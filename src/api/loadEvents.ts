import { EVENTS } from "../data/events";
import type { BehaviorEvent } from "../types";
import { filterVisibleEvents } from "./eventFilter";

const BQ_API = "https://us-central1-poodle-359607.cloudfunctions.net/bq-events-api";
const DEFAULT_LOOKBACK_DAYS = 30;

export async function loadEvents(
  begin?: number,
  end?: number,
): Promise<BehaviorEvent[]> {
  const now = Math.floor(Date.now() / 1000);
  const toTs = end ?? now;
  const fromTs = begin ?? now - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60;

  const fromISO = new Date(fromTs * 1000).toISOString();
  const toISO = new Date(toTs * 1000).toISOString();

  const res = await fetch(`${BQ_API}?from=${fromISO}&to=${toISO}`);
  if (!res.ok) throw new Error(`BigQuery API ${res.status}`);
  const json = await res.json();

  const events: BehaviorEvent[] = (json.events ?? []).map((e: any) => ({
    time: new Date(e.event_timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    machine: e.machine_name,
    type: e.event_type,
    speed: e.speed_kmh ?? 0,
    lat: e.latitude ?? null,
    lon: e.longitude ?? null,
  }));

  return filterVisibleEvents(events);
}

export const FALLBACK_EVENTS = filterVisibleEvents(EVENTS);

import { EVENTS } from "../data/events";
import { FLEET, FLEET_BY_IMEI } from "../data/fleet";
import type { BehaviorEvent } from "../types";
import { filterVisibleEvents } from "./eventFilter";

const BQ_API = "https://us-central1-poodle-359607.cloudfunctions.net/bq-events-api";
const DEFAULT_LOOKBACK_DAYS = 30;

const FLEET_BY_EQUIPMENT_ID = Object.fromEntries(
  FLEET.map((v) => [v.equipment_id, v.machine_name]),
);

function resolveMachineName(e: {
  device_imei?: string | null;
  equipment_id?: number | null;
  machine_name?: string | null;
}): string {
  if (e.equipment_id != null) {
    const byEquipment = FLEET_BY_EQUIPMENT_ID[e.equipment_id];
    if (byEquipment) return byEquipment;
  }
  if (e.device_imei) {
    const byImei = FLEET_BY_IMEI[e.device_imei]?.machine_name;
    if (byImei) return byImei;
  }
  return e.machine_name ?? "Unknown";
}

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
    machine: resolveMachineName(e),
    type: e.event_type,
    speed: e.speed_kmh ?? 0,
    lat: e.latitude ?? null,
    lon: e.longitude ?? null,
  }));

  return filterVisibleEvents(events);
}

export const FALLBACK_EVENTS = filterVisibleEvents(EVENTS);

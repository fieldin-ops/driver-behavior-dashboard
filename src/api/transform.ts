import { FLEET_BY_DEVICE_ID } from "../data/fleet";
import type { BehaviorEvent } from "../types";
import { DISPLAY_TIMEZONE } from "../utils/constants";

type FlespiInterval = {
  begin: number;
  "device.id": number;
  first_msg?: Record<string, number>;
  is_harsh_braking?: boolean | null;
  is_harsh_cornering?: boolean | null;
  is_harsh_acceleration?: boolean | null;
  is_overspeeding?: boolean | null;
};

function getEventType(interval: FlespiInterval): string | null {
  if (interval.is_harsh_braking) return "Harsh Braking";
  if (interval.is_harsh_cornering) return "Harsh Cornering";
  if (interval.is_harsh_acceleration) return "Harsh Acceleration";
  if (interval.is_overspeeding) return "Overspeeding";
  return null;
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TIMEZONE,
  });
}

export function transformIntervals(intervals: FlespiInterval[]): BehaviorEvent[] {
  const events: BehaviorEvent[] = [];

  for (const interval of intervals) {
    const type = getEventType(interval);
    if (!type) continue;

    const deviceId = interval["device.id"];
    const vehicle = FLEET_BY_DEVICE_ID[deviceId];
    if (!vehicle?.has_sensor) continue;

    const msg = interval.first_msg ?? {};
    events.push({
      time: formatTimestamp(interval.begin),
      machine: vehicle.machine_name,
      type,
      speed: msg["position.speed"] ?? 0,
      lat: msg["position.latitude"] ?? null,
      lon: msg["position.longitude"] ?? null,
    });
  }

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return events;
}

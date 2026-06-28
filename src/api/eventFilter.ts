import type { BehaviorEvent } from "../types";

/** Set to false to show Accident Alert events in the dashboard again. */
export const HIDE_ACCIDENT_ALERTS = true;

export const ACCIDENT_ALERT_TYPE = "Accident Alert";
export const COLLISION_TYPE = "Collision";

export function filterVisibleEvents(events: BehaviorEvent[]): BehaviorEvent[] {
  if (!HIDE_ACCIDENT_ALERTS) return events;
  return events.filter((e) => e.type !== ACCIDENT_ALERT_TYPE);
}

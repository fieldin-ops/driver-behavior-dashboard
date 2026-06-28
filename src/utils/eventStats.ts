import { FLEET, getMachineByNameOrCode } from "../data/fleet";
import type { BehaviorEvent, EventCounts, FleetRow, FleetVehicle } from "../types";

export const EMPTY_COUNTS: EventCounts = {
  cornering: 0,
  acceleration: 0,
  braking: 0,
  overspeeding: 0,
  accident: 0,
  collision: 0,
};

export function incrementCount(counts: EventCounts, type: string): EventCounts {
  const next = { ...counts };
  if (type === "Harsh Cornering") next.cornering += 1;
  else if (type === "Harsh Acceleration") next.acceleration += 1;
  else if (type === "Harsh Braking") next.braking += 1;
  else if (type === "Overspeeding") next.overspeeding += 1;
  else if (type === "Accident Alert") next.accident += 1;
  else if (type === "Collision") next.collision += 1;
  return next;
}

export function aggregateEventCounts(events: BehaviorEvent[]): EventCounts {
  return events.reduce((acc, e) => incrementCount(acc, e.type), { ...EMPTY_COUNTS });
}

export function countsByDeviceId(events: BehaviorEvent[]): Record<number, EventCounts> {
  const map: Record<number, EventCounts> = {};
  for (const e of events) {
    const vehicle = getMachineByNameOrCode(e.machine);
    if (!vehicle?.has_sensor || vehicle.flespi_device_id <= 0) continue;
    const id = vehicle.flespi_device_id;
    map[id] = incrementCount(map[id] ?? { ...EMPTY_COUNTS }, e.type);
  }
  return map;
}

export function totalEvents(counts: EventCounts): number {
  return (
    counts.cornering +
    counts.acceleration +
    counts.braking +
    counts.overspeeding +
    counts.accident +
    counts.collision
  );
}

export function fleetRowTone(counts: EventCounts): "danger" | "warning" | "info" | undefined {
  if (counts.collision > 0 || counts.accident > 0) return "danger";
  if (counts.cornering > 0) return "warning";
  if (counts.acceleration > 0) return "info";
  return undefined;
}

export function buildSortedFleet(
  eventCounts: Record<number, EventCounts>,
  fleet: FleetVehicle[] = FLEET,
): FleetRow[] {
  const withEvents: FleetRow[] = [];
  const noEvents: FleetRow[] = [];

  for (const v of fleet) {
    const c =
      v.has_sensor && v.flespi_device_id > 0
        ? (eventCounts[v.flespi_device_id] ?? { ...EMPTY_COUNTS })
        : { ...EMPTY_COUNTS };
    const total = totalEvents(c);
    const row: FleetRow = { ...v, ...c, total };
    if (total > 0) withEvents.push(row);
    else noEvents.push(row);
  }

  withEvents.sort((a, b) => b.total - a.total);
  noEvents.sort((a, b) => a.machine_name.localeCompare(b.machine_name));
  return [...withEvents, ...noEvents];
}

export function machinesWithEventData(eventCounts: Record<number, EventCounts>): FleetRow[] {
  return buildSortedFleet(eventCounts).filter((r) => r.total > 0);
}

export function getCountsForDevice(
  eventCounts: Record<number, EventCounts>,
  deviceId: number,
  hasSensor = true,
): EventCounts {
  if (!hasSensor || deviceId <= 0) return { ...EMPTY_COUNTS };
  return eventCounts[deviceId] ?? { ...EMPTY_COUNTS };
}

export function getMachineEvents(events: BehaviorEvent[], machine: string): BehaviorEvent[] {
  return events.filter((e) => e.machine === machine);
}

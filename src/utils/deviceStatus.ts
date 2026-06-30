import type { FleetVehicle } from "../types";
import { DISPLAY_TIMEZONE } from "./constants";

export function formatLastSeen(timestamp: number | null): string {
  if (timestamp == null) return "Never";
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: DISPLAY_TIMEZONE,
  });
}

export function countReporting(fleet: FleetVehicle[]): number {
  return fleet.filter((v) => v.has_sensor && v.reporting).length;
}

export function countNotReporting(fleet: FleetVehicle[]): number {
  return fleet.filter((v) => v.has_sensor && !v.reporting).length;
}

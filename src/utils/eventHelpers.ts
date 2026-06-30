import type { BehaviorEvent } from "../types";
import { DISPLAY_TIMEZONE } from "./constants";

export function eventTypeColor(type: string): string {
  if (type === "Harsh Cornering") return "#d97706";
  if (type === "Harsh Acceleration") return "#2563eb";
  if (type === "Harsh Braking") return "#16a34a";
  if (type === "Overspeeding") return "#9333ea";
  return "#94a3b8";
}

export function eventTypeBadgeClasses(type: string): string {
  if (type === "Harsh Cornering") return "bg-amber-50 text-warning border-amber-200";
  if (type === "Harsh Acceleration") return "bg-blue-50 text-accent-blue border-blue-200";
  if (type === "Harsh Braking") return "bg-green-50 text-success border-green-200";
  if (type === "Overspeeding") return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export function eventRowBgClass(type: string): string {
  if (type === "Harsh Cornering") return "bg-amber-50/40";
  if (type === "Harsh Acceleration") return "bg-blue-50/40";
  if (type === "Overspeeding") return "bg-purple-50/40";
  return "";
}

export function groupEventsByDay(events: BehaviorEvent[]) {
  const dayMap = new Map<string, { total: number; types: Record<string, number> }>();
  for (const e of events) {
    const day = new Date(e.time).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: DISPLAY_TIMEZONE,
    });
    const entry = dayMap.get(day) ?? { total: 0, types: {} };
    entry.total += 1;
    entry.types[e.type] = (entry.types[e.type] ?? 0) + 1;
    dayMap.set(day, entry);
  }
  const sorted = [...dayMap.entries()].sort(
    (a, b) => new Date(a[0] + ", 2026").getTime() - new Date(b[0] + ", 2026").getTime(),
  );
  const dates = sorted.map(([d]) => d);
  const totals = sorted.map(([, v]) => v.total);
  const typeNames = [
    "Harsh Cornering",
    "Harsh Acceleration",
    "Harsh Braking",
    "Overspeeding",
  ];
  const byType: Record<string, number[]> = {};
  for (const t of typeNames) {
    byType[t] = sorted.map(([, v]) => v.types[t] ?? 0);
  }
  return { dates, totals, byType };
}

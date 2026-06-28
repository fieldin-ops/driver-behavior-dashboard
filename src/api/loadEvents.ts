import { EVENTS } from "../data/events";
import type { BehaviorEvent } from "../types";
import { filterVisibleEvents } from "./eventFilter";
import { fetchIntervals } from "./flespi";
import { transformIntervals } from "./transform";

const HARSH_CALC_ID = 2946206;
const OVERSPEED_CALC_ID = 2946217;
const DEFAULT_LOOKBACK_DAYS = 30;

export async function loadEvents(
  begin?: number,
  end?: number,
): Promise<BehaviorEvent[]> {
  const now = Math.floor(Date.now() / 1000);
  const to = end ?? now;
  const from = begin ?? now - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60;

  const [harsh, overspeed] = await Promise.all([
    fetchIntervals(HARSH_CALC_ID, from, to),
    fetchIntervals(OVERSPEED_CALC_ID, from, to),
  ]);

  return filterVisibleEvents(transformIntervals([...harsh, ...overspeed]));
}

export const FALLBACK_EVENTS = filterVisibleEvents(EVENTS);

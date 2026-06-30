import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DISPLAY_TIMEZONE } from "../utils/constants";
import "./date-range-picker.css";

export type DateRangePreset = "7d" | "14d" | "30d" | "3m" | "6m" | "custom";

export type DateRangeSelection = {
  preset: DateRangePreset;
  customFrom?: string;
  customTo?: string;
};

const PRESETS: { id: Exclude<DateRangePreset, "custom">; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "14d", label: "Last 14 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "3m", label: "Last 3 months" },
  { id: "6m", label: "Last 6 months" },
];

function subtractMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function presetToDates(preset: Exclude<DateRangePreset, "custom">): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const end = startOfDay(now);
  let start: Date;

  switch (preset) {
    case "7d":
      start = startOfDay(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
      break;
    case "14d":
      start = startOfDay(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000));
      break;
    case "3m":
      start = startOfDay(subtractMonths(now, 3));
      break;
    case "6m":
      start = startOfDay(subtractMonths(now, 6));
      break;
    case "30d":
    default:
      start = startOfDay(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
      break;
  }

  return { start, end };
}

export function getDefaultDateRange(): DateRangeSelection {
  return { preset: "30d" };
}

export function dateRangeToTimestamps(selection: DateRangeSelection): {
  begin: number;
  end: number;
} {
  const now = new Date();
  const end = Math.floor(now.getTime() / 1000);

  if (selection.preset === "custom") {
    const fromStr =
      selection.customFrom ??
      toDateInputValue(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
    const toStr = selection.customTo ?? toDateInputValue(now);
    const fromDate = startOfDay(parseDateInput(fromStr));
    const toDate = endOfDay(parseDateInput(toStr));
    return {
      begin: Math.floor(fromDate.getTime() / 1000),
      end: Math.min(Math.floor(toDate.getTime() / 1000), end),
    };
  }

  const { start } = presetToDates(selection.preset);
  return {
    begin: Math.floor(start.getTime() / 1000),
    end,
  };
}

export function formatDateRangeLabel(selection: DateRangeSelection): string {
  const { begin, end } = dateRangeToTimestamps(selection);
  const start = new Date(begin * 1000);
  const endDate = new Date(end * 1000);
  const yearFmt = new Intl.DateTimeFormat("en-US", { timeZone: DISPLAY_TIMEZONE, year: "numeric" });
  const sameYear = yearFmt.format(start) === yearFmt.format(endDate);

  const startFmt = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TIMEZONE,
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endFmt = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: DISPLAY_TIMEZONE,
  });

  return `${startFmt} – ${endFmt}`;
}

function selectionToDates(selection: DateRangeSelection): { start: Date; end: Date } {
  const { begin, end } = dateRangeToTimestamps(selection);
  return {
    start: startOfDay(new Date(begin * 1000)),
    end: startOfDay(new Date(end * 1000)),
  };
}

type Props = {
  value: DateRangeSelection;
  onChange: (value: DateRangeSelection) => void;
  disabled?: boolean;
};

export function DateRangePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const appliedDates = selectionToDates(value);
  const [draftStart, setDraftStart] = useState<Date | null>(appliedDates.start);
  const [draftEnd, setDraftEnd] = useState<Date | null>(appliedDates.end);
  const [draftPreset, setDraftPreset] = useState<DateRangePreset>(value.preset);

  useEffect(() => {
    if (!open) return;
    const { start, end } = selectionToDates(value);
    setDraftStart(start);
    setDraftEnd(end);
    setDraftPreset(value.preset);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const handlePresetClick = (preset: Exclude<DateRangePreset, "custom">) => {
    const { start, end } = presetToDates(preset);
    setDraftPreset(preset);
    setDraftStart(start);
    setDraftEnd(end);
  };

  const handleCalendarChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setDraftStart(start);
    setDraftEnd(end);
    setDraftPreset("custom");
  };

  const handleApply = () => {
    if (!draftStart || !draftEnd) return;

    if (draftPreset !== "custom") {
      onChange({ preset: draftPreset });
    } else {
      onChange({
        preset: "custom",
        customFrom: toDateInputValue(draftStart),
        customTo: toDateInputValue(draftEnd),
      });
    }
    setOpen(false);
  };

  const canApply = Boolean(draftStart && draftEnd);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-navy shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60"
      >
        <Calendar className="h-4 w-4 shrink-0 text-navy" aria-hidden />
        <span>{formatDateRangeLabel(value)}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            role="dialog"
            aria-label="Select date range"
          >
            <div className="flex">
              <div className="flex w-40 shrink-0 flex-col gap-0.5 border-r border-slate-200 bg-slate-50/80 p-2">
                {PRESETS.map(({ id, label }) => {
                  const active = draftPreset === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handlePresetClick(id)}
                      className={`rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                        active
                          ? "bg-navy text-white shadow-sm"
                          : "text-slate-600 hover:bg-white hover:text-navy"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="date-range-picker p-3">
                <DatePicker
                  selectsRange
                  inline
                  monthsShown={2}
                  startDate={draftStart}
                  endDate={draftEnd}
                  onChange={handleCalendarChange}
                  maxDate={new Date()}
                  disabled={disabled}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canApply || disabled}
                onClick={handleApply}
                className="rounded-md bg-navy px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

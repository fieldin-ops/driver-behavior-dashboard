import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, CornerDownRight, Gauge } from "lucide-react";
import { useMemo } from "react";
import { getMachineDeviceId } from "../data/fleet";
import { parseEventTime } from "../data/events";
import type { BehaviorEvent, FleetVehicle } from "../types";
import {
  countsByDeviceId,
  getCountsForDevice,
  getMachineEvents,
  totalEvents,
} from "../utils/eventStats";
import { eventTypeColor, groupEventsByDay } from "../utils/eventHelpers";
import { DeviceStatusBadge } from "./DeviceStatusBadge";
import { EventLog } from "./EventLog";
import { StatCard } from "./StatCard";

type Props = {
  machine: string;
  events: BehaviorEvent[];
  fleet: FleetVehicle[];
  onBack: () => void;
  onSelectMachine: (name: string) => void;
};

function EventDotTimeline({ events }: { events: BehaviorEvent[] }) {
  const sorted = [...events].sort((a, b) => parseEventTime(a.time) - parseEventTime(b.time));
  if (sorted.length === 0) return null;

  const min = parseEventTime(sorted[0].time);
  const max = parseEventTime(sorted[sorted.length - 1].time);
  const range = max - min || 1;

  const legend = [
    { label: "Cornering", type: "Harsh Cornering" },
    { label: "Acceleration", type: "Harsh Acceleration" },
    { label: "Braking", type: "Harsh Braking" },
    { label: "Overspeeding", type: "Overspeeding" },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-navy">Event Markers</h3>
        <p className="text-sm text-slate-500">
          {sorted.length} events along the time axis · oldest left, newest right
        </p>
      </div>
      <div className="relative h-14 rounded-lg border border-slate-200 bg-white">
        <div className="absolute top-1/2 right-4 left-4 h-px -translate-y-1/2 bg-slate-200" />
        {sorted.map((e, i) => {
          const pct = 16 + ((parseEventTime(e.time) - min) / range) * 68;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              title={`${e.time} — ${e.type}`}
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
              style={{ left: `${pct}%`, background: eventTypeColor(e.type) }}
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        {legend.map(({ label, type }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: eventTypeColor(type) }} />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyBarChart({ dates, byType }: { dates: string[]; byType: Record<string, number[]> }) {
  const series = [
    { name: "Harsh Cornering", key: "Harsh Cornering", color: "#d97706" },
    { name: "Harsh Acceleration", key: "Harsh Acceleration", color: "#2563eb" },
    { name: "Overspeeding", key: "Overspeeding", color: "#9333ea" },
  ].filter((s) => byType[s.key]?.some((v) => v > 0));

  const maxVal = Math.max(
    ...dates.map((_, i) => series.reduce((sum, s) => sum + (byType[s.key]?.[i] ?? 0), 0)),
    1,
  );

  return (
    <div className="flex items-end gap-3" style={{ height: 200 }}>
      {dates.map((date, i) => {
        const total = series.reduce((sum, s) => sum + (byType[s.key]?.[i] ?? 0), 0);
        const heightPct = (total / maxVal) * 100;
        return (
          <div key={date} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-col justify-end" style={{ height: 160 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex w-full flex-col-reverse overflow-hidden rounded-t-md"
              >
                {series.map((s) => {
                  const val = byType[s.key]?.[i] ?? 0;
                  if (val === 0) return null;
                  const segPct = (val / total) * 100;
                  return (
                    <div key={s.key} style={{ height: `${segPct}%`, background: s.color }} title={`${s.name}: ${val}`} />
                  );
                })}
              </motion.div>
            </div>
            <span className="text-xs text-slate-500">{date}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MachineDrilldown({ machine, events, fleet, onBack, onSelectMachine }: Props) {
  const vehicle = fleet.find((v) => v.machine_name === machine || v.machine_code === machine);
  const deviceId = getMachineDeviceId(machine);
  const deviceCounts = useMemo(() => countsByDeviceId(events), [events]);
  const counts =
    vehicle?.has_sensor && deviceId != null
      ? getCountsForDevice(deviceCounts, deviceId, true)
      : { cornering: 0, acceleration: 0, braking: 0, overspeeding: 0 };
  const machineEvents = useMemo(
    () => getMachineEvents(events, vehicle?.machine_name ?? machine),
    [events, machine, vehicle?.machine_name],
  );
  const chronological = [...machineEvents].sort((a, b) => parseEventTime(a.time) - parseEventTime(b.time));
  const daily = groupEventsByDay(machineEvents);
  const displayName = vehicle?.machine_name ?? machine;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to fleet
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">{displayName}</h1>
          {vehicle && (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {!vehicle.has_sensor ? (
                <DeviceStatusBadge hasSensor={false} reporting={false} lastSeen={null} variant="inline" />
              ) : (
                <>
                  <span>Device {vehicle.device_code}</span>
                  <DeviceStatusBadge
                    hasSensor
                    reporting={vehicle.reporting}
                    lastSeen={vehicle.last_seen}
                    variant="inline"
                  />
                  <span>· Flespi ID {vehicle.flespi_device_id}</span>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Event Summary</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard value={String(totalEvents(counts))} label="Total Events" prominent index={0} />
          <StatCard value={String(counts.braking)} label="Harsh Braking" tone="success" index={1} />
          <StatCard
            value={String(counts.cornering)}
            label="Harsh Cornering"
            tone="warning"
            icon={CornerDownRight}
            index={2}
          />
          <StatCard
            value={String(counts.acceleration)}
            label="Harsh Acceleration"
            tone="info"
            icon={ArrowUpRight}
            index={3}
          />
          <StatCard
            value={String(counts.overspeeding)}
            label="Overspeeding"
            tone="purple"
            icon={Gauge}
            index={4}
          />
        </div>
      </div>

      {daily.dates.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-navy">Events per Day</h3>
            <p className="text-sm text-slate-500">Daily event counts · last 30 days</p>
          </div>
          <DailyBarChart dates={daily.dates} byType={daily.byType} />
        </div>
      )}

      {chronological.length > 0 && <EventDotTimeline events={chronological} />}

      {chronological.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-navy">Event Log</h3>
            <p className="text-sm text-slate-500">Chronological events · speed in mph</p>
          </div>
          <EventLog events={chronological} onSelectMachine={onSelectMachine} showMachine={false} />
        </div>
      )}
    </motion.div>
  );
}

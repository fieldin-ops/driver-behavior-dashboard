import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  CornerDownRight,
  Download,
  Gauge,
  Loader2,
  RefreshCw,
  Truck,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDeviceConnectionStatus } from "../api/flespi";
import { FALLBACK_EVENTS, loadEvents } from "../api/loadEvents";
import { FLEET, mergeFleetWithStatus, NO_SENSOR } from "../data/fleet";
import type { BehaviorEvent, FleetVehicle } from "../types";
import { DISPLAY_TIMEZONE } from "../utils/constants";
import { countNotReporting, countReporting } from "../utils/deviceStatus";
import { downloadFleetCsv } from "../utils/csvExport";
import {
  aggregateEventCounts,
  buildSortedFleet,
  countsByDeviceId,
  machinesWithEventData,
  totalEvents,
} from "../utils/eventStats";
import { DonutChart } from "./charts/DonutChart";
import { HorizontalBarChart } from "./charts/HorizontalBarChart";
import {
  DateRangePicker,
  dateRangeToTimestamps,
  formatDateRangeLabel,
  getDefaultDateRange,
  type DateRangeSelection,
} from "./DateRangePicker";
import { EventLog } from "./EventLog";
import { FleetTable } from "./FleetTable";
import { MachineDrilldown } from "./MachineDrilldown";
import { StatCard } from "./StatCard";

function formatLastUpdated(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TIMEZONE,
  });
}

export function Dashboard() {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [eventLogOpen, setEventLogOpen] = useState(false);
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [fleet, setFleet] = useState<FleetVehicle[]>(FLEET);
  const [dateRange, setDateRange] = useState<DateRangeSelection>(getDefaultDateRange);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { begin, end } = dateRangeToTimestamps(dateRange);
      const deviceIds = FLEET.filter((v) => v.has_sensor && v.flespi_device_id > 0).map(
        (v) => v.flespi_device_id,
      );
      const [live, statusResult] = await Promise.all([
        loadEvents(begin, end),
        fetchDeviceConnectionStatus(deviceIds).catch(() => new Map()),
      ]);
      setEvents(live);
      setFleet(mergeFleetWithStatus(FLEET, statusResult));
      setLastRefreshed(new Date());
    } catch (err) {
      setEvents(FALLBACK_EVENTS);
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const eventCounts = useMemo(() => aggregateEventCounts(events), [events]);
  const deviceCounts = useMemo(() => countsByDeviceId(events), [events]);
  const sortedFleetRows = useMemo(() => buildSortedFleet(deviceCounts, fleet), [deviceCounts, fleet]);
  const machinesWithEvents = useMemo(() => machinesWithEventData(deviceCounts), [deviceCounts]);
  const topMachinesByEvents = useMemo(() => machinesWithEvents.slice(0, 10), [machinesWithEvents]);
  const barCategories = topMachinesByEvents.map((m) => m.machine_name);

  const donutData = [
    { label: "Harsh Braking", value: eventCounts.braking, color: "#16a34a" },
    { label: "Harsh Cornering", value: eventCounts.cornering, color: "#d97706" },
    { label: "Harsh Acceleration", value: eventCounts.acceleration, color: "#2563eb" },
    { label: "Overspeeding", value: eventCounts.overspeeding, color: "#9333ea" },
  ].filter((d) => d.value > 0);

  const total = totalEvents(eventCounts);
  const reportingCount = countReporting(fleet);
  const notReportingCount = countNotReporting(fleet);
  const initialLoad = loading && events.length === 0;
  const refetching = loading && events.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {/* Header */}
        <header className="mb-10 border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 shrink-0 rounded-full bg-navy" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-navy lg:text-3xl">
                  2B Farming
                </h1>
                <p className="text-lg font-medium text-slate-600">Driver Behavior Dashboard</p>
              </div>
            </div>
            <div className="flex flex-wrap items-start justify-end gap-4">
              {lastRefreshed && (
                <span className="pt-2 text-sm text-slate-400">
                  Last updated: {formatLastUpdated(lastRefreshed)}
                </span>
              )}
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                disabled={loading}
              />
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-navy active:bg-slate-100 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-2 pl-5 text-sm text-danger">
              {error} — showing cached fallback data
            </p>
          )}
        </header>

        <AnimatePresence mode="wait">
          {selectedMachine ? (
            <MachineDrilldown
              key="drilldown"
              machine={selectedMachine}
              events={events}
              fleet={fleet}
              onBack={() => setSelectedMachine(null)}
              onSelectMachine={setSelectedMachine}
            />
          ) : initialLoad ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-32"
            >
              <Loader2 className="h-10 w-10 animate-spin text-navy" />
              <p className="text-sm text-slate-500">Loading events…</p>
            </motion.div>
          ) : (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`relative flex flex-col gap-10 transition-opacity ${refetching ? "pointer-events-none opacity-60" : ""}`}
            >
              {refetching && (
                <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-navy shadow-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating data…
                  </span>
                </div>
              )}
              {/* Hero stat strip */}
              <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Event Summary
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  <StatCard value={String(total)} label="Total Events" prominent index={0} />
                  <StatCard
                    value={String(eventCounts.braking)}
                    label="Harsh Braking"
                    tone="success"
                    index={1}
                  />
                  <StatCard
                    value={String(eventCounts.cornering)}
                    label="Harsh Cornering"
                    tone="warning"
                    icon={CornerDownRight}
                    index={2}
                  />
                  <StatCard
                    value={String(eventCounts.acceleration)}
                    label="Harsh Acceleration"
                    tone="info"
                    icon={ArrowUpRight}
                    index={3}
                  />
                  <StatCard
                    value={String(eventCounts.overspeeding)}
                    label="Overspeeding"
                    tone="purple"
                    icon={Gauge}
                    index={4}
                  />
                </div>
              </section>

              {/* Fleet health */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="rounded-lg bg-navy/10 p-3">
                    <Truck className="h-6 w-6 text-navy" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy">{FLEET.length}</p>
                    <p className="text-sm text-slate-500">Total Vehicles</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="rounded-lg bg-green-50 p-3">
                    <Wifi className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{reportingCount}</p>
                    <p className="text-sm text-slate-500">Online</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="rounded-lg bg-amber-50 p-3">
                    <WifiOff className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">{notReportingCount}</p>
                    <p className="text-sm text-slate-500">Offline</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <div className="rounded-lg bg-slate-100 p-3">
                    <WifiOff className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-600">{NO_SENSOR}</p>
                    <p className="text-sm text-slate-500">No Sensor</p>
                  </div>
                </motion.div>
              </section>

              <hr className="border-slate-200" />

              {/* Charts — compact donut (1/4) + wide bar chart (3/4) on desktop */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 lg:col-span-1">
                  <div className="mb-4 text-center lg:text-left">
                    <h2 className="text-lg font-semibold text-navy">Events by Type</h2>
                    <p className="text-sm text-slate-500">
                      Distribution of {total} harsh driving events
                    </p>
                  </div>
                  <DonutChart data={donutData} />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-5 lg:col-span-2">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-navy">Events by Machine</h2>
                    <p className="text-sm text-slate-500">
                      Top 10 machines by event count
                      {machinesWithEvents.length > 10
                        ? ` · ${machinesWithEvents.length} active machines total`
                        : ""}
                    </p>
                  </div>
                  {topMachinesByEvents.length > 0 ? (
                    <HorizontalBarChart
                      categories={barCategories}
                      onSelectMachine={setSelectedMachine}
                      series={[
                        {
                          name: "Harsh Braking",
                          data: topMachinesByEvents.map((m) => m.braking),
                          color: "#16a34a",
                        },
                        {
                          name: "Harsh Cornering",
                          data: topMachinesByEvents.map((m) => m.cornering),
                          color: "#d97706",
                        },
                        {
                          name: "Harsh Acceleration",
                          data: topMachinesByEvents.map((m) => m.acceleration),
                          color: "#2563eb",
                        },
                        {
                          name: "Overspeeding",
                          data: topMachinesByEvents.map((m) => m.overspeeding),
                          color: "#9333ea",
                        },
                      ]}
                    />
                  ) : (
                    <p className="text-sm text-slate-400">No events in the selected timeframe</p>
                  )}
                </div>
              </section>

              <hr className="border-slate-200" />

              {/* Fleet table */}
              <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-navy">Full Fleet Overview</h2>
                    <p className="text-sm text-slate-500">
                      All {FLEET.length} machines · click a name to drill down · active machines listed
                      first
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadFleetCsv(sortedFleetRows, formatDateRangeLabel(dateRange))
                    }
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-navy active:bg-slate-100"
                  >
                    <Download className="h-4 w-4" />
                    Download CSV
                  </button>
                </div>
                <FleetTable events={events} fleet={fleet} onSelectMachine={setSelectedMachine} />
              </section>

              <hr className="border-slate-200" />

              {/* Event detail log */}
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50">
                <motion.button
                  type="button"
                  onClick={() => setEventLogOpen((o) => !o)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-100/60"
                  whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.8)" }}
                >
                  <h2 className="text-lg font-semibold text-navy">Event Detail Log</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{events.length} events</span>
                    <motion.div
                      animate={{ rotate: eventLogOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    </motion.div>
                  </div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {eventLogOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-200 px-6 pt-4 pb-6">
                        <p className="mb-4 text-sm text-slate-400">
                          All events sorted by time descending · speed in mph
                        </p>
                        <EventLog events={events} onSelectMachine={setSelectedMachine} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

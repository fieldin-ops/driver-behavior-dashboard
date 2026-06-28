import { motion } from "framer-motion";
import { useMemo } from "react";
import { HIDE_ACCIDENT_ALERTS } from "../api/eventFilter";
import type { BehaviorEvent, FleetVehicle } from "../types";
import {
  buildSortedFleet,
  countsByDeviceId,
  fleetRowTone,
  getCountsForDevice,
  totalEvents,
} from "../utils/eventStats";
import { DeviceStatusBadge } from "./DeviceStatusBadge";
import { MachineLink } from "./MachineLink";

type Props = {
  events: BehaviorEvent[];
  fleet: FleetVehicle[];
  onSelectMachine: (name: string) => void;
};

const rowToneBg: Record<string, string> = {
  danger: "bg-red-50/40",
  warning: "bg-amber-50/30",
  info: "bg-blue-50/30",
};

function formatCount(value: number, hasSensor: boolean): string {
  if (!hasSensor) return "—";
  return String(value);
}

export function FleetTable({ events, fleet, onSelectMachine }: Props) {
  const deviceCounts = useMemo(() => countsByDeviceId(events), [events]);
  const sortedFleet = useMemo(() => buildSortedFleet(deviceCounts, fleet), [deviceCounts, fleet]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">
          <tr>
            {[
              "Machine",
              "Device ID",
              "Status",
              "Braking",
              "Cornering",
              "Acceleration",
              "Overspeeding",
              "Collision",
              ...(!HIDE_ACCIDENT_ALERTS ? ["Accidents"] : []),
              "Total",
            ].map(
              (h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                    h === "Status" ? "text-center" : h === "Machine" || h === "Device ID" ? "text-left" : "text-right"
                  }`}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {sortedFleet.map((v, i) => {
            const c = getCountsForDevice(deviceCounts, v.flespi_device_id, v.has_sensor);
            const total = v.has_sensor ? totalEvents(c) : 0;
            const tone = v.has_sensor ? fleetRowTone(c) : undefined;
            return (
              <motion.tr
                key={v.machine_name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.6) }}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50/80 ${
                  tone ? rowToneBg[tone] ?? "" : i % 2 === 1 ? "bg-white" : "bg-slate-50/30"
                }`}
              >
                <td className="px-4 py-2.5">
                    <MachineLink name={v.machine_name} onSelect={onSelectMachine} />
                </td>
                <td className="px-4 py-2.5 text-slate-500">{v.has_sensor ? v.device_code : "—"}</td>
                <td className="px-4 py-2.5 text-center">
                  <DeviceStatusBadge
                    hasSensor={v.has_sensor}
                    reporting={v.reporting}
                    lastSeen={v.last_seen}
                  />
                </td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCount(c.braking, v.has_sensor)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCount(c.cornering, v.has_sensor)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCount(c.acceleration, v.has_sensor)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCount(c.overspeeding, v.has_sensor)}</td>
                <td className="px-4 py-2.5 text-right font-medium">{formatCount(c.collision, v.has_sensor)}</td>
                {!HIDE_ACCIDENT_ALERTS && (
                  <td className="px-4 py-2.5 text-right font-medium">{formatCount(c.accident, v.has_sensor)}</td>
                )}
                <td className="px-4 py-2.5 text-right font-semibold text-navy">
                  {v.has_sensor ? total : "—"}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

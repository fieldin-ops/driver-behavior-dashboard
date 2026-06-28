import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { BehaviorEvent } from "../types";
import { eventRowBgClass } from "../utils/eventHelpers";
import { EventTypeBadge } from "./EventTypeBadge";
import { MachineLink } from "./MachineLink";

type Props = {
  events: BehaviorEvent[];
  onSelectMachine: (name: string) => void;
  showMachine?: boolean;
};

export function EventLog({ events, onSelectMachine, showMachine = true }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
            {showMachine && (
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Machine</th>
            )}
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Event Type</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Speed (mph)
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <motion.tr
              key={`${e.time}-${e.machine}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.5) }}
              className={`border-b border-slate-100 ${eventRowBgClass(e.type)} ${i % 2 === 1 ? "" : "bg-white"}`}
            >
              <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">{e.time}</td>
              {showMachine && (
                <td className="px-4 py-2.5">
                  <MachineLink name={e.machine} onSelect={onSelectMachine} />
                </td>
              )}
              <td className="px-4 py-2.5">
                <EventTypeBadge type={e.type} />
              </td>
              <td className="px-4 py-2.5 text-right font-medium">{Math.round(e.speed * 0.621371)}</td>
              <td className="px-4 py-2.5">
                {e.lat != null && e.lon != null ? (
                  <a
                    href={`https://www.google.com/maps?q=${e.lat},${e.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent-blue hover:underline"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">
                      {e.lat}, {e.lon}
                    </span>
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

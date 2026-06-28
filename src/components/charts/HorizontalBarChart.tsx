import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { ChartTooltip } from "./ChartTooltip";

type Series = {
  name: string;
  data: number[];
  color: string;
};

type Props = {
  categories: string[];
  series: Series[];
  height?: number;
  onSelectMachine?: (name: string) => void;
};

type TooltipState = {
  category: string;
  total: number;
  breakdown: string;
  x: number;
  y: number;
};

const SHORT_NAMES: Record<string, string> = {
  "Harsh Braking": "Braking",
  "Harsh Cornering": "Cornering",
  "Harsh Acceleration": "Acceleration",
  Overspeeding: "Overspeeding",
  "Accident Alerts": "Accident",
  Collisions: "Collision",
};

function formatBreakdown(series: Series[], index: number): string {
  return series
    .map((s) => ({ name: s.name, val: s.data[index] ?? 0 }))
    .filter((p) => p.val > 0)
    .map((p) => `${p.val} ${SHORT_NAMES[p.name] ?? p.name}`)
    .join(", ");
}

export function HorizontalBarChart({ categories, series, height, onSelectMachine }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const maxTotal = Math.max(
    ...categories.map((_, i) => series.reduce((sum, s) => sum + (s.data[i] ?? 0), 0)),
    1,
  );
  const barHeight = Math.max(24, Math.min(32, (320 - categories.length * 6) / categories.length));
  const computedHeight = height ?? categories.length * (barHeight + 6) + 40;

  const showTooltip = useCallback(
    (category: string, index: number, event: React.MouseEvent<HTMLElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const total = series.reduce((sum, s) => sum + (s.data[index] ?? 0), 0);
      setTooltip({
        category,
        total,
        breakdown: formatBreakdown(series, index),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    [series],
  );

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5" style={{ minHeight: computedHeight }}>
      {categories.map((cat, i) => {
        const total = series.reduce((sum, s) => sum + (s.data[i] ?? 0), 0);
        const isHovered = tooltip?.category === cat;

        return (
          <div
            key={cat}
            className="grid grid-cols-[minmax(140px,34%)_1fr_2rem] items-center gap-2 sm:grid-cols-[minmax(160px,38%)_1fr_2rem]"
            onMouseEnter={(e) => showTooltip(cat, i, e)}
            onMouseMove={(e) => showTooltip(cat, i, e)}
            onMouseLeave={hideTooltip}
          >
            {onSelectMachine ? (
              <button
                type="button"
                onClick={() => onSelectMachine(cat)}
                className="cursor-pointer text-left text-xs font-medium leading-snug text-navy underline decoration-navy/30 underline-offset-2 transition-colors hover:text-accent-blue hover:decoration-accent-blue/50"
              >
                {cat}
              </button>
            ) : (
              <span className="text-left text-xs font-medium leading-snug text-slate-600">{cat}</span>
            )}
            <div
              className={`relative overflow-hidden rounded-md bg-slate-100 transition-opacity ${isHovered ? "ring-1 ring-slate-300" : ""}`}
              style={{ height: barHeight }}
            >
              <div className="flex h-full">
                {series.map((s) => {
                  const val = s.data[i] ?? 0;
                  if (val === 0) return null;
                  const widthPct = (val / maxTotal) * 100;
                  return (
                    <motion.div
                      key={s.name}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%`, opacity: isHovered ? 1 : 0.92 }}
                      transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
                      className="h-full"
                      style={{ background: s.color }}
                    />
                  );
                })}
              </div>
            </div>
            <span className="text-right text-xs font-semibold text-navy">{total}</span>
          </div>
        );
      })}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 pt-3">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-xs text-slate-500">{s.name}</span>
          </div>
        ))}
      </div>
      <ChartTooltip visible={!!tooltip} x={tooltip?.x ?? 0} y={tooltip?.y ?? 0} className="max-w-sm">
        {tooltip && (
          <>
            <span className="font-semibold">{tooltip.category}</span>
            {": "}
            {tooltip.total} event{tooltip.total !== 1 ? "s" : ""}
            {tooltip.breakdown && (
              <>
                {" "}
                — {tooltip.breakdown}
              </>
            )}
          </>
        )}
      </ChartTooltip>
    </div>
  );
}

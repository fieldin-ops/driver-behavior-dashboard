import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { ChartTooltip } from "./ChartTooltip";

type Segment = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: Segment[];
  size?: number;
};

type TooltipState = {
  label: string;
  value: number;
  pct: number;
  x: number;
  y: number;
};

export function DonutChart({ data, size = 150 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 12;
  const innerRadius = radius * 0.58;
  let cumulative = 0;

  const segments =
    total > 0
      ? data.map((d) => {
          const startAngle = (cumulative / total) * 360 - 90;
          cumulative += d.value;
          const endAngle = (cumulative / total) * 360 - 90;
          return { ...d, startAngle, endAngle, pct: (d.value / total) * 100 };
        })
      : [];

  function arcPath(startAngle: number, endAngle: number, r: number, ir: number) {
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const x3 = cx + ir * Math.cos(end);
    const y3 = cy + ir * Math.sin(end);
    const x4 = cx + ir * Math.cos(start);
    const y4 = cy + ir * Math.sin(start);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${large} 0 ${x4} ${y4} Z`;
  }

  const showTooltip = useCallback(
    (seg: (typeof segments)[number], event: React.MouseEvent<SVGPathElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        label: seg.label,
        value: seg.value,
        pct: seg.pct,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    [],
  );

  const hideTooltip = useCallback(() => setTooltip(null), []);

  if (total === 0) {
    return <p className="text-sm text-slate-400">No events in the selected timeframe</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-[220px] flex-col items-center gap-3">
      <div ref={containerRef} className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {segments.map((seg, i) => (
            <motion.path
              key={seg.label}
              d={arcPath(seg.startAngle, seg.endAngle, radius, innerRadius)}
              fill={seg.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: tooltip?.label === seg.label ? 1 : tooltip ? 0.55 : 1,
                scale: 1,
              }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              style={{ transformOrigin: `${cx}px ${cy}px`, cursor: "pointer" }}
              onMouseEnter={(e) => showTooltip(seg, e)}
              onMouseMove={(e) => showTooltip(seg, e)}
              onMouseLeave={hideTooltip}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-navy">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">events</span>
        </div>
        <ChartTooltip visible={!!tooltip} x={tooltip?.x ?? 0} y={tooltip?.y ?? 0}>
          {tooltip && (
            <>
              <span className="font-semibold">{tooltip.label}</span>
              {": "}
              {tooltip.value} ({Math.round(tooltip.pct)}%)
            </>
          )}
        </ChartTooltip>
      </div>
      <div className="flex w-full flex-col items-start gap-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex w-full items-center gap-1.5">
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: seg.color }} />
            <span className="min-w-0 truncate text-[11px] leading-tight text-slate-600">
              {seg.label}{" "}
              <span className="text-slate-400">
                {seg.value} · {Math.round(seg.pct)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

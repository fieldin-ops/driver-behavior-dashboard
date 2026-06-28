import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  visible: boolean;
  x: number;
  y: number;
  children: ReactNode;
  className?: string;
};

export function ChartTooltip({ visible, x, y, children, className = "" }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`pointer-events-none absolute z-50 max-w-xs rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg ${className}`}
          style={{
            left: x,
            top: y,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

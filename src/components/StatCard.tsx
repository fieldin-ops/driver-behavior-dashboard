import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "success" | "warning" | "info" | "danger" | "purple";

type Props = {
  value: string;
  label: string;
  tone?: Tone;
  prominent?: boolean;
  icon?: LucideIcon;
  index?: number;
};

const toneClasses: Record<Tone, string> = {
  default: "text-navy",
  success: "text-success",
  warning: "text-warning",
  info: "text-accent-blue",
  danger: "text-danger",
  purple: "text-purple",
};

export function StatCard({ value, label, tone = "default", prominent, icon: Icon, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="rounded-lg border border-slate-200 bg-white px-4 py-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={`font-semibold leading-tight tracking-tight ${toneClasses[tone]} ${
              prominent ? "text-4xl" : "text-3xl"
            }`}
          >
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
        {Icon && (
          <div className={`rounded-lg p-2 ${prominent ? "bg-navy/10" : "bg-slate-50"}`}>
            <Icon className={`h-5 w-5 ${toneClasses[tone]}`} strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

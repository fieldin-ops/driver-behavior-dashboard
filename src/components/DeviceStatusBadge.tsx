import { Radio, Wifi, WifiOff } from "lucide-react";
import { formatLastSeen } from "../utils/deviceStatus";

type Props = {
  hasSensor: boolean;
  reporting: boolean;
  lastSeen: number | null;
  variant?: "badge" | "inline";
};

export function DeviceStatusBadge({
  hasSensor,
  reporting,
  lastSeen,
  variant = "badge",
}: Props) {
  const lastSeenLabel = formatLastSeen(lastSeen);
  const tooltip = reporting
    ? `Device is reporting to Flespi · Last seen ${lastSeenLabel}`
    : `Device is not reporting to Flespi · Last seen ${lastSeenLabel}`;

  if (!hasSensor) {
    if (variant === "inline") {
      return <span className="text-slate-500">No sensor installed</span>;
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        <Radio className="h-3 w-3" />
        No Sensor
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1 ${reporting ? "text-success" : "text-warning"}`}
        title={tooltip}
      >
        {reporting ? (
          <>
            <Wifi className="h-3.5 w-3.5" /> Online
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" /> Offline
          </>
        )}
        <span className="text-slate-400">· Last seen {lastSeenLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        reporting
          ? "border-green-200 bg-green-50 text-success"
          : "border-amber-200 bg-amber-50 text-warning"
      }`}
      title={tooltip}
    >
      {reporting ? (
        <>
          <Wifi className="h-3 w-3" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </span>
  );
}

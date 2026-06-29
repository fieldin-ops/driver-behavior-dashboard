import type { FleetRow } from "../types";

const CSV_HEADERS = [
  "Machine Name",
  "Machine Code",
  "Device ID (IMEI)",
  "Status",
  "Harsh Cornering",
  "Harsh Acceleration",
  "Harsh Braking",
  "Overspeeding",
  "Collision",
  "Total Events",
] as const;

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function statusLabel(row: FleetRow): string {
  if (!row.has_sensor) return "No Sensor";
  return row.reporting ? "Online" : "Offline";
}

function labelToFilenameSuffix(label: string): string {
  return label
    .replace(/\u2013|\u2014|–|—/g, "-")
    .replace(/,\s*/g, "-")
    .replace(/\s+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function fleetCsvFilename(dateRangeLabel: string): string {
  return `fleet-overview-${labelToFilenameSuffix(dateRangeLabel)}.csv`;
}

export function fleetRowsToCsv(rows: FleetRow[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const row of rows) {
    const fields = [
      row.machine_name,
      row.machine_code,
      row.has_sensor ? row.device_code : "",
      statusLabel(row),
      row.has_sensor ? row.cornering : "",
      row.has_sensor ? row.acceleration : "",
      row.has_sensor ? row.braking : "",
      row.has_sensor ? row.overspeeding : "",
      row.has_sensor ? row.collision : "",
      row.has_sensor ? row.total : "",
    ];
    lines.push(fields.map(escapeCsvField).join(","));
  }

  return lines.join("\n");
}

export function downloadFleetCsv(rows: FleetRow[], dateRangeLabel: string): void {
  const csv = fleetRowsToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fleetCsvFilename(dateRangeLabel);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

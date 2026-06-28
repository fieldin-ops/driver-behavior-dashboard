const TOKEN = import.meta.env.VITE_FLESPI_TOKEN;
const BASE = "https://flespi.io";

const REPORTING_WINDOW_SEC = 60 * 60;

export type DeviceConnectionStatus = {
  reporting: boolean;
  last_seen: number | null;
};

type FlespiDeviceStatus = {
  id: number;
  connected?: boolean;
  "telemetry.timestamp"?: number | null;
  telemetry?: { timestamp?: number | null };
};

function parseDeviceStatus(device: FlespiDeviceStatus): DeviceConnectionStatus {
  const lastSeen =
    device["telemetry.timestamp"] ?? device.telemetry?.timestamp ?? null;
  const now = Math.floor(Date.now() / 1000);
  const recentlySeen =
    lastSeen != null && now - lastSeen <= REPORTING_WINDOW_SEC;
  const reporting = device.connected === true || recentlySeen;
  return { reporting, last_seen: lastSeen };
}

export async function fetchDeviceConnectionStatus(
  deviceIds: number[],
): Promise<Map<number, DeviceConnectionStatus>> {
  const map = new Map<number, DeviceConnectionStatus>();
  if (deviceIds.length === 0) return map;

  const url = `${BASE}/gw/devices/${deviceIds.join(",")}?fields=id,connected,telemetry.timestamp`;
  const res = await fetch(url, {
    headers: { Authorization: `FlespiToken ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Flespi ${res.status}`);
  const json = await res.json();
  for (const device of json.result as FlespiDeviceStatus[]) {
    map.set(device.id, parseDeviceStatus(device));
  }
  return map;
}

export async function fetchIntervals(calcId: number, fromTs: number, toTs: number) {
  const data = JSON.stringify({ begin: fromTs, end: toTs });
  const url = `${BASE}/gw/calcs/${calcId}/devices/all/intervals/all?data=${encodeURIComponent(data)}`;
  const res = await fetch(url, {
    headers: { Authorization: `FlespiToken ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Flespi ${res.status}`);
  const json = await res.json();
  return json.result as any[];
}

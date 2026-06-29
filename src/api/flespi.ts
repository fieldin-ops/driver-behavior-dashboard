const DEVICE_STATUS_API = "https://us-central1-poodle-359607.cloudfunctions.net/device-status-api";

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

  const res = await fetch(`${DEVICE_STATUS_API}?ids=${deviceIds.join(",")}`);
  if (!res.ok) throw new Error(`Device status API ${res.status}`);
  const json = await res.json();
  for (const device of json.result as FlespiDeviceStatus[]) {
    map.set(device.id, parseDeviceStatus(device));
  }
  return map;
}

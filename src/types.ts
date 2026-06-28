export type FleetVehicle = {
  machine_name: string;
  machine_code: string;
  equipment_id: number;
  device_code: string;
  flespi_device_id: number;
  has_sensor: boolean;
  reporting: boolean;
  last_seen: number | null;
};

export type BehaviorEvent = {
  time: string;
  machine: string;
  type: string;
  speed: number;
  lat: number | null;
  lon: number | null;
};

export type EventCounts = {
  cornering: number;
  acceleration: number;
  braking: number;
  overspeeding: number;
  accident: number;
  collision: number;
};

export type FleetRow = FleetVehicle & EventCounts & { total: number };

export type EventType =
  | "Accident Alert"
  | "Collision"
  | "Harsh Cornering"
  | "Harsh Acceleration"
  | "Harsh Braking"
  | "Overspeeding";

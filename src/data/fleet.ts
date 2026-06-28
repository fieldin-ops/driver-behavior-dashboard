import type { EventCounts, FleetRow, FleetVehicle } from "../types";

export const FLEET: FleetVehicle[] = [
  { machine_name: "Abraham H. (AC-V-005)", machine_code: "AC-V-005", equipment_id: 181087, device_code: "867295075226157", flespi_device_id: 7793477, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Abraham L. (2B-014)", machine_code: "2B-014", equipment_id: 192240, device_code: "867295075359859", flespi_device_id: 7793540, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "AC 450 Flatbed", machine_code: "AC 450 Flatbed", equipment_id: 173901, device_code: "869616060650911", flespi_device_id: 7057607, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Alejandro R. (2B-009)", machine_code: "2B-009", equipment_id: 192235, device_code: "867295075215754", flespi_device_id: 7793680, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Angel G. (AC-V-019)", machine_code: "AC-V-019", equipment_id: 192241, device_code: "867295075353530", flespi_device_id: 7793510, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Arturo S. (AC-V-018)", machine_code: "AC-V-018", equipment_id: 174081, device_code: "869616062527984", flespi_device_id: 7057783, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Benja (BF-V-08)", machine_code: "BF-V-08", equipment_id: 192251, device_code: "867295075295913", flespi_device_id: 7793562, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Brian S (AC-V-002)", machine_code: "AC-V-002", equipment_id: 192143, device_code: "867295075296325", flespi_device_id: 7793532, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Carmen (BF-V-03)", machine_code: "BF-V-03", equipment_id: 192252, device_code: "867295075238624", flespi_device_id: 7793453, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Damian (2B-021)", machine_code: "2B-021", equipment_id: 181163, device_code: "867295075225811", flespi_device_id: 7793392, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Daniella (2B-006)", machine_code: "2B-006", equipment_id: 181005, device_code: "867295075212645", flespi_device_id: 7793596, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Felipe (AC-V-003)", machine_code: "AC-V-003", equipment_id: 192135, device_code: "869616062540698", flespi_device_id: 7057661, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Fuel Truck (VA-V-005)", machine_code: "VA-V-005", equipment_id: 181036, device_code: "867295075243459", flespi_device_id: 7793213, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Fuel Truck (VA-V-006)", machine_code: "VA-V-006", equipment_id: 174004, device_code: "869616060827931", flespi_device_id: 7057708, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Gabby (2B-012)", machine_code: "2B-012", equipment_id: 192184, device_code: "867295075242915", flespi_device_id: 7793476, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Javier (2B-020)", machine_code: "2B-020", equipment_id: 192232, device_code: "867295075252716", flespi_device_id: 7793210, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Jonathan F. (AC-V-006)", machine_code: "AC-V-006", equipment_id: 174066, device_code: "869616062616506", flespi_device_id: 7057769, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Jonathan H. (AC-V-011)", machine_code: "AC-V-011", equipment_id: 181155, device_code: "867295075365823", flespi_device_id: 7793340, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Jose Luis (BF-V-07)", machine_code: "BF-V-07", equipment_id: 181131, device_code: "867295075290997", flespi_device_id: 7793187, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Jose M. (BF-V-06)", machine_code: "BF-V-06", equipment_id: 180953, device_code: "867295075248375", flespi_device_id: 7793305, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Josh (2B-011)", machine_code: "2B-011", equipment_id: 181125, device_code: "867295075345635", flespi_device_id: 7793163, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Julio Vega (2B-023)", machine_code: "2B-023", equipment_id: 192172, device_code: "867730050872617", flespi_device_id: 7057781, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Kylee (2B-007)", machine_code: "2B-007", equipment_id: 173897, device_code: "869616060832493", flespi_device_id: 7057603, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Mariano (BF-V-04)", machine_code: "BF-V-04", equipment_id: 181089, device_code: "867295075365807", flespi_device_id: 7793485, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Mario (AC-V-014)", machine_code: "AC-V-014", equipment_id: 174044, device_code: "869616060866400", flespi_device_id: 7057748, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Miguel (BF-V-05)", machine_code: "BF-V-05", equipment_id: 181101, device_code: "867295075224244", flespi_device_id: 7793551, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Naranjo (2B-008)", machine_code: "2B-008", equipment_id: 174034, device_code: "869616060829630", flespi_device_id: 7057738, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Salvador (BF-V-02)", machine_code: "BF-V-02", equipment_id: 181169, device_code: "867295075242956", flespi_device_id: 7793428, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Santiago H. (AC-V-004)", machine_code: "AC-V-004", equipment_id: 181109, device_code: "867295075250090", flespi_device_id: 7793594, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (2B-010)", machine_code: "2B-010", equipment_id: 192186, device_code: "867295075223667", flespi_device_id: 7793169, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (2B-018)", machine_code: "2B-018", equipment_id: 181015, device_code: "867295075291268", flespi_device_id: 7793659, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (2B-019)", machine_code: "2B-019", equipment_id: 192244, device_code: "867295075224939", flespi_device_id: 7793669, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (2B-AZ-V-03)", machine_code: "2B-AZ-V-03", equipment_id: 192133, device_code: "867295075294007", flespi_device_id: 7793393, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (AC-V-001)", machine_code: "AC-V-001", equipment_id: 180978, device_code: "867295075296093", flespi_device_id: 7793448, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (AC-V-012)", machine_code: "AC-V-012", equipment_id: 181003, device_code: "867295075294668", flespi_device_id: 7793584, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (AC-V-017)", machine_code: "AC-V-017", equipment_id: 174045, device_code: "869616060827899", flespi_device_id: 7057747, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (VA-V-001)", machine_code: "VA-V-001", equipment_id: 181151, device_code: "867295075357069", flespi_device_id: 7793312, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (VA-V-002)", machine_code: "VA-V-002", equipment_id: 173937, device_code: "869616062577534", flespi_device_id: 7057643, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare (VA-V-003)", machine_code: "VA-V-003", equipment_id: 180937, device_code: "867295075248656", flespi_device_id: 7793215, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Spare AZ (2B-015)", machine_code: "2B-015", equipment_id: 192228, device_code: "867295075325975", flespi_device_id: 7793225, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Uncle Daniel (AC-V-013)", machine_code: "AC-V-013", equipment_id: 181157, device_code: "867295075291110", flespi_device_id: 7793353, has_sensor: true, reporting: false, last_seen: null },
  { machine_name: "Victor M. (2B-013)", machine_code: "2B-013", equipment_id: 174033, device_code: "869616062582427", flespi_device_id: 7057737, has_sensor: true, reporting: false, last_seen: null },
];

export const FLEET_BY_DEVICE_ID = Object.fromEntries(
  FLEET.filter((v) => v.flespi_device_id > 0).map((v) => [v.flespi_device_id, v]),
);

export const FLEET_BY_IMEI = Object.fromEntries(
  FLEET.filter((v) => v.device_code).map((v) => [v.device_code, v]),
);

export const FLEET_BY_MACHINE_CODE = Object.fromEntries(
  FLEET.map((v) => [v.machine_code, v]),
);

export function getMachineDeviceId(machine: string): number | undefined {
  const vehicle = FLEET.find((v) => v.machine_name === machine || v.machine_code === machine);
  return vehicle?.flespi_device_id || undefined;
}

export function getMachineByNameOrCode(name: string): FleetVehicle | undefined {
  return FLEET.find((v) => v.machine_name === name || v.machine_code === name);
}

export function mergeFleetWithStatus(
  baseFleet: FleetVehicle[],
  statusMap: Map<number, { reporting: boolean; last_seen: number | null }>,
): FleetVehicle[] {
  return baseFleet.map((v) => {
    if (!v.has_sensor || v.flespi_device_id <= 0) return v;
    const status = statusMap.get(v.flespi_device_id);
    if (!status) return { ...v, reporting: false, last_seen: null };
    return { ...v, reporting: status.reporting, last_seen: status.last_seen };
  });
}

export const NO_SENSOR = FLEET.filter((v) => !v.has_sensor).length;

export function fleetRowFromVehicle(
  v: FleetVehicle,
  counts: EventCounts = {
    cornering: 0,
    acceleration: 0,
    braking: 0,
    overspeeding: 0,
    accident: 0,
    collision: 0,
  },
): FleetRow {
  const total =
    counts.cornering +
    counts.acceleration +
    counts.braking +
    counts.overspeeding +
    counts.accident +
    counts.collision;
  return { ...v, ...counts, total };
}


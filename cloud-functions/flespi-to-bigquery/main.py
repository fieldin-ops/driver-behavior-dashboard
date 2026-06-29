import json
import hashlib
from datetime import datetime, timezone
from google.cloud import bigquery
import functions_framework

PROJECT = "poodle-359607"
DATASET = "ops"
TABLE = "driver_behavior_events"
TABLE_ID = f"{PROJECT}.{DATASET}.{TABLE}"

FLEET_BY_DEVICE_ID = {
    7793596: ("Daniella (2B-006)", "867295075212645"),
    7057603: ("Kylee (2B-007)", "869616060832493"),
    7057738: ("Naranjo (2B-008)", "869616060829630"),
    7793679: ("Alejandro R. (2B-009)", "867295075215754"),
    7793169: ("Spare (2B-010)", "867295075223667"),
    7793163: ("Josh (2B-011)", "867295075345635"),
    7793476: ("Gabby (2B-012)", "867295075242915"),
    7057737: ("Victor M. (2B-013)", "869616062582427"),
    7793538: ("Abraham L. (2B-014)", "867295075359859"),
    7793225: ("Spare AZ (2B-015)", "867295075325975"),
    7793659: ("Spare (2B-018)", "867295075291268"),
    7793668: ("Spare (2B-019)", "867295075224939"),
    7793210: ("Javier (2B-020)", "867295075252716"),
    7793392: ("Damian (2B-021)", "867295075225811"),
    7057781: ("Julio Vega (2B-023)", "867730050872617"),
    7793391: ("Spare (2B-AZ-V-03)", "867295075294007"),
    7793448: ("Spare (AC-V-001)", "867295075296093"),
    7057661: ("Felipe (AC-V-003)", "869616062540698"),
    7793592: ("Santiago H. (AC-V-004)", "867295075250090"),
    7793472: ("Abraham H. (AC-V-005)", "867295075226157"),
    7057769: ("Jonathan F. (AC-V-006)", "869616062616506"),
    7793340: ("Jonathan H. (AC-V-011)", "867295075365823"),
    7793579: ("Spare (AC-V-012)", "867295075294668"),
    7793353: ("Uncle Daniel (AC-V-013)", "867295075291110"),
    7057748: ("Mario (AC-V-014)", "869616060866400"),
    7057607: ("AC 450 Flatbed", "869616060650911"),
    7057747: ("Spare (AC-V-017)", "869616060827899"),
    7057783: ("Arturo S. (AC-V-018)", "869616062527984"),
    7793508: ("Angel G. (AC-V-019)", "867295075353530"),
    7793529: ("Brian S (AC-V-002)", "867295075296325"),
    7793559: ("Benja (BF-V-08)", "867295075295913"),
    7793428: ("Salvador (BF-V-02)", "867295075242956"),
    7793453: ("Carmen (BF-V-03)", "867295075238624"),
    7793483: ("Mariano (BF-V-04)", "867295075365807"),
    7793549: ("Miguel (BF-V-05)", "867295075224244"),
    7793305: ("Jose M. (BF-V-06)", "867295075248375"),
    7793187: ("Jose Luis (BF-V-07)", "867295075290997"),
    7793312: ("Spare (VA-V-001)", "867295075357069"),
    7057643: ("Spare (VA-V-002)", "869616062577534"),
    7793215: ("Spare (VA-V-003)", "867295075248656"),
    7793213: ("Fuel Truck (VA-V-005)", "867295075243459"),
    7057708: ("Fuel Truck (VA-V-006)", "869616060827931"),
}

bq_client = bigquery.Client(project=PROJECT)


def determine_event_type(interval: dict) -> str | None:
    if interval.get("is_collision"):
        return "Collision"
    if interval.get("is_harsh_braking"):
        return "Harsh Braking"
    if interval.get("is_harsh_cornering"):
        return "Harsh Cornering"
    if interval.get("is_harsh_acceleration"):
        return "Harsh Acceleration"
    if interval.get("is_overspeeding"):
        return "Overspeeding"
    if interval.get("is_accident"):
        return "Accident Alert"
    return None


def ts_to_iso(ts) -> str | None:
    if ts is None:
        return None
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def make_event_id(device_id, begin_ts, event_type) -> str:
    raw = f"{device_id}_{begin_ts}_{event_type}"
    return hashlib.md5(raw.encode()).hexdigest()


def transform_interval(interval: dict) -> dict | None:
    device_id = interval.get("device.id")
    if device_id not in FLEET_BY_DEVICE_ID:
        return None

    event_type = determine_event_type(interval)
    if not event_type:
        return None

    machine_name, imei = FLEET_BY_DEVICE_ID[device_id]
    first_msg = interval.get("first_msg", {})
    begin = interval.get("begin")
    end = interval.get("end")

    return {
        "event_id": make_event_id(device_id, begin, event_type),
        "device_imei": imei,
        "flespi_device_id": device_id,
        "machine_name": machine_name,
        "event_type": event_type,
        "event_timestamp": ts_to_iso(begin),
        "speed_kmh": first_msg.get("position.speed"),
        "latitude": first_msg.get("position.latitude"),
        "longitude": first_msg.get("position.longitude"),
        "duration_seconds": (end - begin) if (begin and end) else None,
        "calc_interval_begin": ts_to_iso(begin),
        "calc_interval_end": ts_to_iso(end),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@functions_framework.http
def handle_webhook(request):
    """Receives flespi webhook POST with calculator intervals, writes to BigQuery."""
    if request.method == "OPTIONS":
        return ("", 204, {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST"})

    try:
        payload = request.get_json(force=True)
    except Exception:
        return ("Bad JSON", 400)

    intervals = payload if isinstance(payload, list) else [payload]

    rows = []
    for interval in intervals:
        row = transform_interval(interval)
        if row:
            rows.append(row)

    if not rows:
        return json.dumps({"inserted": 0, "skipped": len(intervals)}), 200

    errors = bq_client.insert_rows_json(TABLE_ID, rows)
    if errors:
        return json.dumps({"error": str(errors)}), 500

    return json.dumps({"inserted": len(rows), "skipped": len(intervals) - len(rows)}), 200

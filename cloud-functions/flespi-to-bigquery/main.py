import json
import hashlib
from datetime import datetime, timezone
from google.cloud import bigquery
import functions_framework

PROJECT = "poodle-359607"
DATASET = "ops"
TABLE = "driver_behavior_events"
TABLE_ID = f"{PROJECT}.{DATASET}.{TABLE}"
PROD_REPL_DATASET = f"{PROJECT}.prod_repl"

# Fallback when ident is missing from interval payload (flespi config, rarely changes).
FLESPI_DEVICE_TO_IMEI = {
    7793596: "867295075212645",
    7057603: "869616060832493",
    7057738: "869616060829630",
    7793679: "867295075215754",
    7793169: "867295075223667",
    7793163: "867295075345635",
    7793476: "867295075242915",
    7057737: "869616062582427",
    7793538: "867295075359859",
    7793225: "867295075325975",
    7793659: "867295075291268",
    7793668: "867295075224939",
    7793210: "867295075252716",
    7793392: "867295075225811",
    7057781: "867730050872617",
    7793391: "867295075294007",
    7793448: "867295075296093",
    7057661: "869616062540698",
    7793592: "867295075250090",
    7793472: "867295075226157",
    7057769: "869616062616506",
    7793340: "867295075365823",
    7793579: "867295075294668",
    7793353: "867295075291110",
    7057748: "869616060866400",
    7057607: "869616060650911",
    7057747: "869616060827899",
    7057783: "869616062527984",
    7793508: "867295075353530",
    7793529: "867295075296325",
    7793559: "867295075295913",
    7793428: "867295075242956",
    7793453: "867295075238624",
    7793483: "867295075365807",
    7793549: "867295075224244",
    7793305: "867295075248375",
    7793187: "867295075290997",
    7793312: "867295075357069",
    7057643: "869616062577534",
    7793215: "867295075248656",
    7793213: "867295075243459",
    7057708: "869616060827931",
}

bq_client = bigquery.Client(project=PROJECT)


def load_fleet_mapping() -> dict[str, dict]:
    """Load IMEI → {equipment_id, machine_name} from prod_repl MySQL replica."""
    query = f"""
        SELECT
            d.code AS device_imei,
            CAST(e.id AS INT64) AS equipment_id,
            e.alias AS machine_name
        FROM `{PROD_REPL_DATASET}.equipment_installations` ei
        JOIN `{PROD_REPL_DATASET}.equipment` e ON ei.equipment_id = e.id
        JOIN `{PROD_REPL_DATASET}.devices_new` d ON ei.device_id = d.id
        WHERE ei.time_to IS NULL
          AND d.deleted_at IS NULL
          AND d.code IS NOT NULL
    """
    mapping: dict[str, dict] = {}
    job = bq_client.query(query, location="EU")
    for row in job.result():
        mapping[row.device_imei] = {
            "equipment_id": row.equipment_id,
            "machine_name": row.machine_name,
        }
    return mapping


FLEET_MAPPING = load_fleet_mapping()


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


def get_device_imei(interval: dict) -> str | None:
    ident = interval.get("ident") or interval.get("device.ident")
    if ident:
        return str(ident)

    first_msg = interval.get("first_msg") or {}
    ident = first_msg.get("ident")
    if ident:
        return str(ident)

    device_id = interval.get("device.id")
    if device_id is not None:
        return FLESPI_DEVICE_TO_IMEI.get(device_id)

    return None


def transform_interval(interval: dict) -> dict | None:
    device_id = interval.get("device.id")
    if device_id is None:
        return None

    device_imei = get_device_imei(interval)
    if not device_imei:
        return None

    event_type = determine_event_type(interval)
    if not event_type:
        return None

    first_msg = interval.get("first_msg", {})
    begin = interval.get("begin")
    end = interval.get("end")

    fleet = FLEET_MAPPING.get(device_imei)

    return {
        "event_id": make_event_id(device_id, begin, event_type),
        "device_imei": device_imei,
        "flespi_device_id": device_id,
        "equipment_id": fleet["equipment_id"] if fleet else None,
        "machine_name": fleet["machine_name"] if fleet else None,
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

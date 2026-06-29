import json
from google.cloud import bigquery
import functions_framework

PROJECT = "poodle-359607"
DATASET = "ops"
TABLE = "driver_behavior_events"
TABLE_ID = f"{PROJECT}.{DATASET}.{TABLE}"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

bq_client = bigquery.Client(project=PROJECT)


@functions_framework.http
def get_events(request):
    if request.method == "OPTIONS":
        return ("", 204, CORS_HEADERS)

    from_ts = request.args.get("from")
    to_ts = request.args.get("to")

    if not from_ts or not to_ts:
        return (json.dumps({"error": "from and to query params required (ISO timestamps)"}), 400, CORS_HEADERS)

    query = f"""
        SELECT
            event_type,
            device_imei,
            machine_name,
            equipment_id,
            event_timestamp,
            speed_kmh,
            latitude,
            longitude
        FROM `{TABLE_ID}`
        WHERE event_timestamp BETWEEN @from_ts AND @to_ts
        ORDER BY event_timestamp DESC
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("from_ts", "TIMESTAMP", from_ts),
            bigquery.ScalarQueryParameter("to_ts", "TIMESTAMP", to_ts),
        ]
    )

    rows = bq_client.query(query, job_config=job_config).result()

    events = []
    for row in rows:
        events.append({
            "event_type": row.event_type,
            "device_imei": row.device_imei,
            "machine_name": row.machine_name,
            "equipment_id": row.equipment_id,
            "event_timestamp": row.event_timestamp.isoformat() if row.event_timestamp else None,
            "speed_kmh": row.speed_kmh,
            "latitude": float(row.latitude) if row.latitude else None,
            "longitude": float(row.longitude) if row.longitude else None,
        })

    return (json.dumps({"events": events, "count": len(events)}), 200, CORS_HEADERS)

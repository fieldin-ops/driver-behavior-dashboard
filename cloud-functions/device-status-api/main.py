import json
import os
import urllib.request
import urllib.error
import functions_framework

FLESPI_TOKEN = os.environ.get("FLESPI_TOKEN", "")
FLESPI_BASE = "https://flespi.io"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


@functions_framework.http
def get_device_status(request):
    if request.method == "OPTIONS":
        return ("", 204, CORS_HEADERS)

    device_ids = request.args.get("ids", "")
    if not device_ids:
        return (json.dumps({"error": "ids query param required"}), 400, CORS_HEADERS)

    url = f"{FLESPI_BASE}/gw/devices/{device_ids}?fields=id,connected,telemetry.timestamp"
    req = urllib.request.Request(url, headers={"Authorization": f"FlespiToken {FLESPI_TOKEN}"})

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return (json.dumps({"error": f"Flespi {e.code}"}), 502, CORS_HEADERS)
    except Exception as e:
        return (json.dumps({"error": str(e)}), 502, CORS_HEADERS)

    return (json.dumps(data), 200, CORS_HEADERS)

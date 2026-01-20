# backend/app/opensky.py
import os, requests
from typing import Optional, Dict, Any

OPENSKY_BASE = "https://opensky-network.org/api"

def get_states(bbox: Optional[dict] = None) -> Dict[str, Any]:
    """
    bbox: {"lamin":..,"lomin":..,"lamax":..,"lomax":..}
    If bbox is None, returns global snapshot (can be heavy / rate limited).
    """
    params = bbox or {}
    user = os.getenv("OPENSKY_USER")
    pwd = os.getenv("OPENSKY_PASS")

    # Unauthenticated works but is rate-limited; authenticated is better if you have an account.
    auth = (user, pwd) if user and pwd else None

    r = requests.get(f"{OPENSKY_BASE}/states/all", params=params, auth=auth, timeout=15)
    r.raise_for_status()
    return r.json()

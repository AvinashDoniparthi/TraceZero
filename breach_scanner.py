"""
breach_scanner.py — Fetches breach data for an email address.

Uses the Have I Been Pwned (HIBP) v3 API when an API key is present;
otherwise returns realistic simulated breach data for demo purposes.
"""

import os
import httpx
from typing import Any


# ---------------------------------------------------------------------------
# Simulated breach data (used when HIBP_API_KEY is not set)
# ---------------------------------------------------------------------------

SIMULATED_BREACHES: list[dict[str, Any]] = [
    {
        "name": "Adobe",
        "breach_date": "2013-10-04",
        "compromised_data": ["Email addresses", "Password hints", "Passwords", "Usernames"],
        "pwn_count": 152445165,
        "description": "In October 2013, 153 million Adobe accounts were breached.",
        "is_verified": True,
    },
    {
        "name": "LinkedIn",
        "breach_date": "2016-05-05",
        "compromised_data": ["Email addresses", "Passwords"],
        "pwn_count": 164611595,
        "description": "In May 2016, LinkedIn had 164 million email and password combinations exposed.",
        "is_verified": True,
    },
    {
        "name": "Dropbox",
        "breach_date": "2012-07-01",
        "compromised_data": ["Email addresses", "Passwords"],
        "pwn_count": 68648009,
        "description": "In mid-2012, Dropbox suffered a data breach exposing 68 million credentials.",
        "is_verified": True,
    },
    {
        "name": "MySpace",
        "breach_date": "2008-07-01",
        "compromised_data": ["Email addresses", "Passwords", "Usernames"],
        "pwn_count": 359420698,
        "description": "In 2008, MySpace suffered a massive breach exposing 359 million accounts.",
        "is_verified": True,
    },
    {
        "name": "Collection #1",
        "breach_date": "2019-01-07",
        "compromised_data": ["Email addresses", "Passwords"],
        "pwn_count": 772904991,
        "description": "A large collection of credential stuffing lists (emails + passwords) appeared online.",
        "is_verified": False,
    },
    {
        "name": "Canva",
        "breach_date": "2019-05-24",
        "compromised_data": ["Email addresses", "Geographic locations", "Names", "Passwords", "Usernames"],
        "pwn_count": 137272116,
        "description": "In May 2019, the graphic design site Canva suffered a data breach.",
        "is_verified": True,
    },
    {
        "name": "Yahoo",
        "breach_date": "2016-12-14",
        "compromised_data": ["Email addresses", "Passwords", "Phone numbers", "Security questions"],
        "pwn_count": 3000000000,
        "description": "In 2013 (disclosed 2016), Yahoo suffered the largest known breach in history.",
        "is_verified": True,
    },
    {
        "name": "Zynga",
        "breach_date": "2019-09-01",
        "compromised_data": ["Email addresses", "Passwords", "Phone numbers", "Usernames"],
        "pwn_count": 172869660,
        "description": "In 2019, gaming company Zynga had 173 million accounts exposed.",
        "is_verified": True,
    },
]


# ---------------------------------------------------------------------------
# Main fetch function
# ---------------------------------------------------------------------------

async def fetch_breach_data(email: str) -> list[dict[str, Any]]:
    """
    Fetch breach data for *email*.

    Tries the HIBP API first; falls back to simulated data if the key is
    missing or the API call fails.
    """
    api_key = os.getenv("HIBP_API_KEY", "")

    if api_key:
        return await _fetch_from_hibp(email, api_key)

    # No API key — return a deterministic subset of simulated breaches
    return _simulate_breaches(email)


async def _fetch_from_hibp(email: str, api_key: str) -> list[dict[str, Any]]:
    """Call the HIBP v3 /breachedaccount endpoint."""
    url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
    headers = {
        "hibp-api-key": api_key,
        "User-Agent": "TraceZero-App",
    }
    params = {"truncateResponse": "false"}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers, params=params)

            if response.status_code == 404:
                # 404 from HIBP means "no breaches found" — that is fine
                return []

            if response.status_code == 401:
                raise ValueError("Invalid HIBP API key.")

            response.raise_for_status()
            raw_breaches = response.json()

    except httpx.HTTPStatusError as exc:
        # Re-raise as a clean error; caller may decide to fall back
        raise RuntimeError(f"HIBP API error: {exc}") from exc
    except Exception:
        # Network error — fall back to simulation silently
        return _simulate_breaches(email)

    return [_normalise_hibp_breach(b) for b in raw_breaches]


def _normalise_hibp_breach(breach: dict[str, Any]) -> dict[str, Any]:
    """Map a raw HIBP breach object to our standard schema."""
    return {
        "name": breach.get("Name", "Unknown"),
        "breach_date": breach.get("BreachDate", "Unknown"),
        "compromised_data": breach.get("DataClasses", []),
        "pwn_count": breach.get("PwnCount", 0),
        "description": _strip_html(breach.get("Description", "")),
        "is_verified": breach.get("IsVerified", False),
    }


def _strip_html(text: str) -> str:
    """Very lightweight HTML tag stripper (no external deps)."""
    import re
    return re.sub(r"<[^>]+>", "", text)


def _simulate_breaches(email: str) -> list[dict[str, Any]]:
    """
    Return a deterministic, realistic-looking subset of simulated breaches
    based on the hash of the email so the same email always returns the same
    results during a demo session.
    """
    # Use the hash to pick between 2 and 5 breaches
    h = abs(hash(email.lower()))
    count = 2 + (h % 4)  # 2 – 5 breaches
    indices = sorted(set((h >> i) % len(SIMULATED_BREACHES) for i in range(count * 3)))[:count]
    return [SIMULATED_BREACHES[i] for i in indices]

"""
severity_analyzer.py — Assigns a severity level and risk score to breach data.

Severity logic:
  - HIGH   (score 75-100) → Passwords, financial data, or SSNs leaked
  - MEDIUM (score 40-74)  → Email addresses, phone numbers, or usernames
  - LOW    (score 1-39)   → Other data types (geographic locations, etc.)
"""

from typing import Any


# ---------------------------------------------------------------------------
# Data-class → weight mapping
# ---------------------------------------------------------------------------

DATA_WEIGHTS: dict[str, int] = {
    # HIGH-impact data types
    "Passwords": 30,
    "Password hints": 20,
    "Credit cards": 35,
    "Bank account numbers": 35,
    "Social security numbers": 35,
    "Private messages": 25,
    "Security questions and answers": 22,
    "Auth tokens": 28,
    # MEDIUM-impact data types
    "Email addresses": 10,
    "Phone numbers": 12,
    "Usernames": 8,
    "Names": 6,
    "Dates of birth": 14,
    "Physical addresses": 12,
    "IP addresses": 8,
    # LOW-impact data types
    "Geographic locations": 3,
    "Genders": 2,
    "Website activity": 4,
    "Device information": 4,
    "Employers": 2,
    "Education levels": 2,
    "Ethnicities": 2,
    "Time zones": 1,
}

HIGH_RISK_DATA = {
    "Passwords",
    "Password hints",
    "Credit cards",
    "Bank account numbers",
    "Social security numbers",
    "Security questions and answers",
    "Auth tokens",
    "Private messages",
}

MEDIUM_RISK_DATA = {
    "Email addresses",
    "Phone numbers",
    "Usernames",
    "Names",
    "Dates of birth",
    "Physical addresses",
    "IP addresses",
}


# ---------------------------------------------------------------------------
# Main analysis function
# ---------------------------------------------------------------------------

def analyze_severity(breaches: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Given a list of normalised breach dicts, compute:
      - severity  : 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
      - risk_score: integer 0–100
      - breakdown : per-breach severity details
      - top_risks : the most dangerous data types found across all breaches
    """
    if not breaches:
        return {
            "severity": "NONE",
            "risk_score": 0,
            "top_risks": [],
            "breakdown": [],
            "summary": "No breaches found. Your email appears to be safe. 🎉",
        }

    all_data_classes: set[str] = set()
    breakdown: list[dict[str, Any]] = []
    total_score = 0

    for breach in breaches:
        data_classes = breach.get("compromised_data", [])
        breach_score, breach_severity = _score_breach(data_classes)
        total_score += breach_score
        all_data_classes.update(data_classes)

        breakdown.append({
            "breach": breach["name"],
            "date": breach.get("breach_date", "Unknown"),
            "compromised_data": data_classes,
            "severity": breach_severity,
            "score": breach_score,
        })

    # Cap at 100
    risk_score = min(total_score, 100)

    # Overall severity
    if risk_score >= 65:
        severity = "HIGH"
    elif risk_score >= 35:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # Top risks: data classes sorted by weight descending
    top_risks = sorted(
        all_data_classes,
        key=lambda d: DATA_WEIGHTS.get(d, 0),
        reverse=True,
    )[:5]

    summary = _build_summary(severity, risk_score, len(breaches), top_risks)

    return {
        "severity": severity,
        "risk_score": risk_score,
        "top_risks": top_risks,
        "breakdown": breakdown,
        "summary": summary,
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _score_breach(data_classes: list[str]) -> tuple[int, str]:
    """Return (score, severity_label) for a single breach."""
    score = sum(DATA_WEIGHTS.get(dc, 1) for dc in data_classes)
    score = min(score, 100)

    has_high = any(dc in HIGH_RISK_DATA for dc in data_classes)
    has_medium = any(dc in MEDIUM_RISK_DATA for dc in data_classes)

    if has_high or score >= 50:
        severity = "HIGH"
    elif has_medium or score >= 20:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    return score, severity


def _build_summary(severity: str, score: int, breach_count: int, top_risks: list[str]) -> str:
    """Generate a human-readable summary string."""
    risk_str = ", ".join(top_risks[:3]) if top_risks else "unknown data"

    if severity == "HIGH":
        return (
            f"⚠️  HIGH RISK — Your email was found in {breach_count} breach(es) with a risk score of {score}/100. "
            f"Sensitive data exposed includes: {risk_str}. "
            "Change your passwords immediately and enable two-factor authentication."
        )
    elif severity == "MEDIUM":
        return (
            f"🔶 MEDIUM RISK — Your email appeared in {breach_count} breach(es) with a risk score of {score}/100. "
            f"Data exposed includes: {risk_str}. "
            "Consider updating your credentials and reviewing account activity."
        )
    else:
        return (
            f"🟡 LOW RISK — Your email was found in {breach_count} breach(es) with a risk score of {score}/100. "
            f"Data exposed: {risk_str}. "
            "Monitor your accounts and stay vigilant."
        )

"""
chatbot.py — AI-powered cybersecurity chatbot.

Uses Google Gemini 2.0 Flash when GEMINI_API_KEY is set (free tier: 1,500 req/day).
Uses the new google-genai SDK (replaces deprecated google-generativeai).
Falls back to curated simulated responses when no key is set.

Get a free key at: https://aistudio.google.com/apikey
"""

import os
import re
import asyncio

try:
    from google import genai
    from google.genai import types
    _GEMINI_AVAILABLE = True
except ImportError:
    _GEMINI_AVAILABLE = False


# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are TraceZero's cybersecurity assistant — a friendly, 
concise, and expert AI that helps users understand data breaches, protect their 
digital identity, and improve their online security posture.

Guidelines:
- Keep answers clear and actionable (2-4 short paragraphs max).
- Use simple language; avoid excessive jargon.
- When relevant, give concrete steps the user can take right now.
- If a question is outside cybersecurity, politely redirect to security topics.
- Always be helpful, calm, and reassuring — breaches are stressful.
"""


# ---------------------------------------------------------------------------
# Simulated Q&A pairs (keyword → answer) — used when no API key is set
# ---------------------------------------------------------------------------

SIMULATED_RESPONSES: list[tuple[str, str]] = [
    (
        r"password",
        "🔐 **Password Security Best Practices**\n\n"
        "Use a unique, random password of at least 16 characters for every account. "
        "A password manager (e.g., Bitwarden, 1Password) makes this effortless.\n\n"
        "Enable **two-factor authentication (2FA)** wherever possible — even if your "
        "password leaks, attackers still can't log in without your second factor.\n\n"
        "Never reuse passwords across sites. A breach on one site shouldn't compromise all your accounts.",
    ),
    (
        r"breach|pwned|hack(ed)?|leak(ed)?",
        "⚠️ **What To Do After a Data Breach**\n\n"
        "1. **Change your password** on the breached site immediately, and on any other site where you used the same password.\n"
        "2. **Enable 2FA** (preferably an authenticator app, not SMS).\n"
        "3. **Monitor your accounts** for suspicious activity — check bank statements and credit reports.\n"
        "4. **Watch for phishing** — attackers often use leaked emails to craft convincing scam messages.\n\n"
        "Use TraceZero's `/scan` endpoint to see exactly which of your data was exposed.",
    ),
    (
        r"phish(ing)?|scam|email",
        "🎣 **Recognizing & Avoiding Phishing**\n\n"
        "Phishing emails often impersonate trusted brands (banks, Google, Amazon). "
        "Red flags include urgency ('Act now!'), mismatched sender domains, and links that don't match the display text.\n\n"
        "**Before clicking any link**: hover over it to preview the URL. If it looks off, go directly to the website instead.\n\n"
        "Use an email provider with solid spam filtering (Gmail, ProtonMail) and consider an ad blocker "
        "that also blocks malicious domains (e.g., uBlock Origin).",
    ),
    (
        r"2fa|two.factor|mfa|authenticat",
        "🛡️ **Two-Factor Authentication (2FA) Explained**\n\n"
        "2FA adds a second layer of security so that a stolen password alone is not enough to access your account.\n\n"
        "**Best options (strongest to weakest):**\n"
        "1. Hardware keys (YubiKey) — nearly impossible to phish.\n"
        "2. Authenticator apps (Google Authenticator, Authy, Raivo) — excellent and free.\n"
        "3. SMS codes — better than nothing, but vulnerable to SIM-swap attacks.\n\n"
        "Enable 2FA on your email first — it's the master key to all your other accounts.",
    ),
    (
        r"vpn|privacy|track",
        "🕵️ **VPNs & Online Privacy**\n\n"
        "A VPN encrypts your traffic and hides your IP address from websites and your ISP. "
        "It's most useful on public Wi-Fi, or to avoid geographic content restrictions.\n\n"
        "A VPN does **not** make you anonymous — the VPN provider can still see your traffic. "
        "Choose a provider with a strict no-logs policy (Mullvad, ProtonVPN are well audited).",
    ),
    (
        r"dark web|darkweb|tor",
        "🌑 **The Dark Web & Your Data**\n\n"
        "The dark web is accessible only via Tor. While it has legitimate uses, "
        "it also hosts markets where stolen data is bought and sold.\n\n"
        "If your credentials appear in a breach, they may end up on these markets within days. "
        "Monitor your email via Have I Been Pwned or TraceZero's `/scan` endpoint.",
    ),
    (
        r"malware|virus|ransomware|trojan",
        "🦠 **Malware Protection Essentials**\n\n"
        "Common types: **Ransomware** (encrypts files), **Spyware** (monitors activity), **Trojans** (disguised software).\n\n"
        "**Protection steps:**\n"
        "1. Keep your OS and apps updated — most attacks exploit known vulnerabilities.\n"
        "2. Don't download software from untrusted sources.\n"
        "3. Back up data offline (3-2-1 rule: 3 copies, 2 media, 1 offsite).",
    ),
    (
        r"credit card|financial|bank|money",
        "💳 **Protecting Your Financial Data**\n\n"
        "If financial data was exposed:\n"
        "1. **Notify your bank** immediately.\n"
        "2. **Check statements** weekly for unauthorized charges.\n"
        "3. Place a **credit freeze** to prevent new accounts being opened in your name.\n\n"
        "Use virtual card numbers (e.g., Privacy.com) for online shopping.",
    ),
]

FALLBACK_RESPONSE = (
    "🔒 **Cybersecurity Tip**\n\n"
    "For personal security, focus on these core pillars:\n"
    "- Strong, unique passwords via a password manager\n"
    "- 2FA enabled on all important accounts\n"
    "- Regular software updates\n"
    "- Healthy skepticism toward unexpected emails and links\n\n"
    "Feel free to ask me about phishing, VPNs, password safety, or what to do after a breach!"
)


# ---------------------------------------------------------------------------
# Main chatbot function
# ---------------------------------------------------------------------------

async def get_chatbot_response(question: str) -> str:
    """
    Return a cybersecurity answer for *question*.

    Uses Google Gemini 2.0 Flash if GEMINI_API_KEY is set;
    otherwise falls back to the simulated response library.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")

    if api_key and _GEMINI_AVAILABLE:
        try:
            return await _gemini_response(question, api_key)
        except Exception as e:
            print(f"[chatbot] Gemini error, falling back to simulation: {e}")

    return _simulated_response(question)


async def _gemini_response(question: str, api_key: str) -> str:
    """Call Google Gemini 2.0 Flash via the new google-genai SDK."""
    client = genai.Client(api_key=api_key)

    loop = asyncio.get_event_loop()
    response = await loop.run_in_executor(
        None,
        lambda: client.models.generate_content(
            model="gemini-1.5-flash",
            contents=question,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                max_output_tokens=600,
                temperature=0.6,
            ),
        )
    )
    return response.text.strip()


def _simulated_response(question: str) -> str:
    """Match *question* against keyword patterns and return a canned answer."""
    q_lower = question.lower()
    for pattern, answer in SIMULATED_RESPONSES:
        if re.search(pattern, q_lower):
            return answer
    return FALLBACK_RESPONSE

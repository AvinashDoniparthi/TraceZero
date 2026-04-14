# TraceZero — Next-Gen Digital Exposure Dashboard

TraceZero is a high-fidelity, full-stack cybersecurity intelligence platform that scans emails and usernames across multiple OSINT sources, calculating a comprehensive risk score and providing AI-powered advice. Built for hackathons and presentations, it features a highly interactive, "premium" glassmorphism dashboard, dynamic bubble graphs, and extensive intelligence reporting.

## 🌟 Key Features

- **Multi-Source OSINT Pipeline**: Concurrently scans targets using Have I Been Pwned (data breaches), Hunter.io (email intelligence), VirusTotal (domain security), and Social Searcher (social footprint).
- **Interactive Severity Scoring Engine**: A deterministic algorithm surfaces an overarching Risk Score (0-100) mapped to highly visual UI paradigms (Radial Gauges, interactive bubble node representations).
- **Cyber Intelligence Wiki**: A comprehensive, built-in educational hub explaining the core platform architecture and providing high-level cybersecurity concepts.
- **AI-Powered Remediation**: Integrates Google's Gemini Flash 2.0 to offer context-aware, step-by-step remediation strategies based on the specific threats found during the scan.
- **Immersive "Vibrant Cyber" UI**: Built with vanilla CSS/JS utilizing glassmorphism, glowing accents, SVG animations, radar scans, and dynamic tickers to create a "wow factor" dashboard.
- **Firebase Authentication**: Integrated secure authentication (Google, Phone, Email) for an enterprise feel.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Next-Gen UI, Glassmorphism, CSS Variables, Animations), Vanilla JavaScript.
- **Backend / API**: Python 3, FastAPI (Single-file optimal deployment), Uvicorn.
- **AI Integration**: Google Gemini API via `google-genai`.
- **Integrations via REST**: HaveIBeenPwned, Hunter.io, VirusTotal, SocialSearcher.
- **Auth**: Firebase Authentication SDK.

## 📂 Project Structure

```text
tracezero/
├── index.html            ← Main Dashboard UI (Search, Results, Wiki, Tickers)
├── scoring_engine.html   ← Dedicated Interactive Severity Bubble Engine UI
├── check.js              ← Authentication & Core Frontend Logic
├── main.py               ← Single-file FastAPI Backend (OSINT aggregators, Gemini, Endpoints)
├── requirements.txt      ← Python dependencies
├── run.bat               ← Windows runner script
├── vercel.json           ← Cloud deployment mapping
├── render.yaml           ← Alternative deployment configs
├── .env                  ← Environment variables (API Keys)
└── README.md             ← This file
```

## 🚀 Quick Start (Local Setup)

The API is fully built to "fail gracefully" with simulated/deterministic fallback data when specific API credentials aren't defined, ensuring smooth presentations!

### 1. Backend Server Setup
```bash
# Clone the repository
git clone https://github.com/AvinashDoniparthi/TraceZero.git
cd TraceZero

# Set up Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install requirements
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Edit .env to add your free tier API keys (Gemini, VT, Hunter, HIBP)
```

### 2. Run the Platform

You can boot everything using the windows runner script:
```bash
.\run.bat
```

Alternatively, manually run the backend:
```bash
uvicorn main:app --reload
```
The API spins up at `http://localhost:8000`.

### 3. Open the Dashboard
Simply use a local server for the UI to satisfy Firebase/CORS constraints:
```bash
npx serve .
```
Navigate your browser to the local server port provided by `npx serve` (typically `http://localhost:3000`).

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API Healthcheck and status |
| GET | `/scan?input=user@ex.com` | Run the multi-source OSINT pipeline concurrently. |
| GET | `/analyze?input=user` | Core Engine: Returns aggregated Risk Score, High-Risk Flags, and detailed breakdown. |
| POST| `/chat` | Gemini API: Send scan context and question for bespoke remediation advice. |

## 🎨 Interactive Dashboards

- **`index.html`**: The main hub. Features dynamic background meshes, glitch-terminal overlays, and the main data visualization grids upon scanning. Includes the persistent "Intelligence Wiki" available via top navigation.
- **`scoring_engine.html`**: A specialized sub-view specifically designed to showcase a floating, interactive bubble-force graph representation of exposure nodes (using standard vanilla JS).

---
*Created by [Avinash Doniparthi](https://github.com/AvinashDoniparthi)*

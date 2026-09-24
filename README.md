# JournAI — Full-Stack Agentic AI Travel Booking Platform

JournAI is a portfolio-quality, production-ready travel booking platform combining traditional commercial booking workflows (flights, hotels, filters, checkout, my trips) with an autonomous AI travel assistant powered by Google Gemini 2.5 Flash, RAG (Retrieval-Augmented Generation), Model Context Protocol (MCP), and Voice AI.

---

## 🌟 Key Features & Capabilities

### 1. Mode A — Traditional Commercial Travel Booking
- **Manual Flight Search & Comparison**: Search flights by origin, destination, departure date, cabin class, and passenger count. Filter by stops, airlines, and price ranges. Sort by cheapest, fastest, highest price, or departure time.
- **Manual Hotel Search & Room Selection**: Search properties by city, check-in date, stay duration, and guest counts. Filter by star rating and price range. View total stay calculations and amenity badges.

### 2. Mode B — Conversational AI Travel Agent
- **Natural Language Trip Planning**: Enter queries like *"Plan a 4-day trip from Delhi to Goa under ₹30,000 for 2 people"*.
- **Autonomous Intent & Parameter Extraction**: Automatically extracts origin, destination, duration, budget, and traveler count.
- **Action Transparency Stream**: Displays live agent status updates (*"Searching flights with Duffel Engine..."*, *"Comparing hotel offers..."*, *"Querying RAG knowledge base..."*, *"Calculating day-by-day budget..."*).
- **Multi-Category Budget Breakdown**: Visualizes exact allocations across Flights, Hotels, Food, Transportation, and Sightseeing Activities.
- **Dynamic Budget Optimization**: Conversational recalculation (e.g. *"Make it cheaper"*) adjusts flight offers, hotel ratings, and transportation modes to fit user budgets.
- **Voice AI Assistant**: Talk directly using the `🎙 Talk to AI` Web Speech STT/TTS voice interaction module.

### 3. RAG Travel Knowledge Retrieval Engine
- **Vector Knowledge Base**: Ingests structured destination guides (`rag/documents/goa.md`, `manali.md`, `jaipur.md`, `kerala.md`, `mumbai_delhi.md`).
- **Grounded Recommendations**: Provides authentic local food highlights, culture tips, packing suggestions, and best seasons to visit.

### 4. Standalone Travel MCP Server (`mcp_server/`)
- Exposes standardized travel tools:
  - `search_flights`
  - `search_hotels`
  - `get_weather`
  - `search_places`
  - `book_flight` (Protected by human confirmation)
  - `book_hotel` (Protected by human confirmation)

### 5. Human-in-the-Loop Financial Security & Razorpay Integration
- **Strict Human Confirmation**: Financial tool executions require explicit user confirmation before transaction order creation.
- **Server-Side HMAC SHA256 Verification**: Verifies payment signatures server-side.
- **Clear Sandbox Disclaimer**: Displays `TEST BOOKING — NO REAL TICKET ISSUED` across receipts.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Web Speech API.
- **Backend**: Python 3.12, FastAPI, Motor (Async MongoDB), Pydantic v2, PyJWT, Passlib (PBKDF2 SHA256).
- **AI & RAG**: Google Gemini 2.5 Flash, LangChain, Custom Vector RAG Engine.
- **MCP**: FastMCP Python Server (`mcp_server/server.py`).
- **Travel & Payments**: Duffel Travel API adapter (with sandbox fallback), Razorpay payment gateway adapter.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.11+
- Node.js v18+ & npm

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Running the Backend Server
```bash
# Navigate to workspace root
pip install -r backend/requirements.txt
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 4. Running the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 5. Running Standalone MCP Server
```bash
pip install -r mcp_server/requirements.txt
python mcp_server/server.py
```

### 6. Running Test Suite
```bash
$env:PYTHONPATH="backend"
python -m pytest backend/tests/
```

---

## 📁 Repository Structure

```
AI Travel Agent/
├── frontend/                  # Next.js 14 TypeScript Frontend
│   ├── app/                   # App Router pages (/, /flights, /hotels, /ai-agent, /checkout, /my-trips, /login, /register)
│   ├── components/            # UI Components (Navbar, Footer, Providers)
│   ├── context/               # AuthContext
│   ├── services/              # Axios API client
│   └── types/                 # TypeScript interfaces
├── backend/                   # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py            # FastAPI Entry Point
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # MongoDB connection with resilient fallback
│   │   ├── routes/            # Auth, Flights, Hotels, AI, Payments, Bookings, Trips
│   │   ├── services/          # Duffel flight, Hotel, Payment, Auth services
│   │   ├── agents/            # Agent controller & Itinerary generator
│   │   └── rag/               # Vector store loader & retriever
│   └── tests/                 # pytest test suite
├── mcp_server/                # FastMCP Travel Tools Server
│   ├── server.py
│   └── tools/                 # Flights, Hotels, Weather, Places, Bookings tools
├── rag/
│   └── documents/             # Destination markdown knowledge base
└── docs/                      # Technical documentation
```

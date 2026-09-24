# System Architecture — JournAI Platform

## Architectural Principle & Separation of Responsibilities

1. **Static / Knowledge Information (RAG)**:
   - Uses Retrieval-Augmented Generation for destination guides, tourist spots, packing tips, and local customs.
   - Grounded in `rag/documents/*.md`.

2. **Dynamic Information (API Adapters & MCP Tools)**:
   - Uses real-time Duffel flight search, hotel availability, weather forecasts, and places tools.
   - Never retrieved via RAG.

3. **Transactional Information (Backend + Database + Security)**:
   - User authentication, payments, Razorpay order creation, server-side HMAC signature verification, flight/hotel booking creation, and MongoDB persistence.

---

## Component Diagram

```
Frontend (Next.js 14)
   ├── Navbar & AuthContext
   ├── Mode A: Flight & Hotel Search Pages
   ├── Mode B: Conversational AI Assistant & Voice AI
   ├── Checkout & Payment Gateway Modal
   └── My Trips Dashboard
           │
           ▼ (REST API / JSON)
FastAPI Backend API (Port 8000)
   ├── Auth Router & JWT Service
   ├── Flight & Hotel Search Routers (Duffel Adapter)
   ├── AI Agent Controller (Gemini 2.5 Flash + RAG Vector Engine)
   ├── Payment Gateway Router (Razorpay HMAC Verification)
   ├── Bookings Router (MongoDB Motor async driver)
   └── Trips Router
           │
           ▼
FastMCP Travel Server (mcp_server/server.py)
   ├── Flight Tools
   ├── Hotel Tools
   ├── Weather Tools
   ├── Places Tools
   └── Booking Security Tools
```

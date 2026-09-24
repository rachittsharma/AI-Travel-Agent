from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.database import db_manager
from app.routes import auth, flights, hotels, ai, payments, bookings, trips

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_travel_agent")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Travel Agent Backend Server...")
    await db_manager.connect()
    yield
    logger.info("Shutting down AI Travel Agent Backend Server...")
    await db_manager.close()

app = FastAPI(
    title="AI Travel Agent & Booking Platform API",
    description="Full-stack AI travel booking platform API powered by Gemini 2.5 Flash, RAG, and MCP tools.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(flights.router)
app.include_router(hotels.router)
app.include_router(ai.router)
app.include_router(payments.router)
app.include_router(bookings.router)
app.include_router(trips.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "AI Travel Agent API",
        "demo_mode": settings.DEMO_MODE,
        "database": "connected" if db_manager.is_connected else "in_memory_fallback"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if db_manager.is_connected else "in_memory_fallback",
        "demo_mode": settings.DEMO_MODE
    }

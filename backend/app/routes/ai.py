from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.agent_controller import agent_controller
from app.agents.itinerary_generator import itinerary_generator

router = APIRouter(prefix="/api/ai", tags=["AI Travel Agent"])

class AIChatRequest(BaseModel):
    prompt: str
    conversationHistory: List[Dict[str, str]] = []

class AIItineraryRequest(BaseModel):
    origin: str = "Delhi"
    destination: str = "Goa"
    days: int = 4
    travelers: int = 1
    budget: float = 30000.0
    interests: List[str] = []
    makeCheaper: bool = False

@router.post("/chat")
async def chat_with_agent(req: AIChatRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    return await agent_controller.process_chat(req.prompt, req.conversationHistory)

@router.post("/itinerary")
async def generate_itinerary(req: AIItineraryRequest):
    return itinerary_generator.generate_trip_plan(
        origin=req.origin,
        destination=req.destination,
        days=req.days,
        travelers=req.travelers,
        budget=req.budget,
        interests=req.interests,
        make_cheaper=req.makeCheaper
    )

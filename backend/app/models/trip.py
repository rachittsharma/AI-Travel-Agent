from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ItineraryDay(BaseModel):
    day: int
    title: str
    schedule: List[Dict[str, Any]] = []

class TripCreateRequest(BaseModel):
    origin: str
    destination: str
    startDate: str
    endDate: str
    travelers: int = 1
    budget: float
    interests: List[str] = []

class TripResponse(BaseModel):
    id: str
    userId: str
    origin: str
    destination: str
    startDate: str
    endDate: str
    travelers: int
    budget: float
    spent: float = 0.0
    interests: List[str] = []
    itinerary: List[ItineraryDay] = []
    flightBookingId: Optional[str] = None
    hotelBookingId: Optional[str] = None
    status: str = "PLANNED"
    createdAt: datetime = Field(default_factory=datetime.utcnow)

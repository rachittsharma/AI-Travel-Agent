from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class FlightBookingCreate(BaseModel):
    tripId: Optional[str] = None
    flightDetails: Dict[str, Any]
    passengerDetails: Dict[str, Any]
    amount: float
    currency: str = "INR"

class HotelBookingCreate(BaseModel):
    tripId: Optional[str] = None
    hotelDetails: Dict[str, Any]
    guestDetails: Dict[str, Any]
    amount: float
    currency: str = "INR"

class BookingResponse(BaseModel):
    id: str
    userId: str
    tripId: Optional[str] = None
    type: str # "FLIGHT" | "HOTEL"
    provider: str = "duffel_sandbox"
    providerBookingId: str
    bookingDetails: Dict[str, Any]
    customerDetails: Dict[str, Any]
    amount: float
    currency: str = "INR"
    paymentId: Optional[str] = None
    status: str = "CONFIRMED" # PENDING, CONFIRMED, CANCELLED, FAILED
    isTestBooking: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)

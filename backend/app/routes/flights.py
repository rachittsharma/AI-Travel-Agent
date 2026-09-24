from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.services.duffel_service import flight_service

router = APIRouter(prefix="/api/flights", tags=["Flights Search"])

class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departureDate: str
    passengers: int = 1
    cabinClass: str = "economy"
    sortBy: str = "cheapest"
    maxPrice: Optional[float] = None
    stopsFilter: Optional[str] = "all"
    airlineFilter: Optional[str] = "all"

@router.post("/search")
async def search_flights(req: FlightSearchRequest):
    results = flight_service.search_flights(
        origin=req.origin,
        destination=req.destination,
        departure_date=req.departureDate,
        passengers=req.passengers,
        cabin_class=req.cabinClass,
        sort_by=req.sortBy,
        max_price=req.maxPrice,
        stops_filter=req.stopsFilter,
        airline_filter=req.airlineFilter
    )
    return {"count": len(results), "flights": results}

@router.get("/{offer_id}")
async def get_flight_offer(offer_id: str):
    offer = flight_service.get_flight_details(offer_id)
    if not offer:
        raise HTTPException(status_code=44, detail="Flight offer not found")
    return offer

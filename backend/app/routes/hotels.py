from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.hotel_service import hotel_service

router = APIRouter(prefix="/api/hotels", tags=["Hotels Search"])

class HotelSearchRequest(BaseModel):
    city: str
    guests: int = 1
    rooms: int = 1
    nights: int = 3
    minRating: Optional[float] = None
    maxPrice: Optional[float] = None
    amenities: List[str] = []
    sortBy: str = "recommended"

@router.post("/search")
async def search_hotels(req: HotelSearchRequest):
    results = hotel_service.search_hotels(
        city=req.city,
        guests=req.guests,
        rooms=req.rooms,
        nights=req.nights,
        min_rating=req.minRating,
        max_price=req.maxPrice,
        amenities_filter=req.amenities,
        sort_by=req.sortBy
    )
    return {"count": len(results), "hotels": results}

@router.get("/{hotel_id}")
async def get_hotel(hotel_id: str):
    hotel = hotel_service.get_hotel_details(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel

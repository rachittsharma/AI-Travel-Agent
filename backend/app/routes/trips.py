import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.trip import TripCreateRequest, TripResponse, ItineraryDay
from app.models.user import UserResponse
from app.services.auth_service import get_current_user
from app.agents.itinerary_generator import itinerary_generator
from app.database import db_manager

router = APIRouter(prefix="/api/trips", tags=["Trips & Itineraries"])

@router.post("", response_model=TripResponse)
async def create_trip(
    req: TripCreateRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    trip_id = str(uuid.uuid4())
    
    # Generate itinerary
    plan = itinerary_generator.generate_trip_plan(
        origin=req.origin,
        destination=req.destination,
        days=4,
        travelers=req.travelers,
        budget=req.budget,
        interests=req.interests
    )

    itinerary_days = [ItineraryDay(**day) for day in plan["itinerary"]]

    trip_dict = {
        "_id": trip_id,
        "id": trip_id,
        "userId": current_user.id,
        "origin": req.origin,
        "destination": req.destination,
        "startDate": req.startDate,
        "endDate": req.endDate,
        "travelers": req.travelers,
        "budget": req.budget,
        "spent": plan["budgetBreakdown"]["totalEstimatedCost"],
        "interests": req.interests,
        "itinerary": [day.model_dump() for day in itinerary_days],
        "flightBookingId": None,
        "hotelBookingId": None,
        "status": "PLANNED",
        "createdAt": datetime.utcnow()
    }

    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.trips.insert_one(trip_dict)
    else:
        db_manager.in_memory_store["trips"][trip_id] = trip_dict

    return TripResponse(**trip_dict)

@router.get("", response_model=List[TripResponse])
async def get_user_trips(current_user: UserResponse = Depends(get_current_user)):
    trips_list = []

    if db_manager.is_connected and db_manager.db is not None:
        trips = await db_manager.db.trips.find({"userId": current_user.id}).to_list(100)
        for t in trips:
            trips_list.append(TripResponse(**t))
    else:
        for t in db_manager.in_memory_store["trips"].values():
            if t["userId"] == current_user.id:
                trips_list.append(TripResponse(**t))

    trips_list.sort(key=lambda x: x.createdAt, reverse=True)
    return trips_list

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip_details(
    trip_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    trip_dict = None
    if db_manager.is_connected and db_manager.db is not None:
        trip_dict = await db_manager.db.trips.find_one({"_id": trip_id, "userId": current_user.id})
    else:
        t = db_manager.in_memory_store["trips"].get(trip_id)
        if t and t["userId"] == current_user.id:
            trip_dict = t

    if not trip_dict:
        raise HTTPException(status_code=404, detail="Trip not found")

    return TripResponse(**trip_dict)

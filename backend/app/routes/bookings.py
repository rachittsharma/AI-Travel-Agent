import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.models.booking import FlightBookingCreate, HotelBookingCreate, BookingResponse
from app.models.user import UserResponse
from app.services.auth_service import get_current_user
from app.database import db_manager

router = APIRouter(prefix="/api/bookings", tags=["Bookings Workflow"])

@router.post("/flight", response_model=BookingResponse)
async def create_flight_booking(
    req: FlightBookingCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    booking_id = str(uuid.uuid4())
    provider_booking_id = f"DUFFEL_TEST_{uuid.uuid4().hex[:8].upper()}"

    booking_dict = {
        "_id": booking_id,
        "id": booking_id,
        "userId": current_user.id,
        "tripId": req.tripId,
        "type": "FLIGHT",
        "provider": "duffel_sandbox",
        "providerBookingId": provider_booking_id,
        "bookingDetails": req.flightDetails,
        "customerDetails": req.passengerDetails,
        "amount": req.amount,
        "currency": req.currency,
        "status": "CONFIRMED",
        "isTestBooking": True,
        "createdAt": datetime.utcnow()
    }

    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.flight_bookings.insert_one(booking_dict)
    else:
        db_manager.in_memory_store["flight_bookings"][booking_id] = booking_dict

    return BookingResponse(**booking_dict)

@router.post("/hotel", response_model=BookingResponse)
async def create_hotel_booking(
    req: HotelBookingCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    booking_id = str(uuid.uuid4())
    provider_booking_id = f"HT_TEST_{uuid.uuid4().hex[:8].upper()}"

    booking_dict = {
        "_id": booking_id,
        "id": booking_id,
        "userId": current_user.id,
        "tripId": req.tripId,
        "type": "HOTEL",
        "provider": "hotel_sandbox",
        "providerBookingId": provider_booking_id,
        "bookingDetails": req.hotelDetails,
        "customerDetails": req.guestDetails,
        "amount": req.amount,
        "currency": req.currency,
        "status": "CONFIRMED",
        "isTestBooking": True,
        "createdAt": datetime.utcnow()
    }

    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.hotel_bookings.insert_one(booking_dict)
    else:
        db_manager.in_memory_store["hotel_bookings"][booking_id] = booking_dict

    return BookingResponse(**booking_dict)

@router.get("", response_model=List[BookingResponse])
async def get_user_bookings(current_user: UserResponse = Depends(get_current_user)):
    user_bookings = []

    if db_manager.is_connected and db_manager.db is not None:
        flights = await db_manager.db.flight_bookings.find({"userId": current_user.id}).to_list(100)
        hotels = await db_manager.db.hotel_bookings.find({"userId": current_user.id}).to_list(100)
        for b in flights + hotels:
            user_bookings.append(BookingResponse(**b))
    else:
        for b in list(db_manager.in_memory_store["flight_bookings"].values()) + list(db_manager.in_memory_store["hotel_bookings"].values()):
            if b["userId"] == current_user.id:
                user_bookings.append(BookingResponse(**b))

    user_bookings.sort(key=lambda x: x.createdAt, reverse=True)
    return user_bookings

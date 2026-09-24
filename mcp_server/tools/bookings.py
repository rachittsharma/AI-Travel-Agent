import uuid
from typing import Dict, Any

def book_flight_mcp(
    offer_id: str,
    passenger_details: Dict[str, Any],
    user_confirmed: bool = False
) -> Dict[str, Any]:
    """MCP Booking Tool: Requires human confirmation before execution."""
    if not user_confirmed:
        return {
            "status": "REQUIRES_HUMAN_CONFIRMATION",
            "message": "Explicit human confirmation required before financial flight booking.",
            "offer_id": offer_id,
            "action": "CONFIRM_PAYMENT_ORDER"
        }

    return {
        "status": "BOOKING_CONFIRMED",
        "provider": "duffel_sandbox",
        "booking_id": f"DUFFEL_TEST_{uuid.uuid4().hex[:8].upper()}",
        "message": "TEST BOOKING CONFIRMED — NO REAL TICKET ISSUED",
        "is_test_booking": True
    }

def book_hotel_mcp(
    hotel_id: str,
    guest_details: Dict[str, Any],
    user_confirmed: bool = False
) -> Dict[str, Any]:
    """MCP Booking Tool: Requires human confirmation before execution."""
    if not user_confirmed:
        return {
            "status": "REQUIRES_HUMAN_CONFIRMATION",
            "message": "Explicit human confirmation required before financial hotel booking.",
            "hotel_id": hotel_id,
            "action": "CONFIRM_PAYMENT_ORDER"
        }

    return {
        "status": "BOOKING_CONFIRMED",
        "provider": "hotel_sandbox",
        "booking_id": f"HT_TEST_{uuid.uuid4().hex[:8].upper()}",
        "message": "TEST HOTEL BOOKING CONFIRMED — NO REAL RESERVATION ISSUED",
        "is_test_booking": True
    }

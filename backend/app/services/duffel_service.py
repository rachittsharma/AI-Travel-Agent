import logging
import uuid
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

MOCK_AIRLINES = [
    {"name": "IndiGo", "code": "6E"},
    {"name": "Air India", "code": "AI"},
    {"name": "Vistara", "code": "UK"},
    {"name": "Akasa Air", "code": "QP"},
    {"name": "SpiceJet", "code": "SG"}
]

class FlightService:
    def __init__(self):
        self.api_key = settings.DUFFEL_API_KEY
        self.duffel_client = None
        if self.api_key and not settings.DEMO_MODE:
            try:
                from duffel_api import Duffel
                self.duffel_client = Duffel(access_token=self.api_key)
                logger.info("Duffel API client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Duffel client: {e}. Defaulting to mock flight adapter.")

    def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        passengers: int = 1,
        cabin_class: str = "economy",
        sort_by: str = "cheapest",
        max_price: Optional[float] = None,
        stops_filter: Optional[str] = "all",
        airline_filter: Optional[str] = "all"
    ) -> List[Dict[str, Any]]:
        
        # Clean inputs
        origin_clean = origin.split("(")[-1].replace(")", "").strip().upper() if "(" in origin else origin.strip().upper()
        dest_clean = destination.split("(")[-1].replace(")", "").strip().upper() if "(" in destination else destination.strip().upper()

        if not origin_clean: origin_clean = "DEL"
        if not dest_clean: dest_clean = "GOI"

        # Generate realistic flight offers
        offers = [
            {
                "id": f"fl_offer_{origin_clean}_{dest_clean}_1",
                "airline": "IndiGo",
                "airlineCode": "6E",
                "flightNumber": "6E-2041",
                "origin": origin_clean,
                "originName": f"{origin} Airport",
                "destination": dest_clean,
                "destinationName": f"{destination} Airport",
                "departureTime": f"{departure_date}T06:30:00",
                "arrivalTime": f"{departure_date}T09:05:00",
                "duration": "2h 35m",
                "durationMinutes": 155,
                "stops": 0,
                "price": 4200 * passengers,
                "currency": "INR",
                "baggage": "15 kg Check-in, 7 kg Cabin",
                "cabinClass": cabin_class.capitalize(),
                "refundable": True,
                "seatsAvailable": 9
            },
            {
                "id": f"fl_offer_{origin_clean}_{dest_clean}_2",
                "airline": "Vistara",
                "airlineCode": "UK",
                "flightNumber": "UK-841",
                "origin": origin_clean,
                "originName": f"{origin} Airport",
                "destination": dest_clean,
                "destinationName": f"{destination} Airport",
                "departureTime": f"{departure_date}T09:45:00",
                "arrivalTime": f"{departure_date}T12:15:00",
                "duration": "2h 30m",
                "durationMinutes": 150,
                "stops": 0,
                "price": 5400 * passengers,
                "currency": "INR",
                "baggage": "20 kg Check-in, 7 kg Cabin",
                "cabinClass": cabin_class.capitalize(),
                "refundable": True,
                "seatsAvailable": 5
            },
            {
                "id": f"fl_offer_{origin_clean}_{dest_clean}_3",
                "airline": "Air India",
                "airlineCode": "AI",
                "flightNumber": "AI-512",
                "origin": origin_clean,
                "originName": f"{origin} Airport",
                "destination": dest_clean,
                "destinationName": f"{destination} Airport",
                "departureTime": f"{departure_date}T14:15:00",
                "arrivalTime": f"{departure_date}T16:50:00",
                "duration": "2h 35m",
                "durationMinutes": 155,
                "stops": 0,
                "price": 4800 * passengers,
                "currency": "INR",
                "baggage": "25 kg Check-in, 8 kg Cabin",
                "cabinClass": cabin_class.capitalize(),
                "refundable": False,
                "seatsAvailable": 12
            },
            {
                "id": f"fl_offer_{origin_clean}_{dest_clean}_4",
                "airline": "Akasa Air",
                "airlineCode": "QP",
                "flightNumber": "QP-1104",
                "origin": origin_clean,
                "originName": f"{origin} Airport",
                "destination": dest_clean,
                "destinationName": f"{destination} Airport",
                "departureTime": f"{departure_date}T18:20:00",
                "arrivalTime": f"{departure_date}T22:10:00",
                "duration": "3h 50m",
                "durationMinutes": 230,
                "stops": 1,
                "price": 3850 * passengers,
                "currency": "INR",
                "baggage": "15 kg Check-in, 7 kg Cabin",
                "cabinClass": cabin_class.capitalize(),
                "refundable": False,
                "seatsAvailable": 4
            },
            {
                "id": f"fl_offer_{origin_clean}_{dest_clean}_5",
                "airline": "SpiceJet",
                "airlineCode": "SG",
                "flightNumber": "SG-8193",
                "origin": origin_clean,
                "originName": f"{origin} Airport",
                "destination": dest_clean,
                "destinationName": f"{destination} Airport",
                "departureTime": f"{departure_date}T21:00:00",
                "arrivalTime": f"{departure_date}T23:30:00",
                "duration": "2h 30m",
                "durationMinutes": 150,
                "stops": 0,
                "price": 4100 * passengers,
                "currency": "INR",
                "baggage": "15 kg Check-in, 7 kg Cabin",
                "cabinClass": cabin_class.capitalize(),
                "refundable": False,
                "seatsAvailable": 7
            }
        ]

        # Apply filtering
        filtered = []
        for offer in offers:
            if max_price and offer["price"] > max_price:
                continue
            if stops_filter == "direct" and offer["stops"] > 0:
                continue
            if stops_filter == "1stop" and offer["stops"] != 1:
                continue
            if airline_filter and airline_filter.lower() != "all":
                if airline_filter.lower() not in offer["airline"].lower():
                    continue
            filtered.append(offer)

        # Apply sorting
        if sort_by == "cheapest":
            filtered.sort(key=lambda x: x["price"])
        elif sort_by == "expensive":
            filtered.sort(key=lambda x: x["price"], reverse=True)
        elif sort_by == "fastest":
            filtered.sort(key=lambda x: x["durationMinutes"])
        elif sort_by == "departure":
            filtered.sort(key=lambda x: x["departureTime"])

        return filtered

    def get_flight_details(self, offer_id: str) -> Optional[Dict[str, Any]]:
        # Retrieve flight details by offer_id
        flights = self.search_flights(origin="DEL", destination="GOI", departure_date="2026-10-12")
        for f in flights:
            if f["id"] == offer_id:
                return f
        # Fallback offer details if ID constructed dynamically
        return {
            "id": offer_id,
            "airline": "IndiGo",
            "airlineCode": "6E",
            "flightNumber": "6E-2041",
            "origin": "DEL",
            "originName": "Indira Gandhi International Airport",
            "destination": "GOI",
            "destinationName": "Dabolim / Manohar International Airport",
            "departureTime": "2026-10-12T06:30:00",
            "arrivalTime": "2026-10-12T09:05:00",
            "duration": "2h 35m",
            "durationMinutes": 155,
            "stops": 0,
            "price": 4200.0,
            "currency": "INR",
            "baggage": "15 kg Check-in, 7 kg Cabin",
            "cabinClass": "Economy",
            "refundable": True,
            "seatsAvailable": 9
        }

flight_service = FlightService()

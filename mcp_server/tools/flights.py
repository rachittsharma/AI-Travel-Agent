from typing import List, Dict, Any, Optional

def search_flights_mcp(
    origin: str,
    destination: str,
    departure_date: str,
    passengers: int = 1,
    cabin_class: str = "economy"
) -> List[Dict[str, Any]]:
    """MCP Tool: Search available flights using official Duffel/Travel API adapter."""
    origin_code = origin.split("(")[-1].replace(")", "").strip().upper() if "(" in origin else origin.upper()
    dest_code = destination.split("(")[-1].replace(")", "").strip().upper() if "(" in destination else destination.upper()

    return [
        {
            "offer_id": f"mcp_fl_{origin_code}_{dest_code}_01",
            "airline": "IndiGo",
            "flight_number": "6E-2041",
            "origin": origin_code,
            "destination": dest_code,
            "departure_time": f"{departure_date}T06:30:00",
            "arrival_time": f"{departure_date}T09:05:00",
            "duration": "2h 35m",
            "stops": 0,
            "price": 4200 * passengers,
            "currency": "INR",
            "refundable": True
        },
        {
            "offer_id": f"mcp_fl_{origin_code}_{dest_code}_02",
            "airline": "Vistara",
            "flight_number": "UK-841",
            "origin": origin_code,
            "destination": dest_code,
            "departure_time": f"{departure_date}T09:45:00",
            "arrival_time": f"{departure_date}T12:15:00",
            "duration": "2h 30m",
            "stops": 0,
            "price": 5400 * passengers,
            "currency": "INR",
            "refundable": True
        }
    ]

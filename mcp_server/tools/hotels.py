from typing import List, Dict, Any, Optional

def search_hotels_mcp(
    city: str,
    guests: int = 1,
    rooms: int = 1,
    nights: int = 3,
    max_price: Optional[float] = None
) -> List[Dict[str, Any]]:
    """MCP Tool: Search hotel availability and rooms."""
    city_clean = city.capitalize()
    return [
        {
            "hotel_id": f"mcp_ht_{city_clean}_01",
            "name": f"{city_clean} Grand Beach & Spa Resort",
            "city": city_clean,
            "rating": 4.7,
            "price_per_night": 2800,
            "nights": nights,
            "total_price": 2800 * nights,
            "amenities": ["Pool", "Beach Access", "Spa", "Free WiFi"],
            "cancellation_policy": "Free cancellation up to 24h"
        },
        {
            "hotel_id": f"mcp_ht_{city_clean}_02",
            "name": f"{city_clean} Heritage Boutique Hotel",
            "city": city_clean,
            "rating": 4.4,
            "price_per_night": 1900,
            "nights": nights,
            "total_price": 1900 * nights,
            "amenities": ["Rooftop Cafe", "Free Breakfast", "WiFi"],
            "cancellation_policy": "Free cancellation up to 48h"
        }
    ]

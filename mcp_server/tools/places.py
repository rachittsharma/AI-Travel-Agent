from typing import List, Dict, Any

def search_places_mcp(destination: str, category: str = "all") -> List[Dict[str, Any]]:
    """MCP Tool: Search top tourist attractions, beaches, and local sights."""
    dest_clean = destination.capitalize()
    return [
        {
            "name": f"{dest_clean} Historic Fort & Lighthouse",
            "category": "Attraction",
            "rating": 4.7,
            "estimated_time": "2 hours",
            "entry_fee": "₹100",
            "highlight": "Panoramic sea sunset views and 17th century Portuguese defense structures."
        },
        {
            "name": f"{dest_clean} Palm Beach Shacks & Water Sports",
            "category": "Beach & Adventure",
            "rating": 4.6,
            "estimated_time": "4 hours",
            "entry_fee": "Free",
            "highlight": "Parasailing, jet skiing, fresh seafood, and live acoustic music."
        },
        {
            "name": f"{dest_clean} Local Spice Farm & Buffet",
            "category": "Cultural & Dining",
            "rating": 4.5,
            "estimated_time": "3 hours",
            "entry_fee": "₹500",
            "highlight": "Guided spice plantation walk followed by traditional organic buffet."
        }
    ]

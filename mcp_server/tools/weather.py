from typing import Dict, Any

def get_weather_mcp(destination: str) -> Dict[str, Any]:
    """MCP Tool: Retrieve weather forecast and climate information."""
    dest_clean = destination.capitalize()
    return {
        "destination": dest_clean,
        "temperature": "28°C",
        "condition": "Sunny with pleasant ocean breeze",
        "humidity": "65%",
        "best_time_to_visit": "November to February",
        "packing_recommendation": "Light cotton clothes, sunglasses, sunscreen, and casual footwear."
    }

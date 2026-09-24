import sys
import os
import site
import logging

# Ensure User site-packages and mcp_server directory are in sys.path
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.append(user_site)

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from fastmcp import FastMCP
except ImportError:
    from mcp.server.fastmcp import FastMCP

try:
    from tools.flights import search_flights_mcp
    from tools.hotels import search_hotels_mcp
    from tools.weather import get_weather_mcp
    from tools.places import search_places_mcp
    from tools.bookings import book_flight_mcp, book_hotel_mcp
except ImportError:
    from mcp_server.tools.flights import search_flights_mcp
    from mcp_server.tools.hotels import search_hotels_mcp
    from mcp_server.tools.weather import get_weather_mcp
    from mcp_server.tools.places import search_places_mcp
    from mcp_server.tools.bookings import book_flight_mcp, book_hotel_mcp

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("travel_mcp_server")

mcp = FastMCP("JournAI Travel MCP Server")

@mcp.tool()
def search_flights(origin: str, destination: str, departure_date: str, passengers: int = 1) -> str:
    """Search flight offers via travel API."""
    res = search_flights_mcp(origin, destination, departure_date, passengers)
    return str(res)

@mcp.tool()
def search_hotels(city: str, guests: int = 1, nights: int = 3) -> str:
    """Search hotel offers via travel API."""
    res = search_hotels_mcp(city, guests=guests, nights=nights)
    return str(res)

@mcp.tool()
def get_weather(destination: str) -> str:
    """Get weather forecast for destination."""
    res = get_weather_mcp(destination)
    return str(res)

@mcp.tool()
def search_places(destination: str, category: str = "all") -> str:
    """Search tourist attractions and places."""
    res = search_places_mcp(destination, category)
    return str(res)

@mcp.tool()
def book_flight(offer_id: str, passenger_name: str, user_confirmed: bool = False) -> str:
    """Book a flight. Requires user_confirmed=True."""
    res = book_flight_mcp(offer_id, {"name": passenger_name}, user_confirmed)
    return str(res)

@mcp.tool()
def book_hotel(hotel_id: str, guest_name: str, user_confirmed: bool = False) -> str:
    """Book a hotel room. Requires user_confirmed=True."""
    res = book_hotel_mcp(hotel_id, {"name": guest_name}, user_confirmed)
    return str(res)

if __name__ == "__main__":
    logger.info("Starting JournAI Standalone MCP Server...")
    mcp.run()

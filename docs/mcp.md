# Model Context Protocol (MCP) Documentation

The Travel MCP Server is implemented in `mcp_server/server.py` using Python `fastmcp`.

## Exposed MCP Tools

1. `search_flights(origin, destination, departure_date, passengers)`: Queries live flight inventory.
2. `search_hotels(city, guests, nights)`: Queries hotel inventory and prices.
3. `get_weather(destination)`: Fetches destination climate and packing tips.
4. `search_places(destination, category)`: Fetches top tourist attractions and activities.
5. `book_flight(offer_id, passenger_name, user_confirmed)`: Requires `user_confirmed=True`.
6. `book_hotel(hotel_id, guest_name, user_confirmed)`: Requires `user_confirmed=True`.

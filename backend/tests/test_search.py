import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_flight_search_and_filter():
    payload = {
        "origin": "Delhi (DEL)",
        "destination": "Goa (GOI)",
        "departureDate": "2026-10-12",
        "passengers": 2,
        "cabinClass": "economy",
        "sortBy": "cheapest"
    }
    response = client.post("/api/flights/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "flights" in data
    assert data["count"] > 0
    first_flight = data["flights"][0]
    assert first_flight["origin"] == "DEL"
    assert first_flight["destination"] == "GOI"
    assert first_flight["price"] > 0

def test_hotel_search_and_detail():
    payload = {
        "city": "Goa",
        "guests": 2,
        "rooms": 1,
        "nights": 4,
        "sortBy": "rating"
    }
    response = client.post("/api/hotels/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "hotels" in data
    assert data["count"] > 0
    hotel_id = data["hotels"][0]["id"]

    detail_res = client.get(f"/api/hotels/{hotel_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == hotel_id

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ai_chat_agent():
    payload = {
        "prompt": "Plan a 4-day trip from Delhi to Goa. My budget is ₹30,000.",
        "conversationHistory": []
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "actions" in data
    assert "plan" in data
    plan = data["plan"]
    assert plan["destination"] == "Goa"
    assert len(plan["itinerary"]) == 4
    assert plan["budgetBreakdown"]["userBudget"] == 30000.0
    assert "flightOffers" in plan and len(plan["flightOffers"]) >= 2
    assert "hotelOffers" in plan and len(plan["hotelOffers"]) >= 2

def test_ai_show_cheaper_flights():
    payload = {
        "prompt": "show me more cheaper flights",
        "conversationHistory": []
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "flights" in data
    flights = data["flights"]
    assert len(flights) > 0
    # Assert flights are sorted cheapest first
    prices = [f["price"] for f in flights]
    assert prices == sorted(prices)
    assert "cheapest" in data["response"].lower()

def test_ai_make_it_cheaper():
    payload = {
        "prompt": "Make it cheaper.",
        "conversationHistory": []
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    plan = data["plan"]
    assert plan["budgetBreakdown"]["totalEstimatedCost"] > 0


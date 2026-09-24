import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_booking_workflow():
    # 1. Register user
    reg_res = client.post("/api/auth/register", json={
        "name": "Booking Tester",
        "email": "bookingtester@example.com",
        "password": "password123"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create payment order
    pay_res = client.post("/api/payments/create", json={
        "bookingType": "FLIGHT",
        "amount": 4200.0,
        "currency": "INR"
    }, headers=headers)
    assert pay_res.status_code == 200
    order_data = pay_res.json()
    assert "orderId" in order_data

    # 3. Verify payment signature
    verify_res = client.post("/api/payments/verify", json={
        "orderId": order_data["orderId"],
        "paymentId": "pay_mock_9999",
        "signature": "mock_sig_9999"
    }, headers=headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] is True

    # 4. Create Flight Booking
    flight_res = client.post("/api/bookings/flight", json={
        "flightDetails": {"airline": "IndiGo", "flightNumber": "6E-2041"},
        "passengerDetails": {"name": "Booking Tester"},
        "amount": 4200.0
    }, headers=headers)
    assert flight_res.status_code == 200
    booking = flight_res.json()
    assert booking["status"] == "CONFIRMED"
    assert booking["provider"] == "duffel_sandbox"

    # 5. Retrieve User Bookings
    list_res = client.get("/api/bookings", headers=headers)
    assert list_res.status_code == 200
    bookings_list = list_res.json()
    assert len(bookings_list) >= 1
    assert bookings_list[0]["id"] == booking["id"]

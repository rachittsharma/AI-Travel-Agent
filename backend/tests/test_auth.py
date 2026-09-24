import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_register_and_login():
    test_email = "testuser@example.com"
    test_password = "password123"

    # Register
    reg_payload = {
        "name": "Test Traveler",
        "email": test_email,
        "password": test_password
    }
    reg_response = client.post("/api/auth/register", json=reg_payload)
    assert reg_response.status_code == 200
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == test_email

    # Login
    login_payload = {
        "email": test_email,
        "password": test_password
    }
    login_response = client.post("/api/auth/login", json=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    token = login_data["access_token"]
    assert token is not None

    # Get profile with bearer token
    profile_response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_response.status_code == 200
    profile_data = profile_response.json()
    assert profile_data["email"] == test_email
    assert profile_data["name"] == "Test Traveler"

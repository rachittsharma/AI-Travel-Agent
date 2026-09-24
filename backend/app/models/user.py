from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserPreferences(BaseModel):
    cabinClass: str = "economy"
    hotelRating: int = 4
    budgetRange: str = "medium"
    interests: list[str] = ["beaches", "sightseeing", "food"]

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    preferences: UserPreferences = UserPreferences()
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

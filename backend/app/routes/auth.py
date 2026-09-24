from fastapi import APIRouter, Depends
from app.models.user import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.services.auth_service import register_user, authenticate_user, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegisterRequest):
    return await register_user(req)

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest):
    return await authenticate_user(req)

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: UserResponse = Depends(get_current_user)):
    return current_user

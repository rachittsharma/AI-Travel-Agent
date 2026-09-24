import uuid
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings
from app.database import db_manager
from app.models.user import UserRegisterRequest, UserLoginRequest, UserResponse, UserPreferences

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def register_user(req: UserRegisterRequest) -> dict:
    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(req.password)
    now = datetime.utcnow()

    user_dict = {
        "_id": user_id,
        "id": user_id,
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": hashed_pwd,
        "preferences": UserPreferences().model_dump(),
        "createdAt": now
    }

    # Check if existing user
    if db_manager.is_connected and db_manager.db is not None:
        existing = await db_manager.db.users.find_one({"email": req.email.lower()})
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        await db_manager.db.users.insert_one(user_dict)
    else:
        # In-memory store fallback
        for u in db_manager.in_memory_store["users"].values():
            if u["email"] == req.email.lower():
                raise HTTPException(status_code=400, detail="User with this email already exists")
        db_manager.in_memory_store["users"][user_id] = user_dict

    token = create_access_token({"sub": user_id, "email": req.email.lower()})
    user_resp = UserResponse(
        id=user_id,
        name=req.name,
        email=req.email.lower(),
        preferences=UserPreferences(),
        createdAt=now
    )
    return {"access_token": token, "token_type": "bearer", "user": user_resp}

async def authenticate_user(req: UserLoginRequest) -> dict:
    email_lower = req.email.lower()
    user_data = None

    if db_manager.is_connected and db_manager.db is not None:
        user_data = await db_manager.db.users.find_one({"email": email_lower})
    else:
        for u in db_manager.in_memory_store["users"].values():
            if u["email"] == email_lower:
                user_data = u
                break

    if not user_data or not verify_password(req.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user_data["id"], "email": user_data["email"]})
    user_resp = UserResponse(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        preferences=UserPreferences(**user_data.get("preferences", {})),
        createdAt=user_data.get("createdAt", datetime.utcnow())
    )
    return {"access_token": token, "token_type": "bearer", "user": user_resp}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    user_data = None
    if db_manager.is_connected and db_manager.db is not None:
        user_data = await db_manager.db.users.find_one({"_id": user_id})
    else:
        user_data = db_manager.in_memory_store["users"].get(user_id)

    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")

    return UserResponse(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        preferences=UserPreferences(**user_data.get("preferences", {})),
        createdAt=user_data.get("createdAt", datetime.utcnow())
    )

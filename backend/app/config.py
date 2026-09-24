import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEMO_MODE: bool = True
    SECRET_KEY: str = "super-secret-key-change-in-production-ai-travel-agent"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "ai_travel_agent"

    GEMINI_API_KEY: str = ""
    DUFFEL_API_KEY: str = ""
    RAZORPAY_KEY_ID: str = "rzp_test_mock_12345"
    RAZORPAY_KEY_SECRET: str = "mock_secret_12345"
    OPENWEATHER_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

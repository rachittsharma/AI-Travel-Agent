import os
import logging
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False
    in_memory_store: dict = {
        "users": {},
        "trips": {},
        "flight_bookings": {},
        "hotel_bookings": {},
        "payments": {}
    }

    async def connect(self):
        try:
            ca = certifi.where()
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                tlsCAFile=ca,
                tlsAllowInvalidCertificates=True,
                serverSelectionTimeoutMS=4000
            )
            # Ping database
            await self.client.admin.command('ping')
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.is_connected = True
            logger.info(f"Successfully connected to MongoDB Atlas at {settings.MONGODB_DB_NAME}")
        except Exception as e:
            logger.warning(f"MongoDB connection failed: {e}. Falling back to resilient in-memory storage mode.")
            self.is_connected = False
            self.db = None

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB client closed.")

db_manager = DatabaseManager()

def get_db():
    return db_manager.db

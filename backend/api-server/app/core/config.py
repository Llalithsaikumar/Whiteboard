from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Whiteboard API Server"

    # Allowed origins for CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3001",  # Node realtime server
        "http://localhost:5173",  # React frontend
    ]
    """
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    """

settings = Settings()
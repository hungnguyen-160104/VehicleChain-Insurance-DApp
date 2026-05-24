from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    JWT_SECRET_KEY: str = "insurance-vehiclechain-secret-2025"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480
    CHROMA_DB_PATH: str = "./data/chroma_db"
    UPLOADS_PATH: str = "./data/uploads"
    DOCUMENTS_JSON: str = "./data/documents.json"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

# Tạo thư mục data nếu chưa có
Path(settings.CHROMA_DB_PATH).mkdir(parents=True, exist_ok=True)
Path(settings.UPLOADS_PATH).mkdir(parents=True, exist_ok=True)
Path("./data").mkdir(parents=True, exist_ok=True)

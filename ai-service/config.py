from pydantic_settings import BaseSettings
from pathlib import Path
import os

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    # Địa chỉ ví owner (chủ hợp đồng) — CHỈ ví này mới đăng nhập quản trị AI được.
    # Đăng nhập bằng chữ ký ví thay cho username/password.
    # Mặc định = tài khoản Hardhat #0 (deployer trên localhost).
    OWNER_ADDRESS: str = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
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

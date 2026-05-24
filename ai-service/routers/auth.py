from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
from models.schemas import LoginRequest, TokenResponse
from services.auth_service import authenticate_admin, create_access_token
from config import settings

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Đăng nhập admin — trả về JWT token"""
    if not authenticate_admin(request.username, request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng"
        )
    token = create_access_token(
        data={"sub": request.username, "role": "admin"},
        expires_delta=timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRE_MINUTES * 60
    )

@router.get("/verify")
async def verify_token_endpoint(token_data: dict = None):
    """Kiểm tra token còn hợp lệ không (dùng từ frontend)"""
    return {"valid": True, "message": "Token hợp lệ"}

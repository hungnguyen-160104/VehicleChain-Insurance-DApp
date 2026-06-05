from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from models.schemas import (
    WalletChallengeRequest,
    WalletChallengeResponse,
    WalletLoginRequest,
    TokenResponse,
)
from services.auth_service import (
    create_login_challenge,
    verify_login_signature,
    create_access_token,
    require_admin,
)
from rate_limit import login_limiter
from config import settings

router = APIRouter()

@router.post("/challenge", response_model=WalletChallengeResponse)
async def challenge(request: WalletChallengeRequest):
    """Bước 1: tạo thông điệp để ví owner ký."""
    addr = (request.address or "").strip()
    if not addr.startswith("0x") or len(addr) != 42:
        raise HTTPException(status_code=400, detail="Địa chỉ ví không hợp lệ")
    message = create_login_challenge(addr)
    return WalletChallengeResponse(message=message)

@router.post("/wallet-login", response_model=TokenResponse)
async def wallet_login(request: WalletLoginRequest, _rl=Depends(login_limiter)):
    """Bước 2: xác minh chữ ký ví owner → trả JWT."""
    if not verify_login_signature(request.address, request.signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chữ ký không hợp lệ hoặc ví không phải owner",
        )
    token = create_access_token(
        data={"sub": request.address.lower(), "role": "admin"},
        expires_delta=timedelta(minutes=settings.JWT_EXPIRE_MINUTES),
    )
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )

@router.get("/verify")
async def verify_token_endpoint(admin=Depends(require_admin)):
    """Kiểm tra token còn hợp lệ không (dùng từ frontend)"""
    return {"valid": True, "message": "Token hợp lệ"}

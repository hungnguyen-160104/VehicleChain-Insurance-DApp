import time
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from jose import JWTError, jwt
from eth_account import Account
from eth_account.messages import encode_defunct
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings

security = HTTPBearer()

# ─── JWT Token ─────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token không hợp lệ")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token hết hạn hoặc không hợp lệ")

# ─── Đăng nhập bằng chữ ký ví (Sign-In With Ethereum) ──────────────────
# Lưu thông điệp challenge theo địa chỉ ví. In-memory, dùng 1 lần, có hạn —
# phù hợp môi trường 1 instance (giống rate_limit). address(lower) -> (message, expires_at)
_challenges: Dict[str, Tuple[str, float]] = {}
CHALLENGE_TTL = 300  # 5 phút

def create_login_challenge(address: str) -> str:
    """Tạo thông điệp duy nhất để ví owner ký (bước 1)."""
    addr = address.lower()
    nonce = secrets.token_hex(16)
    issued = datetime.utcnow().isoformat()
    message = (
        "VehicleChain Insurance - Dang nhap quan tri AI Service\n"
        f"Dia chi vi: {address}\n"
        f"Nonce: {nonce}\n"
        f"Thoi diem: {issued}\n"
        "Ky thong diep nay de xac thuc ban la chu so huu hop dong (owner)."
    )
    _challenges[addr] = (message, time.time() + CHALLENGE_TTL)
    return message

def verify_login_signature(address: str, signature: str) -> bool:
    """Xác minh chữ ký + đảm bảo địa chỉ ký đúng là owner (bước 2)."""
    addr = address.lower()
    entry = _challenges.pop(addr, None)  # dùng 1 lần — chống replay
    if entry is None:
        return False
    message, expires_at = entry
    if time.time() > expires_at:
        return False
    # Chỉ ví owner mới được phép
    if addr != settings.OWNER_ADDRESS.lower():
        return False
    try:
        recovered = Account.recover_message(encode_defunct(text=message), signature=signature)
    except Exception:
        return False
    return recovered.lower() == addr

# ─── Dependency: require admin token ──────────────────────────────────
def require_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Không có quyền truy cập")
    return payload

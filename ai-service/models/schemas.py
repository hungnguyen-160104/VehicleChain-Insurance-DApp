from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ─── Auth (đăng nhập bằng chữ ký ví owner) ─────────────────────────────
class WalletChallengeRequest(BaseModel):
    address: str

class WalletChallengeResponse(BaseModel):
    message: str

class WalletLoginRequest(BaseModel):
    address: str
    signature: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

# ─── Chat ──────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = None

class SourceDocument(BaseModel):
    filename: str
    excerpt: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDocument] = []
    has_context: bool = True

# ─── Documents ─────────────────────────────────────────────────────────
class DocumentInfo(BaseModel):
    id: str
    filename: str
    original_name: str = ""
    uploaded_at: str = ""
    chunks_count: int = 0
    size_kb: float = 0
    status: str = "active"

class DocumentListResponse(BaseModel):
    documents: List[DocumentInfo]
    total: int

class UploadResponse(BaseModel):
    success: bool
    document_id: str
    filename: str
    chunks_count: int
    message: str

class DeleteResponse(BaseModel):
    success: bool
    message: str

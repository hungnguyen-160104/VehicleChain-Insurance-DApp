import os
import uuid
import json
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from models.schemas import DocumentListResponse, DocumentInfo, UploadResponse, DeleteResponse
from services.auth_service import require_admin
from services.pdf_service import process_pdf
from services.rag_service import rag_service
from config import settings

router = APIRouter()

def _load_documents() -> list:
    """Đọc danh sách tài liệu từ JSON"""
    if not Path(settings.DOCUMENTS_JSON).exists():
        return []
    with open(settings.DOCUMENTS_JSON, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_documents(docs: list):
    """Lưu danh sách tài liệu ra JSON"""
    with open(settings.DOCUMENTS_JSON, "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)

# ─── Lấy danh sách tài liệu (admin only) ──────────────────────────────
@router.get("/", response_model=DocumentListResponse)
async def list_documents(admin=Depends(require_admin)):
    docs = _load_documents()
    doc_infos = [DocumentInfo(**d) for d in docs]
    return DocumentListResponse(documents=doc_infos, total=len(doc_infos))

# ─── Upload PDF (admin only) ───────────────────────────────────────────
@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    admin=Depends(require_admin)
):
    # Kiểm tra định dạng
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file PDF")

    # Giới hạn kích thước 20MB
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File quá lớn (tối đa 20MB)")

    # Lưu file vào disk
    doc_id = str(uuid.uuid4())
    safe_name = f"{doc_id}.pdf"
    file_path = Path(settings.UPLOADS_PATH) / safe_name

    with open(file_path, "wb") as f:
        f.write(contents)

    # Xử lý PDF → chunks
    try:
        chunks = process_pdf(str(file_path))
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=422, detail=f"Không thể đọc PDF: {str(e)}")

    if not chunks:
        os.remove(file_path)
        raise HTTPException(status_code=422, detail="PDF không có nội dung văn bản")

    # Thêm vào ChromaDB
    chunks_count = rag_service.add_documents(doc_id, file.filename, chunks)

    # Lưu metadata
    docs = _load_documents()
    docs.append({
        "id": doc_id,
        "filename": safe_name,
        "original_name": file.filename,
        "uploaded_at": datetime.now().isoformat(),
        "chunks_count": chunks_count,
        "size_kb": round(len(contents) / 1024, 1),
        "status": "active"
    })
    _save_documents(docs)

    return UploadResponse(
        success=True,
        document_id=doc_id,
        filename=file.filename,
        chunks_count=chunks_count,
        message=f"Upload thanh cong! Da xu ly {chunks_count} doan van ban."
    )

# ─── Xóa tài liệu (admin only) ────────────────────────────────────────
@router.delete("/{doc_id}", response_model=DeleteResponse)
async def delete_document(doc_id: str, admin=Depends(require_admin)):
    docs = _load_documents()
    doc = next((d for d in docs if d["id"] == doc_id), None)

    if not doc:
        raise HTTPException(status_code=404, detail="Tai lieu khong ton tai")

    # Xóa khỏi ChromaDB
    rag_service.delete_documents(doc_id)

    # Xóa file vật lý
    file_path = Path(settings.UPLOADS_PATH) / doc["filename"]
    if file_path.exists():
        os.remove(file_path)

    # Cập nhật JSON
    docs = [d for d in docs if d["id"] != doc_id]
    _save_documents(docs)

    return DeleteResponse(
        success=True,
        message=f"Da xoa tai lieu '{doc['original_name']}'"
    )

# ─── Public: kiểm tra có tài liệu không ──────────────────────────────
@router.get("/stats/public")
async def public_stats():
    """Thống kê công khai — frontend dùng để hiển thị trạng thái"""
    docs = _load_documents()
    total_chunks = rag_service.get_document_count()
    return {
        "total_documents": len(docs),
        "total_chunks": total_chunks,
        "ready": total_chunks > 0
    }

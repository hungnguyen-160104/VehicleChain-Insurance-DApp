import os
import uuid
import json
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.concurrency import run_in_threadpool
from models.schemas import DocumentListResponse, DocumentInfo, UploadResponse, DeleteResponse
from services.pdf_service import process_document, SUPPORTED_EXTENSIONS
from services.rag_service import rag_service
from services.auth_service import require_admin
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
# Đăng ký cả "" và "/" để chấp nhận /documents lẫn /documents/ — vì
# redirect_slashes=False (main.py) nên FastAPI KHÔNG tự redirect giữa 2 dạng,
# client gọi thiếu/thừa slash sẽ bị 404 nếu chỉ đăng ký một dạng.
@router.get("", response_model=DocumentListResponse, include_in_schema=False)
@router.get("/", response_model=DocumentListResponse)
async def list_documents(admin=Depends(require_admin)):
    # Nguồn sự thật = chunks thực có trong ChromaDB (gom theo doc_id),
    # bổ sung metadata đẹp từ documents.json nếu có.
    json_meta = {d["id"]: d for d in _load_documents()}
    groups = rag_service.list_documents_from_store()
    doc_infos = []
    for g in groups:
        meta = json_meta.get(g["doc_id"], {})
        doc_infos.append(DocumentInfo(
            id=g["doc_id"],
            filename=g["filename"],
            original_name=meta.get("original_name") or g["filename"],
            uploaded_at=meta.get("uploaded_at", ""),
            chunks_count=g["chunks_count"],
            size_kb=meta.get("size_kb", 0),
            status=meta.get("status", "active"),
        ))
    doc_infos.sort(key=lambda d: d.uploaded_at or "", reverse=True)
    return DocumentListResponse(documents=doc_infos, total=len(doc_infos))

# ─── Upload PDF (admin only) ───────────────────────────────────────────
@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    admin=Depends(require_admin),
):
    # Kiểm tra định dạng
    ext = Path(file.filename or "").suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file PDF hoặc DOCX")

    # Giới hạn kích thước 20MB
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File quá lớn (tối đa 20MB)")

    # Lưu file vào disk
    doc_id = str(uuid.uuid4())
    safe_name = f"{doc_id}{ext}"
    file_path = Path(settings.UPLOADS_PATH) / safe_name

    with open(file_path, "wb") as f:
        f.write(contents)

    # Xử lý tài liệu (PDF/DOCX) → chunks.
    # Chạy trong threadpool: đây là tác vụ I/O+CPU đồng bộ, nếu gọi thẳng trên
    # event loop sẽ chặn mọi request khác (health/chat/list) suốt quá trình.
    try:
        chunks = await run_in_threadpool(process_document, str(file_path))
    except Exception as e:
        os.remove(file_path)
        # Cắt ngắn message để không lộ đường dẫn/chi tiết nội bộ ra client
        raise HTTPException(status_code=422, detail=f"Không thể đọc tài liệu: {str(e)[:150]}")

    if not chunks:
        os.remove(file_path)
        raise HTTPException(status_code=422, detail="Tài liệu không có nội dung văn bản")

    # Thêm vào ChromaDB. Cũng chạy trong threadpool — add_documents có vòng lặp
    # batch với time.sleep() chờ rate-limit (có thể vài phút với tài liệu lớn);
    # offload để service vẫn phản hồi các request khác trong lúc index.
    try:
        chunks_count = await run_in_threadpool(
            rag_service.add_documents, doc_id, file.filename, chunks
        )
    except Exception as e:
        # Dọn sạch file và ChromaDB nếu embed thất bại
        if file_path.exists():
            os.remove(file_path)
        try:
            rag_service.delete_documents(doc_id)  # Xóa partial chunks
        except Exception:
            pass
        err_msg = str(e)
        if "429" in err_msg or "QUOTA" in err_msg.upper() or "EXHAUSTED" in err_msg.upper():
            raise HTTPException(status_code=429, detail="Gemini API rate limit. Vui lòng chờ 1-2 phút rồi thử lại.")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo embedding: {err_msg[:200]}")

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

    # Xóa chunks khỏi ChromaDB theo doc_id (kể cả tài liệu "mồ côi" không có trong JSON)
    deleted = rag_service.delete_documents(doc_id)

    if deleted == 0 and not doc:
        raise HTTPException(status_code=404, detail="Tai lieu khong ton tai")

    # Xóa file vật lý + cập nhật JSON nếu có metadata
    if doc:
        file_path = Path(settings.UPLOADS_PATH) / doc["filename"]
        if file_path.exists():
            os.remove(file_path)
        docs = [d for d in docs if d["id"] != doc_id]
        _save_documents(docs)

    name = doc["original_name"] if doc else doc_id
    return DeleteResponse(
        success=True,
        message=f"Da xoa tai lieu '{name}'"
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

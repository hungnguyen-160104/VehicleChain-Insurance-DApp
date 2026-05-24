from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, SourceDocument
from services.rag_service import rag_service

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Nhận câu hỏi từ user → RAG pipeline → trả lời từ tài liệu bảo hiểm.
    Endpoint công khai (không cần auth) — người dùng bình thường sử dụng.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Câu hỏi không được để trống")

    if len(request.question) > 1000:
        raise HTTPException(status_code=400, detail="Câu hỏi quá dài (tối đa 1000 ký tự)")

    result = rag_service.chat(request.question.strip())

    sources = [
        SourceDocument(filename=s["filename"], excerpt=s["excerpt"])
        for s in result.get("sources", [])
    ]

    return ChatResponse(
        answer=result["answer"],
        sources=sources,
        has_context=result["has_context"]
    )

@router.get("/health")
async def chat_health():
    """Kiểm tra trạng thái AI service"""
    doc_count = rag_service.get_document_count()
    return {
        "status": "ok",
        "total_chunks": doc_count,
        "ready": doc_count > 0
    }

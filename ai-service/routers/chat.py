from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ChatRequest, ChatResponse, SourceDocument
from services.rag_service import rag_service
from rate_limit import chat_limiter

router = APIRouter()

@router.post("/", response_model=ChatResponse)
@router.post("", response_model=ChatResponse)  # handle cả /chat và /chat/
async def chat(request: ChatRequest, _rl=Depends(chat_limiter)):
    """
    Nhận câu hỏi từ user → RAG pipeline → trả lời từ tài liệu bảo hiểm.
    Endpoint công khai (không cần auth) — người dùng bình thường sử dụng.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Câu hỏi không được để trống")

    if len(request.question) > 1000:
        raise HTTPException(status_code=400, detail="Câu hỏi quá dài (tối đa 1000 ký tự)")

    try:
        result = rag_service.chat(request.question.strip())
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service tạm thời không khả dụng: {str(e)[:200]}")

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

import os
import warnings
warnings.filterwarnings("ignore")

from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from typing import List, Dict, Any
from config import settings

os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY

# ─── System prompt cho bảo hiểm Việt Nam ─────────────────────────────
SYSTEM_PROMPT = """Bạn là trợ lý tư vấn bảo hiểm xe cơ giới của hệ thống VehicleChain Insurance.
Nhiệm vụ: trả lời câu hỏi dựa HOÀN TOÀN vào tài liệu được cung cấp bên dưới.

QUY TẮC:
1. Chỉ trả lời dựa trên thông tin trong tài liệu (context)
2. Nếu không có thông tin, trả lời: "Tôi không tìm thấy thông tin về vấn đề này trong tài liệu hiện có. Vui lòng liên hệ tổng đài để được hỗ trợ."
3. Trả lời bằng tiếng Việt, rõ ràng và dễ hiểu
4. Trích dẫn điều khoản, nghị định cụ thể nếu tài liệu có đề cập
5. Không bịa đặt hay suy đoán thông tin không có trong tài liệu

TÀI LIỆU THAM KHẢO:
{context}

Câu hỏi: {question}
Trả lời:"""

PROMPT = ChatPromptTemplate.from_template(SYSTEM_PROMPT)

def _format_docs(docs: List[Document]) -> str:
    """Ghép các document chunks thành context string"""
    return "\n\n---\n\n".join(doc.page_content for doc in docs)

class RAGService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._setup()

    def _setup(self):
        print("[RAG] Khoi tao Gemini Embeddings (gemini-embedding-001)...")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=settings.GEMINI_API_KEY
        )

        print("[RAG] Ket noi ChromaDB embedded...")
        self.vectorstore = Chroma(
            persist_directory=settings.CHROMA_DB_PATH,
            embedding_function=self.embeddings,
            collection_name="insurance_documents"
        )

        print("[RAG] Khoi tao Gemini Flash LLM (gemini-2.5-flash)...")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
            max_tokens=2048,
            timeout=25,       # max 25 giây cho mỗi response
            max_retries=0     # không để LangChain tự retry — chat() tự xử lý retry
        )

        self.retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        )

        # LCEL RAG chain
        self.rag_chain = (
            {"context": self.retriever | _format_docs, "question": RunnablePassthrough()}
            | PROMPT
            | self.llm
            | StrOutputParser()
        )

        print("[RAG] Khoi tao thanh cong!")

    def add_documents(self, doc_id: str, filename: str, chunks: List[str]) -> int:
        """Embed và lưu chunks vào ChromaDB.

        Tối ưu cho Gemini free tier khi upload tài liệu lớn:
        - Gộp nhiều chunks mỗi request (1 batch = 1 API call) → ít request hơn,
          giảm áp lực rate-limit. BATCH_SIZE giữ dưới ngưỡng ~20k token/request.
        - Retry có backoff khi gặp 429/quota: chờ rồi thử lại CHÍNH batch đó thay vì
          để cả upload thất bại — tránh việc 1 request lỗi làm hỏng toàn bộ tài liệu.
        """
        import time
        BATCH_SIZE = 30      # chunks mỗi request (≈ <20k token → 1 API call/batch)
        BATCH_DELAY = 2.0    # giây nghỉ giữa các batch thành công (đỡ RPM)
        # Quota/phút (RPM/TPM) nạp lại sau ~60s. Kiên nhẫn hơn: thử nhiều lần với
        # backoff chặn trần 60s — chờ >60s lặp lại gần như chắc qua throttle theo phút,
        # nên 1 tài liệu lớn không bị bỏ cuộc giữa chừng (đây là lý do cũ upload fail).
        MAX_RETRIES = 8      # số lần thử lại mỗi batch khi dính rate limit
        MAX_BACKOFF = 60     # giây chờ tối đa mỗi lần thử (quota/phút reset sau ~60s)

        total_added = 0
        n = len(chunks)
        num_batches = (n + BATCH_SIZE - 1) // BATCH_SIZE
        for batch_start in range(0, n, BATCH_SIZE):
            batch = chunks[batch_start : batch_start + BATCH_SIZE]
            batch_no = batch_start // BATCH_SIZE + 1

            documents = [
                Document(
                    page_content=chunk,
                    metadata={"doc_id": doc_id, "filename": filename, "chunk_index": batch_start + i}
                )
                for i, chunk in enumerate(batch)
            ]
            ids = [f"{doc_id}_chunk_{batch_start + i}" for i in range(len(batch))]

            # Thử thêm batch — retry với backoff nếu Gemini trả rate limit.
            # An toàn để retry: khi dính rate limit, lỗi xảy ra ở bước embed (gọi API)
            # nên CHƯA có chunk nào được ghi vào Chroma → thử lại không tạo trùng.
            for attempt in range(MAX_RETRIES + 1):
                try:
                    self.vectorstore.add_documents(documents=documents, ids=ids)
                    total_added += len(batch)
                    print(f"[RAG] Batch {batch_no}/{num_batches}: +{len(batch)} chunks ({total_added}/{n})")
                    break
                except Exception as e:
                    msg = str(e).upper()
                    is_rate_limit = any(
                        kw in msg
                        for kw in ["429", "QUOTA", "EXHAUSTED", "RESOURCE_EXHAUSTED", "RATE"]
                    )
                    if is_rate_limit and attempt < MAX_RETRIES:
                        wait = min(MAX_BACKOFF, 20 * (attempt + 1))  # 20,40,60,60,...
                        print(f"[RAG] Rate limit batch {batch_no} (lan {attempt + 1}/{MAX_RETRIES}), cho {wait}s roi thu lai...")
                        time.sleep(wait)
                        continue
                    raise  # hết retry hoặc lỗi khác → để endpoint xử lý/dọn dẹp

            # Nghỉ ngắn giữa các batch thành công để dàn đều request theo phút
            if batch_start + BATCH_SIZE < n:
                time.sleep(BATCH_DELAY)

        print(f"[RAG] Da them tong {total_added} chunks cho '{filename}'")
        return total_added

    def delete_documents(self, doc_id: str) -> int:
        """Xóa tất cả chunks của 1 tài liệu (theo doc_id). Trả về số chunks đã xóa."""
        collection = self.vectorstore._collection
        results = collection.get(where={"doc_id": doc_id})
        ids = results.get("ids") if results else []
        if ids:
            collection.delete(ids=ids)
            print(f"[RAG] Da xoa {len(ids)} chunks cua doc '{doc_id}'")
        return len(ids) if ids else 0

    def list_documents_from_store(self) -> List[Dict[str, Any]]:
        """Liệt kê tài liệu THỰC CÓ trong ChromaDB, gom nhóm theo doc_id.
        Nhờ vậy danh sách luôn khớp với dữ liệu thật (kể cả tài liệu không có
        trong documents.json) — mỗi nhóm có thể xóa riêng theo doc_id."""
        collection = self.vectorstore._collection
        data = collection.get(include=["metadatas"])
        metadatas = data.get("metadatas") or []
        groups: Dict[str, Dict[str, Any]] = {}
        for md in metadatas:
            if not md:
                continue
            doc_id = md.get("doc_id") or "unknown"
            filename = md.get("filename") or "Tài liệu không xác định"
            g = groups.setdefault(doc_id, {"doc_id": doc_id, "filename": filename, "chunks_count": 0})
            g["chunks_count"] += 1
        return list(groups.values())

    def chat(self, question: str) -> Dict[str, Any]:
        """RAG pipeline: embed query → search → generate (1 embedding call, với retry)"""
        import time

        doc_count = self.vectorstore._collection.count()
        if doc_count == 0:
            return {
                "answer": "Hệ thống chưa có tài liệu nào. Admin cần upload tài liệu bảo hiểm trước khi sử dụng tính năng này.",
                "sources": [],
                "has_context": False
            }

        # Retry tối đa 1 lần (chờ 8s) nếu gặp rate limit
        MAX_RETRIES = 1
        RETRY_DELAY = 8  # giây

        for attempt in range(MAX_RETRIES + 1):
            try:
                # Bước 1: Embed query + tìm context — CHỈ 1 lần gọi Embedding API
                context_docs = self.retriever.invoke(question)
                context_str = _format_docs(context_docs)

                # Bước 2: Gọi LLM trực tiếp với context đã có
                # (KHÔNG dùng self.rag_chain.invoke để tránh gọi retriever lần 2)
                messages = PROMPT.format_messages(context=context_str, question=question)
                llm_response = self.llm.invoke(messages)
                answer = llm_response.content if hasattr(llm_response, "content") else str(llm_response)

                # Tổng hợp sources từ context_docs
                sources = []
                seen = set()
                for doc in context_docs:
                    fname = doc.metadata.get("filename", "unknown")
                    if fname not in seen:
                        seen.add(fname)
                        excerpt = doc.page_content[:150] + "..." if len(doc.page_content) > 150 else doc.page_content
                        sources.append({"filename": fname, "excerpt": excerpt})

                return {"answer": answer, "sources": sources, "has_context": True}

            except Exception as e:
                err_str = str(e)
                is_rate_limit = any(
                    kw in err_str.upper()
                    for kw in ["429", "QUOTA", "EXHAUSTED", "RESOURCE_EXHAUSTED", "RATE_LIMIT"]
                )

                if is_rate_limit:
                    if attempt < MAX_RETRIES:
                        print(f"[RAG] Rate limit (lần {attempt + 1}), thử lại sau {RETRY_DELAY}s...")
                        time.sleep(RETRY_DELAY)
                        continue
                    # Hết lần retry
                    return {
                        "answer": "⚠️ Gemini API đang bị giới hạn lưu lượng. Vui lòng thử lại sau 1-2 phút.",
                        "sources": [],
                        "has_context": False,
                        "error": "rate_limit"
                    }
                raise

    def get_document_count(self) -> int:
        return self.vectorstore._collection.count()

# Singleton
rag_service = RAGService()

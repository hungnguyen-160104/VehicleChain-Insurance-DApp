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
        print("[RAG] Khoi tao Gemini Embeddings...")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=settings.GEMINI_API_KEY
        )

        print("[RAG] Ket noi ChromaDB embedded...")
        self.vectorstore = Chroma(
            persist_directory=settings.CHROMA_DB_PATH,
            embedding_function=self.embeddings,
            collection_name="insurance_documents"
        )

        print("[RAG] Khoi tao Gemini Flash LLM...")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
            max_tokens=2048
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
        """Embed và lưu chunks vào ChromaDB"""
        documents = [
            Document(
                page_content=chunk,
                metadata={"doc_id": doc_id, "filename": filename, "chunk_index": i}
            )
            for i, chunk in enumerate(chunks)
        ]
        ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
        self.vectorstore.add_documents(documents=documents, ids=ids)
        print(f"[RAG] Da them {len(chunks)} chunks cho '{filename}'")
        return len(chunks)

    def delete_documents(self, doc_id: str):
        """Xóa tất cả chunks của tài liệu"""
        collection = self.vectorstore._collection
        results = collection.get(where={"doc_id": doc_id})
        if results and results["ids"]:
            collection.delete(ids=results["ids"])
            print(f"[RAG] Da xoa {len(results['ids'])} chunks cua doc '{doc_id}'")

    def chat(self, question: str) -> Dict[str, Any]:
        """RAG pipeline: embed query → search → generate"""
        doc_count = self.vectorstore._collection.count()
        if doc_count == 0:
            return {
                "answer": "Hệ thống chưa có tài liệu nào. Admin cần upload tài liệu bảo hiểm trước khi sử dụng tính năng này.",
                "sources": [],
                "has_context": False
            }

        # Lấy context docs để trả về sources
        context_docs = self.retriever.invoke(question)
        answer = self.rag_chain.invoke(question)

        sources = []
        seen = set()
        for doc in context_docs:
            fname = doc.metadata.get("filename", "unknown")
            if fname not in seen:
                seen.add(fname)
                excerpt = doc.page_content[:150] + "..." if len(doc.page_content) > 150 else doc.page_content
                sources.append({"filename": fname, "excerpt": excerpt})

        return {"answer": answer, "sources": sources, "has_context": True}

    def get_document_count(self) -> int:
        return self.vectorstore._collection.count()

# Singleton
rag_service = RAGService()

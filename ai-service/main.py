from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, chat, documents

app = FastAPI(
    title="VehicleChain Insurance AI Service",
    description="RAG-based AI chatbot cho hệ thống bảo hiểm xe cơ giới",
    version="1.0.0"
)

# ─── CORS — cho phép Next.js frontend gọi API ─────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/auth",      tags=["Admin Auth"])
app.include_router(chat.router,      prefix="/chat",      tags=["Chatbot"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])

# ─── Health check ─────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "VehicleChain Insurance AI",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}

# ─── Chạy server ──────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("VehicleChain Insurance AI Service")
    print("URL: http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("=" * 50)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

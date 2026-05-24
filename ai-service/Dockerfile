# ================================================================
# VehicleChain Insurance AI Service - Dockerfile
# ================================================================
FROM python:3.11-slim

# Metadata
LABEL maintainer="hungnguyen16012004@gmail.com"
LABEL description="VehicleChain Insurance RAG AI Service"

# Working directory
WORKDIR /app

# Install system dependencies (for pdfplumber, chromadb)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (Docker cache layer)
COPY requirements.txt .

# Install Python packages
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create data directories
RUN mkdir -p /app/data/chroma_db /app/data/uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the app
CMD ["python", "main.py"]

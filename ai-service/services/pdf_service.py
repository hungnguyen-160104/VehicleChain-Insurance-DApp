import pdfplumber
from pathlib import Path
from typing import List
import re

CHUNK_SIZE = 800       # ký tự mỗi chunk
CHUNK_OVERLAP = 150    # overlap giữa các chunk

def extract_text_from_pdf(file_path: str) -> str:
    """Trích xuất toàn bộ text từ PDF, hỗ trợ tiếng Việt và bảng biểu"""
    full_text = []
    with pdfplumber.open(file_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            # Trích xuất text thường
            text = page.extract_text()
            if text and text.strip():
                full_text.append(f"[Trang {page_num}]\n{text.strip()}")

            # Trích xuất bảng biểu (nếu có)
            tables = page.extract_tables()
            for table in tables:
                if table:
                    table_text = _table_to_text(table)
                    if table_text.strip():
                        full_text.append(f"[Bảng trang {page_num}]\n{table_text}")

    return "\n\n".join(full_text)

def _table_to_text(table: List[List]) -> str:
    """Chuyển bảng thành text dạng markdown"""
    rows = []
    for row in table:
        cells = [str(cell).strip() if cell else "" for cell in row]
        rows.append(" | ".join(cells))
    return "\n".join(rows)

def split_text_into_chunks(text: str) -> List[str]:
    """Chia text thành các chunk có overlap, ưu tiên cắt theo đoạn văn"""
    # Làm sạch text
    text = re.sub(r'\n{3,}', '\n\n', text)   # Giảm xuống dòng liên tiếp
    text = re.sub(r' {2,}', ' ', text)        # Giảm khoảng trắng thừa
    text = text.strip()

    if len(text) <= CHUNK_SIZE:
        return [text] if text else []

    chunks = []
    paragraphs = text.split('\n\n')

    current_chunk = ""
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # Nếu đoạn văn đơn lẻ quá dài, chia nhỏ hơn
        if len(para) > CHUNK_SIZE:
            # Lưu chunk hiện tại nếu có
            if current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = ""
            # Chia đoạn dài theo câu
            sentences = re.split(r'(?<=[.!?。])\s+', para)
            for sentence in sentences:
                if len(current_chunk) + len(sentence) + 1 <= CHUNK_SIZE:
                    current_chunk += (" " if current_chunk else "") + sentence
                else:
                    if current_chunk:
                        chunks.append(current_chunk.strip())
                    current_chunk = sentence
        elif len(current_chunk) + len(para) + 2 <= CHUNK_SIZE:
            current_chunk += ("\n\n" if current_chunk else "") + para
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            # Overlap: giữ lại 1 đoạn cuối của chunk trước
            overlap_text = _get_overlap(current_chunk)
            current_chunk = (overlap_text + "\n\n" + para).strip() if overlap_text else para

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return [c for c in chunks if len(c) > 50]  # Lọc bỏ chunk quá ngắn

def _get_overlap(text: str) -> str:
    """Lấy phần cuối của text để làm overlap"""
    if len(text) <= CHUNK_OVERLAP:
        return text
    # Tìm điểm cắt gần nhất là xuống dòng
    overlap_start = len(text) - CHUNK_OVERLAP
    newline_pos = text.find('\n', overlap_start)
    if newline_pos != -1:
        return text[newline_pos:].strip()
    return text[-CHUNK_OVERLAP:].strip()

def process_pdf(file_path: str) -> List[str]:
    """Pipeline hoàn chỉnh: PDF → text → chunks"""
    text = extract_text_from_pdf(file_path)
    if not text.strip():
        raise ValueError("PDF không có nội dung hoặc bị mã hóa")
    chunks = split_text_into_chunks(text)
    return chunks

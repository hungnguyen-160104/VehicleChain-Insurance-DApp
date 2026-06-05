"""
Rate limiter in-memory đơn giản (sliding window) cho FastAPI.
Dùng làm dependency: Depends(chat_limiter) / Depends(login_limiter).
Phù hợp môi trường thử nghiệm 1 instance — chống spam/brute-force cơ bản
mà không cần thêm hạ tầng (Redis) hay dependency ngoài.
"""
import time
from collections import defaultdict, deque
from fastapi import Request, HTTPException, status


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window = window_seconds
        self._hits = defaultdict(deque)  # client_ip -> deque[timestamp]

    def __call__(self, request: Request):
        client = request.client.host if request.client else "unknown"
        now = time.time()
        hits = self._hits[client]

        # Bỏ các lượt truy cập đã ra ngoài cửa sổ thời gian
        while hits and now - hits[0] > self.window:
            hits.popleft()

        if len(hits) >= self.max_requests:
            retry_after = int(self.window - (now - hits[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
                headers={"Retry-After": str(retry_after)},
            )

        hits.append(now)


# Giới hạn cho từng endpoint (theo IP)
chat_limiter = RateLimiter(max_requests=20, window_seconds=60)   # 20 câu hỏi / phút
login_limiter = RateLimiter(max_requests=5, window_seconds=60)   # 5 lần đăng nhập / phút

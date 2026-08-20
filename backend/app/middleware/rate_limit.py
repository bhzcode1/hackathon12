import time
from typing import Dict, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.status import HTTP_429_TOO_MANY_REQUESTS
import threading

# In a production environment, we would use a distributed cache like Redis.
# For simplicity, we use an in-memory store with a lock for thread safety.
_request_counts: Dict[str, Tuple[int, float]] = {}
_lock = threading.Lock()

# Default rate limit: 100 requests per minute
DEFAULT_LIMIT = 100
DEFAULT_WINDOW = 60  # seconds


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = DEFAULT_LIMIT, window: int = DEFAULT_WINDOW):
        super().__init__(app)
        self.limit = limit
        self.window = window

    async def dispatch(self, request: Request, call_next):
        # Get the client IP (if behind a proxy, we might need to use X-Forwarded-For)
        # For simplicity, we use the host from the request.
        # In a real scenario, we should consider proxies.
        client_ip = request.client.host if request.client else "unknown"

        now = time.time()
        window_start = now - self.window

        with _lock:
            # Clean up old entries (optional, but we do it to prevent memory leak)
            # We remove entries that are older than the window.
            # We cannot iterate and delete in the same loop, so we create a list of keys to delete.
            # However, for simplicity, we just update the current IP and let the cleanup happen occasionally.
            # We'll do a cleanup every 100 requests or so? Not implemented for brevity.
            # Instead, we just check and update the current IP.

            if client_ip in _request_counts:
                count, window_start_time = _request_counts[client_ip]
                # If the current time is beyond the window, reset the count.
                if now > window_start_time + self.window:
                    count = 0
                    window_start_time = now
                count += 1
                _request_counts[client_ip] = (count, window_start_time)
            else:
                count = 1
                window_start_time = now
                _request_counts[client_ip] = (count, window_start_time)

            # Check if the count exceeds the limit
            if count > self.limit:
                # Calculate the time until the window resets
                reset_time = window_start_time + self.window
                retry_after = int(reset_time - now)
                return JSONResponse(
                    status_code=HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": "Rate limit exceeded",
                            "details": {
                                "limit": self.limit,
                                "window": self.window,
                                "retry_after": retry_after
                            }
                        }
                    },
                    headers={"Retry-After": str(retry_after)}
                )

        response = await call_next(request)
        return response
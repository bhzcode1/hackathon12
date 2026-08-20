import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("app.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        # Process the request
        response: Response = await call_next(request)
        process_time = time.time() - start_time

        # Prepare log data
        log_data = {
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.url.query),
            "status_code": response.status_code,
            "process_time": f"{process_time:.3f}s",
            "client_ip": request.client.host if request.client else "unknown",
        }

        # Log as JSON? We'll let the logging formatter handle the format.
        # We'll log a message and extra data so that a JSON formatter can pick it up.
        logger.info(
            "Request processed",
            extra=log_data
        )

        return response
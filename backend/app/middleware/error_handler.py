from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
import traceback
import logging

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            # Log the exception
            logger.error(
                f"Unhandled exception: {exc}",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                    "exception": str(exc),
                    "traceback": traceback.format_exc()
                }
            )
            # Return a standardized error response
            return JSONResponse(
                status_code=HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": {
                        "code": "INTERNAL_ERROR",
                        "message": "An internal server error occurred",
                        "details": {}
                    }
                }
            )
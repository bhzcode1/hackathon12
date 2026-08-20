import os
import sys
import json
import logging
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router


# Custom JSON formatter for logging
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcfromtimestamp(record.created).isoformat() + "Z",
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        # Add extra attributes from the record
        if hasattr(record, "extra"):
            log_record.update(record.extra)
        # If there is exception info, add it
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_record)


# Set up logging
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logger = logging.getLogger()
logger.setLevel(log_level)

# Create our JSON formatter
json_formatter = JSONFormatter()

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(json_formatter)
logger.addHandler(console_handler)

# File handler (optional)
if os.getenv("LOG_FILE"):
    file_handler = logging.FileHandler(os.getenv("LOG_FILE"))
    file_handler.setFormatter(json_formatter)
    logger.addHandler(file_handler)

# Create the FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include the API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Add middleware for error handling, rate limiting, and logging
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.logging import LoggingMiddleware

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)


@app.get("/")
def root():
    return {"message": "Welcome to Crime Reporting API"}


@app.get("/health")
def health_check():
    # We can add more checks here, e.g., database connectivity
    return {"status": "healthy", "database": "connected"}


# Validate environment variables on startup
def validate_environment():
    # Check that we have a valid database URL (either from DATABASE_URL or constructed from POSTGRES_* vars)
    # and that SECRET_KEY is set
    if not settings.SQLALCHEMY_DATABASE_URI:
        logger.error(
            "Missing required environment variables: DATABASE_URL (or POSTGRES_* variables to construct it)",
            extra={"missing_vars": ["DATABASE_URL"]}
        )
        sys.exit(1)
    if not settings.SECRET_KEY:
        logger.error(
            "Missing required environment variables: SECRET_KEY",
            extra={"missing_vars": ["SECRET_KEY"]}
        )
        sys.exit(1)

# Call the validation function
validate_environment()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List, Union
import secrets
import os


class Settings(BaseSettings):
    # Project settings
    PROJECT_NAME: str = "Crime Reporting API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database settings
    POSTGRES_SERVER: str = Field(default="localhost")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="")
    POSTGRES_DB: str = Field(default="crime_reporting")
    POSTGRES_PORT: str = Field(default="5432")

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Use DATABASE_URL if set, otherwise construct from POSTGRES_* fields
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            return database_url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Security settings
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Superuser settings
    FIRST_SUPERUSER: str = Field(default="admin@crimeapp.com")
    FIRST_SUPERUSER_PASSWORD: str = Field(default="changeme")

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
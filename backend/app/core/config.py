import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime settings loaded from environment variables."""

    # Project metadata
    PROJECT_NAME: str = "House Price Intelligence Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # API Gateway configuration
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # PostgreSQL Database configuration
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "house_price_db"

    DATABASE_URL: str = (
        "postgresql+psycopg2://postgres:postgres@localhost:5432/house_price_db"
    )
    ASYNC_DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/house_price_db"
    )

    # ML Model Registry and Storage
    MODEL_REGISTRY_DIR: str = "ml/models"
    ACTIVE_MODEL_VERSION: str = "v1.0.0"
    DATA_RAW_DIR: str = "data/raw"
    DATA_PROCESSED_DIR: str = "data/processed"

    # CORS settings
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                return json.loads(v)
            except Exception:
                return [v]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

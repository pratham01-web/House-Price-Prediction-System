from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import logger
from app.db.init_db import init_db
from app.api.v1 import api_router
from app.services.prediction_service import PredictionService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for FastAPI application startup and shutdown."""
    logger.info("Starting up House Price Intelligence Backend...")
    # Initialize DB tables
    init_db()

    # Pre-warm active ML pipeline
    try:
        pipeline, metadata = PredictionService.get_pipeline(settings.ACTIVE_MODEL_VERSION)
        logger.info(
            f"Pre-warmed ML pipeline {settings.ACTIVE_MODEL_VERSION} ({metadata.get('algorithm')})."
        )
    except Exception as exc:
        logger.warning(f"Could not pre-warm ML pipeline on startup: {exc}")

    yield

    logger.info("Shutting down House Price Intelligence Backend...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Production-grade Real Estate Price Intelligence and Machine Learning "
        "Valuation Platform backed by PostgreSQL and King County Housing data."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global unhandled exception handler returning RFC-compliant JSON."""
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing the request.",
            "path": request.url.path,
        },
    )


# Mount API Gateway Routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    """Root platform discovery endpoint."""
    return {
        "platform": settings.PROJECT_NAME,
        "version": "1.0.0",
        "api_v1": settings.API_V1_PREFIX,
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }

from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.properties import router as properties_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.models import router as models_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(properties_router)
api_router.include_router(predictions_router)
api_router.include_router(analytics_router)
api_router.include_router(models_router)

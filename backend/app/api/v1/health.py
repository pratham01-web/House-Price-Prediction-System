from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.db.session import get_db
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Verifies service health, database connectivity, and configuration."""
    db_ok = False
    try:
        db.execute(select(1)).scalar()
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database_connected": db_ok,
        "active_model_version": settings.ACTIVE_MODEL_VERSION,
    }

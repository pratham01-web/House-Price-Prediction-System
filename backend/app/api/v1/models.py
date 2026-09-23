from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.model_service import ModelService
from app.schemas.model import ModelVersionResponse, ModelListResponse

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("", response_model=ModelListResponse)
def list_models(db: Session = Depends(get_db)):
    """Lists all registered machine learning models with evaluation metrics."""
    service = ModelService(db)
    return service.list_all_models()


@router.get("/active", response_model=ModelVersionResponse)
def get_active_model(db: Session = Depends(get_db)):
    """Retrieves metadata and verified test metrics of the active production model."""
    service = ModelService(db)
    model = service.get_active_model()
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active model found in registry",
        )
    return model


@router.get("/{version}", response_model=ModelVersionResponse)
def get_model_by_version(version: str, db: Session = Depends(get_db)):
    """Retrieves details of a specific model version tag."""
    service = ModelService(db)
    model = service.get_model_by_version(version)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model version {version} not found",
        )
    return model

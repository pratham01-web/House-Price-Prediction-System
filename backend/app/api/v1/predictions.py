from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.prediction_service import PredictionService
from app.repositories.prediction_repository import PredictionRepository
from app.schemas.prediction import (
    PredictionInput,
    PredictionResponse,
    PredictionHistoryResponse,
    PredictionHistoryItem,
)

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def create_prediction(
    payload: PredictionInput,
    property_id: Optional[int] = Query(None, description="Optional property ID to link"),
    db: Session = Depends(get_db),
):
    """Executes deterministic ML inference for a property and stores the result in PostgreSQL."""
    try:
        service = PredictionService(db)
        return service.predict_property_value(payload, property_id=property_id)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference failure: {str(exc)}",
        )


@router.get("/history", response_model=PredictionHistoryResponse)
def get_prediction_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db),
):
    """Retrieves paginated audit trail of real valuation predictions from PostgreSQL."""
    repo = PredictionRepository(db)
    skip = (page - 1) * page_size
    items, total_count = repo.list_history(skip=skip, limit=page_size)
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return PredictionHistoryResponse(
        total_count=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=[
            PredictionHistoryItem(
                id=item.id,
                predicted_price=item.predicted_price,
                model_version=item.model_version.version if item.model_version else "v1.0.0",
                input_features=item.input_features,
                latency_ms=item.latency_ms,
                created_at=item.created_at,
            )
            for item in items
        ],
    )


@router.get("/{prediction_id}")
def get_prediction_by_id(prediction_id: str, db: Session = Depends(get_db)):
    """Retrieves a single historical prediction by UUID."""
    repo = PredictionRepository(db)
    record = repo.get_by_id(prediction_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record {prediction_id} not found",
        )
    return {
        "id": record.id,
        "predicted_price": record.predicted_price,
        "model_version": record.model_version.version if record.model_version else "unknown",
        "input_features": record.input_features,
        "explanation_factors": record.explanation_factors,
        "latency_ms": record.latency_ms,
        "created_at": record.created_at,
    }

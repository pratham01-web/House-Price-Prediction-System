from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.model_repository import ModelRepository
from app.schemas.model import ModelVersionResponse, ModelListResponse


class ModelService:
    """Service layer for querying model versions, metrics, and active model status."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = ModelRepository(db)

    def get_active_model(self) -> Optional[ModelVersionResponse]:
        """Returns the active production model metadata."""
        model = self.repo.get_active_model()
        if not model:
            return None
        return ModelVersionResponse.model_validate(model)

    def get_model_by_version(self, version: str) -> Optional[ModelVersionResponse]:
        """Returns a specific model version."""
        model = self.repo.get_by_version(version)
        if not model:
            return None
        return ModelVersionResponse.model_validate(model)

    def list_all_models(self) -> ModelListResponse:
        """Returns all registered models."""
        models = self.repo.list_models()
        return ModelListResponse(
            models=[ModelVersionResponse.model_validate(m) for m in models]
        )

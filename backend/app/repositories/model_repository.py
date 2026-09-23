from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import ModelVersion


class ModelRepository:
    """Data access repository for model versions and evaluation metrics."""

    def __init__(self, db: Session):
        self.db = db

    def get_active_model(self) -> Optional[ModelVersion]:
        """Returns the currently active production model."""
        return self.db.scalar(
            select(ModelVersion).where(ModelVersion.is_active == True)
        )

    def get_by_version(self, version: str) -> Optional[ModelVersion]:
        """Returns a model version by its tag (e.g. v1.0.0)."""
        return self.db.scalar(
            select(ModelVersion).where(ModelVersion.version == version)
        )

    def list_models(self) -> List[ModelVersion]:
        """Lists all registered models in the system."""
        return list(self.db.scalars(select(ModelVersion).order_by(ModelVersion.trained_at.desc())).all())

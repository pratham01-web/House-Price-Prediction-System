import uuid
from datetime import datetime
from typing import List, Optional, Any, Dict
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, utc_now


class ModelVersion(Base):
    """Tracks serialized ML models, evaluated performance metrics, and hyperparameters."""

    __tablename__ = "model_versions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    version: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)
    dataset_version_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("dataset_versions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # Validated Out-of-Sample Performance Metrics
    mae: Mapped[float] = mapped_column(Float, nullable=False)
    rmse: Mapped[float] = mapped_column(Float, nullable=False)
    r2: Mapped[float] = mapped_column(Float, nullable=False)

    # Serialized Hyperparameters and Input Schema
    hyperparameters: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    feature_names: Mapped[List[str]] = mapped_column(JSON, nullable=False)

    # Storage and Active State
    artifact_path: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    trained_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    # Relationships
    dataset_version: Mapped["DatasetVersion"] = relationship(
        "DatasetVersion",
        back_populates="model_versions",
    )
    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction",
        back_populates="model_version",
    )

    def __repr__(self) -> str:
        return f"<ModelVersion(version='{self.version}', algo='{self.algorithm}', R2={self.r2:.4f}, active={self.is_active})>"

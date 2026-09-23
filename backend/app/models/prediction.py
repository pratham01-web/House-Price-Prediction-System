import uuid
from datetime import datetime
from typing import Optional, Any, Dict
from sqlalchemy import (
    String,
    BigInteger,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, utc_now


class Prediction(Base):
    """Historical audit record of an ML valuation with inputs, prediction, and explanation."""

    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    model_version_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("model_versions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    property_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("properties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Input Payload Snapshot
    input_features: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)

    # Prediction Output
    predicted_price: Mapped[float] = mapped_column(Float, nullable=False)
    explanation_factors: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
        index=True,
    )

    # Relationships
    model_version: Mapped["ModelVersion"] = relationship(
        "ModelVersion",
        back_populates="predictions",
    )
    property: Mapped[Optional["Property"]] = relationship(
        "Property",
        back_populates="predictions",
    )

    __table_args__ = (
        Index("idx_predictions_created_at_desc", created_at.desc()),
        Index("idx_predictions_model_version", "model_version_id"),
    )

    def __repr__(self) -> str:
        return f"<Prediction(id='{self.id}', price=${self.predicted_price:,.0f}, model='{self.model_version_id}')>"

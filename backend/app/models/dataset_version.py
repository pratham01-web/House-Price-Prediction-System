import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, utc_now


class DatasetVersion(Base):
    """Tracks versioning, provenance, and source metadata for housing datasets."""

    __tablename__ = "dataset_versions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    version: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    row_count: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    # Relationships
    properties: Mapped[List["Property"]] = relationship(
        "Property",
        back_populates="dataset_version",
        cascade="all, delete-orphan",
    )
    model_versions: Mapped[List["ModelVersion"]] = relationship(
        "ModelVersion",
        back_populates="dataset_version",
    )

    def __repr__(self) -> str:
        return f"<DatasetVersion(version='{self.version}', row_count={self.row_count})>"

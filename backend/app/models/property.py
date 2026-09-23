from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import (
    BigInteger,
    String,
    Integer,
    Float,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, utc_now


class Property(Base):
    """Normalized residential property record with transaction details and physical features."""

    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    external_id: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    dataset_version_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("dataset_versions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Financial Transaction
    price: Mapped[float] = mapped_column(Float, nullable=False)
    sale_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Core Physical Attributes
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    bathrooms: Mapped[float] = mapped_column(Float, nullable=False)
    sqft_living: Mapped[int] = mapped_column(Integer, nullable=False)
    sqft_lot: Mapped[int] = mapped_column(Integer, nullable=False)
    floors: Mapped[float] = mapped_column(Float, nullable=False)

    # Qualitative Scores & Ratings
    waterfront: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    view_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    condition_score: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    grade_score: Mapped[int] = mapped_column(Integer, default=7, nullable=False)

    # Architectural Breakdown
    sqft_above: Mapped[int] = mapped_column(Integer, nullable=False)
    sqft_basement: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    yr_built: Mapped[int] = mapped_column(Integer, nullable=False)
    yr_renovated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Spatial Location
    zipcode: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Neighborhood Comparison Metrics
    sqft_living15: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sqft_lot15: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Audit Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    # Relationships
    dataset_version: Mapped["DatasetVersion"] = relationship(
        "DatasetVersion",
        back_populates="properties",
    )
    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction",
        back_populates="property",
    )

    __table_args__ = (
        # Check constraints enforcing domain integrity
        CheckConstraint("price > 0", name="chk_properties_price_positive"),
        CheckConstraint("bedrooms >= 0", name="chk_properties_bedrooms_non_negative"),
        CheckConstraint("bathrooms >= 0", name="chk_properties_bathrooms_non_negative"),
        CheckConstraint("sqft_living > 0", name="chk_properties_sqft_living_positive"),
        CheckConstraint("sqft_lot > 0", name="chk_properties_sqft_lot_positive"),
        CheckConstraint("waterfront IN (0, 1)", name="chk_properties_waterfront_binary"),
        CheckConstraint(
            "view_score BETWEEN 0 AND 4", name="chk_properties_view_score_range"
        ),
        CheckConstraint(
            "condition_score BETWEEN 1 AND 5",
            name="chk_properties_condition_score_range",
        ),
        CheckConstraint(
            "grade_score BETWEEN 1 AND 13", name="chk_properties_grade_score_range"
        ),
        # Analytical Indexes
        Index("idx_properties_zipcode", "zipcode"),
        Index("idx_properties_price", "price"),
        Index("idx_properties_sqft_living", "sqft_living"),
        Index("idx_properties_bedrooms_bathrooms", "bedrooms", "bathrooms"),
        Index("idx_properties_sale_date", "sale_date"),
    )

    def __repr__(self) -> str:
        return f"<Property(id={self.id}, ext_id='{self.external_id}', price=${self.price:,.0f}, zip={self.zipcode})>"

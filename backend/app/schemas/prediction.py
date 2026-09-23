from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class PredictionInput(BaseModel):
    """User input features required for property valuation inference."""
    bedrooms: int = Field(3, ge=0, le=15, description="Number of bedrooms")
    bathrooms: float = Field(2.25, ge=0.5, le=10.0, description="Number of bathrooms")
    sqft_living: int = Field(2000, ge=300, le=15000, description="Living area square footage")
    sqft_lot: int = Field(6000, ge=500, le=1000000, description="Lot size square footage")
    floors: float = Field(1.5, ge=1.0, le=4.0, description="Number of stories")
    waterfront: int = Field(0, ge=0, le=1, description="Waterfront property (0 or 1)")
    view_score: int = Field(0, ge=0, le=4, description="View quality rating (0-4)")
    condition_score: int = Field(3, ge=1, le=5, description="Physical condition (1-5)")
    grade_score: int = Field(7, ge=1, le=13, description="Construction quality grade (1-13)")
    sqft_above: int = Field(1700, ge=300, le=15000, description="Square footage above ground")
    sqft_basement: int = Field(300, ge=0, le=5000, description="Square footage of basement")
    yr_built: int = Field(1985, ge=1900, le=2026, description="Year originally built")
    yr_renovated: int = Field(0, ge=0, le=2026, description="Year of renovation (0 if none)")
    zipcode: str = Field("98052", description="King County 5-digit ZIP code")
    latitude: Optional[float] = Field(47.6740, description="Latitude (optional, defaults to zip centroid)")
    longitude: Optional[float] = Field(-122.1215, description="Longitude (optional, defaults to zip centroid)")
    sqft_living15: Optional[int] = Field(None, description="Nearby neighbor living area avg")
    sqft_lot15: Optional[int] = Field(None, description="Nearby neighbor lot area avg")


class ConfidenceRange(BaseModel):
    """Estimated confidence interval boundaries for predicted price."""
    lower_bound: float
    upper_bound: float


class FeatureFactor(BaseModel):
    """Quantified feature contribution to valuation."""
    feature: str
    impact: str  # "positive", "negative", "neutral"
    weight: float
    label: str


class PredictionResponse(BaseModel):
    """Complete prediction response contract."""
    prediction_id: str
    predicted_price: float
    confidence_range: ConfidenceRange
    model_version: str
    algorithm: str
    feature_factors: List[FeatureFactor]
    latency_ms: float
    created_at: datetime


class PredictionHistoryItem(BaseModel):
    """Historical valuation record retrieved from PostgreSQL."""
    id: str
    predicted_price: float
    model_version: str
    input_features: Dict[str, Any]
    latency_ms: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PredictionHistoryResponse(BaseModel):
    """Paginated list of historical valuations."""
    total_count: int
    page: int
    page_size: int
    total_pages: int
    items: List[PredictionHistoryItem]

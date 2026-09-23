from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


class PropertyBase(BaseModel):
    """Base property attributes."""
    external_id: str
    price: float = Field(..., gt=0, description="Sale transaction price in USD")
    sale_date: Optional[date] = None
    bedrooms: int = Field(..., ge=0)
    bathrooms: float = Field(..., ge=0)
    sqft_living: int = Field(..., gt=0)
    sqft_lot: int = Field(..., gt=0)
    floors: float = Field(..., ge=1.0)
    waterfront: int = Field(0, ge=0, le=1)
    view_score: int = Field(0, ge=0, le=4)
    condition_score: int = Field(3, ge=1, le=5)
    grade_score: int = Field(7, ge=1, le=13)
    sqft_above: int = Field(..., ge=0)
    sqft_basement: int = Field(0, ge=0)
    yr_built: int = Field(..., ge=1800, le=2026)
    yr_renovated: int = Field(0, ge=0, le=2026)
    zipcode: str
    latitude: float
    longitude: float
    sqft_living15: Optional[int] = None
    sqft_lot15: Optional[int] = None


class PropertyResponse(PropertyBase):
    """Response model for a single property."""
    id: int
    dataset_version_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PropertyListResponse(BaseModel):
    """Paginated list of property records."""
    total_count: int
    page: int
    page_size: int
    total_pages: int
    items: List[PropertyResponse]

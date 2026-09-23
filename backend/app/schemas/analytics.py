from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class MarketSummaryResponse(BaseModel):
    """Overall housing market indicators calculated live from database."""
    total_sales: int
    median_price: float
    mean_price: float
    std_price: float
    min_price: float
    max_price: float
    avg_price_per_sqft: float
    median_living_sqft: int
    waterfront_premium_ratio: float
    renovation_premium_amount: float
    top_expensive_zip: str
    top_affordable_zip: str


class HistogramBin(BaseModel):
    """Price distribution histogram bucket."""
    bin_range: str
    bin_start: float
    bin_end: float
    count: int


class PriceDistributionResponse(BaseModel):
    """Price distribution series for chart visualization."""
    total_samples: int
    bins: List[HistogramBin]


class LocationMetric(BaseModel):
    """Spatial valuation metrics aggregated per zipcode."""
    zipcode: str
    property_count: int
    avg_price: float
    median_price: float
    avg_price_per_sqft: float
    latitude: float
    longitude: float


class LocationBreakdownResponse(BaseModel):
    """List of geographic market locations."""
    locations: List[LocationMetric]


class FeatureCorrelation(BaseModel):
    """Pearson correlation coefficient against transaction price."""
    feature: str
    correlation: float
    description: str


class CorrelationAnalysisResponse(BaseModel):
    """List of feature correlations with housing price."""
    correlations: List[FeatureCorrelation]

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    MarketSummaryResponse,
    PriceDistributionResponse,
    LocationBreakdownResponse,
    CorrelationAnalysisResponse,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/market-summary", response_model=MarketSummaryResponse)
def get_market_summary(db: Session = Depends(get_db)):
    """Computes global transaction metrics from authentic database records."""
    service = AnalyticsService(db)
    return service.get_market_summary()


@router.get("/price-distribution", response_model=PriceDistributionResponse)
def get_price_distribution(db: Session = Depends(get_db)):
    """Computes histogram bins for actual closing sale prices."""
    service = AnalyticsService(db)
    return service.get_price_distribution()


@router.get("/location-breakdown", response_model=LocationBreakdownResponse)
def get_location_breakdown(db: Session = Depends(get_db)):
    """Computes spatial volume and valuation trends across all 70 King County zipcodes."""
    service = AnalyticsService(db)
    return service.get_locations()


@router.get("/feature-correlations", response_model=CorrelationAnalysisResponse)
def get_feature_correlations(db: Session = Depends(get_db)):
    """Returns validated Pearson correlation coefficients between features and price."""
    service = AnalyticsService(db)
    return service.get_correlations()

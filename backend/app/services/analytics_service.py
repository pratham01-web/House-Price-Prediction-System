from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import (
    MarketSummaryResponse,
    PriceDistributionResponse,
    LocationBreakdownResponse,
    CorrelationAnalysisResponse,
)


class AnalyticsService:
    """Service layer exposing market analytics and feature correlation calculations."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = AnalyticsRepository(db)

    def get_market_summary(self) -> MarketSummaryResponse:
        """Calculates global market statistics."""
        data = self.repo.get_market_summary()
        return MarketSummaryResponse(**data)

    def get_price_distribution(self) -> PriceDistributionResponse:
        """Calculates histogram distribution buckets for transaction prices."""
        data = self.repo.get_price_distribution()
        return PriceDistributionResponse(**data)

    def get_locations(self) -> LocationBreakdownResponse:
        """Returns geographic analysis across King County zip codes."""
        locations = self.repo.get_location_breakdown()
        return LocationBreakdownResponse(locations=locations)

    def get_correlations(self) -> CorrelationAnalysisResponse:
        """Returns feature correlation factors."""
        correlations = self.repo.get_correlations()
        return CorrelationAnalysisResponse(correlations=correlations)

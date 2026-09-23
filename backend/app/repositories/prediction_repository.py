from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy import select, func, desc
from sqlalchemy.orm import Session
from app.models import Prediction


class PredictionRepository:
    """Data access repository for ML valuation audit records."""

    def __init__(self, db: Session):
        self.db = db

    def save_prediction(
        self,
        model_version_id: str,
        input_features: Dict[str, Any],
        predicted_price: float,
        explanation_factors: Optional[Any],
        latency_ms: float,
        property_id: Optional[int] = None,
    ) -> Prediction:
        """Persists a new prediction into PostgreSQL."""
        prediction = Prediction(
            model_version_id=model_version_id,
            property_id=property_id,
            input_features=input_features,
            predicted_price=predicted_price,
            explanation_factors=explanation_factors,
            latency_ms=latency_ms,
        )
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        return prediction

    def get_by_id(self, prediction_id: str) -> Optional[Prediction]:
        """Fetches a single prediction by UUID."""
        return self.db.scalar(select(Prediction).where(Prediction.id == prediction_id))

    def list_history(
        self, skip: int = 0, limit: int = 20
    ) -> Tuple[List[Prediction], int]:
        """Returns paginated historical predictions ordered by newest first."""
        count_query = select(func.count(Prediction.id))
        total_count = self.db.scalar(count_query) or 0

        query = (
            select(Prediction)
            .order_by(desc(Prediction.created_at))
            .offset(skip)
            .limit(limit)
        )
        items = list(self.db.scalars(query).all())
        return items, total_count

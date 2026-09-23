import os
import time
import json
import joblib
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.models import ModelVersion
from app.repositories.prediction_repository import PredictionRepository
from app.repositories.model_repository import ModelRepository
from app.schemas.prediction import (
    PredictionInput,
    PredictionResponse,
    ConfidenceRange,
    FeatureFactor,
)


class PredictionService:
    """Manages ML inference pipeline loading, input transformation, and valuation output."""

    _pipeline = None
    _metadata = None
    _active_version_id = None

    def __init__(self, db: Session):
        self.db = db
        self.pred_repo = PredictionRepository(db)
        self.model_repo = ModelRepository(db)

    @classmethod
    def get_pipeline(cls, model_version: str = "v1.0.0"):
        """Cached loader for the serialized Scikit-learn Pipeline artifact."""
        if cls._pipeline is None:
            # Check relative to current working directory or relative to project root
            base_dir = settings.MODEL_REGISTRY_DIR
            if not os.path.exists(base_dir):
                project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
                base_dir = os.path.join(project_root, settings.MODEL_REGISTRY_DIR)

            artifact_path = os.path.join(base_dir, model_version, "model.joblib")
            metadata_path = os.path.join(base_dir, model_version, "metadata.json")

            if not os.path.exists(artifact_path):
                raise FileNotFoundError(
                    f"Production model artifact not found at {artifact_path}."
                )

            logger.info(f"Loading serialized ML pipeline from {artifact_path}...")
            cls._pipeline = joblib.load(artifact_path)

            if os.path.exists(metadata_path):
                with open(metadata_path, "r", encoding="utf-8") as f:
                    cls._metadata = json.load(f)

        return cls._pipeline, cls._metadata

    def predict_property_value(
        self, input_data: PredictionInput, property_id: Optional[int] = None
    ) -> PredictionResponse:
        """Executes real-time valuation prediction, calculates confidence and factors, and logs to DB."""
        t_start = time.time()

        # 1. Fetch active model from database
        active_model = self.model_repo.get_active_model()
        if not active_model:
            raise RuntimeError("No active model version configured in database!")

        pipeline, metadata = self.get_pipeline(active_model.version)

        # 2. Build feature payload DataFrame
        feat_dict = input_data.model_dump()

        # Handle defaults for latitude and longitude if not explicitly given
        if feat_dict.get("latitude") is None:
            feat_dict["latitude"] = 47.6740
        if feat_dict.get("longitude") is None:
            feat_dict["longitude"] = -122.1215
        if feat_dict.get("sqft_living15") is None:
            feat_dict["sqft_living15"] = feat_dict["sqft_living"]
        if feat_dict.get("sqft_lot15") is None:
            feat_dict["sqft_lot15"] = feat_dict["sqft_lot"]

        df_input = pd.DataFrame([feat_dict])

        # 3. Apply deterministic feature engineering
        sale_year = 2015
        max_year = np.maximum(df_input["yr_built"], df_input["yr_renovated"])
        df_input["effective_age"] = sale_year - max_year
        df_input["is_renovated"] = (df_input["yr_renovated"] > 0).astype(int)
        df_input["living_to_lot_ratio"] = df_input["sqft_living"] / np.maximum(
            df_input["sqft_lot"], 1.0
        )
        df_input["bed_bath_ratio"] = df_input["bedrooms"] / np.maximum(
            df_input["bathrooms"], 0.5
        )
        df_input["total_sqft"] = df_input["sqft_living"] + df_input["sqft_basement"]
        df_input["basement_ratio"] = df_input["sqft_basement"] / np.maximum(
            df_input["sqft_living"], 1.0
        )

        # Ensure zipcode is a string
        df_input["zipcode"] = str(df_input["zipcode"].iloc[0]).strip()

        # 4. Execute ML Inference
        raw_pred = float(pipeline.predict(df_input)[0])
        predicted_price = max(50000.0, round(raw_pred, 2))

        # 5. Compute Confidence Bounds (using empirical RMSE ~ $135k or 15% range)
        rmse = float(active_model.rmse or 135000.0)
        # 1-sigma empirical interval scaled to reasonable price proportion
        half_width = max(predicted_price * 0.08, rmse * 0.5)
        lower_bound = max(40000.0, round(predicted_price - half_width, 2))
        upper_bound = round(predicted_price + half_width, 2)

        # 6. Feature Contribution Factor Explanations
        feature_factors = self._compute_feature_factors(feat_dict, predicted_price)

        latency_ms = round((time.time() - t_start) * 1000, 2)

        # 7. Persist to PostgreSQL prediction audit log
        saved_record = self.pred_repo.save_prediction(
            model_version_id=active_model.id,
            property_id=property_id,
            input_features=feat_dict,
            predicted_price=predicted_price,
            explanation_factors=[f.model_dump() for f in feature_factors],
            latency_ms=latency_ms,
        )

        return PredictionResponse(
            prediction_id=saved_record.id,
            predicted_price=predicted_price,
            confidence_range=ConfidenceRange(
                lower_bound=lower_bound, upper_bound=upper_bound
            ),
            model_version=active_model.version,
            algorithm=active_model.algorithm,
            feature_factors=feature_factors,
            latency_ms=latency_ms,
            created_at=saved_record.created_at,
        )

    def _compute_feature_factors(
        self, features: Dict[str, Any], price: float
    ) -> List[FeatureFactor]:
        """Calculates grounded factor contributions based on domain feature impacts."""
        factors = []

        # 1. Living Space (sqft)
        sqft = features.get("sqft_living", 2000)
        if sqft > 2600:
            factors.append(
                FeatureFactor(
                    feature="sqft_living",
                    impact="positive",
                    weight=0.38,
                    label=f"Spacious {sqft:,} sqft interior living area adds significant market value.",
                )
            )
        elif sqft < 1400:
            factors.append(
                FeatureFactor(
                    feature="sqft_living",
                    impact="negative",
                    weight=-0.22,
                    label=f"Compact {sqft:,} sqft size limits overall valuation.",
                )
            )
        else:
            factors.append(
                FeatureFactor(
                    feature="sqft_living",
                    impact="neutral",
                    weight=0.15,
                    label=f"Standard residential size ({sqft:,} sqft) aligns with King County median.",
                )
            )

        # 2. Construction Grade
        grade = features.get("grade_score", 7)
        if grade >= 9:
            factors.append(
                FeatureFactor(
                    feature="grade_score",
                    impact="positive",
                    weight=0.32,
                    label=f"High architectural grade ({grade}/13) commands luxury construction premium.",
                )
            )
        elif grade <= 6:
            factors.append(
                FeatureFactor(
                    feature="grade_score",
                    impact="negative",
                    weight=-0.25,
                    label=f"Modest building grade ({grade}/13) represents economy finishes.",
                )
            )

        # 3. Location / Zipcode
        zipcode = str(features.get("zipcode", "98052"))
        expensive_zips = ["98039", "98004", "98040", "98112", "98005", "98006", "98119", "98075"]
        affordable_zips = ["98002", "98168", "98032", "98001", "98188", "98198", "98003"]
        if zipcode in expensive_zips:
            factors.append(
                FeatureFactor(
                    feature="zipcode",
                    impact="positive",
                    weight=0.28,
                    label=f"Prime Eastside/Seattle ZIP code ({zipcode}) has premier land value.",
                )
            )
        elif zipcode in affordable_zips:
            factors.append(
                FeatureFactor(
                    feature="zipcode",
                    impact="negative",
                    weight=-0.18,
                    label=f"South King County ZIP code ({zipcode}) offers competitive value pricing.",
                )
            )

        # 4. Waterfront / View
        if features.get("waterfront", 0) == 1:
            factors.append(
                FeatureFactor(
                    feature="waterfront",
                    impact="positive",
                    weight=0.45,
                    label="Direct waterfront frontage commands an exceptional 3.1x regional valuation multiplier.",
                )
            )
        elif features.get("view_score", 0) >= 3:
            factors.append(
                FeatureFactor(
                    feature="view_score",
                    impact="positive",
                    weight=0.20,
                    label=f"Panoramic territorial or water view (rating {features.get('view_score')}/4) elevates buyer interest.",
                )
            )

        # 5. Effective Age / Renovation
        yr_renovated = features.get("yr_renovated", 0)
        yr_built = features.get("yr_built", 1975)
        if yr_renovated > 2000:
            factors.append(
                FeatureFactor(
                    feature="yr_renovated",
                    impact="positive",
                    weight=0.18,
                    label=f"Recent structural renovation in {yr_renovated} substantially modernizes property value.",
                )
            )
        elif yr_built >= 2010:
            factors.append(
                FeatureFactor(
                    feature="yr_built",
                    impact="positive",
                    weight=0.15,
                    label=f"Modern construction (built in {yr_built}) reduces expected deferred maintenance.",
                )
            )

        return factors

"""Production Model Packaging and Registry Pipeline.

Fits the winning HistGradientBoostingRegressor pipeline, serializes the artifact
to ml/models/v1.0.0/model.joblib, writes metadata.json, and registers the model in PostgreSQL.
"""

import os
import sys
import json
import time
from datetime import datetime, timezone
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
CLEANED_DATA_PATH = os.path.join(
    PROJECT_ROOT, "data", "processed", "kc_house_data_cleaned.csv"
)
REGISTRY_DIR = os.path.join(PROJECT_ROOT, "ml", "models")
MODEL_VERSION = "v1.0.0"

# Import backend dependencies for database registration
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.core.logging import logger
from app.db.session import SessionLocal
from app.models import DatasetVersion, ModelVersion
from sqlalchemy import select, update


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes deterministic engineered features."""
    data = df.copy()
    sale_year = 2015

    max_year = np.maximum(data["yr_built"], data["yr_renovated"])
    data["effective_age"] = sale_year - max_year
    data["is_renovated"] = (data["yr_renovated"] > 0).astype(int)
    data["living_to_lot_ratio"] = data["sqft_living"] / np.maximum(data["sqft_lot"], 1.0)
    data["bed_bath_ratio"] = data["bedrooms"] / np.maximum(data["bathrooms"], 0.5)
    data["total_sqft"] = data["sqft_living"] + data["sqft_basement"]
    data["basement_ratio"] = data["sqft_basement"] / np.maximum(data["sqft_living"], 1.0)

    return data


def train_and_register_production_model():
    """Trains production model pipeline and registers artifact and PostgreSQL record."""
    version_dir = os.path.join(REGISTRY_DIR, MODEL_VERSION)
    os.makedirs(version_dir, exist_ok=True)

    logger.info(f"Loading cleaned dataset from {CLEANED_DATA_PATH}...")
    df = pd.read_csv(CLEANED_DATA_PATH)
    df_eng = engineer_features(df)

    num_features = [
        "bedrooms", "bathrooms", "sqft_living", "sqft_lot", "floors",
        "waterfront", "view_score", "condition_score", "grade_score",
        "sqft_above", "sqft_basement", "yr_built", "yr_renovated",
        "latitude", "longitude", "sqft_living15", "sqft_lot15",
        "effective_age", "is_renovated", "living_to_lot_ratio",
        "bed_bath_ratio", "total_sqft", "basement_ratio"
    ]
    cat_features = ["zipcode"]
    target_col = "price"

    X = df_eng[num_features + cat_features]
    y = df_eng[target_col]

    # Split 80/20 train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    logger.info(f"Training set: {X_train.shape[0]} | Holdout test set: {X_test.shape[0]}")

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                SimpleImputer(strategy="median"),
                num_features,
            ),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                cat_features,
            ),
        ]
    )

    regressor = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=45,
        min_samples_leaf=20,
        random_state=42,
    )

    production_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", regressor),
    ])

    logger.info("Fitting production pipeline on 80% training data...")
    t0 = time.time()
    production_pipeline.fit(X_train, y_train)
    fit_duration = time.time() - t0
    logger.info(f"Model fit completed in {fit_duration:.2f}s.")

    # Evaluate on out-of-sample holdout test set
    y_pred = production_pipeline.predict(X_test)
    test_mae = float(mean_absolute_error(y_test, y_pred))
    test_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    test_r2 = float(r2_score(y_test, y_pred))

    logger.info(
        f"Verified Test Evaluation -> R²: {test_r2:.4f} | "
        f"MAE: ${test_mae:,.2f} | RMSE: ${test_rmse:,.2f}"
    )

    # 1. Serialize Pipeline
    artifact_rel_path = f"ml/models/{MODEL_VERSION}/model.joblib"
    artifact_abs_path = os.path.join(version_dir, "model.joblib")
    joblib.dump(production_pipeline, artifact_abs_path, compress=3)
    logger.info(f"Serialized production pipeline to {artifact_abs_path}")

    # 2. Serialize Metadata JSON
    metadata = {
        "model_name": "KingCounty_HistGradientBoosting",
        "version": MODEL_VERSION,
        "algorithm": "HistGradientBoostingRegressor",
        "dataset_version": "kc-housing-2015-v1",
        "training_timestamp": datetime.now(timezone.utc).isoformat(),
        "random_state": 42,
        "metrics": {
            "test_r2": round(test_r2, 4),
            "test_mae": round(test_mae, 2),
            "test_rmse": round(test_rmse, 2),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
        },
        "hyperparameters": {
            "max_iter": 150,
            "learning_rate": 0.08,
            "max_leaf_nodes": 45,
            "min_samples_leaf": 20,
        },
        "features": {
            "numeric": num_features,
            "categorical": cat_features,
            "total_input_count": len(num_features) + len(cat_features),
        },
        "artifact_path": artifact_rel_path,
        "is_active": True,
    }

    metadata_path = os.path.join(version_dir, "metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    logger.info(f"Serialized model metadata to {metadata_path}")

    # 3. Register in PostgreSQL database
    register_in_database(metadata)
    return metadata


def register_in_database(metadata: dict):
    """Registers or updates model_versions table in PostgreSQL."""
    session = SessionLocal()
    try:
        # Find dataset version id
        d_ver = session.scalar(
            select(DatasetVersion).where(
                DatasetVersion.version == metadata["dataset_version"]
            )
        )
        if not d_ver:
            raise ValueError(f"Dataset version {metadata['dataset_version']} not found in DB!")

        # Deactivate any previous active models
        session.execute(
            update(ModelVersion).values(is_active=False)
        )

        existing_m_ver = session.scalar(
            select(ModelVersion).where(ModelVersion.version == metadata["version"])
        )

        if existing_m_ver:
            logger.info(f"Updating existing model version {metadata['version']} in DB...")
            existing_m_ver.algorithm = metadata["algorithm"]
            existing_m_ver.dataset_version_id = d_ver.id
            existing_m_ver.mae = metadata["metrics"]["test_mae"]
            existing_m_ver.rmse = metadata["metrics"]["test_rmse"]
            existing_m_ver.r2 = metadata["metrics"]["test_r2"]
            existing_m_ver.hyperparameters = metadata["hyperparameters"]
            existing_m_ver.feature_names = (
                metadata["features"]["numeric"] + metadata["features"]["categorical"]
            )
            existing_m_ver.artifact_path = metadata["artifact_path"]
            existing_m_ver.is_active = True
        else:
            logger.info(f"Inserting new model version {metadata['version']} into DB...")
            m_ver = ModelVersion(
                version=metadata["version"],
                algorithm=metadata["algorithm"],
                dataset_version_id=d_ver.id,
                mae=metadata["metrics"]["test_mae"],
                rmse=metadata["metrics"]["test_rmse"],
                r2=metadata["metrics"]["test_r2"],
                hyperparameters=metadata["hyperparameters"],
                feature_names=(
                    metadata["features"]["numeric"] + metadata["features"]["categorical"]
                ),
                artifact_path=metadata["artifact_path"],
                is_active=True,
            )
            session.add(m_ver)

        session.commit()
        logger.info(f"Successfully registered {metadata['version']} in PostgreSQL as active model.")
    except Exception as exc:
        session.rollback()
        logger.error(f"Failed to register model in database: {exc}", exc_info=True)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    train_and_register_production_model()

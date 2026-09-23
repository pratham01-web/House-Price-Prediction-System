"""Automated Data Ingestion & Cleaning Pipeline for King County Housing Sales.

Fetches 21,613 authentic residential real estate transactions from OpenML (42092),
validates data integrity, performs cleaning, and batch ingests into PostgreSQL.
"""

import os
import sys
import argparse
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.datasets import fetch_openml
from sqlalchemy import select, func, delete

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.core.logging import logger
from app.db.session import SessionLocal, engine
from app.models import Base, DatasetVersion, Property

DATASET_VERSION_TAG = "kc-housing-2015-v1"
DATASET_SOURCE_INFO = (
    "King County Department of Assessments / OpenML (Dataset 42092)"
)
DATASET_DESCRIPTION = (
    "21,613 authentic recorded residential home sales in King County, WA "
    "(Seattle metropolitan area) between May 2014 and May 2015."
)

RAW_DATA_PATH = os.path.join(PROJECT_ROOT, "data", "raw", "kc_house_data.csv")
PROCESSED_DATA_PATH = os.path.join(
    PROJECT_ROOT, "data", "processed", "kc_house_data_cleaned.csv"
)


def fetch_raw_dataset() -> pd.DataFrame:
    """Downloads or loads the authentic King County housing dataset."""
    os.makedirs(os.path.dirname(RAW_DATA_PATH), exist_ok=True)

    if os.path.exists(RAW_DATA_PATH):
        logger.info(f"Loading cached raw dataset from {RAW_DATA_PATH}...")
        df = pd.read_csv(RAW_DATA_PATH)
        return df

    logger.info("Downloading King County Housing dataset from OpenML (ID: 42092)...")
    housing = fetch_openml(data_id=42092, as_frame=True, parser="auto")
    df = housing.frame

    logger.info(f"Downloaded raw dataset: {df.shape[0]} rows, {df.shape[1]} columns.")
    df.to_csv(RAW_DATA_PATH, index=False)
    logger.info(f"Saved immutable raw copy to {RAW_DATA_PATH}.")
    return df


def clean_and_validate(df: pd.DataFrame) -> pd.DataFrame:
    """Performs validation, outlier handling, and date formatting."""
    logger.info("Validating and cleaning dataset...")
    cleaned = df.copy()

    # 1. Verify required columns
    required_cols = [
        "date", "price", "bedrooms", "bathrooms", "sqft_living", "sqft_lot",
        "floors", "waterfront", "view", "condition", "grade", "sqft_above",
        "sqft_basement", "yr_built", "yr_renovated", "zipcode", "lat", "long"
    ]
    missing = [col for col in required_cols if col not in cleaned.columns]
    if missing:
        raise ValueError(f"Missing required columns in dataset: {missing}")

    # 2. Check and fix known typographical anomalies
    # The famous 33 bedrooms with 1620 sqft living is a known 3-bedroom home
    bedroom_33_mask = cleaned["bedrooms"] == 33
    if bedroom_33_mask.any():
        logger.info(f"Correcting {bedroom_33_mask.sum()} recording typo: bedrooms 33 -> 3")
        cleaned.loc[bedroom_33_mask, "bedrooms"] = 3

    # 3. Format Date
    if cleaned["date"].dtype == "object":
        # Raw dates formatted as '20141013T000000'
        parsed_dates = pd.to_datetime(
            cleaned["date"].str.slice(0, 8), format="%Y%m%d", errors="coerce"
        )
        cleaned["sale_date"] = parsed_dates.dt.date
    else:
        cleaned["sale_date"] = pd.to_datetime(cleaned["date"]).dt.date

    # 4. Standardize types
    cleaned["price"] = cleaned["price"].astype(float)
    cleaned["bedrooms"] = cleaned["bedrooms"].astype(int)
    cleaned["bathrooms"] = cleaned["bathrooms"].astype(float)
    cleaned["sqft_living"] = cleaned["sqft_living"].astype(int)
    cleaned["sqft_lot"] = cleaned["sqft_lot"].astype(int)
    cleaned["floors"] = cleaned["floors"].astype(float)
    cleaned["waterfront"] = cleaned["waterfront"].astype(int)
    cleaned["view_score"] = cleaned["view"].astype(int)
    cleaned["condition_score"] = cleaned["condition"].astype(int)
    cleaned["grade_score"] = cleaned["grade"].astype(int)
    cleaned["sqft_above"] = cleaned["sqft_above"].astype(int)
    cleaned["sqft_basement"] = cleaned["sqft_basement"].astype(int)
    cleaned["yr_built"] = cleaned["yr_built"].astype(int)
    cleaned["yr_renovated"] = cleaned["yr_renovated"].astype(int)
    cleaned["zipcode"] = cleaned["zipcode"].astype(str).str.strip()
    cleaned["latitude"] = cleaned["lat"].astype(float)
    cleaned["longitude"] = cleaned["long"].astype(float)

    if "sqft_living15" in cleaned.columns:
        cleaned["sqft_living15"] = cleaned["sqft_living15"].astype(int)
    else:
        cleaned["sqft_living15"] = cleaned["sqft_living"]

    if "sqft_lot15" in cleaned.columns:
        cleaned["sqft_lot15"] = cleaned["sqft_lot15"].astype(int)
    else:
        cleaned["sqft_lot15"] = cleaned["sqft_lot"]

    # 5. Generate deterministic external_id
    cleaned["external_id"] = [f"KC-{idx + 1:06d}" for idx in range(len(cleaned))]

    # 6. Physical boundary assertions
    assert (cleaned["price"] > 0).all(), "Found invalid non-positive price!"
    assert (cleaned["bedrooms"] >= 0).all(), "Found negative bedrooms!"
    assert (cleaned["sqft_living"] > 0).all(), "Found non-positive sqft_living!"
    assert (cleaned["condition_score"].between(1, 5)).all(), "Invalid condition score!"
    assert (cleaned["grade_score"].between(1, 13)).all(), "Invalid grade score!"

    os.makedirs(os.path.dirname(PROCESSED_DATA_PATH), exist_ok=True)
    cleaned.to_csv(PROCESSED_DATA_PATH, index=False)
    logger.info(
        f"Validation complete. Cleaned dataset saved to {PROCESSED_DATA_PATH} "
        f"({len(cleaned)} rows)."
    )
    return cleaned


def ingest_into_database(df: pd.DataFrame, reingest: bool = False) -> int:
    """Ingests the validated DataFrame into PostgreSQL in high-performance batches."""
    logger.info("Initializing database tables if not present...")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    try:
        # Check or create DatasetVersion
        d_ver = session.scalar(
            select(DatasetVersion).where(DatasetVersion.version == DATASET_VERSION_TAG)
        )
        if not d_ver:
            logger.info(f"Registering dataset version: {DATASET_VERSION_TAG}...")
            d_ver = DatasetVersion(
                version=DATASET_VERSION_TAG,
                source=DATASET_SOURCE_INFO,
                row_count=len(df),
                description=DATASET_DESCRIPTION,
            )
            session.add(d_ver)
            session.commit()
            session.refresh(d_ver)
        else:
            logger.info(f"Dataset version {DATASET_VERSION_TAG} already registered.")

        # Check existing property count
        existing_count = session.scalar(
            select(func.count(Property.id)).where(
                Property.dataset_version_id == d_ver.id
            )
        )

        if existing_count == len(df) and not reingest:
            logger.info(
                f"PostgreSQL already contains all {existing_count} records for {DATASET_VERSION_TAG}. "
                "Skipping ingestion."
            )
            return existing_count

        if reingest and existing_count > 0:
            logger.warning(f"Reingest flag set. Deleting {existing_count} existing records...")
            session.execute(
                delete(Property).where(Property.dataset_version_id == d_ver.id)
            )
            session.commit()

        logger.info(f"Starting batch ingestion of {len(df)} properties...")
        batch_size = 2500
        records = []

        for _, row in df.iterrows():
            records.append({
                "external_id": row["external_id"],
                "dataset_version_id": d_ver.id,
                "price": float(row["price"]),
                "sale_date": row["sale_date"],
                "bedrooms": int(row["bedrooms"]),
                "bathrooms": float(row["bathrooms"]),
                "sqft_living": int(row["sqft_living"]),
                "sqft_lot": int(row["sqft_lot"]),
                "floors": float(row["floors"]),
                "waterfront": int(row["waterfront"]),
                "view_score": int(row["view_score"]),
                "condition_score": int(row["condition_score"]),
                "grade_score": int(row["grade_score"]),
                "sqft_above": int(row["sqft_above"]),
                "sqft_basement": int(row["sqft_basement"]),
                "yr_built": int(row["yr_built"]),
                "yr_renovated": int(row["yr_renovated"]),
                "zipcode": str(row["zipcode"]),
                "latitude": float(row["latitude"]),
                "longitude": float(row["longitude"]),
                "sqft_living15": int(row["sqft_living15"]),
                "sqft_lot15": int(row["sqft_lot15"]),
            })

            if len(records) >= batch_size:
                session.bulk_insert_mappings(Property, records)
                session.commit()
                records = []
                logger.info(f"Ingested batch... ({batch_size} rows committed)")

        if records:
            session.bulk_insert_mappings(Property, records)
            session.commit()
            logger.info(f"Final batch of {len(records)} rows committed.")

        total_ingested = session.scalar(
            select(func.count(Property.id)).where(
                Property.dataset_version_id == d_ver.id
            )
        )
        logger.info(
            f"Successfully ingested {total_ingested} real properties into PostgreSQL!"
        )
        return total_ingested
    except Exception as exc:
        session.rollback()
        logger.error(f"Error during data ingestion: {exc}", exc_info=True)
        raise
    finally:
        session.close()


def main():
    parser = argparse.ArgumentParser(description="Ingest King County Housing dataset")
    parser.add_argument("--reingest", action="store_true", help="Force reload existing data")
    args = parser.parse_args()

    df_raw = fetch_raw_dataset()
    df_cleaned = clean_and_validate(df_raw)
    total = ingest_into_database(df_cleaned, reingest=args.reingest)
    print(f"PIPELINE SUCCESS: {total} records active in PostgreSQL.")


if __name__ == "__main__":
    main()

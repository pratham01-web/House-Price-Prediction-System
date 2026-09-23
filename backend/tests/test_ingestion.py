"""Automated tests validating the real King County dataset and PostgreSQL ingestion."""

import os
import pytest
import pandas as pd
from sqlalchemy import select, func, distinct
from app.db.session import SessionLocal
from app.models import DatasetVersion, Property

RAW_CSV = "data/raw/kc_house_data.csv"
PROCESSED_CSV = "data/processed/kc_house_data_cleaned.csv"


@pytest.fixture(scope="module")
def db_session():
    """Provides a database session for testing ingested data."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_raw_and_processed_files_exist():
    """Verifies that the immutable raw dataset and cleaned dataset exist with 21,613 rows."""
    assert os.path.exists(RAW_CSV), f"Raw dataset not found at {RAW_CSV}"
    assert os.path.exists(PROCESSED_CSV), f"Cleaned dataset not found at {PROCESSED_CSV}"

    df_cleaned = pd.read_csv(PROCESSED_CSV)
    assert len(df_cleaned) == 21613
    assert "external_id" in df_cleaned.columns
    assert "sale_date" in df_cleaned.columns
    # Check that typo 33 was fixed
    assert 33 not in df_cleaned["bedrooms"].values


def test_dataset_version_registered(db_session):
    """Verifies that dataset_version kc-housing-2015-v1 is registered in PostgreSQL."""
    d_ver = db_session.scalar(
        select(DatasetVersion).where(DatasetVersion.version == "kc-housing-2015-v1")
    )
    assert d_ver is not None
    assert d_ver.row_count == 21613
    assert "King County" in d_ver.source


def test_database_properties_count(db_session):
    """Verifies that exactly 21,613 authentic properties are stored in PostgreSQL."""
    total_props = db_session.scalar(select(func.count(Property.id)))
    assert total_props == 21613


def test_database_price_and_physical_ranges(db_session):
    """Verifies domain boundaries and statistical integrity of real properties in PostgreSQL."""
    min_price = db_session.scalar(select(func.min(Property.price)))
    max_price = db_session.scalar(select(func.max(Property.price)))
    avg_price = db_session.scalar(select(func.avg(Property.price)))
    max_bedrooms = db_session.scalar(select(func.max(Property.bedrooms)))
    min_bedrooms = db_session.scalar(select(func.min(Property.bedrooms)))

    # Real King County price range: $75,000 to $7,700,000 (mean ~$540,000)
    assert min_price == 75000.0
    assert max_price == 7700000.0
    assert 530000.0 < avg_price < 550000.0

    # Max bedrooms should be 11 (the 33-bedroom typo was cleaned to 3)
    assert max_bedrooms <= 11
    assert min_bedrooms == 0


def test_database_zipcodes_and_spatial_bounds(db_session):
    """Verifies spatial coordinates and zip codes in King County."""
    distinct_zips = db_session.scalar(select(func.count(distinct(Property.zipcode))))
    # King County dataset has 70 postal zip codes
    assert distinct_zips == 70

    min_lat = db_session.scalar(select(func.min(Property.latitude)))
    max_lat = db_session.scalar(select(func.max(Property.latitude)))
    min_long = db_session.scalar(select(func.min(Property.longitude)))
    max_long = db_session.scalar(select(func.max(Property.longitude)))

    # Greater Seattle area bounds
    assert 47.1 <= min_lat <= 47.3
    assert 47.7 <= max_lat <= 47.8
    assert -122.6 <= min_long <= -122.4
    assert -121.4 <= max_long <= -121.2

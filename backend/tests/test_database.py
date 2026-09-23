"""Automated tests for Database Architecture, ORM Models, and Constraints."""

import pytest
from datetime import date
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select
from app.db.session import SessionLocal, engine
from app.models import Base, DatasetVersion, Property, ModelVersion, Prediction


@pytest.fixture(scope="module")
def db_session():
    """Provides a transactional database session for tests."""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


def test_database_connection(db_session):
    """Verifies that the database engine connects and executes basic query."""
    result = db_session.execute(select(1)).scalar()
    assert result == 1


def test_dataset_version_creation_and_query(db_session):
    """Tests creating and querying a dataset_version record."""
    d_ver = DatasetVersion(
        version="test-kc-v1.0",
        source="King County Dept of Assessments Test",
        row_count=100,
        description="Automated unit test dataset version",
    )
    db_session.add(d_ver)
    db_session.commit()

    retrieved = db_session.scalar(
        select(DatasetVersion).where(DatasetVersion.version == "test-kc-v1.0")
    )
    assert retrieved is not None
    assert retrieved.row_count == 100
    assert retrieved.id is not None
    assert len(retrieved.id) == 36

    # Clean up test record
    db_session.delete(retrieved)
    db_session.commit()


def test_property_creation_and_relationships(db_session):
    """Tests inserting a property linked to a dataset version."""
    d_ver = DatasetVersion(
        version="test-kc-props",
        source="King County Test",
        row_count=1,
    )
    db_session.add(d_ver)
    db_session.flush()

    prop = Property(
        external_id="TEST_PARCEL_9999",
        dataset_version_id=d_ver.id,
        price=650000.0,
        sale_date=date(2014, 10, 15),
        bedrooms=4,
        bathrooms=2.5,
        sqft_living=2400,
        sqft_lot=7200,
        floors=2.0,
        waterfront=0,
        view_score=1,
        condition_score=4,
        grade_score=8,
        sqft_above=2000,
        sqft_basement=400,
        yr_built=1995,
        yr_renovated=0,
        zipcode="98052",
        latitude=47.6740,
        longitude=-122.1215,
        sqft_living15=2300,
        sqft_lot15=7000,
    )
    db_session.add(prop)
    db_session.commit()

    # Query back
    saved_prop = db_session.scalar(
        select(Property).where(Property.external_id == "TEST_PARCEL_9999")
    )
    assert saved_prop is not None
    assert saved_prop.price == 650000.0
    assert saved_prop.dataset_version.version == "test-kc-props"

    # Clean up
    db_session.delete(saved_prop)
    db_session.delete(d_ver)
    db_session.commit()


def test_property_check_constraint_negative_price(db_session):
    """Verifies that inserting a negative price triggers an IntegrityError constraint violation."""
    d_ver = DatasetVersion(
        version="test-kc-constraint",
        source="King County Test",
        row_count=1,
    )
    db_session.add(d_ver)
    db_session.flush()

    invalid_prop = Property(
        external_id="TEST_INVALID_PRICE",
        dataset_version_id=d_ver.id,
        price=-50000.0,  # Violates chk_properties_price_positive
        bedrooms=3,
        bathrooms=2.0,
        sqft_living=1500,
        sqft_lot=5000,
        floors=1.0,
        waterfront=0,
        view_score=0,
        condition_score=3,
        grade_score=7,
        sqft_above=1500,
        sqft_basement=0,
        yr_built=1980,
        zipcode="98103",
        latitude=47.65,
        longitude=-122.34,
    )
    db_session.add(invalid_prop)

    with pytest.raises(IntegrityError):
        db_session.commit()

    db_session.rollback()
    # Clean up parent
    fresh_d_ver = db_session.scalar(
        select(DatasetVersion).where(DatasetVersion.version == "test-kc-constraint")
    )
    if fresh_d_ver:
        db_session.delete(fresh_d_ver)
        db_session.commit()


def test_model_version_and_prediction_traceability(db_session):
    """Verifies that predictions trace to model_versions and dataset_versions."""
    d_ver = DatasetVersion(
        version="test-kc-model-trace",
        source="King County Test",
        row_count=10,
    )
    db_session.add(d_ver)
    db_session.flush()

    m_ver = ModelVersion(
        version="test-v1.0.0-rf",
        algorithm="RandomForestRegressor",
        dataset_version_id=d_ver.id,
        mae=68000.0,
        rmse=115000.0,
        r2=0.875,
        hyperparameters={"n_estimators": 100, "max_depth": 16},
        feature_names=["sqft_living", "grade_score", "zipcode"],
        artifact_path="ml/models/test-v1.0.0-rf/model.joblib",
        is_active=True,
    )
    db_session.add(m_ver)
    db_session.flush()

    pred = Prediction(
        model_version_id=m_ver.id,
        input_features={"sqft_living": 2100, "grade_score": 8, "zipcode": "98052"},
        predicted_price=715000.0,
        explanation_factors=[{"feature": "sqft_living", "impact": "+$180,000"}],
        latency_ms=12.4,
    )
    db_session.add(pred)
    db_session.commit()

    # Query prediction and verify relationship traversal
    saved_pred = db_session.scalar(select(Prediction).where(Prediction.id == pred.id))
    assert saved_pred is not None
    assert saved_pred.predicted_price == 715000.0
    assert saved_pred.model_version.algorithm == "RandomForestRegressor"
    assert saved_pred.model_version.dataset_version.version == "test-kc-model-trace"

    # Cleanup
    db_session.delete(saved_pred)
    db_session.delete(m_ver)
    db_session.delete(d_ver)
    db_session.commit()

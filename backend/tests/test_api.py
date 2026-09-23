"""Automated integration tests for FastAPI REST API endpoints."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Tests discovery root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "platform" in data
    assert data["docs"] == "/docs"


def test_health_check_endpoint():
    """Tests /api/v1/health endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert data["active_model_version"] == "v1.0.0"


def test_list_properties_endpoint():
    """Tests /api/v1/properties with pagination and filtering."""
    response = client.get("/api/v1/properties?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] == 21613
    assert len(data["items"]) == 10
    assert data["page"] == 1
    assert data["total_pages"] == 2162

    first_item = data["items"][0]
    assert "price" in first_item
    assert "sqft_living" in first_item
    assert "zipcode" in first_item


def test_list_properties_with_filters():
    """Tests /api/v1/properties with price and bedroom filters."""
    response = client.get("/api/v1/properties?min_price=500000&max_price=600000&bedrooms=3&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 5
    for prop in data["items"]:
        assert 500000 <= prop["price"] <= 600000
        assert prop["bedrooms"] == 3


def test_get_property_detail():
    """Tests /api/v1/properties/{id} using an existing property ID."""
    list_res = client.get("/api/v1/properties?page=1&page_size=1")
    assert list_res.status_code == 200
    first_prop = list_res.json()["items"][0]
    prop_id = first_prop["id"]

    response = client.get(f"/api/v1/properties/{prop_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == prop_id
    assert data["price"] > 0
    assert "external_id" in data


def test_create_prediction():
    """Tests POST /api/v1/predictions with valid property input."""
    payload = {
        "bedrooms": 3,
        "bathrooms": 2.5,
        "sqft_living": 2200,
        "sqft_lot": 6500,
        "floors": 2.0,
        "waterfront": 0,
        "view_score": 0,
        "condition_score": 4,
        "grade_score": 8,
        "sqft_above": 1800,
        "sqft_basement": 400,
        "yr_built": 1995,
        "yr_renovated": 0,
        "zipcode": "98052",
        "latitude": 47.6740,
        "longitude": -122.1215
    }
    response = client.post("/api/v1/predictions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "prediction_id" in data
    assert data["predicted_price"] > 100000
    assert data["confidence_range"]["lower_bound"] < data["predicted_price"] < data["confidence_range"]["upper_bound"]
    assert data["model_version"] == "v1.0.0"
    assert len(data["feature_factors"]) > 0
    assert data["latency_ms"] >= 0


def test_prediction_history():
    """Tests GET /api/v1/predictions/history."""
    response = client.get("/api/v1/predictions/history?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total_count"] >= 1
    assert len(data["items"]) >= 1
    assert "predicted_price" in data["items"][0]


def test_analytics_endpoints():
    """Tests all /api/v1/analytics endpoints."""
    # 1. Market summary
    res_m = client.get("/api/v1/analytics/market-summary")
    assert res_m.status_code == 200
    d_m = res_m.json()
    assert d_m["total_sales"] == 21613
    assert d_m["median_price"] == 450000.0

    # 2. Price distribution
    res_d = client.get("/api/v1/analytics/price-distribution")
    assert res_d.status_code == 200
    d_d = res_d.json()
    assert len(d_d["bins"]) > 0

    # 3. Location breakdown
    res_l = client.get("/api/v1/analytics/location-breakdown")
    assert res_l.status_code == 200
    d_l = res_l.json()
    assert len(d_l["locations"]) == 70

    # 4. Feature correlations
    res_c = client.get("/api/v1/analytics/feature-correlations")
    assert res_c.status_code == 200
    d_c = res_c.json()
    assert len(d_c["correlations"]) > 0


def test_model_endpoints():
    """Tests /api/v1/models endpoints."""
    res_active = client.get("/api/v1/models/active")
    assert res_active.status_code == 200
    data = res_active.json()
    assert data["version"] == "v1.0.0"
    assert data["r2"] > 0.85
    assert data["is_active"] is True

    res_list = client.get("/api/v1/models")
    assert res_list.status_code == 200
    assert len(res_list.json()["models"]) >= 1

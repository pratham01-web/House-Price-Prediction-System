# 06. API Specification: RESTful Interface Contracts

## 1. Global API Standards

- **Base URL Prefix**: `/api/v1`
- **Content-Type**: `application/json`
- **Error Standard**: RFC 7807 Problem Details compliant format
- **Pagination Strategy**: Limit-Offset pagination (`limit` default 20, max 100; `offset` default 0)

---

## 2. Endpoint Groups

### 2.1 Health & System Status
- `GET /health`
  - **Description**: Verifies API operational status, DB connectivity, and ML pipeline readiness.
  - **Response 200**:
    ```json
    {
      "status": "healthy",
      "environment": "development",
      "database_connected": true,
      "active_model_version": "v1.0.0"
    }
    ```

### 2.2 Property Exploration
- `GET /properties`
  - **Query Params**:
    - `page` (int, default 1)
    - `page_size` (int, default 20, max 100)
    - `min_price`, `max_price` (float)
    - `bedrooms`, `bathrooms` (float)
    - `zipcode` (string)
    - `sort_by` (`price`, `sqft_living`, `yr_built`)
    - `sort_order` (`asc`, `desc`)
  - **Response 200**:
    ```json
    {
      "total_count": 21613,
      "page": 1,
      "page_size": 20,
      "total_pages": 1081,
      "items": [
        {
          "id": 1,
          "external_id": "7129300520",
          "price": 221900.0,
          "bedrooms": 3,
          "bathrooms": 1.0,
          "sqft_living": 1180,
          "sqft_lot": 5650,
          "floors": 1.0,
          "waterfront": 0,
          "view_score": 0,
          "condition_score": 3,
          "grade_score": 7,
          "yr_built": 1955,
          "zipcode": "98178",
          "latitude": 47.5112,
          "longitude": -122.257
        }
      ]
    }
    ```
- `GET /properties/{id}`
  - **Response 200**: Single property detail object with all 19 attributes.

### 2.3 ML Predictions & Audit Trail
- `POST /predictions`
  - **Request Body**:
    ```json
    {
      "bedrooms": 3,
      "bathrooms": 2.5,
      "sqft_living": 2150,
      "sqft_lot": 6500,
      "floors": 2.0,
      "waterfront": 0,
      "view_score": 0,
      "condition_score": 4,
      "grade_score": 8,
      "sqft_above": 1750,
      "sqft_basement": 400,
      "yr_built": 1998,
      "yr_renovated": 0,
      "zipcode": "98052",
      "latitude": 47.6740,
      "longitude": -122.1215
    }
    ```
  - **Response 201**:
    ```json
    {
      "prediction_id": "a90dfb14-8f0a-4293-80f4-5fca9e3381a1",
      "predicted_price": 724500.0,
      "model_version": "v1.0.0",
      "confidence_range": {
        "lower_bound": 685000.0,
        "upper_bound": 764000.0
      },
      "feature_factors": [
        {"feature": "sqft_living", "impact": "positive", "weight": 0.42},
        {"feature": "grade_score", "impact": "positive", "weight": 0.28},
        {"feature": "zipcode", "impact": "positive", "weight": 0.18}
      ],
      "latency_ms": 14.2,
      "created_at": "2026-09-23T12:05:00Z"
    }
    ```
- `GET /predictions/history`
  - **Description**: Paginated audit log of previously evaluated predictions fetched live from PostgreSQL.

### 2.4 Real Estate Market Analytics
- `GET /analytics/market-summary`
  - Returns overall dataset statistics: total sales, median price, average price/sqft, price quartiles, active model info.
- `GET /analytics/price-distribution`
  - Returns calculated histogram bins for actual closing sale prices.
- `GET /analytics/location-breakdown`
  - Returns top zip codes ranked by volume, average price, and price/sqft.
- `GET /analytics/feature-correlations`
  - Returns correlation coefficients of physical features against sale price.

### 2.5 Model Registry
- `GET /models`
  - List all registered models with version, algorithm, training timestamp, and verified test metrics (MAE, RMSE, R²).
- `GET /models/active`
  - Returns the currently designated production inference model metadata.

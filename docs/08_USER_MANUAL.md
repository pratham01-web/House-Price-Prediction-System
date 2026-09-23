# 08. User Manual & Operation Runbook

Welcome to the **House Price Intelligence & Prediction Platform** (`RealEstateIQ`). This guide walks you through using each component of the system.

---

## 1. Quick Access URLs
- **Web User Interface**: `http://localhost:3000`
- **FastAPI REST API**: `http://localhost:8000/api/v1`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`

---

## 2. Navigating the Platform

### 2.1 Overview Dashboard
- **Market Snapshot**: Shows verified metrics on all 21,613 King County properties (Median Price: $450,000; Average Price/Sqft: $264; Waterfront Multiplier: 3.11x; Renovation Impact: +$152,000).
- **Status Badges**: Shows active model tag (`v1.0.0`), holdout $R^2$ score (87.77%), and database connectivity status.
- **Quick Actions**: One-click shortcuts to the Valuation Studio and Property Explorer.

### 2.2 Property Explorer
- **Search & Filter**:
  - Filter by minimum and maximum transaction price.
  - Filter by bedroom count (1, 2, 3, 4, 5+).
  - Filter by King County ZIP code (70 distinct postal zones).
  - Filter for waterfront-only properties.
- **Sorting**: Sort ascending or descending by Price, Interior Living Space, Year Built, or Construction Grade.
- **Property Cards**: Click on any property card to open the **Specification Modal** detailing all 19 recorded physical attributes and comparison metrics with neighboring parcels.

### 2.3 Valuation Studio (Price Predictor)
- **Entering Property Data**:
  - **Living & Lot Area**: Use sliders to adjust square footage.
  - **Location**: Select from all 70 King County zip codes (e.g. Medina 98039, Bellevue 98004, Redmond 98052, Seattle Capitol Hill 98102, Auburn 98002).
  - **Bedrooms & Bathrooms**: Choose room count and stories.
  - **Construction Grade**: Select King County assessment grade (1 to 13, from Average Grade 7 to Luxury Mansion Grade 11-13).
  - **Condition & View**: Rate maintenance wear and panoramic view quality.
- **Valuation Output**:
  - Click **Calculate ML Fair Market Valuation**.
  - Review the estimated price, 1-sigma empirical confidence interval, and quantified feature contribution factors.
  - Every valuation is automatically logged into the PostgreSQL audit history.

### 2.4 Market Analytics
- **Price Distribution**: Interactive histogram showing real transaction volume buckets across price intervals.
- **Feature Correlations**: Horizontal bar rankings demonstrating which physical features have the highest statistical impact on sale price.
- **Geographic Extremes**: Side-by-side comparison of the top 8 luxury vs. accessible zip codes.

### 2.5 Prediction History
- **Relational Audit Trail**: Displays every prediction executed on the platform, timestamped, with the exact input feature payload, output valuation, and model version.

### 2.6 Model Performance
- **Empirical Metrics**: Review the verified out-of-sample $R^2$, MAE, and RMSE metrics.
- **Algorithm Benchmark**: Compare the performance of the winning HistGradientBoosting model against Gradient Boosting, Random Forest, and the Linear Regression baseline.

---

## 3. Maintenance & CLI Commands

```bash
# Run backend automated pytest suite
.venv\Scripts\pytest backend/tests/ -v

# Re-run ML model benchmarking experiments
.venv\Scripts\python ml/src/train_experiments.py

# Re-train production model and register in PostgreSQL
.venv\Scripts\python ml/src/train_production_model.py

# Launch frontend production server
cd frontend && npm run start
```

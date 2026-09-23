# 07. ML Model Card: KingCounty_HistGradientBoosting (v1.0.0)

## 1. Model Details
- **Model Name**: `KingCounty_HistGradientBoosting`
- **Version**: `v1.0.0`
- **Algorithm**: `HistGradientBoostingRegressor` (Scikit-learn 1.7.2)
- **Model Type**: Supervised Multivariate Histogram-Based Gradient Boosted Decision Trees
- **Date Registered**: September 23, 2026
- **License**: MIT
- **Contact**: Engineering Team

---

## 2. Intended Use
- **Primary Use**: Estimating fair market residential valuation for single-family homes and condominiums in King County, Washington (Seattle, Bellevue, Redmond, Kirkland, Renton, etc.).
- **Target Audience**: Real estate analysts, institutional investors, appraisers, prospective homebuyers and sellers.
- **Out-of-Scope Uses**: Commercial office buildings, agricultural land parcels, and real estate markets outside King County, Washington.

---

## 3. Training & Validation Data
- **Dataset**: King County Housing Sales (OpenML ID: `42092`)
- **Total Records**: 21,613 authentic recorded transactions (May 2014 – May 2015)
- **Data Split Methodology**:
  - 80% Training ($n = 17,290$)
  - 20% Holdout Test ($n = 4,323$)
  - Deterministic random seed: `42`
  - 5-Fold Cross-Validation on training split to measure generalization stability
- **Data Leakage Safeguards**: Imputers, scalers, and categorical encoders were fitted strictly on the 80% training split.

---

## 4. Empirical Performance Evaluation

| Metric | Holdout Test (20%) | 5-Fold Cross-Validation | Baseline Linear Model |
| :--- | :--- | :--- | :--- |
| **Coefficient of Determination ($R^2$)** | **0.8777** | $0.8846 \pm 0.011$ | 0.8109 |
| **Mean Absolute Error (MAE)** | **$69,115.12** | – | $98,099.22 (-$28,984) |
| **Root Mean Squared Error (RMSE)** | **$135,998.18** | – | $169,056.70 (-$33,058) |
| **Inference Latency (per record)** | **0.006 ms** | – | 0.001 ms |

---

## 5. Input Features & Preprocessing

- **Numeric Features (23)**: `bedrooms`, `bathrooms`, `sqft_living`, `sqft_lot`, `floors`, `waterfront`, `view_score`, `condition_score`, `grade_score`, `sqft_above`, `sqft_basement`, `yr_built`, `yr_renovated`, `latitude`, `longitude`, `sqft_living15`, `sqft_lot15`, plus engineered features (`effective_age`, `is_renovated`, `living_to_lot_ratio`, `bed_bath_ratio`, `total_sqft`, `basement_ratio`). Imputed with median.
- **Categorical Features (1)**: `zipcode` (70 postal codes). One-Hot Encoded with `handle_unknown="ignore"`.

---

## 6. Caveats & Ethical Considerations
- **Historical Temporal Frame**: Sales were recorded during 2014–2015. Predictions reflect price relationships of that period and should be indexed for broader regional macroeconomic inflation if used for contemporary spot appraisal.
- **Extreme Luxury Outliers**: For properties exceeding $3,500,000 (top 0.5% of market), custom architectural amenities not captured in standard county assessments (e.g. helipads, private boat slips) may introduce wider residual variance.

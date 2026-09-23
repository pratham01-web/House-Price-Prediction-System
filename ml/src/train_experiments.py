"""Machine Learning Experimentation and Model Benchmarking Pipeline.

Evaluates Baseline Linear Regression vs. Random Forest, Gradient Boosting,
and HistGradientBoosting on 80/20 train-test splits with 5-Fold cross-validation.
Evaluates out-of-sample MAE, RMSE, and R2 without data leakage.
"""

import os
import sys
import json
import time
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor,
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
CLEANED_DATA_PATH = os.path.join(
    PROJECT_ROOT, "data", "processed", "kc_house_data_cleaned.csv"
)
EXPERIMENTS_DIR = os.path.join(PROJECT_ROOT, "ml", "artifacts", "experiments")


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes deterministic engineered features from domain knowledge."""
    data = df.copy()
    sale_year = 2015

    # 1. Effective age (accounting for renovation)
    max_year = np.maximum(data["yr_built"], data["yr_renovated"])
    data["effective_age"] = sale_year - max_year
    data["is_renovated"] = (data["yr_renovated"] > 0).astype(int)

    # 2. Area and spatial ratios
    data["living_to_lot_ratio"] = data["sqft_living"] / np.maximum(data["sqft_lot"], 1.0)
    data["bed_bath_ratio"] = data["bedrooms"] / np.maximum(data["bathrooms"], 0.5)
    data["total_sqft"] = data["sqft_living"] + data["sqft_basement"]
    data["basement_ratio"] = data["sqft_basement"] / np.maximum(data["sqft_living"], 1.0)

    return data


def run_experiments():
    """Runs rigorous model comparisons and serializes metrics and charts."""
    os.makedirs(EXPERIMENTS_DIR, exist_ok=True)
    print(f"Loading cleaned dataset from {CLEANED_DATA_PATH}...")
    df = pd.read_csv(CLEANED_DATA_PATH)

    df_eng = engineer_features(df)

    # Feature definitions
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

    # Strict 80/20 train/test split BEFORE any transformation
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Training split: {X_train.shape[0]} rows | Holdout test split: {X_test.shape[0]} rows")

    # Define Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler()),
                ]),
                num_features,
            ),
            (
                "cat",
                Pipeline([
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                ]),
                cat_features,
            ),
        ]
    )

    # Preprocessor for HistGradientBoosting (can use ordinal/native handling)
    preprocessor_hgb = ColumnTransformer(
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

    # Define Candidate Models
    models = {
        "Linear Regression (Baseline)": {
            "pipeline": Pipeline([
                ("preprocessor", preprocessor),
                ("regressor", LinearRegression()),
            ]),
            "algo_name": "LinearRegression",
            "type": "linear",
        },
        "Ridge Regression (L2)": {
            "pipeline": Pipeline([
                ("preprocessor", preprocessor),
                ("regressor", Ridge(alpha=10.0)),
            ]),
            "algo_name": "Ridge",
            "type": "linear",
        },
        "Random Forest Regressor": {
            "pipeline": Pipeline([
                ("preprocessor", preprocessor),
                ("regressor", RandomForestRegressor(
                    n_estimators=100,
                    max_depth=16,
                    min_samples_split=4,
                    random_state=42,
                    n_jobs=-1,
                )),
            ]),
            "algo_name": "RandomForestRegressor",
            "type": "ensemble",
        },
        "Gradient Boosting Regressor": {
            "pipeline": Pipeline([
                ("preprocessor", preprocessor),
                ("regressor", GradientBoostingRegressor(
                    n_estimators=150,
                    learning_rate=0.08,
                    max_depth=5,
                    random_state=42,
                )),
            ]),
            "algo_name": "GradientBoostingRegressor",
            "type": "ensemble",
        },
        "HistGradientBoosting Regressor": {
            "pipeline": Pipeline([
                ("preprocessor", preprocessor_hgb),
                ("regressor", HistGradientBoostingRegressor(
                    max_iter=150,
                    learning_rate=0.08,
                    max_leaf_nodes=45,
                    min_samples_leaf=20,
                    random_state=42,
                )),
            ]),
            "algo_name": "HistGradientBoostingRegressor",
            "type": "ensemble",
        },
    }

    results = []
    trained_pipelines = {}
    cv = KFold(n_splits=5, shuffle=True, random_state=42)

    print("\n--- Benchmarking ML Models with 5-Fold CV and Test Set Evaluation ---")
    for name, config in models.items():
        pipe = config["pipeline"]
        print(f"\nEvaluating {name}...")

        # 1. 5-Fold Cross Validation on Training Split (R2)
        cv_scores = cross_val_score(
            pipe, X_train, y_train, cv=cv, scoring="r2", n_jobs=-1
        )
        cv_r2_mean = float(np.mean(cv_scores))
        cv_r2_std = float(np.std(cv_scores))
        print(f"  5-Fold CV R²: {cv_r2_mean:.4f} (±{cv_r2_std:.4f})")

        # 2. Train on full 80% training set
        t0 = time.time()
        pipe.fit(X_train, y_train)
        train_time = time.time() - t0

        # 3. Predict on 20% holdout test set
        t_infer_start = time.time()
        y_pred = pipe.predict(X_test)
        inference_latency_ms = ((time.time() - t_infer_start) / len(X_test)) * 1000

        test_mae = float(mean_absolute_error(y_test, y_pred))
        test_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        test_r2 = float(r2_score(y_test, y_pred))

        print(f"  Holdout Test R²:   {test_r2:.4f}")
        print(f"  Holdout Test MAE:  ${test_mae:,.2f}")
        print(f"  Holdout Test RMSE: ${test_rmse:,.2f}")
        print(f"  Training Time:     {train_time:.2f}s | Latency/sample: {inference_latency_ms:.3f}ms")

        record = {
            "model_name": name,
            "algorithm": config["algo_name"],
            "type": config["type"],
            "cv_r2_mean": round(cv_r2_mean, 4),
            "cv_r2_std": round(cv_r2_std, 4),
            "test_r2": round(test_r2, 4),
            "test_mae": round(test_mae, 2),
            "test_rmse": round(test_rmse, 2),
            "train_time_sec": round(train_time, 2),
            "inference_latency_ms": round(inference_latency_ms, 3),
        }
        results.append(record)
        trained_pipelines[name] = {
            "pipeline": pipe,
            "predictions": y_pred,
            "record": record,
        }

    # Sort results by out-of-sample R2 descending
    results.sort(key=lambda x: x["test_r2"], reverse=True)
    best_model = results[0]
    print(f"\nWinning Model: {best_model['model_name']} with Test R² = {best_model['test_r2']:.4f}, MAE = ${best_model['test_mae']:,.2f}")

    # Save benchmark JSON
    benchmark_file = os.path.join(EXPERIMENTS_DIR, "benchmark_results.json")
    with open(benchmark_file, "w", encoding="utf-8") as f:
        json.dump(
            {
                "dataset_version": "kc-housing-2015-v1",
                "train_records": len(X_train),
                "test_records": len(X_test),
                "features_used": num_features + cat_features,
                "benchmarks": results,
                "winner": best_model,
            },
            f,
            indent=2,
        )
    print(f"Benchmark results saved to {benchmark_file}")

    # Generate Model Comparison Visualization Chart
    plot_model_comparison(results, y_test, trained_pipelines)
    return results, trained_pipelines


def plot_model_comparison(results: list, y_test: pd.Series, trained_pipelines: dict):
    """Generates a comparison bar chart and residual plot."""
    sns.set_theme(style="whitegrid")
    fig, axes = plt.subplots(1, 2, figsize=(16, 6))

    # 1. R² vs MAE comparison bar plot
    df_res = pd.DataFrame(results)
    x = np.arange(len(df_res))
    width = 0.35

    ax1 = axes[0]
    bars = ax1.bar(
        x, df_res["test_r2"], width, label="Holdout Test R²", color="#4f46e5"
    )
    ax1.set_ylabel("R² Score (Higher is better)", color="#4f46e5", fontsize=11)
    ax1.set_ylim(0.65, 0.95)
    ax1.set_xticks(x)
    ax1.set_xticklabels(
        [m.replace(" Regressor", "").replace(" (Baseline)", "") for m in df_res["model_name"]],
        rotation=20,
        ha="right",
    )
    ax1.set_title("Candidate Model R² Benchmark (Holdout Test)", fontsize=13)

    for bar in bars:
        height = bar.get_height()
        ax1.annotate(
            f"{height:.3f}",
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 3),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontweight="bold",
        )

    # 2. Actual vs Predicted for Top Model
    top_name = results[0]["model_name"]
    top_pred = trained_pipelines[top_name]["predictions"]

    ax2 = axes[1]
    ax2.scatter(
        y_test / 1000,
        top_pred / 1000,
        alpha=0.35,
        color="#0891b2",
        edgecolors="none",
        s=20,
    )
    # Perfect prediction identity line
    max_val = max(y_test.max(), top_pred.max()) / 1000
    ax2.plot([0, max_val], [0, max_val], "r--", linewidth=1.5, label="Perfect Valuation (Actual = Predicted)")
    ax2.set_xlim(0, 3500)
    ax2.set_ylim(0, 3500)
    ax2.set_xlabel("Actual Price ($ Thousands)", fontsize=11)
    ax2.set_ylabel("Predicted Price ($ Thousands)", fontsize=11)
    ax2.set_title(f"Actual vs. Predicted: {top_name} (R² = {results[0]['test_r2']})", fontsize=13)
    ax2.legend()

    plt.savefig(os.path.join(EXPERIMENTS_DIR, "model_comparison.png"), dpi=200)
    plt.close()
    print("Saved model_comparison.png")


if __name__ == "__main__":
    run_experiments()

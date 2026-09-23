"""Exploratory Data Analysis (EDA) Module for King County Housing Dataset.

Computes comprehensive statistical distributions, correlation matrices,
spatial pricing variations, and exports analytical artifacts and visualizations.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive headless backend
import matplotlib.pyplot as plt
import seaborn as sns

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
CLEANED_DATA_PATH = os.path.join(
    PROJECT_ROOT, "data", "processed", "kc_house_data_cleaned.csv"
)
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "ml", "artifacts", "eda")


def run_eda():
    """Executes exhaustive EDA and persists analytical figures and summary metrics."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Loading cleaned dataset from {CLEANED_DATA_PATH}...")
    df = pd.read_csv(CLEANED_DATA_PATH)
    n_rows, n_cols = df.shape
    print(f"Dataset shape: {n_rows} rows x {n_cols} columns")

    # Set publication aesthetic style
    sns.set_theme(style="whitegrid", palette="muted")
    plt.rcParams.update({"font.size": 11, "figure.autolayout": True})

    # 1. Price Distribution & Skewness
    price_mean = float(df["price"].mean())
    price_median = float(df["price"].median())
    price_std = float(df["price"].std())
    price_iqr = float(df["price"].quantile(0.75) - df["price"].quantile(0.25))
    price_skew = float(df["price"].skew())

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    sns.histplot(df["price"] / 1000, kde=True, ax=axes[0], color="#4f46e5", bins=50)
    axes[0].set_title(f"Price Distribution (Skew: {price_skew:.2f})")
    axes[0].set_xlabel("Price ($ Thousands)")
    axes[0].set_ylabel("Sales Count")
    axes[0].axvline(price_median / 1000, color="crimson", linestyle="--", label=f"Median: ${price_median:,.0f}")
    axes[0].legend()

    sns.histplot(np.log1p(df["price"]), kde=True, ax=axes[1], color="#059669", bins=50)
    axes[1].set_title("Log-Transformed Price Distribution (Normal Bell)")
    axes[1].set_xlabel("log(1 + Price)")
    axes[1].set_ylabel("Sales Count")
    plt.savefig(os.path.join(OUTPUT_DIR, "price_distribution.png"), dpi=200)
    plt.close()
    print("Saved price_distribution.png")

    # 2. Correlation Analysis
    numeric_cols = [
        "price", "bedrooms", "bathrooms", "sqft_living", "sqft_lot", "floors",
        "waterfront", "view_score", "condition_score", "grade_score", "sqft_above",
        "sqft_basement", "yr_built", "yr_renovated", "latitude", "longitude",
        "sqft_living15", "sqft_lot15"
    ]
    corr_matrix = df[numeric_cols].corr()
    price_correlations = corr_matrix["price"].sort_values(ascending=False).to_dict()

    plt.figure(figsize=(12, 10))
    sns.heatmap(
        corr_matrix,
        cmap="coolwarm",
        annot=True,
        fmt=".2f",
        linewidths=0.5,
        cbar_kws={"label": "Pearson Correlation"},
    )
    plt.title("King County Feature Correlation Matrix", fontsize=14, pad=15)
    plt.savefig(os.path.join(OUTPUT_DIR, "correlation_heatmap.png"), dpi=200)
    plt.close()
    print("Saved correlation_heatmap.png")

    # 3. Living Area vs Price with Grade Hue
    plt.figure(figsize=(10, 6))
    sample_df = df.sample(min(5000, len(df)), random_state=42)
    sns.scatterplot(
        data=sample_df,
        x="sqft_living",
        y="price",
        hue="grade_score",
        palette="viridis",
        alpha=0.6,
        edgecolor=None,
    )
    plt.title("Living Square Footage vs. Price (Colored by Building Grade)", fontsize=13)
    plt.xlabel("Interior Living Area (sqft)")
    plt.ylabel("Sale Price ($ USD)")
    plt.savefig(os.path.join(OUTPUT_DIR, "price_vs_sqft.png"), dpi=200)
    plt.close()
    print("Saved price_vs_sqft.png")

    # 4. Building Grade vs Price Boxplot
    plt.figure(figsize=(11, 6))
    sns.boxplot(
        data=df,
        x="grade_score",
        y="price",
        palette="Spectral",
        showfliers=False,
    )
    plt.title("Price Distribution by King County Construction Grade (1-13)", fontsize=13)
    plt.xlabel("Construction Grade")
    plt.ylabel("Price ($ USD - Non-outlier range)")
    plt.savefig(os.path.join(OUTPUT_DIR, "grade_vs_price.png"), dpi=200)
    plt.close()
    print("Saved grade_vs_price.png")

    # 5. Geographic Spatial Pricing Analysis (by Zip Code)
    df["price_per_sqft"] = df["price"] / df["sqft_living"]
    zip_stats = (
        df.groupby("zipcode")
        .agg(
            count=("price", "count"),
            avg_price=("price", "mean"),
            median_price=("price", "median"),
            avg_price_per_sqft=("price_per_sqft", "mean"),
            lat=("latitude", "mean"),
            long=("longitude", "mean"),
        )
        .reset_index()
    )

    top_expensive_zips = (
        zip_stats.sort_values(by="median_price", ascending=False)
        .head(10)[["zipcode", "median_price", "avg_price_per_sqft", "count"]]
        .to_dict(orient="records")
    )

    top_affordable_zips = (
        zip_stats.sort_values(by="median_price", ascending=True)
        .head(10)[["zipcode", "median_price", "avg_price_per_sqft", "count"]]
        .to_dict(orient="records")
    )

    # 6. Structured Statistical Summary Artifact
    summary_data = {
        "dataset_name": "King County House Sales",
        "total_records": n_rows,
        "features_analyzed": len(numeric_cols),
        "target_metrics": {
            "mean": round(price_mean, 2),
            "median": round(price_median, 2),
            "std": round(price_std, 2),
            "iqr": round(price_iqr, 2),
            "skewness": round(price_skew, 2),
            "min": float(df["price"].min()),
            "max": float(df["price"].max()),
        },
        "top_feature_correlations": {
            k: round(v, 4) for k, v in price_correlations.items() if k != "price"
        },
        "top_10_expensive_zipcodes": top_expensive_zips,
        "top_10_affordable_zipcodes": top_affordable_zips,
        "renovation_impact": {
            "unrenovated_median": float(df[df["yr_renovated"] == 0]["price"].median()),
            "renovated_median": float(df[df["yr_renovated"] > 0]["price"].median()),
            "price_delta": float(
                df[df["yr_renovated"] > 0]["price"].median()
                - df[df["yr_renovated"] == 0]["price"].median()
            ),
        },
        "waterfront_premium": {
            "no_waterfront_median": float(df[df["waterfront"] == 0]["price"].median()),
            "waterfront_median": float(df[df["waterfront"] == 1]["price"].median()),
            "ratio": round(
                float(df[df["waterfront"] == 1]["price"].median())
                / float(df[df["waterfront"] == 0]["price"].median()),
                2,
            ),
        },
    }

    summary_path = os.path.join(OUTPUT_DIR, "eda_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary_data, f, indent=2)
    print(f"Saved comprehensive EDA metrics to {summary_path}")

    # Generate a Jupyter notebook for EDA reproducibility
    create_eda_notebook(df, numeric_cols)
    return summary_data


def create_eda_notebook(df: pd.DataFrame, numeric_cols: list):
    """Generates a clean, reproducible Jupyter notebook in ml/notebooks/01_exploratory_data_analysis.ipynb."""
    nb_dir = os.path.join(PROJECT_ROOT, "ml", "notebooks")
    os.makedirs(nb_dir, exist_ok=True)
    nb_path = os.path.join(nb_dir, "01_exploratory_data_analysis.ipynb")

    cells = [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# King County Housing Sales: Exploratory Data Analysis\n",
                "This notebook provides reproducible statistical profiling, feature correlation analysis, ",
                "and geographic market distributions on the 21,613 authentic King County sales."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 1,
            "metadata": {},
            "outputs": [],
            "source": [
                "import pandas as pd\n",
                "import numpy as np\n",
                "import matplotlib.pyplot as plt\n",
                "import seaborn as sns\n",
                "\n",
                "df = pd.read_csv('../../data/processed/kc_house_data_cleaned.csv')\n",
                "print(f'Observations: {df.shape[0]}, Features: {df.shape[1]}')\n",
                "df.head()"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 2,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Statistical Summary of Price Target\n",
                "df['price'].describe().to_frame()"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": 3,
            "metadata": {},
            "outputs": [],
            "source": [
                "# Top correlations with sale price\n",
                "numeric_cols = " + str(numeric_cols) + "\n",
                "corr = df[numeric_cols].corr()['price'].sort_values(ascending=False)\n",
                "corr.to_frame(name='Pearson Correlation with Price')"
            ]
        }
    ]

    notebook = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.10.10"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }

    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(notebook, f, indent=2)
    print(f"Generated reproducible notebook at {nb_path}")


if __name__ == "__main__":
    run_eda()

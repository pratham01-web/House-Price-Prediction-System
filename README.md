# House Price Intelligence & Prediction Platform

A production-grade, full-stack Machine Learning and Real Estate Analytics platform built on real-world housing transaction records from King County, Washington (Seattle metropolitan area).

---

## 1. Architectural Highlights

- **Real Data Foundation**: Built exclusively on 21,613 authentic, verified residential property transactions sourced from King County Department of Assessments and OpenML (`house_sales`).
- **Normalized Relational Model**: PostgreSQL database housing raw property records, model versions, dataset provenance, and historical inference transactions.
- **Enterprise 4-Tier Backend**: FastAPI service implementing Router &rarr; Schema Validation &rarr; Service Layer &rarr; Repository Layer &rarr; Database.
- **Reproducible ML Pipeline**: Rigorous EDA, data hygiene, feature engineering, cross-validation, baseline comparison (Linear Regression vs. Random Forest, Gradient Boosting, HistGradientBoosting), R²/MAE/RMSE evaluation, and persistent model serialization.
- **Executive Frontend**: Next.js 15+ App Router, Tailwind CSS, Framer Motion, and Recharts delivering real market analytics, property exploration, live valuation predictions, and model performance inspection.

---

## 2. Technology Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn
- **Database**: PostgreSQL 16+ (Docker or native Windows service)
- **Machine Learning**: Scikit-learn, Pandas, NumPy, Joblib, Matplotlib, Seaborn
- **Frontend**: Next.js 15+, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React
- **DevOps**: Docker, Docker Compose, Git, Pytest

---

## 3. Directory Layout

```text
.
├── AGENTS.md                  # Project governance, execution rules, and anti-vibe constraints
├── README.md                  # Project overview and runbook
├── docker-compose.yml         # Containerized services (DB, backend, frontend)
├── .env.example               # Environment variables template
├── docs/                      # Technical specifications and architecture guides
│   ├── 01_PROJECT_CHARTER.md
│   ├── 02_ARCHITECTURE.md
│   ├── 03_DATABASE.md
│   ├── 04_DATASET.md
│   ├── 05_ML_SPEC.md
│   └── 06_API.md
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── api/               # API endpoints (routers)
│   │   ├── core/              # Configuration and logging
│   │   ├── db/                # Session management and engine
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── repositories/      # Data access layer
│   │   ├── schemas/           # Pydantic validation schemas
│   │   └── services/          # Business logic and ML inference service
│   ├── tests/                 # Backend automated tests
│   └── requirements.txt       # Backend Python dependencies
├── ml/                        # Machine learning development
│   ├── src/                   # Pipeline scripts (ingestion, training, eval)
│   ├── notebooks/             # Exploratory Data Analysis notebooks
│   └── models/                # Model registry and metadata
├── data/                      # Dataset repository
│   ├── raw/                   # Immutable raw transaction datasets
│   └── processed/             # Cleaned and transformed datasets
└── frontend/                  # Next.js 15+ application
    ├── src/
    │   ├── app/               # Next.js App Router pages
    │   ├── components/        # Reusable UI components
    │   ├── hooks/             # Custom React hooks
    │   ├── lib/               # Utilities and API client
    │   └── types/             # TypeScript definitions
    └── package.json           # Frontend dependencies
```

---

## 4. Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL 16+ (or Docker Desktop)
- Git

### Initial Setup
```bash
# 1. Clone repository and navigate
cd "c:\ML projects\House Price Prediction System"

# 2. Copy environment configuration
cp .env.example .env

# 3. Setup Python virtual environment
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt

# 4. Setup Frontend dependencies
cd frontend
npm install
cd ..
```

---

## 5. Development Phases Roadmap (100% Completed)

Execution is structured across 14 progressive phases under the `AGENTS.md` protocol:
1. **PHASE 01: Project Foundation** `[COMPLETE]` — Directory structure, environment configurations, git protocol, documentation framework.
2. **PHASE 02: Database Architecture** `[COMPLETE]` — Normalized PostgreSQL schema (`properties`, `predictions`, `model_versions`, `dataset_versions`), 9 check constraints, 18 performance indexes.
3. **PHASE 03: Real Dataset & Ingestion** `[COMPLETE]` — Ingested 21,613 authentic King County records into PostgreSQL, deterministic typo remediation.
4. **PHASE 04: Exploratory Data Analysis (EDA)** `[COMPLETE]` — Statistical profiling, distributions, correlation matrices, Jupyter notebook (`ml/notebooks/01_exploratory_data_analysis.ipynb`).
5. **PHASE 05: ML Experiments & Evaluation** `[COMPLETE]` — 5-Fold cross-validation benchmark across 5 models; HistGradientBoosting outperformed baseline Linear Regression ($R^2$: 0.8777 vs 0.8109, MAE: $69,115 vs $98,099).
6. **PHASE 06: Model Registry & Pipeline** `[COMPLETE]` — Scikit-learn Pipeline serialization (`ml/models/v1.0.0/model.joblib`), full metadata JSON.
7. **PHASE 07: FastAPI Backend** `[COMPLETE]` — REST endpoints (`/health`, `/properties`, `/predictions`, `/analytics/*`, `/models/*`), RFC-compliant error handlers.
8. **PHASE 08: Premium Frontend** `[COMPLETE]` — Institutional SaaS UI with Next.js 14, Tailwind CSS, ambient Beams volumetric effect, and responsive application shell.
9. **PHASE 09: System Integration** `[COMPLETE]` — End-to-end data flow verified from PostgreSQL to Next.js UI with zero mock data.
10. **PHASE 10: Automated Testing Suite** `[COMPLETE]` — 19/19 Pytest tests passing covering ML, DB constraints, and API contracts.
11. **PHASE 11: Security & Performance** `[COMPLETE]` — CORS configuration, OWASP security headers, input validation with Pydantic v2.
12. **PHASE 12: Docker & Containerization** `[COMPLETE]` — Multi-stage Dockerfiles and `docker-compose.yml` with health checks.
13. **PHASE 13: Technical Documentation** `[COMPLETE]` — Architecture specs, Model Card, User Manual, interactive Methodology view.
14. **PHASE 14: Final Engineering Audit** `[COMPLETE]` — Full clean-code verification, zero console errors, zero synthetic data policy verified.

---

## 6. Model Benchmark Comparison

Evaluated on 80/20 train/test split with 5-Fold Cross Validation on 21,613 authentic King County sales:

| Model | CV $R^2$ | Holdout $R^2$ | Test MAE | Test RMSE | Latency | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **HistGradientBoosting** | **0.8846** | **0.8777** | **$69,115.12** | **$135,998.18** | **0.006 ms** | **Active Production** |
| Gradient Boosting | 0.8877 | 0.8635 | $71,057.80 | $143,629.54 | 0.004 ms | Evaluated |
| Random Forest | 0.8668 | 0.8388 | $73,837.05 | $156,114.63 | 0.011 ms | Evaluated |
| Linear Regression (Baseline) | 0.8162 | 0.8109 | $98,099.22 | $169,056.70 | 0.001 ms | Evaluated |
| Ridge Regression (L2) | 0.8142 | 0.8078 | $98,568.42 | $170,455.51 | 0.002 ms | Evaluated |

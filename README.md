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

## 5. Development Phases

Execution is structured across 14 progressive phases under the `AGENTS.md` protocol:
1. **Project Foundation** *(Completed)*
2. **Database Architecture**
3. **Real Dataset & Ingestion**
4. **Exploratory Data Analysis**
5. **ML Experiments & Evaluation**
6. **Model Registry & Inference**
7. **FastAPI Backend Services**
8. **Premium Frontend Application**
9. **System Integration**
10. **Automated Testing Suite**
11. **Security & Performance Audits**
12. **Docker & Containerization**
13. **Documentation & Presentation**
14. **Final Engineering Audit**

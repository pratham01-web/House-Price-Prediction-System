# AGENTS.md — Engineering Handbook & Operating Protocol

## 1. Project Mission
The **House Price Intelligence & Prediction Platform** is a production-grade, enterprise-ready real estate analytics and machine learning system. It is built strictly on **real-world recorded housing transaction data** (King County Real Estate Sales: 21,613 verified residential sales from the Department of Assessments / OpenML), backed by PostgreSQL, FastAPI, Scikit-learn, and Next.js.

---

## 2. Non-Negotiable Core Principles

### Real Data Only (Zero Synthetic Data in Production)
- **Never fabricate or synthesize data** for the production platform, database, or UI.
- No fake properties, no mock prices, no simulated metrics, no hardcoded dashboard counters.
- Every production UI element must originate from:
  ```text
  Real Public Dataset (King County)
        ↓
  Validated Data Pipeline
        ↓
  PostgreSQL Database
        ↓
  FastAPI Backend API
        ↓
  Next.js Frontend
  ```
- If test mocks are used strictly in unit tests, they must be isolated in `backend/tests/` and never leak into production seeds or runtime paths.

### Anti-Vibe-Coding Rule
- Every line of code, dependency, architectural layer, database index, and UI element must serve an explicit, justifiable technical purpose.
- No superfluous dependencies.
- No ungrounded statistical claims (no "99.9% accuracy" claims for regression; metrics must be honestly reported as MAE, RMSE, and R²).
- No unnecessary animations that impede responsiveness or usability.

### Strict Architectural Layering
- **API Layer (`backend/app/api/`)**: Route handlers validate incoming requests and serialize outgoing responses. No direct SQL queries, no business logic, no ML inference code inside route handlers.
- **Service Layer (`backend/app/services/`)**: Orchestrates business logic, analytics calculations, and coordinates inference with repository persistence.
- **ML Inference Service (`backend/app/services/prediction_service.py`)**: Loads versioned pipelines, executes deterministic preprocessing and inference, and returns explained outputs.
- **Repository Layer (`backend/app/repositories/`)**: Encapsulates all SQLAlchemy queries and database interactions.
- **Database Layer (`backend/app/models/`, `backend/app/db/`)**: Normalized PostgreSQL schema with foreign keys, indexes, check constraints, and migration tracking.

---

## 3. Antigravity Phase Execution Protocol

Execution across the 14 project phases must strictly adhere to the following 8-step protocol:
1. **Read `AGENTS.md`** before every phase.
2. **Read ONLY the current phase specification**.
3. **Read only directly relevant documentation**.
4. **Inspect only relevant source files**.
5. **Implement the current phase** with production-grade engineering.
6. **Run validation** (automated tests, linter, typecheck, or runtime verification).
7. **Report what changed** concisely.
8. **STOP**. Never automatically jump to the next phase without explicit user confirmation.

---

## 4. Phase Roadmap Reference

- **PHASE 01: Project Foundation** *(Current)*: Project layout, environment configuration, dependency definitions, git setup, docs structure.
- **PHASE 02: Database Architecture**: Normalized PostgreSQL schema (`properties`, `predictions`, `model_versions`, `dataset_versions`), migrations, connection pooling.
- **PHASE 03: Real Dataset & Ingestion**: Automated acquisition of King County sales data, validation, cleaning, and batch ingestion into PostgreSQL.
- **PHASE 04: Exploratory Data Analysis (EDA)**: Statistical profiling, feature correlation analysis, price distribution, geographic clustering, and export of EDA artifacts.
- **PHASE 05: ML Experiments**: Baseline Linear Regression vs. Random Forest, Gradient Boosting, and HistGradientBoosting; cross-validation, feature engineering, R²/MAE/RMSE evaluation.
- **PHASE 06: Model Registry & Inference Pipeline**: Model packaging, metadata serialization, pipeline persistence, and standalone inference verification.
- **PHASE 07: FastAPI Backend**: REST API implementation (`/health`, `/properties`, `/predictions`, `/analytics/*`, `/models/*`), Pydantic schemas, dependency injection.
- **PHASE 08: Premium Frontend**: Next.js 15+ App Router, Tailwind CSS, Framer Motion, Recharts; Overview, Property Explorer, Predictor, Analytics, Prediction History, Model Performance screens.
- **PHASE 09: System Integration**: Connecting frontend to backend, end-to-end data flow validation, error state and loading state verification.
- **PHASE 10: Automated Testing Suite**: Pytest test suite covering ML preprocessing, inference, backend API routes, database constraints, and repository logic.
- **PHASE 11: Security & Performance**: CORS lockdown, input sanitization, rate limiting, query optimization, database indexing verification.
- **PHASE 12: Docker & Containerization**: Multi-container Docker Compose configuration with PostgreSQL, Backend, and Frontend healthchecks.
- **PHASE 13: Documentation & Presentation**: Exhaustive technical documentation, API specifications, ML model card, user manual.
- **PHASE 14: Final Engineering Audit**: End-to-end verification, reproducibility checks, clean code audit.

---

## 5. Technology Stack Specifications

| Layer | Technologies | Standards |
| :--- | :--- | :--- |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn | 4-tier clean architecture, async routes, dependency injection |
| **Database** | PostgreSQL 16+, psycopg2 / asyncpg | Normalized 3NF, indexed query paths, UUID / integer primary keys |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, Joblib | Strict train/test split before fitting, pipeline encapsulation, versioned metadata |
| **Frontend** | Next.js 15+ (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React | Curated color palette, restrained glassmorphism, responsive, accessible contrast |
| **DevOps** | Git, Docker, Docker Compose, Pytest | Reproducible environments, structured logging, environment-driven settings |

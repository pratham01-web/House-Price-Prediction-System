# 01. Project Charter: House Price Intelligence & Prediction Platform

## 1. Problem Statement
Valuing residential real estate is traditionally hindered by opaque pricing models, fragmented listings, and inaccurate estimations based on informal heuristics. Modern real estate analysts, investors, and prospective homebuyers need an intelligent, transparent platform that combines **empirical market transaction records** with **probabilistic machine learning models**.

The platform provides:
1. Deep statistical visibility into actual historical property sales.
2. Verified machine learning predictions with clear feature importance factors.
3. Full transparency into model architecture, training performance metrics (R², MAE, RMSE), and data provenance.
4. An auditable history of real-time predictions persisted in an enterprise relational store.

---

## 2. Core Stakeholders & Personas

- **Real Estate Analyst**: Needs aggregated spatial market analytics, price-per-square-foot breakdowns, correlation matrices, and distribution metrics across zip codes.
- **Homebuyer / Seller**: Wants an intuitive, interactive pricing calculator that estimates the fair market valuation of a home based on physical characteristics (living area, bedrooms, bathrooms, construction quality grade, condition, renovations).
- **ML Engineer / Auditor**: Demands full reproducibility, zero synthetic data, complete model versioning, training timestamps, validation splits, and honest residual analysis.

---

## 3. Scope & Non-Negotiables

| In-Scope | Explicitly Out-of-Scope |
| :--- | :--- |
| Ingestion of 21,613 authentic King County property transactions | Fabricated or synthetic datasets in production |
| 4-Tier FastAPI backend with PostgreSQL persistence | Hardcoded or mock analytics values |
| Multi-model ML benchmarking (Linear vs Tree Ensembles) | Unsubstantiated "accuracy %" claims for regression |
| Real-time inference with persistent prediction audit log | Direct SQL or ML inference calls inside API routes |
| Responsive Next.js 15+ frontend with Framer Motion & Recharts | Gratuitous, distracting UI animations |

---

## 4. Key Performance Indicators (KPIs)
- **Data Integrity**: 100% of property records in PostgreSQL verified against authentic public sales data.
- **Model Quality**: Achieving $R^2 \ge 0.75$ and realistic MAE on out-of-sample test splits using tree ensembles.
- **Inference Latency**: Sub-50ms model prediction response time on the backend API.
- **Traceability**: 100% of API predictions linked to foreign-keyed model version metadata in PostgreSQL.

# Production Dockerfile for FastAPI ML Backend
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for PostgreSQL client and C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy source code and models
COPY backend /app/backend
COPY ml /app/ml
COPY data/processed /app/data/processed

ENV PYTHONPATH=/app/backend:/app
ENV MODEL_REGISTRY_DIR=/app/ml/models
ENV ENVIRONMENT=production

EXPOSE 8000

WORKDIR /app/backend

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

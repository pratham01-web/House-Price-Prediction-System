# Production Deployment Guide: House Price Intelligence & Prediction Platform

This guide outlines how to deploy the **House Price Intelligence & Prediction Platform** (`RealEstateIQ`) into production across multiple hosting strategies.

---

## 1. System Components & Environment Variables

The platform consists of three core components:
1. **Relational Database**: PostgreSQL 16+ (Normalized 3NF schema, 21,613 records).
2. **Machine Learning & API Gateway**: FastAPI backend with Scikit-learn inference pipeline.
3. **Executive Frontend**: Next.js 14 App Router with React Three Fiber, React Bits Beams, and Tailwind CSS.

### Required Environment Variables

#### Backend (`backend/.env` or Container Environment)
```env
ENVIRONMENT=production
PROJECT_NAME="House Price Intelligence Platform"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_db_password
POSTGRES_HOST=postgres_host_or_ip
POSTGRES_PORT=5432
POSTGRES_DB=house_price_db

DATABASE_URL=postgresql+psycopg2://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
ASYNC_DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

MODEL_REGISTRY_DIR=ml/models
ACTIVE_MODEL_VERSION=v1.0.0
CORS_ORIGINS=["https://your-frontend-domain.com","http://localhost:3000"]
```

#### Frontend (`frontend/.env.production` or Vercel Environment)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api/v1
```

---

## 2. Deployment Method 1: Cloud PaaS (Free / Low Cost — Recommended for Demos)

This is the fastest, zero-maintenance deployment path:

### Step 1: Managed PostgreSQL Database (Neon or Supabase)
1. Sign up at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) (both offer free tier PostgreSQL).
2. Create a new project called `house_price_db`.
3. Copy the **Connection String** (`postgresql://user:password@host/neondb`).
4. In your terminal, run the ingestion script locally pointing to the remote DB to populate the 21,613 verified King County transactions:
   ```bash
   DATABASE_URL="postgresql+psycopg2://user:password@host/neondb" python ml/src/ingest_data.py
   ```

### Step 2: Backend API (Render.com or Railway.app)
1. Create a free account on [Render.com](https://render.com).
2. Click **New +** &rarr; **Web Service**, connect your GitHub repo `pratham01-web/House-Price-Prediction-System`.
3. Configure the service:
   - **Name**: `realestateiq-backend`
   - **Environment**: `Python 3`
   - **Root Directory**: (Leave blank or `backend`)
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon/Supabase connection string with `postgresql+psycopg2://` scheme.
   - `ASYNC_DATABASE_URL`: Connection string with `postgresql+asyncpg://` scheme.
   - `MODEL_REGISTRY_DIR`: `ml/models`
   - `ACTIVE_MODEL_VERSION`: `v1.0.0`
   - `CORS_ORIGINS`: `["*"]`
5. Click **Deploy Web Service**. Once deployed, copy your backend URL (e.g. `https://realestateiq-backend.onrender.com`).
6. Test health: `https://realestateiq-backend.onrender.com/api/v1/health`.

### Step 3: Frontend Web Terminal (Vercel)
1. Sign up at [Vercel.com](https://vercel.com) and click **Add New...** &rarr; **Project**.
2. Select your repository `pratham01-web/House-Price-Prediction-System`.
3. In **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click "Edit" and choose `frontend`.
4. In **Environment Variables**:
   - Key: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://realestateiq-backend.onrender.com/api/v1` (your Render backend URL).
5. Click **Deploy**. Vercel will build and assign you a global HTTPS domain (e.g. `https://house-price-prediction-system.vercel.app`).

---

## 3. Deployment Method 2: Single-Server Docker Compose (AWS EC2 / DigitalOcean / Hetzner)

For institutional deployments where all containers run on a dedicated Linux VPS:

### Step 1: Provision Server
- Ubuntu 22.04 LTS VM (minimum 2 vCPU, 4GB RAM).
- Install Docker & Docker Compose:
  ```bash
  sudo apt update && sudo apt install -y docker.io docker-compose-v2
  sudo usermod -aG docker $USER
  ```

### Step 2: Clone Repository & Configure Environment
```bash
git clone https://github.com/pratham01-web/House-Price-Prediction-System.git
cd House-Price-Prediction-System

# Create .env file
cat <<EOF > .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(openssl rand -hex 16)
POSTGRES_DB=house_price_db
POSTGRES_PORT=5432
BACKEND_PORT=8000
ACTIVE_MODEL_VERSION=v1.0.0
EOF
```

### Step 3: Launch Containers
```bash
docker compose up -d --build
```
This builds and starts:
- `house_price_postgres` (PostgreSQL 16 on port 5432 with persistent volume `postgres_data`).
- `house_price_backend` (FastAPI + Uvicorn on port 8000 with pre-warmed ML pipeline).
- `house_price_frontend` (Next.js 14 production server on port 3000).

### Step 4: Run Data Ingestion Inside Backend Container
```bash
docker compose exec backend python ml/src/ingest_data.py
```
All 21,613 records are ingested into PostgreSQL within 4 seconds.

### Step 5: Configure Reverse Proxy & HTTPS (Nginx + Let's Encrypt)
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/realestateiq`:
```nginx
server {
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and secure:
```bash
sudo ln -s /etc/nginx/sites-available/realestateiq /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

---

## 4. Verification & Health Monitoring

Once deployed, verify all endpoints:
1. **System Health Check**:
   ```bash
   curl -s https://your-domain.com/api/v1/health | jq .
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "House Price Intelligence Platform",
     "environment": "production",
     "database_connected": true,
     "active_model_version": "v1.0.0"
   }
   ```
2. **Interactive Valuation Test**:
   ```bash
   curl -X POST https://your-domain.com/api/v1/predictions \
     -H "Content-Type: application/json" \
     -d '{
       "bedrooms": 4,
       "bathrooms": 2.5,
       "sqft_living": 2600,
       "sqft_lot": 8000,
       "floors": 2.0,
       "waterfront": 0,
       "view": 1,
       "condition_score": 4,
       "grade_score": 9,
       "sqft_above": 2000,
       "sqft_basement": 600,
       "yr_built": 1995,
       "zipcode": "98052"
     }' | jq .
   ```
3. **Web Terminal**:
   Open `https://your-domain.com` &rarr; observe animated `<BlurText />` title and dynamic white dot particle background &rarr; log in with 1-click &rarr; execute real-time property appraisals.

# Student Collaboration Hub (SCU)

A complete full-stack project where students can:
- Sign up / log in
- Share notes
- Post discussion threads
- Share job notification links

Tech:
- **Backend**: FastAPI + MongoDB + JWT auth
- **Frontend**: React + Vite + TailwindCSS

## Project structure

- `backend/` FastAPI app
- `frontend/` React app

---

## Prerequisites

- Node.js 18+ (recommended)
- Python 3.11+ (recommended)
- MongoDB (local or MongoDB Atlas) **must be running** (the backend connects on startup)

---

## Backend setup (FastAPI)

### 1) Create venv and install deps

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2) Configure environment

This workspace blocks committing `.env*` files, so we provide `config.example` instead.
Set your environment variables based on `backend/config.example` (Mongo URI + JWT secret).

PowerShell example:

```powershell
$env:MONGODB_URI="mongodb://localhost:27017"
$env:MONGODB_DB="scu"
$env:JWT_SECRET="change-me-super-secret"
$env:CORS_ORIGINS="http://127.0.0.1:5173,http://localhost:5173"
```

If you use **MongoDB Atlas**, set `MONGODB_URI` to your Atlas connection string (it starts with `mongodb+srv://...`).

### 3) Start MongoDB

- **Local MongoDB**: start your MongoDB service (it must be listening on `localhost:27017`), then continue.
- **Atlas**: no local service needed; just set `MONGODB_URI` correctly.

### 3) Run backend

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs:
- Swagger UI: `http://127.0.0.1:8000/docs`

---

## Frontend setup (React)

### 1) Install deps

```powershell
cd ..\frontend
npm install
```

### 2) Configure environment

Set frontend environment variables based on `frontend/config.example` if you want a non-default API URL.

### 3) Run frontend

```powershell
npm run dev
```

Frontend runs at:
- `http://127.0.0.1:5173`

---

## Default behavior / notes

- Auth is JWT-based. The frontend stores the token in **localStorage** to keep you logged in.
- All user content is stored in MongoDB (notes, threads, job links).
- CORS is enabled for the frontend dev server.

---

## Deployment notes (quick)

- Backend: Deploy `backend/` to your server (e.g., Render/VPS). Set env vars from `.env.example`.
- Frontend: `npm run build` and host the static output from `frontend/dist` (Netlify/Vercel/your server).

---

## Deploy (Netlify + Render) - simple path

### Backend on Render

- Use `backend/render.yaml` (Blueprint) or create a Render Python Web Service.
- **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Only required env vars**:
  - `MONGODB_URI` (Atlas recommended)
  - `JWT_SECRET` (set a strong secret)
- **CORS**:
  - Set `CORS_ORIGINS` to your Netlify site URL (recommended)
  - Or set `CORS_ORIGINS=*` for simplicity (works because we do JWT in headers, not cookies)

### Frontend on Netlify

- SPA routing is already configured via `frontend/public/_redirects`.
- If you want **no Netlify dashboard env vars**, edit and commit `frontend/netlify.toml`:
  - set `VITE_API_BASE_URL` to your Render backend URL.

Render deployment (backend)

Required environment variables (set these in Render service settings):
- `MONGODB_URI` — your MongoDB connection string (mongodb+srv://...)
- `JWT_SECRET` — secret used to sign JWT tokens
- `MONGODB_DB` — (optional) database name, defaults to `scu`
- `CORS_ORIGINS` — comma-separated origins, e.g. https://your-site.netlify.app

Render YAML (already provided): `render.yaml` in `backend/` sets:
- `buildCommand: pip install -r requirements.txt`
- `startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Notes:
- `runtime.txt` selects Python version for Render. Keep as-is or change to a supported Python version.
- For local dev, create a `.env` file in `backend/` with `MONGODB_URI`, `JWT_SECRET`, etc.

Frontend (Netlify)
- Deploy the `frontend/` directory to Netlify.
- After frontend deploy, set `CORS_ORIGINS` in the backend Render service to your Netlify URL.

Quick local run (from `backend/`):

Windows PowerShell:

```powershell
pip install -r requirements.txt
$env:MONGODB_URI = "your-uri-here"
$env:JWT_SECRET = "change-me"
uvicorn app.main:app --reload
```

That's it — the backend will fail fast on startup if `MONGODB_URI` is not set, giving a clear error message.

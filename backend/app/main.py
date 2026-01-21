from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import db
from .routers import auth, job_links, notes, threads, users


app = FastAPI(title=settings.app_name)

allow_credentials = "*" not in settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    db.connect()
    # Fail fast with a clear error if Mongo isn't reachable.
    db.client.admin.command("ping")
    # indexes
    db.users.create_index("email", unique=True)
    db.notes.create_index([("user_id", 1), ("updated_at", -1)])
    db.job_links.create_index([("user_id", 1), ("updated_at", -1)])
    db.threads.create_index([("updated_at", -1)])


@app.on_event("shutdown")
def _shutdown() -> None:
    db.close()


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(notes.router)
app.include_router(threads.router)
app.include_router(job_links.router)


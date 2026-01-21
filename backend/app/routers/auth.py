from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..db import db
from ..schemas import TokenResponse, UserLogin, UserPublic, UserSignup
from ..security import create_access_token, hash_password, verify_password
from ..utils import now_utc, oid_str


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup):
    existing = db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    doc = {
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    res = db.users.insert_one(doc)
    token = create_access_token(user_id=str(res.inserted_id), email=doc["email"])
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin):
    user = db.users.find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user_id=str(user["_id"]), email=user["email"])
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserPublic)
def me():
    # This route is provided by users router in practice; keeping minimal here would require auth dep.
    # Prefer using /users/me (protected).
    raise HTTPException(status_code=status.HTTP_410_GONE, detail="Use /users/me")


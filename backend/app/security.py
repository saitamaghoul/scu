from __future__ import annotations

import base64
import hashlib
import hmac
import os
import time
from dataclasses import dataclass

import jwt

from .config import settings


PBKDF2_ITERATIONS = 210_000
SALT_BYTES = 16
DKLEN = 32


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("utf-8")


def _b64d(s: str) -> bytes:
    padding = "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode((s + padding).encode("utf-8"))


def hash_password(password: str) -> str:
    salt = os.urandom(SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS, dklen=DKLEN)
    # format: pbkdf2_sha256$<iterations>$<salt_b64>$<hash_b64>
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${_b64e(salt)}${_b64e(dk)}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, iters_s, salt_b64, hash_b64 = stored.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iters = int(iters_s)
        salt = _b64d(salt_b64)
        expected = _b64d(hash_b64)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iters, dklen=len(expected))
        return hmac.compare_digest(dk, expected)
    except Exception:
        return False


@dataclass(frozen=True)
class TokenData:
    user_id: str
    email: str
    exp: int


def create_access_token(*, user_id: str, email: str) -> str:
    now = int(time.time())
    exp = now + int(settings.access_token_expire_minutes) * 60
    payload = {"sub": user_id, "email": email, "iat": now, "exp": exp, "type": "access"}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> TokenData:
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("Invalid token type")
    return TokenData(user_id=str(payload["sub"]), email=str(payload["email"]), exp=int(payload["exp"]))


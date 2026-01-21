from __future__ import annotations

from fastapi import APIRouter, Depends

from ..deps import get_current_user
from ..schemas import UserPublic
from ..utils import oid_str


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def me(user=Depends(get_current_user)):
    return UserPublic(
        id=oid_str(user["_id"]),
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
    )


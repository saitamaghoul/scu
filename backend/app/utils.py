from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def oid_str(oid: ObjectId) -> str:
    return str(oid)


def parse_object_id(value: str) -> ObjectId:
    return ObjectId(value)


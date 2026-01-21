from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import db
from ..deps import get_current_user
from ..schemas import ApiMessage, ThreadCreate, ThreadOut, ThreadUpdate
from ..utils import now_utc, oid_str, parse_object_id


router = APIRouter(prefix="/threads", tags=["threads"])


def _to_out(doc) -> ThreadOut:
    return ThreadOut(
        id=oid_str(doc["_id"]),
        user_id=doc["user_id"],
        author_name=doc.get("author_name", "Unknown"),
        title=doc["title"],
        body=doc["body"],
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=list[ThreadOut])
def list_threads():
    cursor = db.threads.find({}).sort("updated_at", -1).limit(200)
    return [_to_out(d) for d in cursor]


@router.post("", response_model=ThreadOut, status_code=status.HTTP_201_CREATED)
def create_thread(payload: ThreadCreate, user=Depends(get_current_user)):
    now = now_utc()
    doc = {
        "user_id": oid_str(user["_id"]),
        "author_name": user["name"],
        "title": payload.title.strip(),
        "body": payload.body,
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "created_at": now,
        "updated_at": now,
    }
    res = db.threads.insert_one(doc)
    created = db.threads.find_one({"_id": res.inserted_id})
    return _to_out(created)


@router.put("/{thread_id}", response_model=ThreadOut)
def update_thread(thread_id: str, payload: ThreadUpdate, user=Depends(get_current_user)):
    existing = db.threads.find_one({"_id": parse_object_id(thread_id)})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    if existing["user_id"] != oid_str(user["_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    update: dict = {"updated_at": now_utc()}
    if payload.title is not None:
        update["title"] = payload.title.strip()
    if payload.body is not None:
        update["body"] = payload.body
    if payload.tags is not None:
        update["tags"] = [t.strip() for t in payload.tags if t.strip()]

    db.threads.update_one({"_id": existing["_id"]}, {"$set": update})
    updated = db.threads.find_one({"_id": existing["_id"]})
    return _to_out(updated)


@router.delete("/{thread_id}", response_model=ApiMessage)
def delete_thread(thread_id: str, user=Depends(get_current_user)):
    existing = db.threads.find_one({"_id": parse_object_id(thread_id)})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    if existing["user_id"] != oid_str(user["_id"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    db.threads.delete_one({"_id": existing["_id"]})
    return ApiMessage(message="Deleted")


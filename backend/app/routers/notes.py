from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import db
from ..deps import get_current_user
from ..schemas import ApiMessage, NoteCreate, NoteOut, NoteUpdate
from ..utils import now_utc, oid_str, parse_object_id


router = APIRouter(prefix="/notes", tags=["notes"])


def _to_out(doc) -> NoteOut:
    return NoteOut(
        id=oid_str(doc["_id"]),
        user_id=doc["user_id"],
        title=doc["title"],
        content=doc["content"],
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=list[NoteOut])
def list_notes(user=Depends(get_current_user)):
    cursor = db.notes.find({"user_id": oid_str(user["_id"])}).sort("updated_at", -1)
    return [_to_out(d) for d in cursor]


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate, user=Depends(get_current_user)):
    now = now_utc()
    doc = {
        "user_id": oid_str(user["_id"]),
        "title": payload.title.strip(),
        "content": payload.content,
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "created_at": now,
        "updated_at": now,
    }
    res = db.notes.insert_one(doc)
    created = db.notes.find_one({"_id": res.inserted_id})
    return _to_out(created)


@router.put("/{note_id}", response_model=NoteOut)
def update_note(note_id: str, payload: NoteUpdate, user=Depends(get_current_user)):
    existing = db.notes.find_one({"_id": parse_object_id(note_id), "user_id": oid_str(user["_id"])})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    update: dict = {"updated_at": now_utc()}
    if payload.title is not None:
        update["title"] = payload.title.strip()
    if payload.content is not None:
        update["content"] = payload.content
    if payload.tags is not None:
        update["tags"] = [t.strip() for t in payload.tags if t.strip()]

    db.notes.update_one({"_id": existing["_id"]}, {"$set": update})
    updated = db.notes.find_one({"_id": existing["_id"]})
    return _to_out(updated)


@router.delete("/{note_id}", response_model=ApiMessage)
def delete_note(note_id: str, user=Depends(get_current_user)):
    res = db.notes.delete_one({"_id": parse_object_id(note_id), "user_id": oid_str(user["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return ApiMessage(message="Deleted")


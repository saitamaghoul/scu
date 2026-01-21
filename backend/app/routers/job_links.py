from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ..db import db
from ..deps import get_current_user
from ..schemas import ApiMessage, JobLinkCreate, JobLinkOut, JobLinkUpdate
from ..utils import now_utc, oid_str, parse_object_id


router = APIRouter(prefix="/job-links", tags=["job-links"])


def _to_out(doc) -> JobLinkOut:
    return JobLinkOut(
        id=oid_str(doc["_id"]),
        user_id=doc["user_id"],
        title=doc["title"],
        url=doc["url"],
        company=doc.get("company"),
        location=doc.get("location"),
        notes=doc.get("notes"),
        tags=doc.get("tags", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.get("", response_model=list[JobLinkOut])
def list_job_links(user=Depends(get_current_user)):
    cursor = db.job_links.find({"user_id": oid_str(user["_id"])}).sort("updated_at", -1)
    return [_to_out(d) for d in cursor]


@router.post("", response_model=JobLinkOut, status_code=status.HTTP_201_CREATED)
def create_job_link(payload: JobLinkCreate, user=Depends(get_current_user)):
    now = now_utc()
    doc = {
        "user_id": oid_str(user["_id"]),
        "title": payload.title.strip(),
        "url": str(payload.url),
        "company": payload.company.strip() if payload.company else None,
        "location": payload.location.strip() if payload.location else None,
        "notes": payload.notes,
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "created_at": now,
        "updated_at": now,
    }
    res = db.job_links.insert_one(doc)
    created = db.job_links.find_one({"_id": res.inserted_id})
    return _to_out(created)


@router.put("/{job_link_id}", response_model=JobLinkOut)
def update_job_link(job_link_id: str, payload: JobLinkUpdate, user=Depends(get_current_user)):
    existing = db.job_links.find_one({"_id": parse_object_id(job_link_id), "user_id": oid_str(user["_id"])})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job link not found")

    update: dict = {"updated_at": now_utc()}
    if payload.title is not None:
        update["title"] = payload.title.strip()
    if payload.url is not None:
        update["url"] = str(payload.url)
    if payload.company is not None:
        update["company"] = payload.company.strip() if payload.company else None
    if payload.location is not None:
        update["location"] = payload.location.strip() if payload.location else None
    if payload.notes is not None:
        update["notes"] = payload.notes
    if payload.tags is not None:
        update["tags"] = [t.strip() for t in payload.tags if t.strip()]

    db.job_links.update_one({"_id": existing["_id"]}, {"$set": update})
    updated = db.job_links.find_one({"_id": existing["_id"]})
    return _to_out(updated)


@router.delete("/{job_link_id}", response_model=ApiMessage)
def delete_job_link(job_link_id: str, user=Depends(get_current_user)):
    res = db.job_links.delete_one({"_id": parse_object_id(job_link_id), "user_id": oid_str(user["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job link not found")
    return ApiMessage(message="Deleted")


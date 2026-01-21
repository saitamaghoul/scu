from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, HttpUrl


class ApiMessage(BaseModel):
    message: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime


class UserSignup(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    content: str = Field(min_length=1, max_length=50_000)
    tags: list[str] = Field(default_factory=list)


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    content: str | None = Field(default=None, min_length=1, max_length=50_000)
    tags: list[str] | None = None


class NoteOut(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class ThreadCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    body: str = Field(min_length=1, max_length=50_000)
    tags: list[str] = Field(default_factory=list)


class ThreadUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    body: str | None = Field(default=None, min_length=1, max_length=50_000)
    tags: list[str] | None = None


class ThreadOut(BaseModel):
    id: str
    user_id: str
    author_name: str
    title: str
    body: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class JobLinkCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    url: HttpUrl
    company: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=2000)
    tags: list[str] = Field(default_factory=list)


class JobLinkUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    url: HttpUrl | None = None
    company: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=2000)
    tags: list[str] | None = None


class JobLinkOut(BaseModel):
    id: str
    user_id: str
    title: str
    url: HttpUrl
    company: str | None
    location: str | None
    notes: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime


import certifi
from __future__ import annotations

from pymongo import MongoClient
from pymongo.collection import Collection

from .config import settings


class Database:
    def __init__(self) -> None:
        self._client: MongoClient | None = None
def connect(self) -> None:
    if self._client is None:
        self._client = MongoClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
            tlsCAFile=certifi.where()  # <-- fixes SSL handshake
        )

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    @property
    def client(self) -> MongoClient:
        if self._client is None:
            raise RuntimeError("Database not connected")
        return self._client

    @property
    def db(self):
        return self.client[settings.mongodb_db]

    @property
    def users(self) -> Collection:
        return self.db["users"]

    @property
    def notes(self) -> Collection:
        return self.db["notes"]

    @property
    def threads(self) -> Collection:
        return self.db["threads"]

    @property
    def job_links(self) -> Collection:
        return self.db["job_links"]


db = Database()


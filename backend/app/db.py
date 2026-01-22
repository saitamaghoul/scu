from __future__ import annotations

import certifi
from pymongo import MongoClient
from pymongo.collection import Collection

from .config import settings


class Database:
    def __init__(self) -> None:
        self._client: MongoClient | None = None

    def connect(self) -> None:
        if self._client is None:
            if not settings.mongodb_uri:
                raise RuntimeError(
                    "MONGODB_URI is not set. Set env var MONGODB_URI to your MongoDB connection string."
                )

            # Strip surrounding whitespace/newlines that may have been injected
            # into environment variables (e.g. trailing newlines from CI or
            # accidental copy/paste). A stray newline in the URI can produce
            # malformed options like `w=majority\n` which break the driver.
            uri_raw = settings.mongodb_uri
            # Remove CR/LF characters and common URL-encoded newline sequences
            uri = (
                uri_raw.replace("\n", "")
                .replace("\r", "")
                .replace("%0A", "")
                .replace("%0a", "")
                .strip()
            )
            if not uri:
                raise RuntimeError(
                    "MONGODB_URI is empty after stripping whitespace. Check the env var."
                )

            # Let the URI control TLS settings (for mongodb+srv URIs the driver
            # enables TLS automatically). Passing `tls`/`tlsCAFile` explicitly
            # can sometimes cause handshake issues in some hosting environments.
            self._client = MongoClient(
                uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )

            # force connection check and provide a clearer error if it fails
            try:
                self._client.admin.command("ping")
            except Exception as exc:  # pylint: disable=broad-except
                # Clean up client to avoid leaking sockets
                try:
                    self._client.close()
                finally:
                    self._client = None
                raise RuntimeError(
                    "Failed connecting to MongoDB. Check MONGODB_URI value, "
                    "MongoDB Atlas network access (IP whitelist), and that the URI "
                    "uses the correct `mongodb+srv://` form if appropriate. "
                    f"Original error: {exc}"
                ) from exc

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
        # Ensure DB name has no surrounding whitespace
        dbname = settings.mongodb_db.strip() if settings.mongodb_db else "scu"
        return self.client[dbname]

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

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Allow a local `.env` file for development while prioritizing environment
    # variables in production (Render / Netlify builds provide env vars).
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Student Collaboration Hub API"
    environment: str = "dev"

    # Intentionally empty by default so deployments must provide `MONGODB_URI`.
    mongodb_uri: str = ""
    mongodb_db: str = "scu"

    # Secrets should be provided via env var `JWT_SECRET` in production.
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Comma-separated list.
    # Use "*" to allow any origin (simpler, but don't use with cookies).
    cors_origins: str = "http://127.0.0.1:5173,http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()

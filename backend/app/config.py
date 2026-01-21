from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    app_name: str = "Student Collaboration Hub API"
    environment: str = "dev"

    mongodb_uri: str = "mongodb+srv://zoomoutmotion_db_user:saitama%40222@cluster0.q9j8e4w.mongodb.net/?retryWrites=true&w=majority"
"
    mongodb_db: str = "scu"

    jwt_secret: str = "saitama@222"
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


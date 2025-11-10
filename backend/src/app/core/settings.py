# app/core/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/mydb"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_TIMEOUT: int = 30
    AUTH0_CLIENT_ID: str
    AUTH0_CLIENT_SECRET: str
    AUTH0_DOMAIN: str
    AUTH0_AUDIENCE: str
    AUTH0_CALLBACK_URL: str
    SESSION_SECRET: str
    AUTH0_ALGORITHMS: str = "RS256"
    AUTH_REDIRECT_URI: str = "http://localhost:8000/auth/callback"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()


@lru_cache()
def get_settings():
    return Settings()

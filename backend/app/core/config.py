from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

_project_root = Path(__file__).resolve().parent.parent.parent.parent
_default_db_file = (_project_root / "revenue_survival.db").resolve().as_posix()

def _resolve_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL", "").strip()
    env = os.getenv("ENVIRONMENT", "development").lower()
    is_cloud_prod = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("RENDER") or os.getenv("RAILWAY_ENVIRONMENT") or env == "production")

    if raw_url:
        # Standardize postgres dialect for SQLAlchemy async
        if raw_url.startswith("postgres://"):
            raw_url = "postgresql+asyncpg://" + raw_url[len("postgres://"):]
        elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+asyncpg://"):
            raw_url = "postgresql+asyncpg://" + raw_url[len("postgresql://"):]
        
        # Normalize query params for asyncpg (strip unsupported libpq args like channel_binding)
        if "?" in raw_url:
            base_part, query_part = raw_url.split("?", 1)
            params = query_part.split("&")
            clean_params = []
            for p in params:
                if not p or p.startswith("channel_binding="):
                    continue
                if p.startswith("sslmode="):
                    p = "ssl=require"
                clean_params.append(p)
            if clean_params:
                raw_url = f"{base_part}?{'&'.join(clean_params)}"
            else:
                raw_url = base_part
        return raw_url


    if is_cloud_prod and (os.getenv("VERCEL") or os.getenv("RENDER") or os.getenv("RAILWAY_ENVIRONMENT")):
        # Strict fail loudly in production cloud deployments
        raise RuntimeError(
            "CRITICAL CONFIGURATION ERROR: DATABASE_URL is missing in production cloud environment. "
            "Revenue Survival AI requires a persistent cloud PostgreSQL database (Render / Railway / Neon / Supabase). "
            "Ephemeral SQLite in /tmp is strictly forbidden in production."
        )

    # Local development fallback
    return f"sqlite+aiosqlite:///{_default_db_file}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Revenue Survival AI Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database (Single Source of Truth: Always absolute path to root revenue_survival.db or Postgres URL)
    DATABASE_URL: str = _resolve_database_url()
    
    # LLM Settings (optional API keys, with built-in high-fidelity autonomous simulation fallback)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", None)
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    class Config:
        case_sensitive = True

settings = Settings()


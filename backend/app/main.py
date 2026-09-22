from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api import (
    missions,
    opportunities,
    offers,
    leads,
    communications,
    tasks,
    real_estate,
    analytics,
    scheduler,
    connectors,
    seller_intelligence,
    outreach_automation,
    long_term_memory,
    browser_automation,
    strategy_brain,
    marketplace,
    copilot,
    closing_engine,
    learning,
    ceo_brain,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite/Postgres DB tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Safely ensure new columns exist in communications table if already created
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE communications ADD COLUMN provider_name VARCHAR(50) DEFAULT 'WHATSAPP_BUSINESS'"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE communications ADD COLUMN provider_message_id VARCHAR(255)"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE communications ADD COLUMN delivered_at DATETIME"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE communications ADD COLUMN read_at DATETIME"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE missions ADD COLUMN industries JSON"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE revenue_opportunities ADD COLUMN intent_score FLOAT DEFAULT 85.0"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE revenue_opportunities ADD COLUMN closing_probability FLOAT DEFAULT 0.85"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE revenue_opportunities ADD COLUMN priority VARCHAR(50) DEFAULT 'HOT'"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN company_name VARCHAR(255)"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN pipeline_stage VARCHAR(50) DEFAULT 'DISCOVERED'"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN stage_duration_hours FLOAT DEFAULT 1.0"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN revenue_probability FLOAT DEFAULT 0.80"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN qualification_score FLOAT DEFAULT 75.0"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN classification VARCHAR(50) DEFAULT 'QUALIFIED'"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN buying_intent VARCHAR(50) DEFAULT 'HIGH'"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN estimated_budget FLOAT DEFAULT 3500.0"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN decision_stage VARCHAR(50) DEFAULT 'EVALUATION'"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN decision_maker_probability FLOAT DEFAULT 0.85"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE leads ADD COLUMN qualification_notes TEXT"))
        except Exception:
            pass
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Multi-Agent AI Revenue Survival Engine",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(missions.router, prefix=settings.API_V1_STR)
app.include_router(opportunities.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(leads.router, prefix=settings.API_V1_STR)
app.include_router(communications.router, prefix=settings.API_V1_STR)
app.include_router(tasks.router, prefix=settings.API_V1_STR)
app.include_router(real_estate.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(scheduler.router, prefix=settings.API_V1_STR)
app.include_router(connectors.router, prefix=settings.API_V1_STR)
app.include_router(seller_intelligence.router, prefix=settings.API_V1_STR)
app.include_router(outreach_automation.router, prefix=settings.API_V1_STR)
app.include_router(long_term_memory.router, prefix=settings.API_V1_STR)
app.include_router(browser_automation.router, prefix=settings.API_V1_STR)
app.include_router(strategy_brain.router, prefix=settings.API_V1_STR)
app.include_router(marketplace.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router, prefix=settings.API_V1_STR)
app.include_router(closing_engine.router, prefix=settings.API_V1_STR)
app.include_router(learning.router, prefix=settings.API_V1_STR)
app.include_router(ceo_brain.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "survival_mode": "ACTIVE",
        "docs_url": "/docs"
    }

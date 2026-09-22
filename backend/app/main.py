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
    business_operator,
    growth_loop,
    revenue_empire,
    scaling_engine,
    enterprise_network,
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
        # Phase 16 Validation Layer columns
        for col_sql in [
            "ALTER TABLE leads ADD COLUMN source_type VARCHAR(50) DEFAULT 'REAL'",
            "ALTER TABLE leads ADD COLUMN verification_status VARCHAR(50) DEFAULT 'VERIFIED'",
            "ALTER TABLE leads ADD COLUMN client_identity VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN proposal_id INTEGER",
            "ALTER TABLE leads ADD COLUMN payment_status VARCHAR(50)",
            "ALTER TABLE leads ADD COLUMN payment_reference VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN revenue_verification_status VARCHAR(50) DEFAULT 'UNVERIFIED'",
            "ALTER TABLE communications ADD COLUMN recipient VARCHAR(255)",
            "ALTER TABLE communications ADD COLUMN delivery_confirmation VARCHAR(255)",
            "ALTER TABLE communications ADD COLUMN reply_source VARCHAR(50) DEFAULT 'CLIENT_DIRECT'",
            "ALTER TABLE communications ADD COLUMN source_type VARCHAR(50) DEFAULT 'REAL'",
            "ALTER TABLE communications ADD COLUMN verification_status VARCHAR(50) DEFAULT 'VERIFIED'",
            "ALTER TABLE revenue_tracking ADD COLUMN client_identity VARCHAR(255)",
            "ALTER TABLE revenue_tracking ADD COLUMN proposal_id INTEGER",
            "ALTER TABLE revenue_tracking ADD COLUMN payment_status VARCHAR(50) DEFAULT 'SETTLED'",
            "ALTER TABLE revenue_tracking ADD COLUMN payment_reference VARCHAR(255)",
            "ALTER TABLE revenue_tracking ADD COLUMN revenue_verification_status VARCHAR(50) DEFAULT 'VERIFIED'",
            "ALTER TABLE revenue_tracking ADD COLUMN source_type VARCHAR(50) DEFAULT 'REAL'",
            "ALTER TABLE revenue_tracking ADD COLUMN verification_status VARCHAR(50) DEFAULT 'VERIFIED'",
            "ALTER TABLE revenue_tracking ADD COLUMN audit_hash VARCHAR(255)",
            "ALTER TABLE proposals ADD COLUMN payment_status VARCHAR(50) DEFAULT 'UNPAID'",
            "ALTER TABLE proposals ADD COLUMN payment_reference VARCHAR(255)",
            "ALTER TABLE proposals ADD COLUMN source_type VARCHAR(50) DEFAULT 'REAL'",
            "ALTER TABLE proposals ADD COLUMN verification_status VARCHAR(50) DEFAULT 'VERIFIED'",
            "ALTER TABLE tasks ADD COLUMN source_type VARCHAR(50) DEFAULT 'SYSTEM'",
            "ALTER TABLE tasks ADD COLUMN verification_status VARCHAR(50) DEFAULT 'VERIFIED'",
            "ALTER TABLE operator_action_logs ADD COLUMN source_type VARCHAR(50) DEFAULT 'SYSTEM'",
            "ALTER TABLE operator_action_logs ADD COLUMN verification_status VARCHAR(50) DEFAULT 'VERIFIED'",
            "ALTER TABLE leads ADD COLUMN source_platform VARCHAR(100) DEFAULT 'Telegram'",
            "ALTER TABLE leads ADD COLUMN source_url TEXT",
            "ALTER TABLE leads ADD COLUMN profile_url TEXT",
            "ALTER TABLE leads ADD COLUMN evidence_reference VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN discovery_timestamp DATETIME",
            "ALTER TABLE leads ADD COLUMN calendar_event_id VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN meeting_link VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN call_status VARCHAR(50) DEFAULT 'NONE'",
            "ALTER TABLE leads ADD COLUMN call_notes TEXT",
            "ALTER TABLE leads ADD COLUMN call_completed_at DATETIME",
            "ALTER TABLE communications ADD COLUMN provider_confirmation VARCHAR(255)",
            "ALTER TABLE communications ADD COLUMN reply_status VARCHAR(50) DEFAULT 'NONE'",
            "ALTER TABLE communications ADD COLUMN reply_classification VARCHAR(100)",
            "ALTER TABLE communications ADD COLUMN followup_sequence_step INTEGER DEFAULT 0",
            "ALTER TABLE proposals ADD COLUMN recipient_confirmation VARCHAR(255)",
            "ALTER TABLE proposals ADD COLUMN client_response TEXT",
            "ALTER TABLE proposals ADD COLUMN viewed_at DATETIME",
            "ALTER TABLE proposals ADD COLUMN accepted_at DATETIME",
            "ALTER TABLE proposals ADD COLUMN rejected_at DATETIME",
            "ALTER TABLE revenue_tracking ADD COLUMN payment_id VARCHAR(255)",
            "ALTER TABLE revenue_tracking ADD COLUMN transaction_reference VARCHAR(255)",
            "ALTER TABLE revenue_tracking ADD COLUMN settlement_date DATETIME"
        ]:
            try:
                from sqlalchemy import text
                await conn.execute(text(col_sql))
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
app.include_router(business_operator.router, prefix=settings.API_V1_STR)
app.include_router(growth_loop.router, prefix=settings.API_V1_STR)
app.include_router(revenue_empire.router, prefix=settings.API_V1_STR)
app.include_router(scaling_engine.router, prefix=settings.API_V1_STR)
app.include_router(enterprise_network.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "ONLINE",
        "survival_mode": "ACTIVE",
        "docs_url": "/docs"
    }

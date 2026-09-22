from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.models.entities import MarketSignal
from app.schemas.schemas import SignalIngestionRequest, ConnectorAuthConfig, ConnectorAuthResponse
from app.services.connectors.data_acquisition import data_acquisition_engine
from app.services.connectors.auth_manager import connector_auth_manager

router = APIRouter(prefix="/connectors", tags=["connectors"])

@router.get("/auth/status", response_model=List[ConnectorAuthResponse])
async def get_connector_auth_status(db: AsyncSession = Depends(get_db)):
    """
    Returns authentication and connection states for all 6 public signal connectors:
    Reddit, Telegram, YouTube, LinkedIn, Web Search, Business Directories.
    """
    statuses = await connector_auth_manager.get_all_connector_statuses(db)
    return statuses

@router.post("/auth/configure")
async def configure_connector_auth(payload: ConnectorAuthConfig, db: AsyncSession = Depends(get_db)):
    """
    Configures API keys, tokens, or credentials for a specified connector.
    """
    result = await connector_auth_manager.configure_connector(
        session=db,
        connector_name=payload.connector_name,
        auth_type=payload.auth_type,
        credentials=payload.credentials
    )
    return result

@router.post("/auth/test/{connector_name}")
async def test_connector_auth(connector_name: str, db: AsyncSession = Depends(get_db)):
    """
    Runs a live ping test verifying connector authentication and latency.
    """
    result = await connector_auth_manager.test_connector_connection(db, connector_name)
    return result

@router.get("/signals/{mission_id}")
async def get_mission_signals(mission_id: int, source: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    stmt = select(MarketSignal).where(MarketSignal.mission_id == mission_id).order_by(MarketSignal.id.desc())
    if source:
        stmt = stmt.where(MarketSignal.source == source.upper())
    result = await db.execute(stmt)
    signals = result.scalars().all()
    
    # Calculate source breakdown
    breakdown = {"BUYER_RADAR": 0, "TELEGRAM": 0, "REDDIT": 0, "YOUTUBE": 0, "LINKEDIN": 0, "CUSTOM": 0}
    for s in signals:
        src = s.source.upper()
        if src in breakdown:
            breakdown[src] += 1
        else:
            breakdown["CUSTOM"] += 1
            
    return {
        "total_signals": len(signals),
        "breakdown": breakdown,
        "signals": [
            {
                "id": s.id,
                "source": s.source,
                "signal_text": s.signal_text,
                "lead_name": s.lead_name,
                "country": s.country,
                "intent_score": s.intent_score,
                "channel": s.channel,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in signals
        ]
    }

@router.post("/scan-all/{mission_id}")
async def scan_all_connectors(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await data_acquisition_engine.scan_all_connectors(db, mission_id)
    return result

@router.post("/poll-live/{mission_id}")
async def poll_live_connectors(mission_id: int, db: AsyncSession = Depends(get_db)):
    from app.services.connectors.live_connectors import live_connector_manager
    result = await live_connector_manager.poll_all_live_connectors(db, mission_id)
    return result

@router.post("/ingest")
async def ingest_signal(payload: SignalIngestionRequest, db: AsyncSession = Depends(get_db)):
    signal = await data_acquisition_engine.ingest_custom_signal(
        session=db,
        mission_id=payload.mission_id,
        source=payload.source,
        signal_text=payload.signal_text,
        lead_name=payload.lead_name,
        country=payload.country,
        intent_score=payload.intent_score,
        channel=payload.channel,
        raw_metadata=payload.raw_metadata
    )
    return {
        "status": "success",
        "signal_id": signal.id,
        "source": signal.source,
        "intent_score": signal.intent_score,
        "lead_name": signal.lead_name,
        "created_at": signal.created_at.isoformat() if signal.created_at else None
    }


# UAE Buyer Radar Bridge Endpoints
@router.post("/bridge/sync/{mission_id}")
async def sync_buyer_radar_bridge(mission_id: int, source: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """
    Triggers UAE Buyer Radar Bridge sync:
    Pulls live signals across Telegram MTProto, LinkedIn, Instagram, Reddit, YouTube, Web Search,
    normalizes them into RevenueSignals, classifies per mission industries, and creates RevenueOpportunity + CRM Leads.
    """
    from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
    result = await uae_buyer_radar_bridge.sync_mission_signals(db, mission_id, filter_source=source)
    return result


@router.get("/bridge/health")
async def get_connector_health_dashboard(db: AsyncSession = Depends(get_db)):
    """
    Returns live connector health telemetry for Telegram MTProto, LinkedIn, Instagram, Reddit, YouTube, Web Search:
    Source, Last Sync, Signals Found Today, Status, Errors, Latency.
    """
    from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
    health = await uae_buyer_radar_bridge.get_connector_health_dashboard(db)
    return health


@router.get("/bridge/command-center/{mission_id}")
async def get_revenue_command_center_telemetry(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns real-time Revenue Command Center metrics:
    - Today's Signals
    - New Qualified Opportunities
    - Hot Leads
    - Offers Ready
    - Messages Pending Approval
    - Expected Revenue
    - Target Funnel Math (Required Leads -> Convos -> Proposals -> Deals)
    """
    from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
    metrics = await uae_buyer_radar_bridge.get_revenue_command_center_metrics(db, mission_id)
    return metrics


@router.get("/bridge/daily-report/{mission_id}")
async def get_revenue_survival_daily_report(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates morning Revenue Survival Daily Report:
    - Signals Found
    - Qualified Leads
    - Industries Breakdown
    - Expected Revenue
    - Top 10 Opportunities
    - Recommended Actions
    """
    from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
    report = await uae_buyer_radar_bridge.generate_revenue_survival_daily_report(db, mission_id)
    return report


@router.post("/bridge/hourly-sync")
async def run_hourly_connector_sync_endpoint(db: AsyncSession = Depends(get_db)):
    """
    Executes autonomous 1-hour connector sync across all active missions.
    """
    from app.services.scheduler import daily_scheduler
    result = await daily_scheduler.run_hourly_connector_sync(db)
    return result



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.models.entities import MarketSignal
from app.schemas.schemas import SignalIngestionRequest
from app.services.connectors.data_acquisition import data_acquisition_engine

router = APIRouter(prefix="/connectors", tags=["connectors"])

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


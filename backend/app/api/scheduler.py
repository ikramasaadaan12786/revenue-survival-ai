from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.core.database import get_db
from app.models.entities import DailyCycleLog
from app.schemas.schemas import DailyCycleResponse
from app.services.scheduler import daily_scheduler

router = APIRouter(prefix="/scheduler", tags=["scheduler"])

@router.get("/logs/{mission_id}", response_model=List[DailyCycleResponse])
async def get_daily_cycle_logs(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(DailyCycleLog).where(DailyCycleLog.mission_id == mission_id).order_by(DailyCycleLog.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/run-cycle/{mission_id}")
async def trigger_daily_cycle(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await daily_scheduler.run_full_daily_cycle(db, mission_id)
    return result

@router.post("/auto-discovery-sweep")
async def trigger_auto_discovery_sweep(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Autonomous Daily Sweep: Automatically hunts opportunities, updates dynamic scoring,
    and stages AI offers across active missions.
    """
    result = await daily_scheduler.auto_discovery_sweep(db, mission_id)
    return result


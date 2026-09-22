from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.entities import RevenueTracking, Experiment, AgentMemory, Mission, Lead, Communication
from app.schemas.schemas import RevenueTrackingCreate, RevenueTrackingResponse, ExperimentResponse, AgentMemoryResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/revenue/{mission_id}", response_model=List[RevenueTrackingResponse])
async def get_mission_revenues(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(RevenueTracking).where(RevenueTracking.mission_id == mission_id).order_by(RevenueTracking.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/revenue", response_model=RevenueTrackingResponse)
async def record_revenue(payload: RevenueTrackingCreate, db: AsyncSession = Depends(get_db)):
    rev = RevenueTracking(**payload.model_dump())
    db.add(rev)
    
    # Update mission revenue
    mission = await db.get(Mission, payload.mission_id)
    if mission:
        mission.revenue_generated = (mission.revenue_generated or 0.0) + payload.amount
        if mission.revenue_generated >= mission.goal_amount:
            mission.status = "COMPLETED"
    
    await db.commit()
    await db.refresh(rev)
    return rev

@router.get("/experiments/{mission_id}", response_model=List[ExperimentResponse])
async def get_mission_experiments(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Experiment).where(Experiment.mission_id == mission_id).order_by(Experiment.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/memory", response_model=List[AgentMemoryResponse])
async def get_agent_memory(db: AsyncSession = Depends(get_db)):
    stmt = select(AgentMemory).order_by(AgentMemory.id.desc()).limit(30)
    result = await db.execute(stmt)
    return result.scalars().all()

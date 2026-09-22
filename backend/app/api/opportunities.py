from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.entities import Opportunity, RevenueOpportunity, Mission
from app.schemas.schemas import OpportunityResponse, RevenueOpportunityResponse
from app.agents.opportunity_hunter import OpportunityHunterAgent

router = APIRouter(prefix="/opportunities", tags=["opportunities"])
opp_agent = OpportunityHunterAgent()

@router.get("/mission/{mission_id}", response_model=List[OpportunityResponse])
async def get_mission_opportunities(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Opportunity).where(Opportunity.mission_id == mission_id).order_by(Opportunity.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/revenue-opportunities/{mission_id}", response_model=List[RevenueOpportunityResponse])
async def get_revenue_opportunities(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(RevenueOpportunity).where(RevenueOpportunity.mission_id == mission_id).order_by(RevenueOpportunity.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/hunt/{mission_id}")
async def trigger_opportunity_hunter(mission_id: int, db: AsyncSession = Depends(get_db)):
    mission = await db.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    result = await opp_agent.execute_task(db, mission_id, {})
    return result

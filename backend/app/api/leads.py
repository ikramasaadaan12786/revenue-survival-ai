from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.entities import Lead, Mission
from app.schemas.schemas import LeadResponse, LeadCreate
from app.agents.lead_hunter import LeadHunterAgent

router = APIRouter(prefix="/leads", tags=["leads"])
lead_agent = LeadHunterAgent()

class LeadStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

@router.get("/mission/{mission_id}", response_model=List[LeadResponse])
async def get_mission_leads(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Lead).where(Lead.mission_id == mission_id).order_by(Lead.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/hunt/{mission_id}")
async def trigger_lead_hunter(mission_id: int, db: AsyncSession = Depends(get_db)):
    mission = await db.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    result = await lead_agent.execute_task(db, mission_id, {})
    return result

@router.patch("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status(lead_id: int, payload: LeadStatusUpdate, db: AsyncSession = Depends(get_db)):
    lead = await db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = payload.status
    if payload.notes:
        lead.notes = (lead.notes or "") + f" | {payload.notes}"
    await db.commit()
    await db.refresh(lead)
    return lead

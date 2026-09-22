from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.models.entities import Communication, Lead
from app.schemas.schemas import OutreachCampaignCreate
from app.services.outreach_engine import outreach_automation_engine

router = APIRouter(prefix="/outreach-automation", tags=["outreach-automation"])

class SequenceRequest(BaseModel):
    mission_id: int
    lead_id: int

@router.post("/generate-sequence")
async def generate_outreach_sequence(payload: SequenceRequest, db: AsyncSession = Depends(get_db)):
    comms = await outreach_automation_engine.generate_full_outreach_sequence(db, payload.mission_id, payload.lead_id)
    return {
        "status": "success",
        "lead_id": payload.lead_id,
        "sequence_steps_created": len(comms),
        "steps": [
            {
                "id": c.id,
                "step": c.sequence_step,
                "message_type": c.message_type,
                "subject": c.subject,
                "body": c.body,
                "scheduled_for": c.scheduled_for.isoformat() if c.scheduled_for else None
            }
            for c in comms
        ]
    }

@router.post("/campaign")
async def create_outreach_campaign(payload: OutreachCampaignCreate, db: AsyncSession = Depends(get_db)):
    res = await outreach_automation_engine.create_campaign_for_mission(
        session=db,
        mission_id=payload.mission_id,
        lead_ids=payload.lead_ids,
        target_intent=payload.target_intent,
        custom_pitch_angle=payload.custom_pitch_angle
    )
    return res

@router.get("/pipeline/{mission_id}")
async def get_outreach_pipeline(mission_id: int, db: AsyncSession = Depends(get_db)):
    pipeline = await outreach_automation_engine.get_follow_up_pipeline(db, mission_id)
    return {
        "mission_id": mission_id,
        "total_leads_tracked": len(pipeline),
        "pipeline": pipeline
    }


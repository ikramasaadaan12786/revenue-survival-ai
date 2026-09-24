from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.entities import Communication, Lead, Mission, RevenueTracking
from app.schemas.schemas import CommunicationResponse, CommunicationApprovalUpdate
from app.agents.outreach_agent import OutreachAgent
from app.agents.sales_assistant import SalesAssistantAgent
from app.services.communication.communication_manager import communication_manager
from app.services.communication.templates import template_engine, MESSAGE_TEMPLATES

router = APIRouter(prefix="/communications", tags=["communications"])
outreach_agent = OutreachAgent()
sales_agent = SalesAssistantAgent()

class SimulateReplyPayload(BaseModel):
    message: str

class InboundWebhookPayload(BaseModel):
    sender: str
    message: str
    provider_message_id: Optional[str] = None

class SendDirectMessagePayload(BaseModel):
    lead_id: int
    template_name: Optional[str] = None
    custom_body: Optional[str] = None
    channel: str = "WhatsApp"

@router.get("/templates")
async def list_message_templates():
    return {
        "templates": [
            {
                "id": k,
                "name": k.replace("_", " ").title(),
                "channel": v["channel"],
                "category": v["category"],
                "template": v["template"],
                "required_variables": v.get("required_variables", [])
            }
            for k, v in MESSAGE_TEMPLATES.items()
        ]
    }

@router.get("/mission/{mission_id}", response_model=List[CommunicationResponse])
async def get_mission_communications(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Communication).where(Communication.mission_id == mission_id).order_by(Communication.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/approvals/{mission_id}", response_model=List[CommunicationResponse])
async def get_pending_approvals(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Communication).where(
        Communication.mission_id == mission_id,
        Communication.approval_status == "PENDING"
    ).order_by(Communication.id.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/draft/{mission_id}")
async def trigger_outreach_drafting(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await outreach_agent.execute_task(db, mission_id, {})
    return result

@router.post("/{comm_id}/review", response_model=CommunicationResponse)
async def review_communication(comm_id: int, payload: CommunicationApprovalUpdate, db: AsyncSession = Depends(get_db)):
    comm = await db.get(Communication, comm_id)
    if not comm:
        raise HTTPException(status_code=404, detail="Communication item not found")

    comm.approval_status = payload.approval_status
    if payload.modified_body:
        comm.body = payload.modified_body

    if payload.approval_status == "APPROVED":
        # Dispatched via provider abstraction
        await db.commit()
        await communication_manager.dispatch_approved_communication(db, comm_id)
    elif payload.approval_status == "REJECTED":
        comm.delivery_status = "FAILED"
        await db.commit()

    await db.refresh(comm)
    return comm

@router.post("/batch-approve/{mission_id}")
async def batch_approve(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Communication).where(
        Communication.mission_id == mission_id,
        Communication.approval_status == "PENDING"
    )
    result = await db.execute(stmt)
    comms = result.scalars().all()

    dispatched = 0
    for c in comms:
        c.approval_status = "APPROVED"
        await db.commit()
        await communication_manager.dispatch_approved_communication(db, c.id)
        dispatched += 1

    return {"status": "success", "approved_count": len(comms), "dispatched_count": dispatched}

@router.post("/dispatch/{comm_id}")
async def dispatch_communication(comm_id: int, db: AsyncSession = Depends(get_db)):
    result = await communication_manager.dispatch_approved_communication(db, comm_id)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@router.post("/webhooks/{provider}")
async def receive_provider_webhook(provider: str, payload: InboundWebhookPayload, db: AsyncSession = Depends(get_db)):
    result = await communication_manager.handle_inbound_webhook_reply(
        session=db,
        provider=provider.upper(),
        sender_phone_or_email=payload.sender,
        message_text=payload.message,
        provider_message_id=payload.provider_message_id
    )
    return result

@router.post("/{comm_id}/simulate-reply")
async def simulate_prospect_reply(comm_id: int, payload: SimulateReplyPayload, db: AsyncSession = Depends(get_db)):
    comm = await db.get(Communication, comm_id)
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")

    comm.response_received = payload.message
    comm.delivery_status = "REPLIED"
    comm.read_at = datetime.utcnow()

    lead = await db.get(Lead, comm.lead_id)
    sales_resp = None
    if lead:
        lead.status = "REPLIED"
        sales_resp = await sales_agent.execute_task(db, comm.mission_id, {
            "lead_id": lead.id,
            "message": payload.message
        })
        lead.notes = (lead.notes or "") + f" | AI Sales Note: {sales_resp.get('summary')}"
    
    await db.commit()
    return {
        "status": "success",
        "lead_name": lead.name if lead else "Prospect",
        "reply": payload.message,
        "ai_sales_response": sales_resp if lead else None
    }

@router.post("/{comm_id}/regenerate-pitch")
async def regenerate_single_pitch(comm_id: int, db: AsyncSession = Depends(get_db)):
    """
    Regenerates a draft pitch using the professional pitch generator.
    Guarantees historical SENT/DELIVERED messages are never modified.
    """
    from app.services.communication.pitch_generator import pitch_generator
    comm = await db.get(Communication, comm_id)
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
    
    if comm.delivery_status in ["SENT", "DELIVERED", "READ", "REPLIED"]:
        raise HTTPException(status_code=400, detail="Cannot modify already sent or delivered communications.")

    lead = await db.get(Lead, comm.lead_id) if comm.lead_id else None
    if not lead:
        raise HTTPException(status_code=404, detail="Lead associated with communication not found")

    pitch_data = pitch_generator.generate_pitch(lead, channel=comm.channel)
    comm.subject = pitch_data["subject"]
    comm.body = pitch_data["body"]
    if not comm.recipient and lead.contact_info:
        comm.recipient = lead.contact_info

    await db.commit()
    await db.refresh(comm)
    return {
        "status": "success",
        "comm_id": comm.id,
        "subject": comm.subject,
        "body": comm.body,
        "personalization_summary": pitch_data["personalization_summary"]
    }

@router.post("/mission/{mission_id}/regenerate-drafts")
async def regenerate_mission_draft_pitches(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Regenerates all un-sent DRAFT/STAGED communications for a mission using the professional pitch generator.
    Preserves all SENT/DELIVERED communications untouched.
    """
    from app.services.communication.pitch_generator import pitch_generator
    stmt = (
        select(Communication, Lead)
        .outerjoin(Lead, Communication.lead_id == Lead.id)
        .where(
            Communication.mission_id == mission_id,
            Communication.delivery_status.in_(["DRAFT", "APPROVAL_REQUIRED", "PENDING"])
        )
    )
    results = (await db.execute(stmt)).all()
    
    regenerated_count = 0
    summaries = []
    for comm, lead in results:
        if lead:
            pitch_data = pitch_generator.generate_pitch(lead, channel=comm.channel)
            comm.subject = pitch_data["subject"]
            comm.body = pitch_data["body"]
            if not comm.recipient and lead.contact_info:
                comm.recipient = lead.contact_info
            regenerated_count += 1
            summaries.append(pitch_data["personalization_summary"])

    await db.commit()
    return {
        "status": "success",
        "mission_id": mission_id,
        "regenerated_count": regenerated_count,
        "summaries": summaries
    }

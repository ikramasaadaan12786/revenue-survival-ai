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

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


# =============================================================================
# BUSINESS USABILITY & ACTION CENTERS
# =============================================================================

class MarkContactedPayload(BaseModel):
    lead_id: int
    channel: str = "LinkedIn"
    notes: Optional[str] = None


class SendTestEmailPayload(BaseModel):
    recipient_email: str
    subject: Optional[str] = "Revenue Survival AI — Integration Test"
    body: Optional[str] = None


@router.get("/email-action-center")
async def get_email_action_center(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Returns high-level email outreach metrics, explicit blocker reasons, and queued/drafted items.
    """
    from app.services.intelligence.daily_excel_service import daily_excel_service
    from app.services.communication.pitch_generator import pitch_generator

    # Fetch mission leads
    stmt = select(Lead).options(selectinload(Lead.communications)).order_by(Lead.id.desc())
    if mission_id:
        stmt = stmt.where(Lead.mission_id == mission_id)
    
    leads = (await db.execute(stmt)).scalars().all()

    items = []
    ready_to_send = 0
    waiting_approval = 0
    sent_today = 0
    delivered = 0
    replies = 0
    failed = 0
    no_verified_email = 0

    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    for l in leads:
        # Ignore research/jobs/duplicates
        if l.classification in ["JOB_VACANCY", "RESEARCH_SIGNAL", "DUPLICATE", "REJECTED", "BLOG_ARTICLE", "SELLER_PROMO"]:
            continue

        email = daily_excel_service.extract_email(l)
        latest_comm = sorted(l.communications, key=lambda c: c.id or 0, reverse=True)[0] if l.communications else None

        pitch_data = pitch_generator.generate_pitch(l, channel="Email")
        subject = latest_comm.subject if (latest_comm and latest_comm.subject) else pitch_data["subject"]
        body = latest_comm.body if (latest_comm and latest_comm.body) else pitch_data["body"]

        if not email:
            status_str = "NO_VERIFIED_EMAIL"
            status_reason = "No verified direct email found on public profile (manual enrichment required)"
            no_verified_email += 1
        elif latest_comm:
            if latest_comm.delivery_status in ["DELIVERED", "READ"]:
                status_str = "DELIVERED"
                status_reason = "Delivered to recipient mailbox"
                delivered += 1
            elif latest_comm.delivery_status == "SENT":
                status_str = "SUBMITTED"
                status_reason = "Submitted to Resend email provider"
                if latest_comm.sent_at and latest_comm.sent_at.strftime("%Y-%m-%d") == today_str:
                    sent_today += 1
            elif latest_comm.delivery_status == "FAILED":
                status_str = "FAILED"
                status_reason = latest_comm.metadata_info.get("error", "Provider dispatch failed") if isinstance(latest_comm.metadata_info, dict) else "Delivery error"
                failed += 1
            elif latest_comm.approval_status == "PENDING":
                status_str = "WAITING_OWNER_APPROVAL"
                status_reason = "Draft ready — awaiting owner approval before sending"
                waiting_approval += 1
            elif latest_comm.approval_status == "APPROVED":
                status_str = "QUEUED"
                status_reason = "Approved — queued for cloud fast dispatcher"
                ready_to_send += 1
            else:
                status_str = "DRAFT"
                status_reason = "Personalized draft generated"
                ready_to_send += 1

            if latest_comm.reply_status in ["REPLIED", "POSITIVE", "NEUTRAL"]:
                replies += 1
        else:
            status_str = "DRAFT"
            status_reason = "Ready for owner review and dispatch"
            ready_to_send += 1

        items.append({
            "lead_id": l.id,
            "comm_id": latest_comm.id if latest_comm else None,
            "name": l.name or "Prospect",
            "company": l.company_name or "Direct Client",
            "requirement": l.interest or "",
            "recipient_email": email or "",
            "status": status_str,
            "status_reason": status_reason,
            "subject": subject,
            "body": body,
            "sent_at": latest_comm.sent_at.isoformat() if (latest_comm and latest_comm.sent_at) else None,
            "approval_status": latest_comm.approval_status if latest_comm else "PENDING",
            "source_url": l.source_url
        })

    return {
        "summary": {
            "ready_to_send": ready_to_send,
            "waiting_approval": waiting_approval,
            "sent_today": sent_today,
            "delivered": delivered,
            "replies": replies,
            "failed": failed,
            "no_verified_email": no_verified_email,
            "total_actionable": len(items)
        },
        "items": items
    }


@router.get("/linkedin-action-center")
async def get_linkedin_action_center(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Returns verified LinkedIn prospects with 1-click owner actions and honest API status.
    """
    from app.services.intelligence.daily_excel_service import daily_excel_service
    from app.services.communication.pitch_generator import pitch_generator
    from app.services.connectors.linkedin_oauth_service import OFFICIAL_SCOPES, linkedin_oauth_service

    # Check OAuth connection
    is_connected = bool(linkedin_oauth_service.get_client_id())

    stmt = select(Lead).order_by(Lead.id.desc())
    if mission_id:
        stmt = stmt.where(Lead.mission_id == mission_id)

    leads = (await db.execute(stmt)).scalars().all()

    prospects = []
    for l in leads:
        if l.classification in ["JOB_VACANCY", "RESEARCH_SIGNAL", "DUPLICATE", "REJECTED", "BLOG_ARTICLE", "SELLER_PROMO"]:
            continue

        linkedin_url = daily_excel_service.extract_linkedin_url(l)
        if not linkedin_url and "linkedin" not in (l.source or "").lower() and not l.profile_url:
            continue

        url = linkedin_url or l.profile_url or ""
        msg = daily_excel_service.generate_recommended_linkedin_note(l)

        prospects.append({
            "lead_id": l.id,
            "name": l.name or "LinkedIn Member",
            "company": l.company_name or "Enterprise",
            "profile_url": url,
            "requirement": l.interest or "",
            "suggested_message": msg,
            "contact_status": "CONTACTED" if l.status in ["CONTACTED", "REPLIED", "MEETING", "WON"] else "TO_CONTACT",
            "discovery_time": l.discovery_timestamp.isoformat() if l.discovery_timestamp else None,
            "source_url": l.source_url
        })

    return {
        "connection_status": {
            "authenticated": is_connected,
            "scopes": OFFICIAL_SCOPES,
            "automated_dm_api_available": False,
            "status_label": "CONNECTED — AUTOMATED DM API NOT AVAILABLE",
            "explanation": "LinkedIn OAuth grants profile data and social feed publishing. Direct 1-on-1 member messaging requires LinkedIn Enterprise Partner tier. Use the 1-click action buttons below to open the prospect profile and paste your personalized note."
        },
        "prospects_count": len(prospects),
        "prospects": prospects
    }


@router.get("/action-required")
async def get_action_required(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Consolidates all pending owner actions into one unified screen.
    """
    from app.services.intelligence.daily_excel_service import daily_excel_service
    from app.services.communication.pitch_generator import pitch_generator

    stmt = select(Lead).options(selectinload(Lead.communications)).order_by(Lead.id.desc())
    if mission_id:
        stmt = stmt.where(Lead.mission_id == mission_id)
    
    leads = (await db.execute(stmt)).scalars().all()

    emails_waiting_approval = []
    linkedin_prospects = []
    platform_prospects = []
    leads_needing_review = []
    replies_needing_response = []
    proposals_needing_approval = []

    for l in leads:
        if l.classification in ["JOB_VACANCY", "RESEARCH_SIGNAL", "DUPLICATE", "REJECTED", "BLOG_ARTICLE", "SELLER_PROMO"]:
            continue

        email = daily_excel_service.extract_email(l)
        linkedin_url = daily_excel_service.extract_linkedin_url(l)
        latest_comm = sorted(l.communications, key=lambda c: c.id or 0, reverse=True)[0] if l.communications else None

        # 1. Emails waiting approval
        if email and latest_comm and latest_comm.approval_status == "PENDING" and latest_comm.delivery_status not in ["SENT", "DELIVERED"]:
            emails_waiting_approval.append({
                "lead_id": l.id,
                "comm_id": latest_comm.id,
                "name": l.name or "Prospect",
                "company": l.company_name or "Client",
                "email": email,
                "subject": latest_comm.subject,
                "body": latest_comm.body
            })

        # 2. LinkedIn prospects to contact
        if linkedin_url and l.status not in ["CONTACTED", "REPLIED", "MEETING", "WON"]:
            linkedin_prospects.append({
                "lead_id": l.id,
                "name": l.name or "LinkedIn Prospect",
                "company": l.company_name,
                "profile_url": linkedin_url,
                "requirement": l.interest,
                "suggested_message": daily_excel_service.generate_recommended_linkedin_note(l)
            })

        # 3. Platform prospects to contact (e.g. Reddit, Telegram)
        if any(p in (l.source or l.source_platform or "").lower() for p in ["reddit", "telegram"]) and not email and l.status not in ["CONTACTED", "REPLIED", "MEETING", "WON"]:
            pitch = pitch_generator.generate_pitch(l, channel="Manual")
            platform_prospects.append({
                "lead_id": l.id,
                "platform": l.source_platform or l.source or "Platform",
                "name": l.name or "Member",
                "source_url": l.source_url or l.profile_url,
                "requirement": l.interest,
                "suggested_response": pitch.get("body", "")
            })

        # 4. Leads needing review
        if l.verification_status == "NEEDS_REVIEW":
            leads_needing_review.append({
                "lead_id": l.id,
                "name": l.name or "Unverified Lead",
                "company": l.company_name,
                "requirement": l.interest,
                "source": l.source_platform or l.source,
                "source_url": l.source_url
            })

        # 5. Replies needing response
        if latest_comm and latest_comm.reply_status in ["REPLIED", "POSITIVE"]:
            replies_needing_response.append({
                "lead_id": l.id,
                "comm_id": latest_comm.id,
                "name": l.name,
                "company": l.company_name,
                "reply_content": latest_comm.reply_content or "Inbound reply received",
                "channel": latest_comm.channel
            })

    total_count = (
        len(emails_waiting_approval) +
        len(linkedin_prospects) +
        len(platform_prospects) +
        len(leads_needing_review) +
        len(replies_needing_response) +
        len(proposals_needing_approval)
    )

    return {
        "total_actions_count": total_count,
        "emails_waiting_approval": emails_waiting_approval,
        "linkedin_prospects": linkedin_prospects,
        "platform_prospects": platform_prospects,
        "leads_needing_review": leads_needing_review,
        "replies_needing_response": replies_needing_response,
        "proposals_needing_approval": proposals_needing_approval
    }


@router.post("/mark-contacted")
async def mark_lead_contacted(payload: MarkContactedPayload, db: AsyncSession = Depends(get_db)):
    """
    Marks a prospect as contacted via manual action (LinkedIn, Platform, Phone) with timestamp and notes.
    """
    lead = await db.get(Lead, payload.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.status = "CONTACTED"
    if payload.notes:
        lead.notes = f"{lead.notes or ''}\n[Contacted on {payload.channel}]: {payload.notes}".strip()

    # Create or update communication record
    comm = Communication(
        lead_id=lead.id,
        mission_id=lead.mission_id,
        channel=payload.channel,
        recipient=lead.contact_info or lead.name or "Prospect",
        subject=f"Manual Outreach via {payload.channel}",
        body=payload.notes or f"Outreach initiated via {payload.channel}",
        approval_status="APPROVED",
        delivery_status="DELIVERED",
        sent_at=datetime.utcnow()
    )
    db.add(comm)
    await db.commit()
    await db.refresh(lead)

    return {
        "status": "SUCCESS",
        "lead_id": lead.id,
        "lead_status": lead.status,
        "channel": payload.channel,
        "message": f"Lead #{lead.id} marked as contacted via {payload.channel}."
    }


@router.post("/send-test-email")
async def send_test_email(payload: SendTestEmailPayload, db: AsyncSession = Depends(get_db)):
    """
    Sends a safe test verification email via Resend to confirm outgoing SMTP / API credentials.
    """
    import os
    import resend

    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="RESEND_API_KEY is not configured.")

    from_domain = os.getenv("EMAIL_SENDING_DOMAIN", "resend.dev").strip()
    from_email = os.getenv("EMAIL_FROM", f"Revenue AI <onboarding@{from_domain}>")

    resend.api_key = api_key
    body = payload.body or f"Hello,\n\nThis is a live test verification from Revenue Survival AI.\nResend outbound delivery is functional.\n\nTime: {datetime.utcnow().isoformat()} UTC"

    try:
        r = resend.Emails.send({
            "from": from_email,
            "to": payload.recipient_email,
            "subject": payload.subject,
            "text": body
        })
        return {
            "status": "SUCCESS",
            "provider_message_id": r.get("id"),
            "recipient": payload.recipient_email,
            "from": from_email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resend delivery error: {str(e)}")


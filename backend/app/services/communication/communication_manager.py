import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.entities import Communication, Lead, Mission
from app.services.communication.base_provider import MessagePayload, ProviderResponse
from app.services.communication.whatsapp_provider import whatsapp_provider
from app.services.communication.twilio_provider import twilio_provider
from app.services.communication.email_provider import email_provider
from app.services.communication.templates import template_engine
from app.agents.sales_assistant import SalesAssistantAgent

class CommunicationManager:
    """
    Unified Communication Orchestrator:
    - Provider Abstraction (WhatsApp Business -> Twilio Fallback -> SendGrid Email)
    - Template Engine Resolution
    - Zero-Ad-Spend Safety Approval Verification
    - Live Delivery Tracking & Inbound Webhook Reply Routing
    """
    def __init__(self):
        self.sales_agent = SalesAssistantAgent()

    async def dispatch_approved_communication(
        self,
        session: AsyncSession,
        communication_id: int
    ) -> Dict[str, Any]:
        comm = await session.get(Communication, communication_id)
        if not comm:
            return {"status": "error", "message": "Communication record not found"}

        if comm.approval_status != "APPROVED":
            return {
                "status": "error",
                "message": f"Cannot dispatch: Approval status is {comm.approval_status}. Human approval required."
            }

        lead = await session.get(Lead, comm.lead_id)
        recipient_contact = (lead.contact_info if lead and lead.contact_info else "+971501234567")
        recipient_name = lead.name if lead else "Valued Client"

        payload = MessagePayload(
            recipient=recipient_contact,
            recipient_name=recipient_name,
            body=comm.body,
            subject=comm.subject,
            metadata={"mission_id": comm.mission_id, "comm_id": comm.id}
        )

        # Provider routing logic
        provider_resp: ProviderResponse = None
        if comm.channel.lower() in ["whatsapp", "sms"]:
            # Primary: WhatsApp Business API
            provider_resp = await whatsapp_provider.send_message(payload)
            if not provider_resp.success:
                # Fallback: Twilio
                provider_resp = await twilio_provider.send_message(payload)
        elif comm.channel.lower() == "email":
            provider_resp = await email_provider.send_message(payload)
        else:
            # Default to WhatsApp
            provider_resp = await whatsapp_provider.send_message(payload)

        # Update communication tracking
        comm.provider_name = provider_resp.provider
        comm.provider_message_id = provider_resp.provider_message_id
        comm.delivery_status = provider_resp.status
        comm.sent_at = datetime.datetime.utcnow()
        if provider_resp.status == "DELIVERED":
            comm.delivered_at = datetime.datetime.utcnow()

        # Update CRM Lead Stage
        if lead:
            lead.status = "CONTACTED"

        await session.commit()
        await session.refresh(comm)

        return {
            "status": "success" if provider_resp.success else "failed",
            "communication_id": comm.id,
            "provider": provider_resp.provider,
            "provider_message_id": provider_resp.provider_message_id,
            "delivery_status": comm.delivery_status,
            "lead_id": lead.id if lead else None,
            "lead_name": recipient_name
        }

    async def handle_inbound_webhook_reply(
        self,
        session: AsyncSession,
        provider: str,
        sender_phone_or_email: str,
        message_text: str,
        provider_message_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Receives inbound replies from WhatsApp / Twilio / Email webhooks.
        Matches lead, advances CRM pipeline stage to REPLIED / QUALIFIED, and generates AI sales response.
        """
        # Find lead matching phone or email
        clean_sender = sender_phone_or_email.replace("+", "").replace("whatsapp:", "").strip()
        lead_stmt = select(Lead).where(
            (Lead.contact_info.ilike(f"%{clean_sender}%")) | 
            (Lead.name.ilike(f"%{clean_sender}%"))
        )
        lead = (await session.execute(lead_stmt)).scalars().first()

        # Find latest communication
        comm = None
        if lead:
            comm_stmt = select(Communication).where(
                Communication.lead_id == lead.id
            ).order_by(Communication.id.desc())
            comm = (await session.execute(comm_stmt)).scalars().first()

        if comm:
            comm.response_received = message_text
            comm.delivery_status = "REPLIED"
            comm.read_at = datetime.datetime.utcnow()

        ai_sales_analysis = None
        if lead:
            lead.status = "REPLIED"
            # Autonomous AI Sales Assistant response generation
            sales_result = await self.sales_agent.execute_task(session, lead.mission_id, {
                "lead_id": lead.id,
                "message": message_text
            })
            ai_sales_analysis = sales_result.get("summary")
            lead.notes = (lead.notes or "") + f" | [Inbound Reply]: '{message_text}' | AI Analysis: {ai_sales_analysis}"

        await session.commit()

        return {
            "status": "success",
            "matched_lead_id": lead.id if lead else None,
            "matched_lead_name": lead.name if lead else "Unknown",
            "message_received": message_text,
            "ai_sales_analysis": ai_sales_analysis
        }

    async def update_delivery_status(
        self,
        session: AsyncSession,
        provider_message_id: str,
        status: str
    ) -> bool:
        stmt = select(Communication).where(Communication.provider_message_id == provider_message_id)
        comm = (await session.execute(stmt)).scalars().first()
        if not comm:
            return False

        comm.delivery_status = status.upper()
        if status.upper() == "DELIVERED":
            comm.delivered_at = datetime.datetime.utcnow()
        elif status.upper() == "READ":
            comm.read_at = datetime.datetime.utcnow()

        await session.commit()
        return True

communication_manager = CommunicationManager()

import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Communication, Lead, Mission, Offer
from app.services.llm_engine import llm_engine

class OutreachAutomationEngine:
    """
    Outreach Automation & Multi-Step Follow-Up Engine:
    - Generates 3-step sequences: Step 1 (Initial Pitch), Step 2 (T+24h Value Brief), Step 3 (T+48h Scarcity Close)
    - Staged in Human Approval Queue before delivery
    - Automatically updates Lead status to CONTACT_READY and logs timeline
    """

    async def generate_full_outreach_sequence(
        self, session: AsyncSession, mission_id: int, lead_id: int
    ) -> List[Communication]:
        lead = await session.get(Lead, lead_id)
        if not lead:
            return []

        offer_stmt = select(Offer).where(Offer.mission_id == mission_id)
        offer = (await session.execute(offer_stmt)).scalars().first()
        product_name = offer.product_name if offer else "Dubai Distress Deal Intelligence"

        from app.services.communication.pitch_generator import pitch_generator, OFFICIAL_WHATSAPP_NUMBER
        pitch_data = pitch_generator.generate_pitch(lead, channel=lead.channel)
        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

        # Step 1: Initial Conversational Pitch
        comm1 = Communication(
            mission_id=mission_id,
            lead_id=lead.id,
            channel=lead.channel or "Email",
            message_type="INITIAL_PITCH",
            sequence_step=1,
            subject=pitch_data["subject"],
            body=pitch_data["body"],
            recipient=lead.contact_info,
            requires_approval=True,
            approval_status="PENDING",
            delivery_status="DRAFT",
            scheduled_for=now
        )
        session.add(comm1)

        # Step 2: T+24h Professional Follow-up
        s2_body = (
            f"Hi {lead.name},\n\n"
            f"Following up on our previous note regarding {lead.interest or 'your requirement'}.\n\n"
            f"If you are still reviewing options, I’d be happy to coordinate a brief conversation or share relevant scope details.\n\n"
            f"Please feel free to reply with a convenient time to speak, or connect with us on WhatsApp at {OFFICIAL_WHATSAPP_NUMBER}.\n\n"
            f"Best regards,\n"
            f"Business Development Team"
        )
        comm2 = Communication(
            mission_id=mission_id,
            lead_id=lead.id,
            channel=lead.channel or "Email",
            message_type="FOLLOW_UP_1",
            sequence_step=2,
            subject=f"Following Up on Your Requirement — {lead.company_name or lead.name}",
            body=s2_body,
            recipient=lead.contact_info,
            requires_approval=True,
            approval_status="PENDING",
            delivery_status="DRAFT",
            scheduled_for=now + datetime.timedelta(hours=24)
        )
        session.add(comm2)

        # Step 3: T+48h Final Professional Touch
        s3_body = (
            f"Hi {lead.name},\n\n"
            f"Just checking in to ensure you have what you need regarding {lead.interest or 'your requirement'}.\n\n"
            f"If your timing has shifted, no problem at all. We are available whenever you are ready to explore next steps.\n\n"
            f"WhatsApp: {OFFICIAL_WHATSAPP_NUMBER}\n\n"
            f"Best regards,\n"
            f"Business Development Team"
        )
        comm3 = Communication(
            mission_id=mission_id,
            lead_id=lead.id,
            channel=lead.channel or "Email",
            message_type="FOLLOW_UP_2",
            sequence_step=3,
            subject=f"Checking In: {lead.company_name or lead.name}",
            body=s3_body,
            recipient=lead.contact_info,
            requires_approval=True,
            approval_status="PENDING",
            delivery_status="DRAFT",
            scheduled_for=now + datetime.timedelta(hours=48)
        )
        session.add(comm3)

        lead.status = "CONTACT_READY"
        await session.commit()
        return [comm1, comm2, comm3]

    async def create_campaign_for_mission(
        self,
        session: AsyncSession,
        mission_id: int,
        lead_ids: Optional[List[int]] = None,
        target_intent: Optional[str] = "Hot",
        custom_pitch_angle: Optional[str] = None
    ) -> Dict[str, Any]:
        """Creates full 3-step outreach campaigns across target leads in a mission."""
        if lead_ids:
            stmt = select(Lead).where(Lead.mission_id == mission_id, Lead.id.in_(lead_ids))
        elif target_intent:
            stmt = select(Lead).where(Lead.mission_id == mission_id, Lead.intent_score == target_intent)
        else:
            stmt = select(Lead).where(Lead.mission_id == mission_id)

        res = await session.execute(stmt)
        leads = res.scalars().all()

        total_sequences = 0
        total_steps = 0
        for lead in leads:
            seq = await self.generate_full_outreach_sequence(session, mission_id, lead.id)
            total_sequences += 1
            total_steps += len(seq)

        return {
            "status": "success",
            "campaign_target_leads": len(leads),
            "total_sequences_created": total_sequences,
            "total_messages_staged": total_steps,
            "approval_required": True
        }

    async def get_follow_up_pipeline(self, session: AsyncSession, mission_id: int) -> List[Dict[str, Any]]:
        """Retrieves comprehensive follow-up tracking matrix across all active leads."""
        stmt = select(Lead).where(Lead.mission_id == mission_id).order_by(Lead.id.desc())
        leads = (await session.execute(stmt)).scalars().all()

        pipeline = []
        for lead in leads:
            c_stmt = select(Communication).where(Communication.lead_id == lead.id).order_by(Communication.sequence_step)
            comms = (await session.execute(c_stmt)).scalars().all()

            steps = [
                {
                    "id": c.id,
                    "step": c.sequence_step,
                    "type": c.message_type,
                    "channel": c.channel,
                    "subject": c.subject,
                    "body": c.body,
                    "approval_status": c.approval_status,
                    "delivery_status": c.delivery_status,
                    "scheduled_for": c.scheduled_for.isoformat() if c.scheduled_for else None,
                    "sent_at": c.sent_at.isoformat() if c.sent_at else None
                }
                for c in comms
            ]

            pipeline.append({
                "lead_id": lead.id,
                "lead_name": lead.name,
                "lead_country": lead.country,
                "intent_score": lead.intent_score,
                "channel": lead.channel,
                "crm_status": lead.status,
                "steps_count": len(steps),
                "steps": steps
            })

        return pipeline

outreach_automation_engine = OutreachAutomationEngine()


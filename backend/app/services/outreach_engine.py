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

        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

        # Step 1: Initial Conversational Pitch
        s1_body = (
            f"Hi {lead.name},\n\n"
            f"I saw your note regarding {lead.interest or 'high-yield Dubai property investments'}. "
            f"We just compiled a curated dossier of 3 off-market distress allocations in Business Bay & Dubai Marina "
            f"yielding 8.5%+ net with post-handover payment terms.\n\n"
            f"Would it be helpful if I shared the 1-page financial breakdown with you here?"
        )
        comm1 = Communication(
            mission_id=mission_id,
            lead_id=lead.id,
            channel=lead.channel,
            message_type="INITIAL_PITCH",
            sequence_step=1,
            subject=f"Exclusive: 3 Distress Allocations in Business Bay (8.5% Net Yield)",
            body=s1_body,
            requires_approval=True,
            approval_status="PENDING",
            delivery_status="DRAFT",
            scheduled_for=now
        )
        session.add(comm1)

        # Step 2: T+24h Value Drop
        s2_body = (
            f"Hey {lead.name}, quick follow up on the {lead.country} investor brief. "
            f"One of the Waterfront 1BR allocations in Business Bay just had an additional 2% developer fee waiver approved. "
            f"Net rental ROI forecast is 8.8%.\n\n"
            f"Let me know if you want me to drop the payment schedule over WhatsApp."
        )
        comm2 = Communication(
            mission_id=mission_id,
            lead_id=lead.id,
            channel=lead.channel,
            message_type="FOLLOW_UP_1",
            sequence_step=2,
            subject=f"Update: 8.8% Net Yield + Fee Waiver on Business Bay Unit",
            body=s2_body,
            requires_approval=True,
            approval_status="PENDING",
            delivery_status="DRAFT",
            scheduled_for=now + datetime.timedelta(hours=24)
        )
        session.add(comm2)

        # Step 3: T+48h Scarcity Close
        s3_body = (
            f"Hi {lead.name}, closing out allocations for this week's distress tranche. "
            f"We have 1 remaining allocation before units return to standard retail broker pricing. "
            f"Shall I reserve the 10-minute briefing slot for you today?"
        )
        comm3 = Communication(
            mission_id=mission_id,
            lead_id=lead.id,
            channel=lead.channel,
            message_type="FOLLOW_UP_2",
            sequence_step=3,
            subject=f"Final Call: 1 Remaining Allocation in Distress Tranche",
            body=s3_body,
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


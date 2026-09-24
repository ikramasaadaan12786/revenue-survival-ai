import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.agents.base import BaseAgent
from app.models.entities import Lead, Offer, Communication, Mission, AgentMemory

class OutreachAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Outreach Agent",
            role="Drafts highly personalized WhatsApp scripts, emails, and LinkedIn messages with built-in human-in-the-loop safety approvals."
        )

    async def execute_task(self, session: AsyncSession, mission_id: int, parameters: Dict[str, Any]) -> Dict[str, Any]:
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        # Fetch leads without pending or approved communications
        leads_stmt = select(Lead).where(Lead.mission_id == mission_id)
        leads_res = await session.execute(leads_stmt)
        leads = leads_res.scalars().all()

        offer_stmt = select(Offer).where(Offer.mission_id == mission_id)
        offer_res = await session.execute(offer_stmt)
        offer = offer_res.scalars().first()

        created_comms = []
        for lead in leads:
            # Check if lead already has communication
            comm_check = await session.execute(
                select(Communication).where(Communication.lead_id == lead.id)
            )
            if comm_check.scalars().first():
                continue

            system_prompt = (
                f"You are the Outreach Agent specializing in ultra-personalized, respectful, zero-spam direct outreach. "
                f"Prospect: {lead.name} from {lead.country}. Channel: {lead.channel}. Interest: {lead.interest}. Intent: {lead.intent_score}. "
                f"Product/Offer: {offer.product_name if offer else 'Distress Investment Intelligence'} ({offer.pricing if offer else 299} AED). "
                f"Draft a short, irresistible, highly conversational message tailored to their specific interest and channel. "
                f"Return a strict JSON object with: {{subject, body}}."
            )
            user_prompt = f"Write the outreach script for {lead.name} on {lead.channel}."
            response_text = await self.llm.generate_completion(system_prompt, user_prompt)

            from app.services.communication.pitch_generator import pitch_generator
            pitch_data = pitch_generator.generate_pitch(lead, channel=lead.channel or "Email")
            subject = pitch_data["subject"]
            body = pitch_data["body"]

            comm = Communication(
                mission_id=mission_id,
                lead_id=lead.id,
                channel=lead.channel or "Email",
                message_type="INITIAL_PITCH",
                subject=subject,
                body=body,
                recipient=lead.contact_info,
                requires_approval=True,
                approval_status="PENDING",
                delivery_status="DRAFT"
            )
            session.add(comm)
            created_comms.append(comm)
            lead.status = "CONTACT_PENDING"

        # Memory update
        memory = AgentMemory(
            agent_name=self.name,
            category="LEARNING",
            key=f"outreach_drafted_m{mission_id}",
            value={"drafted_count": len(created_comms), "safety_rule": "Requires human operator approval prior to send"},
            confidence=0.98
        )
        session.add(memory)
        await session.commit()

        return {
            "status": "success",
            "drafts_created": len(created_comms),
            "summary": f"Drafted {len(created_comms)} tailored outreach messages queued for Human-in-the-Loop review."
        }

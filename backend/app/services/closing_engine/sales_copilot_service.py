from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Lead, Communication, Mission, Offer

class SalesCopilotService:
    """
    Sales Copilot Service.
    Generates tailored multi-touch closing sequences:
    - Client Summary
    - Pain Point Diagnosis
    - Recommended Solution
    - Opening Message
    - Follow-up Day 1
    - Follow-up Day 3
    - Closing Message
    
    All messages are staged into the CRM / Safety Approval Queue as PENDING APPROVAL.
    """

    def generate_closing_sequence(
        self,
        lead_name: str,
        company_name: Optional[str],
        requirement: str,
        industry: str,
        channel: str,
        offer_name: str,
        price_aed: float
    ) -> Dict[str, Any]:
        """
        Generates 4-touch conversion sequence tailored to the prospect.
        """
        company_ref = f" at {company_name}" if company_name else ""
        first_name = lead_name.split()[0] if lead_name else "there"
        price_str = f"{price_aed:,.0f} AED" if price_aed > 0 else "0% buyer fee model"

        # 1. Client Summary
        summary = (
            f"Decision maker {lead_name}{company_ref} active in {industry}. "
            f"Demonstrated high buying intent with requirement: '{requirement[:120]}'."
        )

        # 2. Pain Point Diagnosis
        if "ai" in requirement.lower() or "agent" in requirement.lower():
            pain_point = "Operational overhead and slow customer inquiry response times losing high-ticket clients to competitors."
            solution = f"Deploy {offer_name} ({price_str}) with bilingual WhatsApp routing to automate qualification and 24/7 booking."
        elif "website" in requirement.lower() or "portal" in requirement.lower():
            pain_point = "Outdated or non-existent web presence failing to establish high-trust institutional credibility with GCC buyers."
            solution = f"Build {offer_name} ({price_str}) with ultra-fast Next.js architecture and direct conversion funnels."
        elif "property" in requirement.lower() or "real estate" in requirement.lower():
            pain_point = "Navigating off-plan delays, market noise, and missing prime off-market units with favorable developer payment terms."
            solution = f"Provide VIP Dubai Investment Advisory with pre-allocated off-market allocations and cash-flow yield underwriting."
        elif "software" in requirement.lower() or "mvp" in requirement.lower():
            pain_point = "High risk of delayed product rollout and engineering budget bleed with traditional external agencies."
            solution = f"Deliver {offer_name} ({price_str}) with milestone-based rapid MVP deployment in under 21 days."
        else:
            pain_point = "Inconsistent inbound pipeline and lack of automated decision-maker outreach."
            solution = f"Execute {offer_name} ({price_str}) delivering 30+ qualified GCC sales conversations monthly."

        # 3. Message Sequence (Opening, Day 1, Day 3, Closing)
        if channel.upper() in ["WHATSAPP", "TELEGRAM"]:
            opening = (
                f"Hi {first_name}, saw your note regarding {requirement[:60]}. "
                f"We recently deployed a tailored {offer_name} for a UAE team that solved this exact bottleneck. "
                f"Are you free for a quick 5-min briefing on WhatsApp today?"
            )
            followup_day1 = (
                f"Hi {first_name}, following up on this—I put together a 1-page breakdown of the exact deliverables, "
                f"timeline, and {price_str} pricing structure. Should I send the PDF over here?"
            )
            followup_day3 = (
                f"Hey {first_name}, just checking in. We have an engineer allocated this week for {industry} deployments. "
                f"If you'd like to get this live before month-end, let me know and we can lock in the kickoff call."
            )
            closing_msg = (
                f"Hi {first_name}, wanted to check if you still plan to move forward with {requirement[:50]}? "
                f"If timing is pushed back, no worries at all—happy to revisit when you're ready."
            )
        elif channel.upper() == "LINKEDIN":
            opening = (
                f"Hi {first_name},\n\n"
                f"Came across your requirement for {requirement[:70]}. "
                f"We specialize in rapid deployment of {offer_name} across UAE & GCC markets with guaranteed turnaround.\n\n"
                f"Would you be open to a brief chat this week to review the scope and deliverables?"
            )
            followup_day1 = (
                f"Hi {first_name}, sharing quick context—our architecture allows us to deliver full implementation "
                f"in under 14 days with milestone payment protection ({price_str}).\n\n"
                f"Let me know if Thursday or Friday works better for a 10-minute discovery call."
            )
            followup_day3 = (
                f"Hi {first_name}, checking if you had a chance to review my previous message regarding the {offer_name}? "
                f"Happy to send over our case studies and live client demos."
            )
            closing_msg = (
                f"Hi {first_name}, closing the loop here in case your priorities have shifted. "
                f"Wishing you and {company_name or 'your team'} continued momentum."
            )
        else:  # EMAIL
            opening = (
                f"Subject: Solution for {company_name or lead_name}'s {industry} requirement\n\n"
                f"Dear {first_name},\n\n"
                f"I noticed your recent requirement: \"{requirement}\".\n\n"
                f"We help UAE founders and operators solve this directly with our {offer_name}. "
                f"We can deliver the complete system for {price_str} with verified milestone delivery.\n\n"
                f"Could we schedule a brief 10-minute introduction this week?"
            )
            followup_day1 = (
                f"Subject: Re: Solution for {company_name or lead_name}\n\n"
                f"Hi {first_name},\n\n"
                f"Following up with the scope overview for {offer_name}. "
                f"Key deliverables include full deployment, CRM integration, and 30-day post-launch warranty.\n\n"
                f"Would you have 10 minutes tomorrow afternoon?"
            )
            followup_day3 = (
                f"Subject: Implementation timeline for {company_name or lead_name}\n\n"
                f"Hi {first_name},\n\n"
                f"We are finalizing our deployment schedule for this cycle and have reserved a slot for your project. "
                f"Let me know if you would like to proceed with the discovery proposal."
            )
            closing_msg = (
                f"Subject: Checking in: {company_name or lead_name}\n\n"
                f"Hi {first_name},\n\n"
                f"I assume you might be occupied or solved this internally. "
                f"I will pause follow-ups for now, but please feel free to reach out whenever you need."
            )

        return {
            "client_summary": summary,
            "pain_point": pain_point,
            "recommended_solution": solution,
            "channel": channel,
            "opening_message": opening,
            "followup_day_1": followup_day1,
            "followup_day_3": followup_day3,
            "closing_message": closing_msg,
            "requires_approval": True,
            "approval_status": "PENDING"
        }

    async def stage_sales_copilot_sequence(
        self,
        session: AsyncSession,
        mission_id: int,
        lead_id: int
    ) -> Dict[str, Any]:
        """
        Generates sequence and stages all 4 messages into Communication table with approval_status="PENDING".
        """
        lead_res = await session.execute(select(Lead).where(Lead.id == lead_id))
        lead = lead_res.scalar_one_or_none()
        if not lead:
            return {"error": "Lead not found"}

        offer_name = "AI Revenue Acceleration Package"
        offer_price = lead.expected_value or 12500.0

        if lead.offer_id:
            off_res = await session.execute(select(Offer).where(Offer.id == lead.offer_id))
            off = off_res.scalar_one_or_none()
            if off:
                offer_name = off.product_name
                offer_price = off.pricing

        channel = lead.channel or "WhatsApp"
        seq = self.generate_closing_sequence(
            lead_name=lead.name,
            company_name=lead.company_name,
            requirement=lead.interest or "",
            industry=lead.country or "Dubai Business",
            channel=channel,
            offer_name=offer_name,
            price_aed=offer_price
        )

        # Stage 4 Communication records with PENDING approval
        messages_to_stage = [
            ("INITIAL_PITCH", 1, seq["opening_message"]),
            ("FOLLOW_UP_1", 2, seq["followup_day_1"]),
            ("FOLLOW_UP_3", 3, seq["followup_day_3"]),
            ("CLOSING_MESSAGE", 4, seq["closing_message"]),
        ]

        staged_ids = []
        for msg_type, step, body_text in messages_to_stage:
            comm = Communication(
                mission_id=mission_id,
                lead_id=lead_id,
                channel=channel,
                message_type=msg_type,
                sequence_step=step,
                body=body_text,
                requires_approval=True,
                approval_status="PENDING",
                delivery_status="DRAFT"
            )
            session.add(comm)
            await session.commit()
            await session.refresh(comm)
            staged_ids.append(comm.id)

        lead.pipeline_stage = "CONTACT_READY"
        lead.status = "CONTACT_READY"
        await session.commit()

        seq["staged_communication_ids"] = staged_ids
        return seq


sales_copilot_service = SalesCopilotService()

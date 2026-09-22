import datetime
import math
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import (
    Mission, Lead, Opportunity, RevenueOpportunity, Offer, Communication, Proposal, DailyCycleLog, RevenueTracking
)
from app.services.closing_engine.deal_qualifier import deal_qualification_engine
from app.services.closing_engine.offer_matcher import offer_matching_engine
from app.services.closing_engine.sales_copilot_service import sales_copilot_service
from app.services.proposal_generator import proposal_generator_service

class SalesManagerExecutionService:
    """
    Phase 14 Autonomous Revenue Execution Engine & AI Sales Manager.
    Directs the operational execution across:
    - Activity Quota Tracking (Messages, Calls, Proposals, Closed Deals)
    - Automated Daily Operating Cycle
    - Radar-to-Lead Conversion Engine
    - Deal Room CRM & Pipeline Stages
    - Proposal Desk Execution
    """

    async def get_mission_activity_tracker(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        """
        Calculates required vs completed metrics for real mission operations.
        """
        mission_res = await session.execute(select(Mission).where(Mission.id == mission_id))
        mission = mission_res.scalar_one_or_none()
        if not mission:
            return {"error": "Mission not found"}

        target_amount = float(mission.goal_amount or 2500.0)
        achieved_amount = float(mission.revenue_generated or 0.0)
        gap = max(0.0, target_amount - achieved_amount)

        # 1. Communications count
        comms_res = await session.execute(
            select(Communication).where(Communication.mission_id == mission_id)
        )
        all_comms = comms_res.scalars().all()
        messages_completed = len([c for c in all_comms if c.approval_status == "APPROVED" or c.delivery_status in ["SENT", "DELIVERED", "READ", "REPLIED"]])
        messages_pending = len([c for c in all_comms if c.approval_status == "PENDING"])

        # 2. Proposals count
        props_res = await session.execute(
            select(Proposal).where(Proposal.mission_id == mission_id)
        )
        all_props = props_res.scalars().all()
        proposals_completed = len(all_props)

        # 3. Leads & Deals count
        leads_res = await session.execute(
            select(Lead).where(Lead.mission_id == mission_id)
        )
        all_leads = leads_res.scalars().all()
        deals_closed = len([l for l in all_leads if (l.pipeline_stage or "").upper() == "WON" or l.status == "DEAL"])
        calls_completed = len([l for l in all_leads if (l.pipeline_stage or "").upper() in ["DISCOVERY_CALL", "MEETING", "NEGOTIATION", "CLOSING", "WON"]])

        # Activity Quotas:
        # Target AED 2500 needs 1-2 deals, 2 proposals, 3 calls, 8 messages
        deals_target = max(1, math.ceil(target_amount / 2500.0))
        proposals_required = deals_target * 2
        calls_required = proposals_required + 1
        messages_required = max(8, calls_required * 3)

        conversion_rate = round((deals_closed / len(all_leads) * 100.0), 1) if all_leads else 0.0

        return {
            "mission_id": mission_id,
            "mission_title": mission.title,
            "target_revenue_aed": target_amount,
            "achieved_revenue_aed": achieved_amount,
            "revenue_gap_aed": gap,
            "status": mission.status,
            "activity_tracker": {
                "messages": {
                    "required": messages_required,
                    "completed": messages_completed,
                    "pending_approval": messages_pending,
                    "progress_pct": min(100.0, round((messages_completed / messages_required) * 100, 1)) if messages_required else 0.0
                },
                "calls": {
                    "required": calls_required,
                    "completed": calls_completed,
                    "progress_pct": min(100.0, round((calls_completed / calls_required) * 100, 1)) if calls_required else 0.0
                },
                "proposals": {
                    "required": proposals_required,
                    "completed": proposals_completed,
                    "progress_pct": min(100.0, round((proposals_completed / proposals_required) * 100, 1)) if proposals_required else 0.0
                },
                "deals": {
                    "target": deals_target,
                    "closed": deals_closed,
                    "progress_pct": min(100.0, round((deals_closed / deals_target) * 100, 1)) if deals_target else 0.0
                }
            },
            "overall_execution_score": round((
                min(100.0, (messages_completed / max(1, messages_required)) * 25) +
                min(100.0, (calls_completed / max(1, calls_required)) * 25) +
                min(100.0, (proposals_completed / max(1, proposals_required)) * 25) +
                min(100.0, (deals_closed / max(1, deals_target)) * 25)
            ), 1),
            "conversion_rate_percent": conversion_rate
        }

    async def run_daily_operating_cycle(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        """
        Executes full autonomous operating cycle for AI Sales Manager:
        1. Qualifies all active leads
        2. Attaches tailored offers
        3. Stages outbound messages
        4. Logs execution cycle
        """
        leads_res = await session.execute(select(Lead).where(Lead.mission_id == mission_id))
        leads = leads_res.scalars().all()

        qualified_count = 0
        offers_attached = 0
        messages_staged = 0

        for l in leads:
            # 1. 5D Qualification
            qual = await deal_qualification_engine.qualify_and_upgrade_lead(session, l.id)
            if qual and qual["category"] != "REJECT":
                qualified_count += 1

                # 2. Offer Matching
                if not l.offer_id:
                    off = await offer_matching_engine.create_or_attach_offer_for_lead(session, mission_id, l.id)
                    if off:
                        offers_attached += 1

                # 3. Stage Sales Copilot Sequence
                seq = await sales_copilot_service.stage_sales_copilot_sequence(session, mission_id, l.id)
                if "staged_communication_ids" in seq:
                    messages_staged += len(seq["staged_communication_ids"])

        # Record daily cycle log
        log_entry = DailyCycleLog(
            mission_id=mission_id,
            cycle_date=datetime.date.today().isoformat(),
            phase="EXECUTION_SPRINT",
            summary=f"Execution Cycle completed: {qualified_count} leads verified, {offers_attached} offers linked, {messages_staged} messages held in Safety Gate.",
            metrics_snapshot={
                "leads_processed": len(leads),
                "qualified_leads": qualified_count,
                "offers_linked": offers_attached,
                "messages_staged": messages_staged,
                "total_pipeline_aed": sum(l.expected_value or 3500.0 for l in leads)
            },
            actions_taken=[
                "Ran 5D Lead Qualification",
                "Linked tailored commercial packages",
                "Staged multi-step closing copy into Safety Gate"
            ]
        )
        session.add(log_entry)
        await session.commit()

        tracker = await self.get_mission_activity_tracker(session, mission_id)

        return {
            "status": "success",
            "mission_id": mission_id,
            "leads_processed": len(leads),
            "qualified_leads": qualified_count,
            "offers_linked": offers_attached,
            "messages_staged_in_safety_gate": messages_staged,
            "activity_tracker": tracker["activity_tracker"],
            "execution_score": tracker["overall_execution_score"]
        }

    async def convert_radar_signal_to_lead(
        self,
        session: AsyncSession,
        mission_id: int,
        name: str,
        company: str,
        interest: str,
        source: str,
        country: str,
        budget: float,
        channel: str = "WhatsApp"
    ) -> Dict[str, Any]:
        """
        Converts any market radar signal directly into an active Lead with matched offer and staged sequence.
        """
        # Create Lead
        new_lead = Lead(
            mission_id=mission_id,
            name=name,
            company_name=company,
            interest=interest,
            source=source,
            country=country,
            channel=channel,
            estimated_budget=budget,
            expected_value=budget,
            pipeline_stage="QUALIFIED",
            status="AI_VERIFIED"
        )
        session.add(new_lead)
        await session.commit()
        await session.refresh(new_lead)

        # Qualify
        qual = await deal_qualification_engine.qualify_and_upgrade_lead(session, new_lead.id)

        # Attach offer
        offer = await offer_matching_engine.create_or_attach_offer_for_lead(session, mission_id, new_lead.id)

        # Stage copilot sequence
        seq = await sales_copilot_service.stage_sales_copilot_sequence(session, mission_id, new_lead.id)

        return {
            "status": "success",
            "lead_id": new_lead.id,
            "name": new_lead.name,
            "classification": new_lead.classification,
            "qualification_score": new_lead.qualification_score,
            "offer_id": offer.id if offer else None,
            "offer_name": offer.product_name if offer else "B2B Outbound Engine",
            "staged_messages": seq.get("staged_communication_ids", [])
        }

    async def get_deal_room_crm(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        """
        Returns full Deal Room CRM board data with grouped stages and weighted revenue values.
        """
        leads_res = await session.execute(
            select(Lead).where(Lead.mission_id == mission_id).order_by(Lead.id.desc())
        )
        leads = leads_res.scalars().all()

        offers_res = await session.execute(
            select(Offer).where(Offer.mission_id == mission_id)
        )
        offers_map = {o.id: o for o in offers_res.scalars().all()}

        stages = {
            "QUALIFIED": [],
            "CONTACTED": [],
            "DISCOVERY_CALL": [],
            "PROPOSAL_SENT": [],
            "NEGOTIATION": [],
            "WON": []
        }

        total_pipeline = 0.0
        weighted_pipeline = 0.0

        for l in leads:
            st = (l.pipeline_stage or "QUALIFIED").upper()
            if st not in stages:
                if st in ["DISCOVERED", "OFFER_CREATED", "CONTACT_PENDING"]:
                    st = "QUALIFIED"
                elif st in ["FOLLOW_UP", "OBJECTION"]:
                    st = "NEGOTIATION"
                elif st in ["CLOSING", "PAYMENT_PENDING"]:
                    st = "NEGOTIATION"
                else:
                    st = "QUALIFIED"

            val = float(l.expected_value or l.estimated_budget or 3500.0)
            prob = float(l.revenue_probability or 0.65)
            weighted = round(val * prob, 2)
            total_pipeline += val
            weighted_pipeline += weighted

            off = offers_map.get(l.offer_id)

            stages[st].append({
                "id": l.id,
                "name": l.name,
                "company": l.company_name or "Direct Entity",
                "source": l.source or "CONNECTORS",
                "industry": l.country or "AI & Automation",
                "deal_value": val,
                "closing_probability": prob,
                "weighted_value": weighted,
                "classification": l.classification or "QUALIFIED",
                "qualification_score": l.qualification_score or 75.0,
                "offer_name": off.product_name if off else "B2B Autonomous Outbound Engine",
                "channel": l.channel or "WhatsApp",
                "stage": st
            })

        return {
            "mission_id": mission_id,
            "total_deals": len(leads),
            "total_pipeline_value_aed": round(total_pipeline, 2),
            "total_weighted_pipeline_aed": round(weighted_pipeline, 2),
            "stages": stages
        }

sales_manager_execution_service = SalesManagerExecutionService()

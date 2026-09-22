from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Lead, RevenueOpportunity, Proposal, Mission

class AutonomousPriorityEngine:
    """
    Autonomous Priority Engine.
    Calculates the Top 10 Daily Highest-Impact Actions across all active opportunities and leads.
    Ranking Formula:
      Score = (Deal Value AED) x (Closing Probability) x (Urgency Weight: 1.0 to 1.5)
    """

    async def calculate_top_priorities(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        leads_query = select(Lead)
        if mission_id:
            leads_query = leads_query.where(Lead.mission_id == mission_id)

        leads = (await session.execute(leads_query)).scalars().all()
        active_leads = [l for l in leads if (l.pipeline_stage or "").upper() not in ["WON", "LOST"]]

        actions = []

        for lead in active_leads:
            val = float(lead.expected_value or 5000.0)
            prob = float(lead.revenue_probability or 0.65)
            qual = float(lead.qualification_score or 75.0)

            # Urgency multiplier
            urgency_mult = 1.3 if qual >= 80.0 or (lead.intent_score or "").lower() == "hot" else 1.0
            priority_score = round(val * prob * urgency_mult, 2)

            # Determine action type and text
            stage = (lead.pipeline_stage or "NEW").upper()
            if stage in ["NEW", "DISCOVERED", "QUALIFIED"]:
                action_title = f"Dispatch tailored {lead.channel} opening pitch"
                action_type = "OUTREACH"
            elif stage in ["CONTACT_READY", "CONTACTED"]:
                action_title = f"Follow up on 1-page solution breakdown"
                action_type = "FOLLOW_UP"
            elif stage in ["DISCOVERY_CALL", "MEETING", "REPLIED"]:
                action_title = f"Conduct 10-min discovery briefing call"
                action_type = "CALL"
            elif stage in ["PROPOSAL_SENT", "NEGOTIATION"]:
                action_title = f"Present commercial closing terms & secure 50% deposit"
                action_type = "CLOSING"
            else:
                action_title = f"Engage decision maker on {lead.channel}"
                action_type = "OUTREACH"

            actions.append({
                "lead_id": lead.id,
                "mission_id": lead.mission_id,
                "prospect_name": lead.name,
                "company": lead.company_name or "Direct Decision Maker",
                "channel": lead.channel or "WhatsApp",
                "action_title": action_title,
                "action_type": action_type,
                "deal_value_aed": val,
                "closing_probability": prob,
                "qualification_score": qual,
                "priority_score": priority_score,
                "recommendation_reason": f"High potential deal ({val:,.0f} AED) with {int(prob*100)}% closing probability on {lead.channel}."
            })

        # Sort descending by priority score
        actions.sort(key=lambda x: x["priority_score"], reverse=True)

        # Assign ranks 1 to 10
        top_10 = actions[:10]
        for idx, act in enumerate(top_10):
            act["rank"] = idx + 1

        return top_10


priority_engine = AutonomousPriorityEngine()

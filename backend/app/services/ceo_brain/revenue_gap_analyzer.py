import math
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, Lead, Proposal, RevenueTracking

class RevenueGapAnalyzer:
    """
    Revenue Gap Analysis Engine.
    Calculates:
      Target Revenue - Confirmed Revenue - Weighted Active Pipeline = Net Revenue Gap
    Prescribes exact quantitative actions needed to close the remaining gap:
      - Required Qualified Leads
      - Required Proposals
      - Required Discovery Calls
      - Required Closing Velocity (AED/hour)
    """

    async def analyze_mission_gap(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        mission_res = await session.execute(select(Mission).where(Mission.id == mission_id))
        mission = mission_res.scalar_one_or_none()
        if not mission:
            return {"error": "Mission not found"}

        leads_res = await session.execute(
            select(Lead).where(
                Lead.mission_id == mission_id,
                Lead.source_type == "REAL",
                Lead.verification_status == "VERIFIED"
            )
        )
        leads = leads_res.scalars().all()

        target_amount = float(mission.goal_amount or 2500.0)
        confirmed_revenue = float(mission.revenue_generated or 0.0)
        
        # Calculate active weighted pipeline strictly from real leads
        active_leads = [l for l in leads if (l.pipeline_stage or "").upper() not in ["WON", "LOST"]]
        weighted_pipeline = sum(
            (float(l.expected_value or l.estimated_budget or 0.0)) * (float(l.revenue_probability or 0.60)) 
            for l in active_leads
        )
        total_raw_pipeline = sum(float(l.expected_value or l.estimated_budget or 0.0) for l in active_leads)

        nominal_gap = max(0.0, target_amount - confirmed_revenue)
        # Net gap factoring in weighted active pipeline conversion expectancy
        net_gap = max(0.0, nominal_gap - weighted_pipeline)

        deadline_hours = float(mission.deadline_hours or 72)
        velocity_required = round(nominal_gap / deadline_hours, 2) if deadline_hours > 0 else 0.0

        # Mathematical reverse-calc based on target & gap
        avg_deal_size = 5000.0
        active_gap = net_gap if net_gap > 0 else nominal_gap
        deals_needed = max(1, math.ceil(active_gap / avg_deal_size)) if active_gap > 0 else 0
        proposals_needed = deals_needed * 2
        calls_needed = proposals_needed * 2
        leads_needed = calls_needed * 2

        if net_gap > 0:
            action_summary = (
                f"To close the remaining net gap of {net_gap:,.0f} {mission.currency}: "
                f"Need {leads_needed} more qualified leads -> {calls_needed} discovery calls -> "
                f"{proposals_needed} proposals -> {deals_needed} closing deals."
            )
        elif nominal_gap > 0:
            action_summary = (
                f"Active pipeline of {weighted_pipeline:,.0f} {mission.currency} covers nominal gap of {nominal_gap:,.0f} {mission.currency}. "
                f"Required: Advance {proposals_needed} active proposals and conduct {deals_needed} closing calls to confirm revenue."
            )
        else:
            action_summary = f"Mission target of {target_amount:,.0f} {mission.currency} is 100% achieved! Maintain nurturing workflows."

        return {
            "mission_id": mission_id,
            "target_revenue_aed": target_amount,
            "confirmed_revenue_aed": confirmed_revenue,
            "nominal_revenue_gap_aed": round(nominal_gap, 2),
            "raw_pipeline_value_aed": total_raw_pipeline,
            "weighted_pipeline_value_aed": round(weighted_pipeline, 2),
            "net_revenue_gap_aed": round(net_gap, 2),
            "deadline_hours": deadline_hours,
            "required_velocity_aed_per_hour": velocity_required,
            "required_qualified_leads": leads_needed if net_gap > 0 else 0,
            "required_discovery_calls": calls_needed,
            "required_proposals": proposals_needed,
            "required_closing_deals": deals_needed,
            "action_summary": action_summary
        }


revenue_gap_analyzer = RevenueGapAnalyzer()

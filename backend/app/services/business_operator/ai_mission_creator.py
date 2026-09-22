import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, Lead, RevenueOpportunity
from app.services.ceo_brain.industry_intelligence import industry_intelligence
from app.services.ceo_brain.source_intelligence import source_intelligence

class AIMissionCreator:
    """
    AI Mission Creator:
    Autonomously analyzes market signals, industry conversion velocity,
    channel attribution, and revenue gaps to synthesize optimized Revenue Missions.
    """

    async def generate_mission_blueprint(
        self,
        session: AsyncSession,
        market_focus_override: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Analyze industry performance & source ROI
        ind_metrics = await industry_intelligence.analyze_industry_performance(session)
        src_metrics = await source_intelligence.analyze_sources(session)

        best_ind = ind_metrics[0].get("industry", "AI Agents & Automation") if ind_metrics else "AI Agents & Automation"
        second_ind = ind_metrics[1].get("industry", "Dubai Real Estate & Advisory") if len(ind_metrics) > 1 else "Dubai Real Estate & Advisory"
        
        top_source = (src_metrics[0].get("source_name") or "telegram").lower() if src_metrics else "telegram"
        second_source = (src_metrics[1].get("source_name") or "linkedin").lower() if len(src_metrics) > 1 else "linkedin"

        industry_selection = [best_ind, second_ind] if not market_focus_override else [market_focus_override]
        source_selection = [top_source, second_source, "instagram", "web_search"]

        # 2. Determine target revenue & timeframe based on sector potential
        if "AI Agents" in best_ind or "Automation" in best_ind:
            target_amount = 25000.0
            duration_days = 7
            mission_name = "UAE AI Automation & Agent Revenue Sprint"
            strategy_summary = "High-velocity acquisition targeting SME founders with 7-day delivery AI Agent packages."
            confidence = 92.0
        elif "Real Estate" in best_ind or "Investor" in best_ind:
            target_amount = 100000.0
            duration_days = 14
            mission_name = "Dubai Off-Market Investor & Prime Property Sprint"
            strategy_summary = "Direct advisory outreach to high-net-worth investors across Telegram and Instagram."
            confidence = 94.0
        elif "Software" in best_ind:
            target_amount = 45000.0
            duration_days = 10
            mission_name = "UAE Custom Software & Workflow MVP Sprint"
            strategy_summary = "Target corporate operations leaders needing bespoke internal software and workflow tools."
            confidence = 88.0
        else:
            target_amount = 20000.0
            duration_days = 7
            mission_name = f"Autonomous {best_ind} Growth Sprint"
            strategy_summary = "Accelerated multi-channel outbound to capture qualified demand."
            confidence = 86.0

        rationale = (
            f"Synthesized from {best_ind} yielding top conversion velocity and {top_source.upper()} "
            f"delivering maximum deal volume. Expected high ROI closing cadence."
        )

        return {
            "mission_name": mission_name,
            "goal_amount": target_amount,
            "currency": "AED",
            "deadline_hours": duration_days * 24,
            "selected_industries": industry_selection,
            "selected_sources": source_selection,
            "strategy_summary": strategy_summary,
            "creation_rationale": rationale,
            "confidence_score": confidence,
            "expected_revenue_aed": target_amount,
            "estimated_leads_needed": int(target_amount / 2500),
            "generated_at": datetime.datetime.utcnow().isoformat()
        }

    async def create_autonomous_mission(
        self,
        session: AsyncSession,
        blueprint_override: Optional[Dict[str, Any]] = None
    ) -> Mission:
        blueprint = blueprint_override or await self.generate_mission_blueprint(session)

        selected_inds = blueprint.get("selected_industries", ["AI Agents & Automation"])
        mission = Mission(
            title=blueprint["mission_name"],
            ai_strategy=blueprint["strategy_summary"],
            goal_amount=blueprint["goal_amount"],
            currency=blueprint.get("currency", "AED"),
            revenue_generated=0.0,
            deadline_hours=blueprint.get("deadline_hours", 168),
            status="ACTIVE",
            industry=selected_inds[0] if selected_inds else "AI Agents & Automation",
            industries=selected_inds,
            confidence_score=blueprint.get("confidence_score", 90.0),
            next_best_action=f"Launch lead hunter sweep across {', '.join(blueprint.get('selected_sources', ['Telegram']))}."
        )

        session.add(mission)
        await session.commit()
        await session.refresh(mission)
        return mission


ai_mission_creator = AIMissionCreator()

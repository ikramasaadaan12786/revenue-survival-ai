import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, Lead, RevenueOpportunity, Proposal, RevenueTracking
from app.services.ceo_brain.industry_intelligence import industry_intelligence
from app.services.ceo_brain.offer_optimizer import offer_optimizer
from app.services.ceo_brain.source_intelligence import source_intelligence
from app.services.ceo_brain.priority_engine import priority_engine

class WeeklyReporterAndBriefingEngine:
    """
    Weekly Business Reporter & Morning CEO Daily Briefing Engine.
    Delivers institutional executive summaries for business owners and AI leadership.
    """

    async def generate_weekly_report(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        mission_res = await session.execute(select(Mission).where(Mission.id == mission_id))
        mission = mission_res.scalar_one_or_none()
        if not mission:
            return {"error": "Mission not found"}

        leads_res = await session.execute(select(Lead).where(Lead.mission_id == mission_id))
        leads = leads_res.scalars().all()

        won_deals = [l for l in leads if (l.pipeline_stage or "").upper() == "WON" or (l.status or "").upper() == "DEAL"]
        lost_deals = [l for l in leads if (l.pipeline_stage or "").upper() == "LOST"]

        revenue_generated = float(mission.revenue_generated or sum(l.expected_value or 0.0 for l in won_deals))
        pipeline_value = float(mission.pipeline_value or sum(l.expected_value or 0.0 for l in leads if (l.pipeline_stage or "").upper() not in ["WON", "LOST"]))
        goal_amount = float(mission.goal_amount or 10000.0)

        industries = await industry_intelligence.analyze_industry_performance(session, mission_id)
        offers = await offer_optimizer.analyze_offers(session, mission_id)
        sources = await source_intelligence.analyze_sources(session, mission_id)

        best_source = sources[0]["display_name"] if sources else "Telegram"
        best_industry = industries[0]["industry"] if industries else "AI Agents & Automation"
        best_offer = offers[0]["product_name"] if offers else "AI Agent Development Package"

        # Problem / friction identification
        bottlenecks = []
        if len(lost_deals) > 0:
            bottlenecks.append(f"{len(lost_deals)} prospects paused due to pricing objections or delayed execution timelines.")
        if len(leads) > 0 and len(won_deals) == 0:
            bottlenecks.append("Staged outreach awaiting operator approval in Safety Queue.")

        if not bottlenecks:
            bottlenecks.append("No critical friction detected. Conversion velocity healthy.")

        next_week_strategy = [
            f"Double down on {best_source} scraping to ingest 50+ fresh decision makers in {best_industry}.",
            f"Promote {best_offer} with 50% upfront milestone deposit structure to accelerate cash collection.",
            f"Maintain target closing velocity to surpass {goal_amount:,.0f} {mission.currency} target."
        ]

        today_str = datetime.datetime.utcnow().strftime("%B %d, %Y")

        return {
            "mission_id": mission_id,
            "report_period": f"Week Ending {today_str}",
            "revenue": {
                "generated_aed": revenue_generated,
                "pipeline_aed": pipeline_value,
                "target_aed": goal_amount,
                "deals_won_count": len(won_deals),
                "deals_lost_count": len(lost_deals)
            },
            "performance": {
                "best_source": best_source,
                "best_industry": best_industry,
                "best_offer": best_offer,
                "overall_conversion_rate_pct": round(len(won_deals) / max(1, len(leads)) * 100.0, 1)
            },
            "problems_and_bottlenecks": bottlenecks,
            "next_week_strategy": next_week_strategy
        }

    async def generate_morning_ceo_briefing(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        mission_res = await session.execute(select(Mission).where(Mission.id == mission_id))
        mission = mission_res.scalar_one_or_none()
        if not mission:
            return {"error": "Mission not found"}

        leads_res = await session.execute(select(Lead).where(Lead.mission_id == mission_id))
        leads = leads_res.scalars().all()

        priorities = await priority_engine.calculate_top_priorities(session, mission_id)
        
        goal = float(mission.goal_amount or 5000.0)
        achieved = float(mission.revenue_generated or 0.0)
        remaining = max(0.0, goal - achieved)

        today_str = datetime.datetime.utcnow().strftime("%A, %B %d, %Y")

        return {
            "mission_id": mission_id,
            "briefing_date": today_str,
            "yesterday_performance": {
                "revenue_closed_aed": achieved,
                "active_leads_in_pipeline": len(leads),
                "hot_opportunities_active": len([l for l in leads if (l.qualification_score or 0) >= 80.0])
            },
            "today_revenue_target_aed": remaining,
            "top_opportunities_summary": f"{len(priorities)} high-value opportunities queued for immediate outreach.",
            "top_actions": priorities[:5],
            "risk_alerts": [
                f"{len([l for l in leads if l.pipeline_stage == 'CONTACT_READY'])} outreach sequences awaiting safety approval."
            ],
            "recommended_strategy": f"Focus direct WhatsApp and LinkedIn touches on top 5 decision makers to secure first payment deposit."
        }


weekly_reporter = WeeklyReporterAndBriefingEngine()

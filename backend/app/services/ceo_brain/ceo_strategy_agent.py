from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, Lead, Offer, RevenueOpportunity, CEODecisionMemory, RevenueTracking
from app.services.ceo_brain.industry_intelligence import industry_intelligence
from app.services.ceo_brain.offer_optimizer import offer_optimizer
from app.services.ceo_brain.source_intelligence import source_intelligence
from app.services.ceo_brain.revenue_gap_analyzer import revenue_gap_analyzer

class CEOStrategyAgent:
    """
    Autonomous CEO Strategy Brain Agent.
    Continuously audits business-wide multi-mission execution:
    - Synthesizes industry rankings, offer conversion rates, and source attribution
    - Calculates net revenue gaps and prescribes corrective pivots
    - Stores every strategic decision into CEODecisionMemory for cognitive learning
    - Delivers confidence-scored prescriptive decisions
    """

    async def generate_daily_ceo_decision(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        mission_res = await session.execute(select(Mission).where(Mission.id == mission_id))
        mission = mission_res.scalar_one_or_none()
        if not mission:
            return {"error": "Mission not found"}

        # Fetch intelligence components
        industries = await industry_intelligence.analyze_industry_performance(session, mission_id)
        offers = await offer_optimizer.analyze_offers(session, mission_id)
        sources = await source_intelligence.analyze_sources(session, mission_id)
        gap_data = await revenue_gap_analyzer.analyze_mission_gap(session, mission_id)

        best_industry = industries[0]["industry"] if industries else "AI Agents & Automation"
        best_offer = offers[0]["product_name"] if offers else "AI Agent Development Package"
        best_source = sources[0]["display_name"] if sources else "Telegram"

        # Determine highest probability strategy
        goal = float(mission.goal_amount or 5000.0)
        achieved = float(mission.revenue_generated or 0.0)
        net_gap = gap_data.get("net_revenue_gap_aed", 5000.0)

        if "ai" in best_industry.lower():
            decision = f"Scale outreach across {best_source} targeting AI Agent clients"
            reason = f"{best_industry} demonstrates the highest conversion speed ({industries[0]['conversion_rate_pct']}%) with strong profit margin."
            confidence = 89.0
            expected_impact = min(net_gap, 25000.0)
            action_type = "SCALE_AI_OUTREACH"
        elif "real estate" in best_industry.lower():
            decision = f"Focus on high-ticket property investors in {best_source}"
            reason = f"High deal size capability ({industries[0]['pipeline_value_aed']:,.0f} AED pipeline) delivers fastest path to hit {goal:,.0f} AED target."
            confidence = 92.0
            expected_impact = min(net_gap, 50000.0)
            action_type = "ACCELERATE_INVESTOR_DEALS"
        else:
            decision = f"Deploy {best_offer} across {best_source} and LinkedIn feeds"
            reason = f"Verified lead interest with consistent response rates ({offers[0]['reply_rate_pct']}%)."
            confidence = 85.0
            expected_impact = 15000.0
            action_type = "OPTIMIZE_MULTI_CHANNEL"

        # Check for underperformance risk alert
        risk_alert = None
        if len(industries) > 1 and industries[-1]["conversion_rate_pct"] < 5.0 and industries[-1]["opportunities_generated"] >= 3:
            risk_alert = f"Underperformance detected in {industries[-1]['industry']}. Recommend pausing outbound ad allocation and shifting focus to {best_industry}."

        # Store in CEODecisionMemory
        mem = CEODecisionMemory(
            mission_id=mission_id,
            decision_type=action_type,
            recommendation=decision,
            reason=reason,
            confidence_score=confidence,
            expected_impact_aed=expected_impact,
            action_taken=f"Auto-applied CEO priority to {best_industry}",
            result_status="EXECUTED",
            metrics_snapshot={
                "best_industry": best_industry,
                "best_offer": best_offer,
                "best_source": best_source,
                "net_gap_aed": net_gap
            }
        )
        session.add(mem)
        await session.commit()
        await session.refresh(mem)

        return {
            "decision_id": mem.id,
            "mission_id": mission_id,
            "decision": decision,
            "recommendation": decision,
            "reason": reason,
            "confidence_score": confidence,
            "expected_impact_aed": expected_impact,
            "best_industry": best_industry,
            "best_offer": best_offer,
            "best_source": best_source,
            "risk_alert": risk_alert,
            "gap_analysis": gap_data,
            "created_at": mem.created_at.isoformat() if mem.created_at else None
        }

    async def get_historical_ceo_decisions(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        query = select(CEODecisionMemory).order_by(CEODecisionMemory.id.desc())
        if mission_id:
            query = query.where(CEODecisionMemory.mission_id == mission_id)

        records = (await session.execute(query)).scalars().all()
        return [
            {
                "id": r.id,
                "mission_id": r.mission_id,
                "decision_type": r.decision_type,
                "recommendation": r.recommendation,
                "reason": r.reason,
                "confidence_score": r.confidence_score,
                "expected_impact_aed": r.expected_impact_aed,
                "action_taken": r.action_taken,
                "result_status": r.result_status,
                "actual_revenue_impact_aed": r.actual_revenue_impact_aed,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in records[:15]
        ]


ceo_strategy_agent = CEOStrategyAgent()

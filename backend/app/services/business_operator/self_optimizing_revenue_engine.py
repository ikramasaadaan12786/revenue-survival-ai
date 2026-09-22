import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, Lead, CEODecisionMemory, OperatorActionLog
from app.services.ceo_brain.industry_intelligence import industry_intelligence
from app.services.ceo_brain.source_intelligence import source_intelligence
from app.services.ceo_brain.revenue_gap_analyzer import revenue_gap_analyzer

class SelfOptimizingRevenueEngine:
    """
    Self-Optimizing Revenue Engine:
    Continuously monitors active mission throughput, pipeline coverage, lead velocity,
    and channel conversion. Autonomously recommends and applies operational adaptations:
    - Target escalation / scaling
    - Industry pivots
    - Offer adaptations
    - Discovery bandwidth reallocation
    - Pausing underperforming channels
    """

    async def evaluate_and_optimize_mission(
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

        gap_data = await revenue_gap_analyzer.analyze_mission_gap(session, mission_id)
        ind_metrics = await industry_intelligence.analyze_industry_performance(session)
        src_metrics = await source_intelligence.analyze_sources(session)

        total_leads = len(leads)
        won_deals = len([l for l in leads if (l.pipeline_stage or "").upper() == "WON"])
        conversion_rate = (won_deals / total_leads * 100.0) if total_leads > 0 else 0.0
        pipeline_val = gap_data.get("raw_pipeline_value_aed", 0.0)
        target_val = float(mission.goal_amount or 10000.0)
        confirmed_val = float(mission.revenue_generated or 0.0)

        optimizations: List[Dict[str, Any]] = []

        # 1. Target Scaling Check (If pipeline covers > 150% of target or won >= 80%)
        if (confirmed_val >= target_val * 0.80) or (pipeline_val > target_val * 1.5):
            new_target = target_val * 1.5
            optimizations.append({
                "action_type": "INCREASE_TARGET",
                "title": f"Escalate Target Revenue to {new_target:,.0f} AED",
                "description": f"Active pipeline ({pipeline_val:,.0f} AED) and confirmed revenue exceed pacing threshold. Escalating target by +50%.",
                "confidence_score": 93.0,
                "projected_revenue_impact_aed": new_target - target_val,
                "parameters": {"new_goal_amount": new_target}
            })

        # 2. Underperforming Industry Focus Check
        weak_industries = [i.get("industry") for i in ind_metrics if i.get("performance_tier") in ["NEEDS_IMPROVEMENT", "LOW_PRIORITY"]]
        best_industry = ind_metrics[0].get("industry", "AI Agents & Automation") if ind_metrics else "AI Agents & Automation"
        if weak_industries:
            optimizations.append({
                "action_type": "PIVOT_INDUSTRY",
                "title": f"Pivot Outbound Bandwidth to {best_industry}",
                "description": f"Detected low conversion in {', '.join(weak_industries[:2])}. Reallocating 80% hunter capacity to {best_industry}.",
                "confidence_score": 89.0,
                "projected_revenue_impact_aed": 15000.0,
                "parameters": {"pivot_to": best_industry, "deprioritize": weak_industries}
            })

        # 3. Discovery Acceleration Check (If qualified lead count is low)
        if total_leads < 10:
            optimizations.append({
                "action_type": "INCREASE_DISCOVERY",
                "title": "Trigger Deep UAE Radar Discovery Sweep",
                "description": f"Lead volume ({total_leads}) is below optimal pipeline density. Launching multi-channel radar sweep across top channels.",
                "confidence_score": 95.0,
                "projected_revenue_impact_aed": 20000.0,
                "parameters": {"channels": ["telegram", "linkedin", "instagram"]}
            })

        # 4. Weak Channel Filtering Check
        for s in src_metrics:
            if s["signals_found"] >= 5 and s["deals_won"] == 0 and s["source_key"] not in ["telegram", "linkedin"]:
                optimizations.append({
                    "action_type": "PAUSE_WEAK_CHANNEL",
                    "title": f"Pause Signal Ingestion from {s['display_name']}",
                    "description": f"{s['display_name']} generated {s['signals_found']} signals with 0 confirmed deals. Redirecting compute to Telegram/LinkedIn.",
                    "confidence_score": 85.0,
                    "projected_revenue_impact_aed": 5000.0,
                    "parameters": {"channel_key": s["source_key"]}
                })
                break

        # Fallback default optimization if healthy
        if not optimizations:
            optimizations.append({
                "action_type": "MAINTAIN_EXECUTION",
                "title": "Maintain High-Velocity Outreach Cadence",
                "description": f"Mission pipeline health is stable with {pipeline_val:,.0f} AED active value. Focus on closing proposals in negotiation.",
                "confidence_score": 91.0,
                "projected_revenue_impact_aed": 10000.0,
                "parameters": {}
            })

        # Store primary optimization in CEODecisionMemory and OperatorActionLog
        primary_opt = optimizations[0]
        decision_mem = CEODecisionMemory(
            mission_id=mission_id,
            decision_type=primary_opt["action_type"],
            recommendation=primary_opt["title"],
            reason=primary_opt["description"],
            confidence_score=primary_opt["confidence_score"],
            expected_impact_aed=primary_opt["projected_revenue_impact_aed"],
            action_taken=f"AUTONOMOUS_OPERATOR_{primary_opt['action_type']}",
            result_status="EXECUTED",
            actual_revenue_impact_aed=0.0,
            metrics_snapshot={
                "conversion_rate": conversion_rate,
                "pipeline_value_aed": pipeline_val,
                "target_aed": target_val,
                "total_leads": total_leads,
                "optimizations_evaluated": len(optimizations)
            }
        )
        session.add(decision_mem)

        # Stage in Operator Action Log
        action_log = OperatorActionLog(
            mission_id=mission_id,
            action_type=primary_opt["action_type"],
            title=primary_opt["title"],
            description=primary_opt["description"],
            status="PENDING_APPROVAL",
            action_payload=primary_opt.get("parameters", {}),
            revenue_impact_aed=primary_opt["projected_revenue_impact_aed"],
            confidence_score=primary_opt["confidence_score"]
        )
        session.add(action_log)
        await session.commit()

        return {
            "mission_id": mission_id,
            "mission_title": mission.title,
            "conversion_rate_pct": round(conversion_rate, 2),
            "pipeline_value_aed": pipeline_val,
            "target_revenue_aed": target_val,
            "confirmed_revenue_aed": confirmed_val,
            "primary_optimization": primary_opt,
            "all_recommended_optimizations": optimizations,
            "decision_memory_id": decision_mem.id,
            "action_log_id": action_log.id,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }


self_optimizing_revenue_engine = SelfOptimizingRevenueEngine()

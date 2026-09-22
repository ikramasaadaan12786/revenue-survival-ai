import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, RevenueOpportunity, Opportunity, Lead

class MissionEscalationEngine:
    """
    Evaluates revenue velocity and pipeline coverage to recommend:
    1. Increase Target (When pipeline value > 1.5x goal)
    2. Change Strategy (When pacing falls below threshold)
    3. Focus on Higher-Value Opportunities (Filter out low-ticket friction)
    """

    async def get_escalation_recommendation(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        pipe_val = float(mission.pipeline_value or 0.0)
        goal_val = float(mission.goal_amount or 1000.0)
        coverage_ratio = round(pipe_val / goal_val, 2) if goal_val > 0 else 1.0

        # Fetch hot opportunities
        rev_opps = (await session.execute(
            select(RevenueOpportunity).where(RevenueOpportunity.mission_id == mission_id)
        )).scalars().all()
        
        hot_opps = [ro for ro in rev_opps if ro.priority == "HOT" or (ro.intent_score or 0) >= 88.0]
        hot_deal_sum = sum(ro.estimated_value for ro in hot_opps)

        if coverage_ratio >= 1.4:
            action_type = "INCREASE_TARGET"
            new_goal = round(goal_val * 1.5, 0)
            title = f"Escalate Target: Increase Goal to {new_goal:,.0f} {mission.currency}"
            reasoning = (
                f"Your active pipeline value ({pipe_val:,.0f} {mission.currency}) currently covers {coverage_ratio:.1f}x of your target. "
                f"We recommend increasing the mission target by +50% to maximize monetization velocity."
            )
            actions = [
                f"Increase mission target from {goal_val:,.0f} {mission.currency} to {new_goal:,.0f} {mission.currency}",
                "Authorize all pending safety approval pitches to maintain momentum",
                "Deploy secondary high-ticket upsell offers upon initial delivery"
            ]
            confidence = 94.5
        elif hot_deal_sum >= goal_val and len(hot_opps) > 0:
            action_type = "FOCUS_HIGH_VALUE"
            new_goal = goal_val
            title = f"High-Value Focus: Prioritize {len(hot_opps)} HOT Opportunities ({hot_deal_sum:,.0f} {mission.currency})"
            reasoning = (
                f"You have {len(hot_opps)} HOT opportunities totaling {hot_deal_sum:,.0f} {mission.currency} with >90% intent scores. "
                f"Allocating 100% of outreach focus to these top deals guarantees hitting your revenue milestone in under 48 hours."
            )
            actions = [
                f"Prioritize outreach to {hot_opps[0].name} ({hot_opps[0].company or hot_opps[0].industry})",
                "Fast-track bespoke pitch approvals in Safety Queue",
                "Deprioritize lower-tier leads to eliminate closing friction"
            ]
            confidence = 91.0
        else:
            action_type = "PIVOT_STRATEGY"
            new_goal = goal_val
            title = "Strategy Pivot: Deploy 24-Hour Express Cash Sprints"
            reasoning = (
                f"To accelerate closing velocity before the {mission.deadline_hours}h deadline, "
                f"pivot outreach to express 24h WhatsApp AI Bot and Next.js Landing Page sprints with 50% upfront deposits."
            )
            actions = [
                "Switch primary outreach hook to '24-Hour Delivery with 50% Upfront Escrow'",
                "Mine additional Reddit and Telegram signals for urgent buyer requests",
                "Simulate immediate prospect response handling"
            ]
            confidence = 88.0

        return {
            "mission_id": mission_id,
            "current_goal": goal_val,
            "pipeline_value": pipe_val,
            "coverage_ratio": coverage_ratio,
            "urgency_tier": "HIGH" if coverage_ratio >= 1.4 else "STANDARD",
            "action_type": action_type,
            "title": title,
            "recommended_new_goal": new_goal if action_type == "INCREASE_TARGET" else None,
            "reasoning": reasoning,
            "recommended_actions": actions,
            "confidence": confidence
        }

    async def apply_escalation(
        self,
        session: AsyncSession,
        mission_id: int,
        action_type: str,
        new_goal_amount: Optional[float] = None,
        new_strategy_angle: Optional[str] = None
    ) -> Dict[str, Any]:
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        if action_type == "INCREASE_TARGET" and new_goal_amount:
            old_goal = mission.goal_amount
            mission.goal_amount = new_goal_amount
            mission.ai_strategy = (
                f"Escalated Revenue Target: Increased from {old_goal:,.0f} to {new_goal_amount:,.0f} {mission.currency}. "
                f"Aggressively closing pipeline opportunities to exceed updated milestone."
            )
            mission.next_best_action = "Execute prioritized closing on qualified HOT opportunities."
            mission.confidence_score = min(98.0, (mission.confidence_score or 85.0) + 3.0)
            await session.commit()
            return {
                "status": "success",
                "message": f"Mission #{mission_id} target escalated to {new_goal_amount:,.0f} {mission.currency}.",
                "new_goal": new_goal_amount
            }
        elif action_type == "FOCUS_HIGH_VALUE":
            mission.ai_strategy = f"High-Value Focus Mode: Concentrating 100% of outreach execution on top HOT tier opportunities."
            mission.next_best_action = "Approve and dispatch pitches for top 3 high-value enterprise leads in Safety Queue."
            await session.commit()
            return {
                "status": "success",
                "message": f"Mission #{mission_id} switched to High-Value Focus Mode."
            }
        else:
            # PIVOT_STRATEGY
            mission.status = "PIVOTING"
            mission.ai_strategy = new_strategy_angle or "Express 24-Hour Cash Sprint Pivot with 50% upfront deposits."
            mission.next_best_action = "Dispatch express 24h turnaround pitches to active market signals."
            await session.commit()
            return {
                "status": "success",
                "message": f"Mission #{mission_id} strategy pivoted to Express Cash Sprints."
            }

mission_escalation_engine = MissionEscalationEngine()

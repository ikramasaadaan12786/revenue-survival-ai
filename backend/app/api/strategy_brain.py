from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.entities import Mission
from app.schemas.schemas import MissionResponse
from app.services.revenue_strategy_brain import revenue_strategy_brain
from app.agents.survival_manager import survival_manager

router = APIRouter(prefix="/strategy-brain", tags=["strategy-brain"])

class EvaluateRevenueRequest(BaseModel):
    target_amount: float
    deadline_hours: int = 72
    budget: float = 0.0
    currency: str = "AED"

class AutoCreateMissionRequest(BaseModel):
    title: Optional[str] = None
    target_amount: float
    deadline_hours: int = 72
    budget: float = 0.0
    currency: str = "AED"

class PivotRequest(BaseModel):
    forced_new_industry: Optional[str] = None

@router.post("/evaluate")
async def evaluate_revenue_intent(payload: EvaluateRevenueRequest):
    """
    Evaluates Target Amount, Deadline, and Budget across all 8 industries and returns the optimal monetization blueprint.
    """
    result = revenue_strategy_brain.evaluate_revenue_intent(
        target_amount=payload.target_amount,
        deadline_hours=payload.deadline_hours,
        budget=payload.budget,
        currency=payload.currency
    )
    return result

@router.post("/auto-create-mission")
async def auto_create_mission_from_brain(payload: AutoCreateMissionRequest, db: AsyncSession = Depends(get_db)):
    """
    One-click autonomous mission creation:
    Takes only target amount, deadline, and budget.
    AI selects the best industry, configures offers, sets up tasks, and launches execution.
    """
    evaluation = revenue_strategy_brain.evaluate_revenue_intent(
        target_amount=payload.target_amount,
        deadline_hours=payload.deadline_hours,
        budget=payload.budget,
        currency=payload.currency
    )

    primary_ind = evaluation["primary_industry"]
    mission_title = payload.title or f"Autonomous {primary_ind} Sprint ({payload.target_amount:,.0f} {payload.currency})"

    mission = Mission(
        title=mission_title,
        goal_amount=payload.target_amount,
        currency=payload.currency,
        deadline_hours=payload.deadline_hours,
        budget=payload.budget,
        industry=primary_ind,
        status="ACTIVE"
    )
    db.add(mission)
    await db.commit()
    await db.refresh(mission)

    # Configure mission from Strategy Brain
    res = await revenue_strategy_brain.auto_configure_mission_from_brain(db, mission.id)
    return {
        "status": "success",
        "mission_id": mission.id,
        "title": mission.title,
        "industry": mission.industry,
        "goal_amount": mission.goal_amount,
        "currency": mission.currency,
        "deadline_hours": mission.deadline_hours,
        "ai_strategy": mission.ai_strategy,
        "next_best_action": mission.next_best_action,
        "confidence_score": mission.confidence_score,
        "evaluation": res.get("evaluation")
    }

@router.post("/pivot/{mission_id}")
async def trigger_autonomous_pivot(mission_id: int, payload: Optional[PivotRequest] = None, db: AsyncSession = Depends(get_db)):
    """
    Triggers an autonomous multi-industry pivot when performance in current niche is stalled.
    """
    forced = payload.forced_new_industry if payload else None
    result = await survival_manager.execute_autonomous_industry_pivot(db, mission_id, forced)
    return result

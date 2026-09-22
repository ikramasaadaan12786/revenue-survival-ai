from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.entities import Mission, Opportunity, RevenueOpportunity, Lead, Communication, RevenueTracking, Task, Offer, RealEstateDeal
from app.schemas.schemas import MissionCreate, MissionResponse, DashboardSummary, TaskResponse
from app.agents.survival_manager import SurvivalManagerAgent

router = APIRouter(prefix="/missions", tags=["missions"])
survival_manager = SurvivalManagerAgent()

@router.get("/", response_model=List[MissionResponse])
async def list_missions(db: AsyncSession = Depends(get_db)):
    stmt = select(Mission).order_by(Mission.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=MissionResponse)
async def create_mission(payload: MissionCreate, db: AsyncSession = Depends(get_db)):
    expires_at = datetime.utcnow() + timedelta(hours=payload.deadline_hours)

    all_default_industries = [
        "Dubai Real Estate & Advisory",
        "Digital Services & Consulting",
        "AI Agents & Automation",
        "Custom Software Development",
        "SaaS Products",
        "Website Development",
        "Mobile Applications",
        "E-Commerce & High Ticket Sales",
        "Lead Generation Services",
        "Marketing & Growth Services"
    ]

    selected_industries = (
        payload.industries if (payload.industries and len(payload.industries) > 0)
        else ([payload.industry] if payload.industry and payload.industry != "All Industries" else all_default_industries)
    )

    if len(selected_industries) == len(all_default_industries):
        industry_str = "All Industries"
    elif len(selected_industries) <= 2:
        industry_str = ", ".join(selected_industries)
    else:
        industry_str = f"{selected_industries[0]}, {selected_industries[1]} (+{len(selected_industries) - 2} more)"

    mission = Mission(
        title=payload.title,
        goal_amount=payload.goal_amount,
        currency=payload.currency,
        deadline_hours=payload.deadline_hours,
        budget=payload.budget,
        spent=0.0,
        revenue_generated=0.0,
        pipeline_value=0.0,
        total_commission_potential=0.0,
        industry=industry_str,
        industries=selected_industries,
        status="ACTIVE",
        current_day=1,
        total_days=max(1, payload.deadline_hours // 24),
        expires_at=expires_at,
    )
    db.add(mission)
    await db.commit()
    await db.refresh(mission)

    # Initialize contextual plan using Survival Manager
    await survival_manager.initialize_mission_plan(db, mission.id)
    await db.refresh(mission)
    return mission

@router.get("/{mission_id}", response_model=MissionResponse)
async def get_mission(mission_id: int, db: AsyncSession = Depends(get_db)):
    mission = await db.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission

@router.get("/{mission_id}/dashboard", response_model=DashboardSummary)
@router.get("/{mission_id}/summary", response_model=DashboardSummary)
async def get_mission_dashboard(mission_id: int, db: AsyncSession = Depends(get_db)):
    mission = await db.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    now = datetime.utcnow()
    hours_remaining = 0.0
    if mission.expires_at:
        diff = (mission.expires_at - now).total_seconds() / 3600.0
        hours_remaining = max(0.0, round(diff, 1))
    else:
        hours_remaining = float(mission.deadline_hours)

    opp_count = (await db.execute(select(Opportunity).where(Opportunity.mission_id == mission_id))).scalars().all()
    rev_opps = (await db.execute(select(RevenueOpportunity).where(RevenueOpportunity.mission_id == mission_id))).scalars().all()
    leads = (await db.execute(select(Lead).where(Lead.mission_id == mission_id))).scalars().all()
    comms = (await db.execute(select(Communication).where(Communication.mission_id == mission_id))).scalars().all()
    tasks = (await db.execute(select(Task).where(Task.mission_id == mission_id).order_by(Task.id.desc()).limit(10))).scalars().all()
    revs = (await db.execute(select(RevenueTracking).where(RevenueTracking.mission_id == mission_id))).scalars().all()
    deals = (await db.execute(select(RealEstateDeal).where(RealEstateDeal.mission_id == mission_id))).scalars().all()

    sent_count = sum(1 for c in comms if c.delivery_status in ["SENT", "DELIVERED", "READ", "REPLIED"])
    replies_count = sum(1 for c in comms if c.delivery_status == "REPLIED" or c.response_received)
    meetings_count = sum(1 for l in leads if l.status == "MEETING")
    deals_count = sum(1 for l in leads if l.status in ["DEAL", "COMMISSION"])
    commission_earned = sum(r.commission_collected for r in revs if r.deal_status == "CONFIRMED")
    pending_approvals = sum(1 for c in comms if c.approval_status == "PENDING" and c.requires_approval)

    # 8-Stage CRM Funnel Counts
    crm_funnel_counts = {
        "NEW": 0,
        "AI_VERIFIED": 0,
        "CONTACT_READY": 0,
        "CONTACTED": 0,
        "REPLIED": 0,
        "MEETING": 0,
        "DEAL": 0,
        "COMMISSION": 0
    }
    for l in leads:
        st = l.status.upper()
        if st in crm_funnel_counts:
            crm_funnel_counts[st] += 1
        else:
            crm_funnel_counts["NEW"] += 1

    total_opps = max(len(opp_count), len(rev_opps), len(opp_count) + len(rev_opps) if not opp_count else len(opp_count))
    lead_pipeline_val = sum(l.expected_value for l in leads)
    if lead_pipeline_val > 0:
        pipeline_val = lead_pipeline_val
    elif rev_opps:
        pipeline_val = sum(ro.estimated_value for ro in rev_opps)
    else:
        pipeline_val = mission.pipeline_value or 0.0

    mission.pipeline_value = pipeline_val

    total_comm_potential = sum(l.commission_potential for l in leads) + sum(d.commission_amount for d in deals)
    if total_comm_potential == 0 and pipeline_val > 0:
        total_comm_potential = round(pipeline_val * 0.15, 2)
    mission.total_commission_potential = total_comm_potential

    return DashboardSummary(
        mission=mission,
        hours_remaining=hours_remaining,
        target_amount=mission.goal_amount,
        revenue_achieved=mission.revenue_generated,
        pipeline_expected=pipeline_val,
        total_commission_potential=total_comm_potential,
        budget_spent=mission.spent,
        survival_status=mission.status,
        confidence_score=mission.confidence_score,
        opportunities_count=total_opps,
        leads_count=len(leads),
        messages_sent=sent_count,
        replies_count=replies_count,
        meetings_count=meetings_count,
        deals_count=deals_count,
        commission_earned=commission_earned,
        next_best_action=mission.next_best_action or "Execute autonomous tasks.",
        active_agent="Survival Manager Agent",
        recent_tasks=tasks,
        pending_approvals=pending_approvals,
        crm_funnel_counts=crm_funnel_counts
    )

@router.post("/{mission_id}/run-next-step")
async def run_next_step(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await survival_manager.execute_next_autonomous_step(db, mission_id)
    return result

@router.post("/{mission_id}/evaluate-pivot")
async def evaluate_pivot(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await survival_manager.evaluate_survival_status(db, mission_id)
    return result

@router.get("/{mission_id}/progress")
async def get_mission_progress(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await survival_manager.evaluate_mission_progress(db, mission_id)
    return result

@router.get("/{mission_id}/strategy-decision")
async def get_strategy_decision(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await survival_manager.get_daily_strategy_decision(db, mission_id)
    return result

@router.get("/{mission_id}/bottlenecks")
async def get_mission_bottlenecks(mission_id: int, db: AsyncSession = Depends(get_db)):
    progress = await survival_manager.evaluate_mission_progress(db, mission_id)
    return progress.get("bottleneck", {})

@router.post("/{mission_id}/browser-research")
async def trigger_browser_research(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await survival_manager.browser_agent.execute_task(db, mission_id, {})
    return result

@router.post("/{mission_id}/live-cycle")
async def execute_live_autonomous_cycle(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await survival_manager.execute_live_autonomous_cycle(db, mission_id)
    return result

@router.get("/{mission_id}/live-roadmap")
async def get_live_mission_roadmap(mission_id: int, total_days: int = 30, db: AsyncSession = Depends(get_db)):
    result = await survival_manager.generate_live_multi_day_roadmap(db, mission_id, total_days)
    return result



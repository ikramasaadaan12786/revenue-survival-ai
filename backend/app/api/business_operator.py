from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.services.business_operator.ai_mission_creator import ai_mission_creator
from app.services.business_operator.self_optimizing_revenue_engine import self_optimizing_revenue_engine
from app.services.business_operator.autonomous_offer_generator import autonomous_offer_generator
from app.services.business_operator.lead_hunter_manager import lead_hunter_manager
from app.services.business_operator.ceo_approval_execution_layer import ceo_approval_execution_layer
from app.services.business_operator.growth_memory_engine import growth_memory_engine
from app.services.business_operator.operator_orchestrator import operator_orchestrator

router = APIRouter(prefix="/business-operator", tags=["Autonomous Business Operator v5"])


class MissionBlueprintRequest(BaseModel):
    market_focus_override: Optional[str] = None


class CreateMissionRequest(BaseModel):
    blueprint: Optional[Dict[str, Any]] = None


class HunterDispatchRequest(BaseModel):
    mission_id: Optional[int] = None
    sources: Optional[List[str]] = None


class BatchApprovalRequest(BaseModel):
    mission_id: Optional[int] = None


class RejectActionRequest(BaseModel):
    reason: Optional[str] = None


@router.get("/control-room-stats")
async def get_control_room_stats(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns real-time telemetry and stats for the Revenue Control Room Dashboard.
    """
    return await operator_orchestrator.get_control_room_telemetry(db, mission_id)


@router.post("/run-autonomous-cycle")
async def run_autonomous_cycle(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes the master Autonomous Business Operator cycle.
    """
    return await operator_orchestrator.run_master_autonomous_cycle(db, mission_id)


@router.post("/generate-mission-blueprint")
async def generate_mission_blueprint(
    req: MissionBlueprintRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Generates an optimized AI Revenue Mission blueprint based on market intelligence.
    """
    return await ai_mission_creator.generate_mission_blueprint(db, req.market_focus_override)


@router.post("/create-autonomous-mission")
async def create_autonomous_mission(
    req: CreateMissionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Instantiates an approved AI Mission into the active database.
    """
    mission = await ai_mission_creator.create_autonomous_mission(db, req.blueprint)
    return {
        "status": "CREATED",
        "mission_id": mission.id,
        "title": mission.title,
        "goal_amount": mission.goal_amount,
        "currency": mission.currency
    }


@router.get("/self-optimizations/{mission_id}")
async def get_self_optimizations(
    mission_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates mission performance and returns self-optimizing recommendations.
    """
    return await self_optimizing_revenue_engine.evaluate_and_optimize_mission(db, mission_id)


@router.post("/generate-tiered-offers/{lead_id}")
async def generate_tiered_offers(
    lead_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Autonomously generates 3-tier value packages (Starter, Growth, Enterprise) for a lead.
    """
    return await autonomous_offer_generator.attach_tiered_offers_to_lead(db, lead_id)


@router.get("/hunter-fleet-status")
async def get_hunter_fleet_status(
    db: AsyncSession = Depends(get_db)
):
    """
    Returns live operational status and attribution across all 6 signal discovery channels.
    """
    return await lead_hunter_manager.get_hunter_fleet_status(db)


@router.post("/dispatch-lead-hunters")
async def dispatch_lead_hunters(
    req: HunterDispatchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches autonomous signal sweep and enrolls qualified leads into target mission.
    """
    return await lead_hunter_manager.dispatch_lead_hunters(db, req.mission_id, req.sources)


@router.get("/approval-queue")
async def get_approval_queue(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves all operator actions and sales touches pending human authorization.
    """
    return await ceo_approval_execution_layer.get_pending_approvals(db, mission_id)


@router.post("/approve-action/{action_id}")
async def approve_operator_action(
    action_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Approves and applies a staged operator optimization or action.
    """
    res = await ceo_approval_execution_layer.approve_operator_action(db, action_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/reject-action/{action_id}")
async def reject_operator_action(
    action_id: int,
    req: RejectActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Rejects a staged operator action.
    """
    res = await ceo_approval_execution_layer.reject_operator_action(db, action_id, req.reason)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/approve-communication/{comm_id}")
async def approve_communication(
    comm_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Approves and dispatches an outreach message to the external prospect.
    """
    res = await ceo_approval_execution_layer.approve_communication(db, comm_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.post("/batch-approve")
async def batch_approve(
    req: BatchApprovalRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Batch approves all pending operator actions and sales communications.
    """
    return await ceo_approval_execution_layer.batch_approve_all(db, req.mission_id)


@router.get("/growth-memory")
async def get_growth_memory(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves historical business growth memory records and macro strategic learnings.
    """
    return await growth_memory_engine.get_growth_memories(db, limit)

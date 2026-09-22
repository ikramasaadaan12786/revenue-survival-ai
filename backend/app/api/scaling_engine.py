"""
Revenue Survival AI - Autonomous AI Business Scaling Engine v8 API Router
Endpoints for Hiring, Outsourcing, Partnerships, Investors, Market Expansion, Competitors, Brand, Content Factory, and Sales Automation.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.services.scaling_engine.scaling_orchestrator import scaling_orchestrator
from app.services.scaling_engine.hiring_manager import hiring_manager
from app.services.scaling_engine.outsource_manager import outsource_manager
from app.services.scaling_engine.partnership_finder import partnership_finder
from app.services.scaling_engine.investor_intelligence import investor_intelligence
from app.services.scaling_engine.market_expansion_engine import market_expansion_engine
from app.services.scaling_engine.competitor_intelligence import competitor_intelligence
from app.services.scaling_engine.brand_builder import brand_builder
from app.services.scaling_engine.content_factory import content_factory
from app.services.scaling_engine.sales_automation_team import sales_automation_team

from app.models.entities import ScalingIntelligenceLog, BrandContentPipeline
from sqlalchemy import select, desc

router = APIRouter(prefix="/scaling-engine", tags=["Autonomous AI Business Scaling Engine v8"])


@router.get("/command-center")
async def get_scaling_command_center(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns high-level Scaling Command Center telemetry across all 9 scaling intelligence domains.
    """
    return await scaling_orchestrator.get_scaling_command_center_telemetry(db, mission_id)


@router.post("/run-scale-analysis")
async def run_scale_analysis_cycle(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes autonomous scale analysis cycle and persists actionable scaling directives.
    """
    return await scaling_orchestrator.run_scale_analysis_cycle(db, mission_id)


@router.get("/hiring")
async def get_hiring_intelligence(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await hiring_manager.analyze_hiring_requirements(db, mission_id)


@router.get("/outsource")
async def get_outsource_intelligence(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await outsource_manager.analyze_outsource_opportunities(db, mission_id)


@router.get("/partnerships")
async def get_partnership_intelligence(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await partnership_finder.discover_partnerships(db, mission_id)


@router.get("/investors")
async def get_investor_intelligence(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await investor_intelligence.analyze_investor_readiness(db, mission_id)


@router.get("/market-expansion")
async def get_market_expansion_intelligence(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await market_expansion_engine.analyze_market_expansion(db, mission_id)


@router.get("/competitors")
async def get_competitor_intelligence(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await competitor_intelligence.analyze_competitor_landscape(db, mission_id)


@router.get("/brand")
async def get_brand_intelligence(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await brand_builder.generate_brand_strategy(db, mission_id)


@router.get("/content-factory")
async def get_content_factory_assets(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await content_factory.generate_daily_content_batch(db, mission_id)


@router.get("/sales-automation")
async def get_sales_automation_team(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await sales_automation_team.analyze_sales_automation(db, mission_id)


@router.get("/history")
async def get_scaling_logs(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns recent persisted scaling intelligence log entries.
    """
    query = select(ScalingIntelligenceLog).order_by(desc(ScalingIntelligenceLog.created_at)).limit(limit)
    res = await db.execute(query)
    return res.scalars().all()

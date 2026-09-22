from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.services.growth_loop.strategy_experiment_engine import strategy_experiment_engine
from app.services.growth_loop.revenue_learning_optimizer import revenue_learning_optimizer
from app.services.growth_loop.dynamic_strategy_pivots import dynamic_strategy_pivots
from app.services.growth_loop.pricing_intelligence import pricing_intelligence
from app.services.business_operator.growth_memory_engine import growth_memory_engine

router = APIRouter(prefix="/growth-loop", tags=["Autonomous Growth Loop v6"])

class CreateExperimentRequest(BaseModel):
    mission_id: Optional[int] = None
    name: str
    category: str = "OFFER"
    hypothesis: str
    variant_a: str
    variant_b: str

@router.get("/command-center")
async def get_growth_command_center_stats(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns aggregated real-time growth telemetry for the Growth Command Center.
    """
    learning = await revenue_learning_optimizer.generate_learning_optimization(db, mission_id)
    experiments = await strategy_experiment_engine.evaluate_experiments(db, mission_id)
    pivots = await dynamic_strategy_pivots.generate_strategy_pivots(db, mission_id)
    pricing = await pricing_intelligence.analyze_pricing_performance(db)

    concluded_exps = [e for e in experiments if e["status"] == "CONCLUDED"]
    winning_offer = learning["best_performing_offer"]
    winning_source = learning["best_performing_source"]
    best_strategy = learning["best_pitch_strategy"]

    return {
        "growth_score": learning["growth_score"],
        "best_strategy": best_strategy,
        "winning_offer": winning_offer,
        "winning_source": winning_source,
        "active_experiments_count": len(experiments),
        "concluded_experiments_count": len(concluded_exps),
        "learning_metrics": learning,
        "experiments": experiments,
        "strategy_pivots": pivots,
        "pricing_intelligence": pricing
    }

@router.post("/run-optimization-cycle")
async def run_daily_optimization_cycle(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Autonomous Daily Optimization Cycle:
    Analyzes performance, tests experiments, promotes winning strategies, and records growth memory.
    """
    learning = await revenue_learning_optimizer.generate_learning_optimization(db, mission_id)
    experiments = await strategy_experiment_engine.evaluate_experiments(db, mission_id)
    pivots = await dynamic_strategy_pivots.generate_strategy_pivots(db, mission_id)

    # Record macro memory
    mem = await growth_memory_engine.record_growth_cycle(
        session=db,
        mission_id=mission_id,
        cycle_type="GROWTH_OPTIMIZATION_V6",
        insight_summary_override=f"Growth Loop v6 evaluated {len(experiments)} experiments. Promoted {learning['best_performing_offer']} on {learning['best_performing_source']}."
    )

    return {
        "status": "OPTIMIZATION_COMPLETE",
        "growth_score": learning["growth_score"],
        "promoted_strategies_count": len(pivots),
        "growth_memory_id": mem.id,
        "primary_recommendation": learning["optimization_recommendations"][0] if learning["optimization_recommendations"] else "Scale high-velocity channels."
    }

@router.get("/experiments")
async def get_experiments(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await strategy_experiment_engine.evaluate_experiments(db, mission_id)

@router.post("/create-experiment")
async def create_experiment(
    req: CreateExperimentRequest,
    db: AsyncSession = Depends(get_db)
):
    exp = await strategy_experiment_engine.create_experiment(
        session=db,
        mission_id=req.mission_id,
        name=req.name,
        category=req.category,
        hypothesis=req.hypothesis,
        variant_a=req.variant_a,
        variant_b=req.variant_b
    )
    return {"status": "CREATED", "experiment_id": exp.id, "name": exp.name}

@router.get("/learning-optimizer")
async def get_learning_optimizer(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await revenue_learning_optimizer.generate_learning_optimization(db, mission_id)

@router.get("/strategy-pivots")
async def get_strategy_pivots(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await dynamic_strategy_pivots.generate_strategy_pivots(db, mission_id)

@router.get("/pricing-intelligence")
async def get_pricing_intelligence(
    db: AsyncSession = Depends(get_db)
):
    return await pricing_intelligence.analyze_pricing_performance(db)

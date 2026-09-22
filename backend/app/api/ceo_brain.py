from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.services.ceo_brain.ceo_strategy_agent import ceo_strategy_agent
from app.services.ceo_brain.industry_intelligence import industry_intelligence
from app.services.ceo_brain.offer_optimizer import offer_optimizer
from app.services.ceo_brain.source_intelligence import source_intelligence
from app.services.ceo_brain.revenue_gap_analyzer import revenue_gap_analyzer
from app.services.ceo_brain.priority_engine import priority_engine
from app.services.ceo_brain.experiment_engine import experiment_engine
from app.services.ceo_brain.weekly_reporter import weekly_reporter

router = APIRouter(prefix="/ceo-brain", tags=["ceo-brain"])

@router.get("/daily-decision/{mission_id}")
async def get_daily_ceo_decision(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates prescriptive daily CEO strategy decision with confidence score, reason, and revenue impact.
    """
    decision = await ceo_strategy_agent.generate_daily_ceo_decision(db, mission_id)
    return decision

@router.get("/historical-decisions/{mission_id}")
async def get_historical_ceo_decisions(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns historical decisions stored in CEODecisionMemory for learning audit.
    """
    decisions = await ceo_strategy_agent.get_historical_ceo_decisions(db, mission_id)
    return decisions

@router.get("/industry-intelligence")
async def get_industry_intelligence(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Tracks and ranks conversion metrics across all 7 UAE industry sectors.
    """
    industries = await industry_intelligence.analyze_industry_performance(db, mission_id)
    return industries

@router.get("/offer-optimization")
async def get_offer_optimization(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Analyzes offer performance (Created, Replies, Deals, Revenue) and gives Scale/Modify recommendations.
    """
    offers = await offer_optimizer.analyze_offers(db, mission_id)
    return offers

@router.get("/source-intelligence")
async def get_source_intelligence(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Evaluates connector attribution, signals found, qualified leads, and closed revenue per source.
    """
    sources = await source_intelligence.analyze_sources(db, mission_id)
    return sources

@router.get("/revenue-gap/{mission_id}")
async def get_revenue_gap_analysis(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Calculates net revenue gap (Target - Confirmed - Weighted Pipeline) and prescribes required actions.
    """
    gap = await revenue_gap_analyzer.analyze_mission_gap(db, mission_id)
    return gap

@router.get("/top-priorities/{mission_id}")
async def get_top_priorities(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Calculates the Daily Top 10 High-Impact Actions ranked by revenue potential x closing probability.
    """
    priorities = await priority_engine.calculate_top_priorities(db, mission_id)
    return priorities

@router.get("/experiments/{mission_id}")
async def get_experiments(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Lists active and concluded A/B growth experiments.
    """
    experiments = await experiment_engine.get_or_seed_experiments(db, mission_id)
    return experiments

@router.post("/experiments/create")
async def create_experiment(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Creates a new A/B growth experiment.
    """
    result = await experiment_engine.create_experiment(
        session=db,
        mission_id=payload["mission_id"],
        name=payload["name"],
        hypothesis=payload["hypothesis"],
        variant_a=payload["variant_a"],
        variant_b=payload["variant_b"]
    )
    return result

@router.get("/weekly-report/{mission_id}")
async def get_weekly_business_report(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates executive Weekly Business Report.
    """
    report = await weekly_reporter.generate_weekly_report(db, mission_id)
    return report

@router.get("/morning-briefing/{mission_id}")
async def get_morning_ceo_briefing(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates morning CEO Daily Briefing with Yesterday's stats, Today's target, Risk Alerts, and Strategy.
    """
    briefing = await weekly_reporter.generate_morning_ceo_briefing(db, mission_id)
    return briefing


@router.get("/target-achievement-plan/{mission_id}")
async def get_target_achievement_plan(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    CEO Brain: Calculates how to achieve mission revenue target in remaining hours:
    - Calls needed
    - Messages needed
    - Offers needed
    - Expected conversion rate
    """
    from app.services.ceo_brain.target_achievement_engine import target_achievement_engine
    plan = await target_achievement_engine.calculate_target_achievement_plan(db, mission_id)
    return plan


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.schemas.schemas import RevenueLearningResponse, PerformanceReportResponse
from app.services.revenue_learning_engine import revenue_learning_engine

router = APIRouter(prefix="/learning", tags=["learning"])

@router.get("/insights/{mission_id}", response_model=List[RevenueLearningResponse])
@router.get("/insights", response_model=List[RevenueLearningResponse])
async def get_learning_insights(mission_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """
    Revenue Memory & Learning Engine:
    Returns historical intelligence on high-converting industries, best offers, reply velocity, and average deal size.
    """
    insights = await revenue_learning_engine.generate_learning_insights(db, mission_id)
    return insights

@router.get("/performance-report/{mission_id}", response_model=PerformanceReportResponse)
async def get_weekly_performance_report(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Autonomous Improvement:
    Synthesizes a full Performance Report identifying best performing industry, best offer,
    bottlenecks, and strategic recommendations.
    """
    report = await revenue_learning_engine.generate_weekly_performance_report(db, mission_id)
    if report.get("status") == "error":
        raise HTTPException(status_code=404, detail=report.get("message", "Mission not found"))
    return report

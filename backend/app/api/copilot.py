from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.schemas.schemas import CopilotOpportunityAnalysisRequest, CopilotOpportunityAnalysisResponse
from app.services.revenue_copilot import revenue_copilot

router = APIRouter(prefix="/copilot", tags=["copilot"])

@router.post("/analyze-opportunity", response_model=CopilotOpportunityAnalysisResponse)
async def analyze_opportunity_with_copilot(payload: CopilotOpportunityAnalysisRequest, db: AsyncSession = Depends(get_db)):
    """
    Revenue Copilot deep analysis:
    Formulates problem diagnostics, recommended service, pricing terms, pitch message, and follow-up sequence.
    """
    result = await revenue_copilot.analyze_opportunity(
        session=db,
        opportunity_id=payload.opportunity_id,
        revenue_opportunity_id=payload.revenue_opportunity_id,
        problem_text=payload.problem_text,
        company=payload.company,
        industry=payload.industry,
        target_budget=payload.target_budget,
        currency=payload.currency
    )
    return result

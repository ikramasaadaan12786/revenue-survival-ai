from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.models.entities import Lead, Proposal, Mission
from app.schemas.schemas import (
    LeadQualificationRequest,
    LeadQualificationResponse,
    SalesClosingStrategyRequest,
    SalesClosingStrategyResponse,
    ProposalGenerateRequest,
    ProposalResponse,
    PipelineStageUpdateRequest,
    DealPipelineOverviewResponse,
    PipelineStageMetrics
)
from app.services.lead_qualification_engine import lead_qualification_engine
from app.services.sales_closing_assistant import sales_closing_assistant
from app.services.proposal_generator import proposal_generator_service

router = APIRouter(prefix="/closing-engine", tags=["closing-engine"])

# 1. Lead Qualification Endpoint
@router.post("/qualify-lead", response_model=LeadQualificationResponse)
async def qualify_lead_endpoint(payload: LeadQualificationRequest, db: AsyncSession = Depends(get_db)):
    """
    AI Lead Qualification Agent:
    Scores opportunity from 0 to 100 and classifies into HOT, QUALIFIED, WARM, or COLD.
    """
    result = await lead_qualification_engine.qualify_lead(
        session=db,
        lead_id=payload.lead_id,
        opportunity_id=payload.opportunity_id,
        company_name=payload.company_name,
        requirement_text=payload.requirement_text,
        channel=payload.channel,
        contact_name=payload.contact_name,
        industry=payload.industry
    )
    return result


# 2. Sales Closing Copilot Endpoint
@router.post("/sales-copilot", response_model=SalesClosingStrategyResponse)
async def get_sales_closing_strategy(payload: SalesClosingStrategyRequest, db: AsyncSession = Depends(get_db)):
    """
    AI Sales Closing Assistant:
    Generates Discovery Questions, Objection Handling Battlecards, and Negotiation Strategies.
    """
    result = await sales_closing_assistant.generate_closing_strategy(
        session=db,
        lead_id=payload.lead_id,
        opportunity_id=payload.opportunity_id,
        company_name=payload.company_name,
        industry=payload.industry,
        target_budget=payload.target_budget,
        current_objection=payload.current_objection
    )
    return result


# 3. Proposal Generator Endpoints
@router.post("/generate-proposal", response_model=ProposalResponse)
async def generate_proposal_endpoint(payload: ProposalGenerateRequest, db: AsyncSession = Depends(get_db)):
    """
    AI Proposal Generation Engine:
    Creates tailored commercial proposals for AI Agents, Software, Websites, SaaS, Real Estate & Marketing.
    """
    result = await proposal_generator_service.generate_proposal(
        session=db,
        mission_id=payload.mission_id,
        lead_id=payload.lead_id,
        opportunity_id=payload.opportunity_id,
        proposal_type=payload.proposal_type,
        client_name=payload.client_name,
        client_industry=payload.client_industry,
        problem_description=payload.problem_description,
        custom_budget=payload.custom_budget,
        timeline_days=payload.timeline_days
    )
    return result

@router.get("/proposals/{mission_id}", response_model=List[ProposalResponse])
async def get_mission_proposals(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Lists all generated proposals for a mission.
    """
    proposals = await proposal_generator_service.get_proposals_by_mission(db, mission_id)
    return proposals


# 4. Upgraded Deal Pipeline Endpoints
@router.patch("/leads/{lead_id}/pipeline-stage")
async def update_pipeline_stage(lead_id: int, payload: PipelineStageUpdateRequest, db: AsyncSession = Depends(get_db)):
    """
    Moves lead through the upgraded 14-stage Deal Pipeline:
    DISCOVERED -> QUALIFIED -> OFFER_CREATED -> CONTACT_PENDING -> CONTACTED -> 
    DISCOVERY_CALL -> PROPOSAL_SENT -> FOLLOW_UP -> OBJECTION -> NEGOTIATION -> 
    CLOSING -> PAYMENT_PENDING -> WON / LOST
    """
    lead = await db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead.pipeline_stage = payload.stage.upper()
    if payload.notes:
        lead.notes = f"{lead.notes or ''}\n[{payload.stage.upper()}]: {payload.notes}".strip()
    if payload.revenue_probability is not None:
        lead.revenue_probability = payload.revenue_probability

    # Sync standard status
    if payload.stage.upper() == "WON":
        lead.status = "DEAL"
    elif payload.stage.upper() in ["DISCOVERY_CALL", "NEGOTIATION"]:
        lead.status = "MEETING"
    elif payload.stage.upper() in ["CONTACTED", "PROPOSAL_SENT", "FOLLOW_UP"]:
        lead.status = "CONTACTED"
        
    await db.commit()
    await db.refresh(lead)
    return {
        "status": "success",
        "lead_id": lead.id,
        "new_stage": lead.pipeline_stage,
        "revenue_probability": lead.revenue_probability
    }

@router.get("/pipeline/overview/{mission_id}", response_model=DealPipelineOverviewResponse)
async def get_deal_pipeline_overview(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns full Deal Pipeline breakdown with stage metrics, stage durations, and revenue probabilities.
    """
    leads = (await db.execute(select(Lead).where(Lead.mission_id == mission_id))).scalars().all()

    stages_order = [
        ("DISCOVERED", 0.10, 2.0),
        ("QUALIFIED", 0.25, 4.0),
        ("OFFER_CREATED", 0.40, 6.0),
        ("CONTACT_PENDING", 0.45, 12.0),
        ("CONTACTED", 0.50, 18.0),
        ("DISCOVERY_CALL", 0.60, 24.0),
        ("PROPOSAL_SENT", 0.70, 36.0),
        ("FOLLOW_UP", 0.75, 48.0),
        ("OBJECTION", 0.65, 30.0),
        ("NEGOTIATION", 0.85, 40.0),
        ("CLOSING", 0.90, 24.0),
        ("PAYMENT_PENDING", 0.95, 12.0),
        ("WON", 1.00, 0.0),
        ("LOST", 0.00, 0.0)
    ]

    stage_metrics = []
    total_val = 0.0
    weighted_val = 0.0

    for st_name, default_prob, default_dur in stages_order:
        matched_leads = [l for l in leads if (l.pipeline_stage or "DISCOVERED").upper() == st_name]
        st_val = sum(l.expected_value or 3500.0 for l in matched_leads)
        total_val += st_val
        weighted_val += st_val * default_prob
        conv_rate = round((len(matched_leads) / len(leads) * 100.0), 1) if len(leads) > 0 else 0.0

        stage_metrics.append(PipelineStageMetrics(
            stage_name=st_name,
            count=len(matched_leads),
            total_value=st_val,
            conversion_rate=conv_rate,
            avg_duration_hours=default_dur
        ))

    return DealPipelineOverviewResponse(
        mission_id=mission_id,
        total_leads=len(leads),
        pipeline_value=total_val,
        weighted_pipeline_value=round(weighted_val, 2),
        stages=stage_metrics
    )

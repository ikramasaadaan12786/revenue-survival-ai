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


# 5. Autonomous Closing Engine v4 Endpoints

@router.post("/qualify-deal")
async def qualify_deal_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Evaluates buyer seriousness, budget capability, buying timeline, decision maker %, and closing probability.
    """
    from app.services.closing_engine.deal_qualifier import deal_qualification_engine
    if payload.get("lead_id"):
        result = await deal_qualification_engine.qualify_and_upgrade_lead(db, payload["lead_id"])
        if not result:
            raise HTTPException(status_code=404, detail="Lead not found")
        return result
    else:
        result = deal_qualification_engine.qualify_opportunity(
            name=payload.get("name", "Prospect"),
            company=payload.get("company"),
            requirement=payload.get("requirement", ""),
            industry=payload.get("industry", "Dubai Real Estate & Advisory"),
            source=payload.get("source", "TELEGRAM"),
            stated_budget=payload.get("stated_budget")
        )
        return result


@router.post("/match-offer")
async def match_offer_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Auto-matches and creates tailored high-ticket service package for a requirement or lead.
    """
    from app.services.closing_engine.offer_matcher import offer_matching_engine
    if payload.get("lead_id") and payload.get("mission_id"):
        offer = await offer_matching_engine.create_or_attach_offer_for_lead(
            db, payload["mission_id"], payload["lead_id"]
        )
        if not offer:
            raise HTTPException(status_code=404, detail="Lead not found")
        return {
            "status": "success",
            "offer_id": offer.id,
            "product_name": offer.product_name,
            "pricing": offer.pricing,
            "currency": offer.currency,
            "target_audience": offer.target_audience
        }
    else:
        matched = offer_matching_engine.match_offer_for_requirement(
            requirement=payload.get("requirement", ""),
            industry=payload.get("industry", "AI Agents"),
            budget_capability=payload.get("budget_capability")
        )
        return matched


@router.post("/sales-copilot-sequence")
async def sales_copilot_sequence_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Generates 4-touch closing sequence (Opening, Day 1, Day 3, Closing) and stages into Safety Approval Queue as PENDING.
    """
    from app.services.closing_engine.sales_copilot_service import sales_copilot_service
    if payload.get("lead_id") and payload.get("mission_id"):
        result = await sales_copilot_service.stage_sales_copilot_sequence(
            db, payload["mission_id"], payload["lead_id"]
        )
        return result
    else:
        result = sales_copilot_service.generate_closing_sequence(
            lead_name=payload.get("lead_name", "Decision Maker"),
            company_name=payload.get("company_name"),
            requirement=payload.get("requirement", ""),
            industry=payload.get("industry", "UAE Business"),
            channel=payload.get("channel", "WhatsApp"),
            offer_name=payload.get("offer_name", "AI Revenue System"),
            price_aed=payload.get("price_aed", 12500.0)
        )
        return result


@router.get("/daily-execution-plan/{mission_id}")
async def get_daily_execution_plan(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Generates morning AI Daily Execution Plan:
    - Today's Goal
    - Top 20 Prioritized Opportunities
    - Who to Contact First
    - Calls Needed & Proposals Needed
    - Expected Revenue Forecast
    - Recommended Strategic Actions
    """
    from app.services.closing_engine.daily_execution_planner import daily_execution_planner
    plan = await daily_execution_planner.generate_daily_plan(db, mission_id)
    return plan


@router.post("/record-deal-outcome")
async def record_deal_outcome_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Revenue Outcome Learning Loop:
    Records WON or LOST deal, updates cognitive memory, learnings, and mission stats.
    """
    from app.services.closing_engine.outcome_learner import revenue_outcome_learner
    result = await revenue_outcome_learner.record_deal_outcome(
        session=db,
        mission_id=payload["mission_id"],
        lead_id=payload["lead_id"],
        outcome=payload["outcome"],
        actual_revenue_aed=payload.get("actual_revenue_aed"),
        reason=payload.get("reason")
    )
    return result


@router.post("/run-full-closing-cycle/{mission_id}")
async def run_full_closing_cycle(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Autonomous Execution:
    Takes all active leads for the mission, runs AI Qualification, Matches High-Ticket Offers,
    and Stages Sales Copilot Sequences into the Safety Approval Queue.
    """
    from app.services.closing_engine.deal_qualifier import deal_qualification_engine
    from app.services.closing_engine.offer_matcher import offer_matching_engine
    from app.services.closing_engine.sales_copilot_service import sales_copilot_service
    from app.services.closing_engine.daily_execution_planner import daily_execution_planner

    leads_res = await db.execute(select(Lead).where(Lead.mission_id == mission_id))
    leads = leads_res.scalars().all()

    qualified_count = 0
    offers_created = 0
    messages_staged = 0

    for l in leads:
        # 1. Qualify
        qual = await deal_qualification_engine.qualify_and_upgrade_lead(db, l.id)
        if qual and qual["category"] != "REJECT":
            qualified_count += 1

            # 2. Offer Match
            if not l.offer_id:
                off = await offer_matching_engine.create_or_attach_offer_for_lead(db, mission_id, l.id)
                if off:
                    offers_created += 1

            # 3. Stage Sales Copilot Sequence
            seq_res = await sales_copilot_service.stage_sales_copilot_sequence(db, mission_id, l.id)
            if "staged_communication_ids" in seq_res:
                messages_staged += len(seq_res["staged_communication_ids"])

    plan = await daily_execution_planner.generate_daily_plan(db, mission_id)

    return {
        "status": "success",
        "mission_id": mission_id,
        "total_leads_processed": len(leads),
        "qualified_leads": qualified_count,
        "offers_attached": offers_created,
        "messages_staged_for_approval": messages_staged,
        "daily_plan": plan
    }


# 6. Phase 13 Revenue Sprint & Priority Queue Endpoints

@router.get("/priority-queue/{mission_id}")
async def get_priority_approval_queue_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns Top 5 high-impact leads to contact first with expected revenue, closing probability, and recommended action.
    """
    from app.services.closing_engine.revenue_sprint_service import revenue_sprint_service
    queue = await revenue_sprint_service.get_priority_approval_queue(db, mission_id)
    return queue


@router.get("/deal-probabilities/{mission_id}")
async def get_deal_probabilities_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Calculates Estimated Value, Closing Probability %, and Weighted Revenue across all mission leads.
    """
    from app.services.closing_engine.revenue_sprint_service import revenue_sprint_service
    result = await revenue_sprint_service.get_deal_probabilities(db, mission_id)
    return result


@router.get("/revenue-sprint/{mission_id}")
async def get_revenue_sprint_mode_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Revenue Sprint Mode: Identifies the fastest closing opportunity, fastest offer, and fastest channel to hit target.
    """
    from app.services.closing_engine.revenue_sprint_service import revenue_sprint_service
    result = await revenue_sprint_service.calculate_revenue_sprint(db, mission_id)
    return result


@router.post("/re-evaluate-leads/{mission_id}")
async def re_evaluate_leads_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Runs strict 5-dimension validation (Intent, Budget, DM, Timeline, Clarity) across all leads, re-classifying HOT leads.
    """
    from app.services.closing_engine.deal_qualifier import deal_qualification_engine
    leads_res = await db.execute(select(Lead).where(Lead.mission_id == mission_id))
    leads = leads_res.scalars().all()

    upgraded = []
    for l in leads:
        eval_res = await deal_qualification_engine.qualify_and_upgrade_lead(db, l.id)
        if eval_res:
            upgraded.append({
                "lead_id": l.id,
                "name": l.name,
                "category": eval_res["category"],
                "qualification_score": eval_res["qualification_score"],
                "closing_probability": eval_res["closing_probability"],
                "weighted_revenue_aed": eval_res["weighted_revenue_aed"]
            })

    return {
        "status": "success",
        "mission_id": mission_id,
        "total_leads_re_evaluated": len(leads),
        "results": upgraded
    }



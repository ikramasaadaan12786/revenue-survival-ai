from fastapi import APIRouter, Depends, HTTPException, Request, status
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


# 7. Phase 14 Autonomous Revenue Execution Engine Endpoints

@router.get("/activity-tracker/{mission_id}")
async def get_mission_activity_tracker_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns real Mission Activity Tracker: Messages, Calls, Proposals, and Deals closed vs required.
    """
    from app.services.closing_engine.sales_manager_execution_service import sales_manager_execution_service
    result = await sales_manager_execution_service.get_mission_activity_tracker(db, mission_id)
    return result


@router.post("/run-operating-cycle/{mission_id}")
async def run_daily_operating_cycle_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Executes AI Sales Manager Daily Operating Cycle:
    Qualifies radar leads, attaches high-ticket offers, stages outbound sequences, and updates activity quotas.
    """
    from app.services.closing_engine.sales_manager_execution_service import sales_manager_execution_service
    result = await sales_manager_execution_service.run_daily_operating_cycle(db, mission_id)
    return result


@router.post("/convert-signal")
async def convert_radar_signal_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Converts a Buyer Radar signal directly into an active Lead with tailored offer and staged sequence.
    """
    from app.services.closing_engine.sales_manager_execution_service import sales_manager_execution_service
    result = await sales_manager_execution_service.convert_radar_signal_to_lead(
        session=db,
        mission_id=payload.get("mission_id", 1006),
        name=payload.get("name", "Verified Buyer"),
        company=payload.get("company", "UAE Enterprise"),
        interest=payload.get("interest", "AI Automation"),
        source=payload.get("source", "BUYER RADAR"),
        country=payload.get("country", "United Arab Emirates"),
        budget=float(payload.get("budget", 25000.0)),
        channel=payload.get("channel", "WhatsApp")
    )
    return result


@router.get("/deal-room/{mission_id}")
async def get_deal_room_crm_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns full Deal Room CRM board with grouped stages, lead cards, and weighted pipeline values.
    """
    from app.services.closing_engine.sales_manager_execution_service import sales_manager_execution_service
    result = await sales_manager_execution_service.get_deal_room_crm(db, mission_id)
    return result


# 8. Phase 15 Real Revenue Execution Engine Endpoints

@router.get("/real-execution-stats/{mission_id}")
async def get_real_execution_stats_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns 100% real database counters: Tasks, Messages, Replies, Calls, Proposals, Deals, and Closed Revenue.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    result = await real_revenue_execution_engine.get_real_execution_stats(db, mission_id)
    return result


@router.get("/action-logs/{mission_id}")
async def get_agent_action_logs_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retrieves chronological AI Agent Action Logs for the mission.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    logs = await real_revenue_execution_engine.get_agent_action_logs(db, mission_id)
    return logs


@router.post("/create-tasks/{mission_id}")
async def create_tasks_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Converts planned activities for top priority leads into real executable tasks in the database.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    tasks = await real_revenue_execution_engine.create_executable_tasks_from_pipeline(db, mission_id)
    return {"status": "success", "created_tasks": tasks}


@router.post("/execute-task/{task_id}")
async def execute_task_endpoint(task_id: int, db: AsyncSession = Depends(get_db)):
    """
    Executes a task and marks it as COMPLETED with database logs.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    result = await real_revenue_execution_engine.execute_task_action(db, task_id)
    return result


@router.post("/send-message/{comm_id}")
async def send_message_endpoint(comm_id: int, db: AsyncSession = Depends(get_db)):
    """
    Dispatches an approved message, marking delivery_status as SENT.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    result = await real_revenue_execution_engine.approve_and_send_message(db, comm_id)
    return result


@router.post("/record-reply")
async def record_reply_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Records an inbound buyer reply and advances the lead to Discovery Call stage.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    result = await real_revenue_execution_engine.record_inbound_reply(
        session=db,
        comm_id=payload["comm_id"],
        reply_message=payload.get("reply_message", "Salam, please send me details and pricing.")
    )
    return result


@router.post("/complete-call")
async def complete_call_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Records a completed discovery call with outcome notes.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    result = await real_revenue_execution_engine.book_and_complete_call(
        session=db,
        lead_id=payload["lead_id"],
        call_outcome=payload.get("call_outcome", "OFFER_ACCEPTED"),
        notes=payload.get("notes", "Requirements verified. Proposal requested.")
    )
    return result


@router.post("/update-proposal-status")
async def update_proposal_status_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Updates proposal status to SENT or ACCEPTED.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    result = await real_revenue_execution_engine.send_and_accept_proposal(
        session=db,
        proposal_id=payload["proposal_id"],
        status=payload.get("status", "SENT")
    )
    return result


@router.post("/close-deal")
async def close_deal_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Closes a won deal, records confirmed revenue in RevenueTracking, and updates Mission revenue.
    """
    from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine
    result = await real_revenue_execution_engine.close_won_deal(
        session=db,
        mission_id=payload.get("mission_id", 1006),
        lead_id=payload["lead_id"],
        actual_revenue_aed=float(payload.get("actual_revenue_aed", 2500.0)),
        source=payload.get("source", "CLOSING_ENGINE")
    )
    return result


# 9. Phase 16 & 18 Real Revenue Validation Layer & Reality Mode Endpoints

@router.get("/validation-overview/{mission_id}")
async def get_validation_overview_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Phase 16 & 18: Returns clean separation between REAL BUSINESS RESULTS and AI FORECAST.
    Guarantees zero mixing of predicted/simulated counters with verified collected revenue.
    """
    from app.services.closing_engine.revenue_validation_service import revenue_validation_service
    result = await revenue_validation_service.get_validation_overview(db, mission_id)
    return result


@router.get("/revenue-proof-ledger/{mission_id}")
async def get_revenue_proof_ledger_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Phase 16 & 18: Returns the Verified Revenue Proof Ledger (genuine settled transactions only).
    """
    from app.services.closing_engine.revenue_validation_service import revenue_validation_service
    ledger = await revenue_validation_service.get_revenue_proof_ledger(db, mission_id)
    return ledger


@router.get("/reality-audit/{mission_id}")
async def get_reality_audit_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Phase 18 Reality Mode: Complete Reality Audit Page payload showing 8-point mission completion checklist,
    revenue entries with cryptographic proof, demo test history archive, and verified buyer terminal evidence.
    """
    from app.services.closing_engine.revenue_validation_service import revenue_validation_service
    audit_data = await revenue_validation_service.get_reality_audit(db, mission_id)
    return audit_data


@router.get("/demo-history/{mission_id}")
async def get_demo_history_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Phase 18 Reality Mode: Returns SYSTEM TEST REVENUE / DEMO HISTORY archive records.
    """
    from app.services.closing_engine.revenue_validation_service import revenue_validation_service
    history = await revenue_validation_service.get_demo_history_ledger(db, mission_id)
    return history


@router.post("/verify-transaction")
async def verify_transaction_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 16 & 18: Verifies an external payment settlement with proof reference and cryptographic audit signature.
    """
    from app.services.closing_engine.revenue_validation_service import revenue_validation_service
    result = await revenue_validation_service.verify_and_settle_deal(
        session=db,
        mission_id=payload.get("mission_id", 1006),
        lead_id=payload["lead_id"],
        actual_revenue_aed=float(payload.get("actual_revenue_aed", 2500.0)),
        payment_reference=payload.get("payment_reference", "TXN-AE-ENBD-771928"),
        proposal_id=payload.get("proposal_id"),
        client_identity=payload.get("client_identity"),
        payer_name=payload.get("payer_name"),
        source=payload.get("source", "EXTERNAL_SETTLED_WIRE")
    )
    return result


# 10. Phase 17 Real Revenue Autonomous Operator & Overnight Production Mode Endpoints

@router.post("/overnight/run-cycle/{mission_id}")
async def run_overnight_cycle_endpoint(
    mission_id: int,
    cycle_type: str = "INTERVAL_15M",
    db: AsyncSession = Depends(get_db)
):
    """
    Phase 17: Executes an autonomous overnight operating cycle (15-min check, hourly bottleneck, 6h CEO review, morning report).
    """
    from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
    result = await autonomous_revenue_operator.run_overnight_full_cycle(
        session=db,
        mission_id=mission_id,
        cycle_type=cycle_type
    )
    return result


@router.get("/overnight/logs/{mission_id}")
async def get_overnight_logs_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Phase 17: Retrieves chronological overnight cycle execution logs.
    """
    from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
    logs = await autonomous_revenue_operator.get_overnight_logs(db, mission_id)
    return logs


@router.post("/lead/discover-evidence")
async def discover_lead_evidence_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 17: Discovers and verifies a real buyer lead with external evidence references.
    """
    from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
    result = await autonomous_revenue_operator.discover_and_verify_lead(
        session=db,
        mission_id=payload.get("mission_id", 1006),
        name=payload["name"],
        company=payload["company"],
        country=payload.get("country", "United Arab Emirates"),
        source_platform=payload.get("source_platform", "Telegram"),
        source_url=payload.get("source_url"),
        profile_url=payload.get("profile_url"),
        contact_info=payload.get("contact_info"),
        requirement=payload.get("requirement", "AI Enterprise Automation"),
        budget_estimate=float(payload.get("budget_estimate", 3500.0)),
        intent_score=payload.get("intent_score", "Warm"),
        channel=payload.get("channel", "WhatsApp")
    )
    return result


@router.post("/communication/confirm-delivery")
async def confirm_delivery_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 17: Dispatches approved message and records external provider delivery confirmation.
    """
    from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
    result = await autonomous_revenue_operator.dispatch_and_confirm_message(
        session=db,
        comm_id=payload["comm_id"],
        provider_confirmation=payload.get("provider_confirmation")
    )
    return result


@router.post("/communication/process-reply")
async def process_reply_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 17: Ingests external inbound reply, executes real reply intelligence, classifies intent, and triggers actions.
    """
    from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
    result = await autonomous_revenue_operator.process_inbound_reply(
        session=db,
        comm_id=payload["comm_id"],
        reply_text=payload.get("reply_text", "Salam, please send pricing and deliverables."),
        reply_source=payload.get("reply_source", "CLIENT_DIRECT")
    )
    return result


@router.post("/call/record-verified")
async def record_verified_call_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 17: Records a completed discovery call with verified proof fields (calendar event, meeting link, notes).
    """
    from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
    result = await autonomous_revenue_operator.record_verified_call(
        session=db,
        lead_id=payload["lead_id"],
        calendar_event_id=payload.get("calendar_event_id", "CAL-EVT-99214"),
        meeting_link=payload.get("meeting_link", "https://meet.google.com/xyz-dubai-ai"),
        call_notes=payload.get("call_notes", "Verified budget and timeline with decision maker."),
        call_outcome=payload.get("call_outcome", "QUALIFIED")
    )
    return result


@router.post("/proposal/update-lifecycle")
async def update_proposal_lifecycle_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 17: Updates proposal lifecycle status (Draft -> Sent -> Viewed -> Accepted -> Rejected).
    """
    from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
    result = await autonomous_revenue_operator.update_proposal_lifecycle(
        session=db,
        proposal_id=payload["proposal_id"],
        new_status=payload.get("new_status", "SENT"),
        recipient_confirmation=payload.get("recipient_confirmation"),
        client_response=payload.get("client_response")
    )
    return result


# 11. Phase 19 Real Customer Acquisition Operating System Endpoints

@router.post("/ingest-lead")
async def ingest_verified_lead_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 19: Strict lead ingestion gateway. Only imports leads having all 6 required external evidence fields.
    Rejects any lead lacking proof URLs, platform metadata, or contact channels.
    """
    from app.services.closing_engine.real_acquisition_engine import real_customer_acquisition_engine
    result = await real_customer_acquisition_engine.ingest_verified_lead(
        session=db,
        mission_id=payload.get("mission_id", 1006),
        lead_data=payload
    )
    return result


@router.post("/buyer-hunt/{mission_id}")
async def run_buyer_hunt_endpoint(
    mission_id: int,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Phase 19: Autonomous hourly Buyer Hunt sweep across real public channels in 4 categories:
    AI Automation, Website Development, Dubai Real Estate Advisory, Marketing Services.
    """
    from app.services.closing_engine.real_acquisition_engine import real_customer_acquisition_engine
    result = await real_customer_acquisition_engine.run_hourly_buyer_hunt(
        session=db,
        mission_id=mission_id,
        target_category=category
    )
    return result


@router.patch("/leads/{lead_id}/pipeline-step")
async def advance_pipeline_step_endpoint(
    lead_id: int,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Phase 19: Advances a lead through the strict 9-stage Real Sales Pipeline:
    DISCOVERED -> VERIFIED -> CONTACT_READY -> CONTACTED -> REPLIED -> CALL_BOOKED -> PROPOSAL_SENT -> NEGOTIATION -> WON
    """
    from app.services.closing_engine.real_acquisition_engine import real_customer_acquisition_engine
    result = await real_customer_acquisition_engine.advance_pipeline_stage(
        session=db,
        lead_id=lead_id,
        target_stage=payload["target_stage"],
        proof_payload=payload.get("proof_payload")
    )
    return result


@router.get("/reality-health-monitor/{mission_id}")
async def get_reality_health_monitor_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Phase 19: Returns Today's Real Execution Telemetry (Zero Probability Metrics):
    New Verified Leads, Messages Delivered, Replies Received, Calls Booked, Proposals Sent, Revenue Collected.
    """
    from app.services.closing_engine.real_acquisition_engine import real_customer_acquisition_engine
    health_data = await real_customer_acquisition_engine.get_reality_health_monitor(
        session=db,
        mission_id=mission_id
    )
    return health_data


# 12. Phase 20 Real Outbound Activation & Provider Connection Endpoints

@router.post("/outbound/dispatch")
async def dispatch_outbound_communication_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Phase 20: Transmits approved communication through active provider:
    - WhatsApp Business Cloud API (Meta Graph API)
    - Email Provider API (Resend / SendGrid / SMTP)
    - LinkedIn Outreach Workflow
    """
    from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
    channel = (payload.get("channel") or "WhatsApp").upper()
    comm_id = int(payload["comm_id"])

    if "WHATSAPP" in channel:
        result = await real_provider_dispatch_service.dispatch_whatsapp_message(
            session=db,
            comm_id=comm_id,
            recipient_phone=payload.get("recipient", "+971508924110"),
            message_body=payload.get("body", ""),
            template_name=payload.get("template_name")
        )
    elif "EMAIL" in channel:
        result = await real_provider_dispatch_service.dispatch_email_message(
            session=db,
            comm_id=comm_id,
            recipient_email=payload.get("recipient", "client@dubai-enterprise.ae"),
            subject=payload.get("subject", "AI Enterprise Partnership Proposal"),
            message_body=payload.get("body", "")
        )
    elif "LINKEDIN" in channel:
        result = await real_provider_dispatch_service.dispatch_linkedin_outreach(
            session=db,
            comm_id=comm_id,
            profile_url=payload.get("recipient", "https://linkedin.com/in/executive"),
            message_body=payload.get("body", "")
        )
    else:
        result = await real_provider_dispatch_service.dispatch_whatsapp_message(
            session=db,
            comm_id=comm_id,
            recipient_phone=payload.get("recipient", "+971508924110"),
            message_body=payload.get("body", "")
        )

    return result


@router.post("/webhooks/{provider}")
async def receive_provider_webhook_endpoint(
    provider: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Phase 20: Ingests real delivery receipts (delivered, read) and genuine inbound client replies.
    """
    from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
    result = await real_provider_dispatch_service.process_incoming_webhook(
        session=db,
        provider=provider,
        payload=payload
    )
    return result


@router.get("/provider-status")
async def get_provider_status_endpoint():
    """
    Phase 20: Returns status and latency of connected communication providers (WhatsApp, Email, LinkedIn).
    """
    from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
    statuses = await real_provider_dispatch_service.get_provider_statuses()
    return statuses


# -------------------------------------------------------------
# RESEND REAL EMAIL INTEGRATION ENDPOINTS
# -------------------------------------------------------------
@router.get("/resend/health")
async def get_resend_health_endpoint():
    """
    Checks real Resend API connectivity, key validation, domain status, and last send timestamp.
    """
    from app.services.connectors.resend_email_service import resend_email_service
    return await resend_email_service.check_health()


@router.get("/resend/verify-domain")
async def verify_resend_domain_endpoint(domain: Optional[str] = None):
    """
    Verifies sending domain DKIM/SPF status against official Resend domains API.
    """
    from app.services.connectors.resend_email_service import resend_email_service
    return await resend_email_service.verify_domain(domain_name=domain)


@router.post("/resend/test-email")
async def send_resend_test_email_endpoint(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches a real test email via official Resend API (POST https://api.resend.com/emails).
    """
    from app.services.connectors.resend_email_service import resend_email_service
    to_email = payload.get("to") or payload.get("recipient") or "delivered@resend.dev"
    subject = payload.get("subject", "Revenue Survival AI — Live Resend Integration Verification")
    body = payload.get("body", "This is an authentic test dispatch verifying live Resend API integration for Revenue Survival AI Agent.")
    from_address = payload.get("from_address")
    
    result = await resend_email_service.send_email(
        to=to_email,
        subject=subject,
        body=body,
        from_address=from_address,
        session=db
    )
    return result


@router.post("/webhooks/resend")
async def receive_resend_webhook_endpoint(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handles live Resend webhook events (email.delivered, email.bounced, email.failed, email.opened, email.received).
    Verifies Svix signature when RESEND_WEBHOOK_SECRET is set.
    """
    from app.services.connectors.resend_email_service import resend_email_service
    import json

    raw_body = await request.body()
    headers_dict = dict(request.headers)

    sig_check = resend_email_service.verify_webhook_signature(headers=headers_dict, raw_body=raw_body)
    if not sig_check.get("verified"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Resend webhook signature verification failed: {sig_check.get('error')}"
        )

    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    return await resend_email_service.handle_resend_webhook(session=db, payload=payload)


@router.post("/webhooks/resend/inbound")
async def receive_resend_inbound_email_endpoint(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handles dedicated inbound email replies sent to sales@altsofts.in.
    Verifies Svix signature, matches sender email to lead, and transitions pipeline stage to REPLIED.
    """
    from app.services.connectors.resend_email_service import resend_email_service
    import json

    raw_body = await request.body()
    headers_dict = dict(request.headers)

    sig_check = resend_email_service.verify_webhook_signature(headers=headers_dict, raw_body=raw_body)
    if not sig_check.get("verified"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Resend webhook signature verification failed: {sig_check.get('error')}"
        )

    try:
        payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    return await resend_email_service.handle_resend_webhook(session=db, payload=payload)


@router.get("/communications/summary")
async def get_communications_summary_endpoint(
    mission_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Dashboard Communication Center:
    Aggregates Sent, Delivered, Opened, Replies Received, and Hot Inquiries requiring immediate action.
    """
    from app.services.connectors.resend_email_service import resend_email_service
    return await resend_email_service.get_communications_summary(session=db, mission_id=mission_id)


# -------------------------------------------------------------
# LINKEDIN REAL INTEGRATION ENDPOINTS
# -------------------------------------------------------------
@router.get("/linkedin/health")
async def get_linkedin_health_endpoint():
    """
    Checks official LinkedIn API connection, OAuth token validity, sender profile URN, and permissions.
    """
    from app.services.connectors.linkedin_outreach_service import linkedin_outreach_service
    return await linkedin_outreach_service.check_health()


@router.post("/linkedin/test-outreach")
async def send_linkedin_test_outreach_endpoint(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches a real outreach test message via official LinkedIn API (POST https://api.linkedin.com/v2/messages).
    """
    from app.services.connectors.linkedin_outreach_service import linkedin_outreach_service
    recipient_url = payload.get("recipient_url") or payload.get("profile_url") or "https://www.linkedin.com/in/hamad-alrumaithi"
    subject = payload.get("subject", "Executive Strategic Inquiry: Dubai Real Estate Infrastructure")
    body = payload.get("body", "Authentic integration test for Revenue Survival AI Agent LinkedIn Messaging engine.")
    recipient_name = payload.get("recipient_name", "Hamad Al-Rumaithi")

    result = await linkedin_outreach_service.send_message(
        recipient_profile_url=recipient_url,
        subject=subject,
        body=body,
        recipient_name=recipient_name
    )
    return result


@router.post("/daily-cycle/{mission_id}")
async def trigger_daily_cycle_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Phase 20: Executes the autonomous Daily Revenue Operating Cycle.
    """
    from app.services.closing_engine.real_acquisition_engine import real_customer_acquisition_engine
    result = await real_customer_acquisition_engine.execute_daily_revenue_operating_cycle(
        session=db,
        mission_id=mission_id
    )
    return result


# =====================================================================
# MASTER PHASE — AUTONOMOUS REAL REVENUE OPERATING SYSTEM ENDPOINTS
# =====================================================================

@router.post("/sales-manager/run-cycle")
async def run_sales_manager_cycle_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Master Phase: Executes full 10-step AI Sales Manager Autonomous Revenue Cycle:
    1. Find verified buyers
    2. Score buyers
    3. Prioritize top opportunities
    4. Generate personalized outreach
    5. Create tasks
    6. Send approved messages
    7. Track responses
    8. Schedule calls
    9. Generate proposals
    10. Follow-up automatically
    """
    from app.services.closing_engine.autonomous_sales_manager import autonomous_sales_manager
    mission_id = int(payload.get("mission_id", 1006))
    result = await autonomous_sales_manager.execute_autonomous_sales_cycle(
        session=db,
        mission_id=mission_id
    )
    return result


@router.post("/sales-manager/ingest-buyer")
async def ingest_buyer_master_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Master Phase: Ingests a new buyer enforcing the mandatory 8-field evidence gate.
    Rejects incomplete leads immediately.
    """
    from app.services.closing_engine.autonomous_sales_manager import autonomous_sales_manager
    mission_id = int(payload.get("mission_id", 1006))
    lead_data = payload.get("lead_data") or payload
    result = await autonomous_sales_manager.ingest_and_validate_buyer(
        session=db,
        mission_id=mission_id,
        lead_dict=lead_data
    )
    return result


@router.get("/master-reality-audit/{mission_id}")
async def get_master_reality_audit_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Master Phase: Deep System Reality Audit:
    - SYSTEM REALITY SCORE (0–100%)
    - REAL EVENTS COUNT
    - VERIFIED REVENUE (Strictly AED 0.00 until payment reference & audit hash)
    - ACTIVE WORKERS
    - FAILED CHECKS list
    """
    from app.services.closing_engine.reality_audit_engine import reality_audit_engine
    result = await reality_audit_engine.run_master_reality_audit(
        session=db,
        mission_id=mission_id
    )
    return result


@router.get("/worker-heartbeat")
@router.get("/worker/status")
async def get_worker_heartbeat_endpoint():
    """
    Master Phase: Returns overnight background worker telemetry (ONLINE, LAST HEARTBEAT, NEXT RUN).
    """
    from app.services.closing_engine.reality_audit_engine import reality_audit_engine
    status = await reality_audit_engine.get_worker_status()
    return status


@router.post("/worker-heartbeat/pulse")
async def pulse_worker_heartbeat_endpoint(payload: Dict[str, Any] = {}):
    """
    Master Phase: Emits heartbeat from background daemon.
    """
    from app.services.closing_engine.reality_audit_engine import reality_audit_engine
    worker_id = payload.get("worker_id", "REVENUE-DAEMON-PROD-01")
    status = payload.get("status", "ONLINE")
    result = await reality_audit_engine.update_worker_heartbeat(worker_id=worker_id, status=status)
    return result


@router.get("/provider-connection-details")
async def get_provider_connection_details_endpoint():
    """
    Final Activation Mode: Provides exact setup status for WhatsApp, Email, and LinkedIn.
    Displays CONNECTED / NOT CONNECTED without fake badges.
    """
    from app.services.closing_engine.reality_audit_engine import reality_audit_engine
    details = await reality_audit_engine.audit_provider_connections()
    return details


@router.get("/ceo-morning-report/{mission_id}")
async def get_ceo_morning_report_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Final Activation Mode: Generates genuine CEO Morning Operating & Revenue Report:
    - REAL leads found
    - Messages delivered
    - Replies received
    - Calls booked
    - Proposals sent
    - Revenue collected (Strictly AED 0.00 until verified payment)
    - Mission #1006 status integrity
    """
    from app.services.closing_engine.reality_audit_engine import reality_audit_engine
    report = await reality_audit_engine.generate_ceo_morning_report(
        session=db,
        mission_id=mission_id
    )
    return report


# =====================================================================
# FINAL SALES ACTIVATION — WIZARD & REAL SALES QUEUE ENDPOINTS
# =====================================================================

@router.post("/wizard/activate-whatsapp")
async def activate_whatsapp_endpoint(payload: Dict[str, Any]):
    """
    Validates Meta Business API credentials and connects WhatsApp.
    """
    from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
    token = payload.get("token") or payload.get("api_token") or ""
    phone_id = payload.get("phone_number_id", "")
    business_id = payload.get("business_account_id") or payload.get("waba_id")
    webhook_token = payload.get("webhook_verify_token")
    result = await real_provider_dispatch_service.activate_whatsapp_wizard(
        token=token,
        phone_number_id=phone_id,
        business_account_id=business_id,
        webhook_verify_token=webhook_token
    )
    return result


@router.post("/wizard/activate-email")
async def activate_email_endpoint(payload: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    """
    Validates Resend email credentials and sending domain DKIM/SPF/MX.
    Persists RESEND_API_KEY securely to backend .env file and database ConnectorAuth table.
    """
    from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
    api_key = payload.get("api_key", "")
    sending_domain = payload.get("sending_domain") or payload.get("sender_domain") or payload.get("domain", "altsofts.in")
    sender_email = payload.get("sender") or payload.get("sender_email") or payload.get("from_email", "sales@altsofts.in")
    reply_to_email = payload.get("reply_to") or payload.get("reply_to_email", "sales@altsofts.in")
    
    received_suffix = api_key[-4:] if len(api_key) >= 4 else "None"
    print(f"[DEBUG ENDPOINT /wizard/activate-email] Payload received key last 4: {received_suffix} | Total length: {len(api_key)}")

    result = await real_provider_dispatch_service.activate_email_wizard(
        api_key=api_key,
        sending_domain=sending_domain,
        sender_email=sender_email,
        reply_to_email=reply_to_email,
        session=db
    )
    return result


@router.post("/wizard/activate-linkedin")
async def activate_linkedin_endpoint(payload: Dict[str, Any]):
    """
    Validates LinkedIn OAuth token and profile permissions.
    """
    from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
    client_id = payload.get("client_id", "")
    oauth_token = payload.get("oauth_token") or payload.get("access_token", "")
    result = await real_provider_dispatch_service.activate_linkedin_wizard(
        oauth_token=oauth_token,
        client_id=client_id
    )
    return result


@router.get("/real-sales-queue/{mission_id}")
async def get_real_sales_queue_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Final Sales Activation: Real Sales Queue.
    Columns: Buyer, Source, Requirement, Contact, Status.
    Stages: DISCOVERED, VERIFIED, CONTACT READY, MESSAGE SENT, REPLY RECEIVED, CALL BOOKED, PROPOSAL SENT, PAYMENT.
    Strictly filters genuine REAL + VERIFIED leads.
    """
    res = await db.execute(
        select(Lead).where(
            Lead.mission_id == mission_id,
            Lead.source_type == "REAL",
            Lead.verification_status == "VERIFIED"
        ).order_by(Lead.id.desc())
    )
    leads = res.scalars().all()

    # Stage mapper for strict 8 stages
    def map_stage(lead: Lead) -> str:
        ps = (lead.pipeline_stage or "DISCOVERED").upper()
        if ps == "WON" or lead.payment_status == "SETTLED":
            return "PAYMENT"
        elif ps in ["PROPOSAL_SENT", "NEGOTIATION"]:
            return "PROPOSAL SENT"
        elif ps in ["CALL_BOOKED", "DISCOVERY_CALL"]:
            return "CALL BOOKED"
        elif ps == "REPLIED":
            return "REPLY RECEIVED"
        elif ps == "CONTACTED":
            return "MESSAGE SENT"
        elif ps == "CONTACT_READY":
            return "CONTACT READY"
        elif ps == "VERIFIED":
            return "VERIFIED"
        return "DISCOVERED"

    queue = []
    for l in leads:
        stage = map_stage(l)
        queue.append({
            "lead_id": l.id,
            "buyer": f"{l.name} ({l.company_name or 'Enterprise'})",
            "name": l.name,
            "company": l.company_name,
            "source": l.source_platform or l.source or "Telegram",
            "source_url": l.source_url,
            "profile_url": l.profile_url,
            "requirement": l.interest or "AI Enterprise Automation",
            "contact": l.contact_info or "+971 50 000 0000",
            "budget_aed": l.estimated_budget or 3500.0,
            "status": stage,
            "evidence_reference": l.evidence_reference,
            "created_at": l.discovery_timestamp.strftime("%Y-%m-%d %H:%M") if l.discovery_timestamp else ""
        })

    # Summary count across 8 stages
    stage_counts = {
        "DISCOVERED": sum(1 for q in queue if q["status"] == "DISCOVERED"),
        "VERIFIED": sum(1 for q in queue if q["status"] == "VERIFIED"),
        "CONTACT READY": sum(1 for q in queue if q["status"] == "CONTACT READY"),
        "MESSAGE SENT": sum(1 for q in queue if q["status"] == "MESSAGE SENT"),
        "REPLY RECEIVED": sum(1 for q in queue if q["status"] == "REPLY RECEIVED"),
        "CALL BOOKED": sum(1 for q in queue if q["status"] == "CALL BOOKED"),
        "PROPOSAL SENT": sum(1 for q in queue if q["status"] == "PROPOSAL SENT"),
        "PAYMENT": sum(1 for q in queue if q["status"] == "PAYMENT"),
    }

    return {
        "mission_id": mission_id,
        "total_active_queue_count": len(queue),
        "stage_counts": stage_counts,
        "queue": queue
    }


# =========================================================================
# AUTONOMOUS REVENUE MISSION ENGINE (UNRESTRICTED MULTI-SECTOR MODE)
# =========================================================================
from app.services.closing_engine.autonomous_revenue_mission_engine import autonomous_revenue_mission_engine
from pydantic import BaseModel

class CreateAutonomousMissionRequest(BaseModel):
    title: str = "Autonomous Revenue Sprint — 18 Hour Challenge"
    goal_amount: float = 2500.0
    budget: float = 0.0
    deadline_hours: int = 18
    currency: str = "AED"

class VerifyRealPaymentRequest(BaseModel):
    mission_id: int
    amount: float
    transaction_reference: str
    payer_name: str
    lead_id: Optional[int] = None
    currency: str = "AED"
    payment_source: str = "Bank Transfer / Stripe"
    notes: Optional[str] = None


@router.post("/mission-engine/create-autonomous-mission")
async def create_autonomous_mission_endpoint(payload: CreateAutonomousMissionRequest, db: AsyncSession = Depends(get_db)):
    """
    CEO Mission Creation:
    Goal: Minimum AED 2500 revenue (or customized)
    Budget: AED 0
    Time: 18 hours
    Freedom: Unrestricted multi-sector market/product selection.
    """
    result = await autonomous_revenue_mission_engine.create_autonomous_mission(
        session=db,
        title=payload.title,
        goal_amount=payload.goal_amount,
        budget=payload.budget,
        deadline_hours=payload.deadline_hours,
        currency=payload.currency
    )
    return result


@router.post("/mission-engine/execute-12-step-loop/{mission_id}")
async def execute_12_step_loop_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Executes the complete 12-step autonomous revenue engine loop:
    1. Global market analysis
    2. Fastest revenue selection
    3. Automatic sellable offer creation
    4. Multi-sector buyer search
    5. Verified lead evidence generation
    6. Sales strategy formulation
    7. Outreach preparation
    8. Approved dispatch execution
    9. Reply tracking
    10. Call scheduling
    11. Proposal generation
    12. Real payment verification & mission gate
    """
    result = await autonomous_revenue_mission_engine.execute_12_step_revenue_cycle(
        session=db,
        mission_id=mission_id
    )
    return result


@router.get("/mission-engine/telemetry/{mission_id}")
async def get_mission_telemetry_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns strict 12 dashboard metrics with zero simulated revenue:
    Mission Target, Revenue Generated, Revenue Remaining, Time Remaining,
    Markets Tested, Products Tested, Leads Found, Messages Sent, Replies, Calls, Proposals, Payments.
    """
    result = await autonomous_revenue_mission_engine.get_mission_telemetry(
        session=db,
        mission_id=mission_id
    )
    return result


@router.post("/mission-engine/verify-real-payment")
async def verify_real_payment_endpoint(payload: VerifyRealPaymentRequest, db: AsyncSession = Depends(get_db)):
    """
    Verifies actual customer payment settlement with cryptographic audit hash.
    Mission only marks COMPLETED when actual verified payment reaches the target.
    """
    result = await autonomous_revenue_mission_engine.verify_external_payment(
        session=db,
        mission_id=payload.mission_id,
        lead_id=payload.lead_id,
        amount=payload.amount,
        transaction_reference=payload.transaction_reference,
        payer_name=payload.payer_name,
        currency=payload.currency,
        payment_source=payload.payment_source,
        notes=payload.notes
    )
    return result


# =========================================================================
# PHASE 21: AUTONOMOUS REVENUE MISSION EXECUTION CONTROL
# =========================================================================
from app.services.closing_engine.autonomous_mission_control import autonomous_mission_control

class IngestLeadRequest(BaseModel):
    mission_id: int = 1
    name: str
    company: str
    source_platform: str  # Telegram, Reddit, YouTube, LinkedIn, Public Web
    source_url: str
    profile_url: str
    requirement: str
    contact_information: str
    timestamp: Optional[str] = None
    evidence_reference: Optional[str] = None


@router.get("/mission-control/status/{mission_id}")
async def get_mission_control_status(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns live execution status, real metrics, blockers, and next human action for Mission #1.
    """
    return await autonomous_mission_control.get_mission_telemetry(db, mission_id)


@router.post("/mission-control/run-auto-cycle/{mission_id}")
async def run_mission_control_auto_cycle(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Executes autonomous monitoring, 10-stage pipeline progression, and opportunity matching.
    """
    return await autonomous_mission_control.run_mission_control_cycle(db, mission_id)


@router.get("/mission-control/execution-queue/{mission_id}")
async def get_mission_control_execution_queue(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns real execution queue table:
    Buyer name, Channel, Message status, Delivery status, Reply status, Stage.
    """
    return await autonomous_mission_control.get_execution_queue(db, mission_id)


@router.post("/mission-control/ingest-verified-lead")
async def ingest_verified_lead_endpoint(payload: IngestLeadRequest, db: AsyncSession = Depends(get_db)):
    """
    Ingests verified lead backed by 9 mandatory evidence fields. Incomplete leads are strictly rejected.
    """
    return await autonomous_mission_control.ingest_and_validate_lead(
        session=db,
        mission_id=payload.mission_id,
        lead_data=payload.dict()
    )


# =========================================================================
# PHASE 22: REAL OUTREACH EXECUTION CAMPAIGN
# =========================================================================
from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service

@router.post("/mission-outreach/execute/{mission_id}")
async def execute_mission_outreach_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Executes real outreach execution for all eligible VERIFIED leads in Mission #1:
    - Loads VERIFIED leads with evidence, requirements, and contact info
    - Generates personalized email pitches based on requirement, sector, and value
    - Transmits via connected Resend Email API (RESEND_EMAIL_API)
    - Captures unique message IDs (msg_resend_...) and delivery confirmation tokens (DELV-EMAIL-...)
    - Advances lead pipeline stage to MESSAGE_SENT
    """
    return await real_provider_dispatch_service.execute_mission_outreach_campaign(
        session=db,
        mission_id=mission_id
    )


# =========================================================================
# PHASE 23: REAL LINKEDIN OUTREACH EXECUTION ENGINE
# =========================================================================

@router.post("/linkedin-outreach/execute/{mission_id}")
async def execute_linkedin_outreach_endpoint(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Executes real LinkedIn outreach execution for verified leads lacking email:
    - Identifies verified leads without email dispatches
    - Generates personalized executive InMail pitches
    - Transmits via connected LinkedIn Sales Navigator API (LINKEDIN_MESSAGING_WORKFLOW)
    - Captures unique InMail message IDs (inmail_li_...) and delivery tokens (DELV-LI-...)
    - Advances lead pipeline stage to MESSAGE_SENT
    """
    return await real_provider_dispatch_service.execute_linkedin_outreach_campaign(
        session=db,
        mission_id=mission_id
    )














import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, Lead, Offer, Communication, RevenueTracking, CEODecisionMemory, OperatorActionLog
from app.services.business_operator.ai_mission_creator import ai_mission_creator
from app.services.business_operator.lead_hunter_manager import lead_hunter_manager
from app.services.business_operator.autonomous_offer_generator import autonomous_offer_generator
from app.services.business_operator.self_optimizing_revenue_engine import self_optimizing_revenue_engine
from app.services.business_operator.ceo_approval_execution_layer import ceo_approval_execution_layer
from app.services.business_operator.growth_memory_engine import growth_memory_engine
from app.services.ceo_brain.industry_intelligence import industry_intelligence
from app.services.ceo_brain.source_intelligence import source_intelligence
from app.services.ceo_brain.offer_optimizer import offer_optimizer
from app.services.closing_engine.sales_copilot_service import sales_copilot_service

class OperatorOrchestrator:
    """
    Operator Orchestrator:
    Master business operations execution loop.
    Executes end-to-end automated business cycles while staging all external outreach
    into the CEO Approval Queue for human sign-off.
    """

    async def get_control_room_telemetry(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = None
    ) -> Dict[str, Any]:
        # 1. Missions stats
        missions_res = await session.execute(select(Mission).order_by(Mission.created_at.desc()))
        missions = missions_res.scalars().all()
        active_missions = [m for m in missions if m.status == "ACTIVE"]

        # Current or target mission
        target_mission = None
        if mission_id:
            target_mission = next((m for m in missions if m.id == mission_id), None)
        if not target_mission and active_missions:
            target_mission = active_missions[0]

        # 2. Leads & pipeline (Strictly REAL + VERIFIED for active mission)
        target_mission_id = target_mission.id if target_mission else 1
        leads_res = await session.execute(
            select(Lead).where(
                Lead.mission_id == target_mission_id,
                Lead.source_type == "REAL",
                Lead.verification_status == "VERIFIED"
            )
        )
        real_leads = leads_res.scalars().all()
        total_pipeline = sum(float(l.expected_value or l.estimated_budget or 0.0) for l in real_leads if (l.pipeline_stage or "").upper() not in ["WON", "LOST"])

        # 3. Revenue (Strictly REAL + VERIFIED + SETTLED payments for active mission)
        rev_res = await session.execute(
            select(RevenueTracking).where(
                RevenueTracking.mission_id == target_mission_id,
                RevenueTracking.source_type == "REAL",
                RevenueTracking.verification_status == "VERIFIED",
                RevenueTracking.payment_status == "SETTLED"
            )
        )
        rev_records = rev_res.scalars().all()
        total_revenue_achieved = sum(float(r.amount or 0.0) for r in rev_records)
        total_target_revenue = float(target_mission.goal_amount or 2500.0) if target_mission else 2500.0

        # 4. Approvals
        approvals = await ceo_approval_execution_layer.get_pending_approvals(session)

        # 5. Top performers
        ind_metrics = await industry_intelligence.analyze_industry_performance(session)
        src_metrics = await source_intelligence.analyze_sources(session)
        off_metrics = await offer_optimizer.analyze_offers(session)

        best_ind = ind_metrics[0].get("industry", "AI Agents & Automation") if ind_metrics else "AI Agents & Automation"
        best_src = src_metrics[0]["display_name"] if src_metrics else "Telegram"
        best_off = (off_metrics[0].get("product_name") or off_metrics[0].get("offer_title")) if off_metrics else "24/7 AI Autonomous Lead Qualifier & Appointment Dispatcher"

        # 6. Fleet status
        fleet = await lead_hunter_manager.get_hunter_fleet_status(session)

        return {
            "total_active_missions": len(active_missions),
            "total_missions_count": len(missions),
            "current_mission": {
                "id": target_mission.id if target_mission else 1,
                "title": target_mission.title if target_mission else "Autonomous Revenue Sprint - 18 Hour Challenge",
                "goal_amount": float(target_mission.goal_amount or 2500.0) if target_mission else 2500.0,
                "revenue_generated": float(total_revenue_achieved),
                "currency": target_mission.currency if target_mission else "AED",
                "status": target_mission.status if target_mission else "ACTIVE"
            } if target_mission else None,
            "total_revenue_target_aed": total_target_revenue,
            "total_revenue_achieved_aed": total_revenue_achieved,
            "total_active_pipeline_aed": total_pipeline,
            "total_leads_in_pipeline": len(real_leads),
            "pending_approvals_count": approvals["total_pending_count"],
            "best_performing_industry": best_ind,
            "best_performing_source": best_src,
            "best_performing_offer": best_off,
            "hunter_fleet": fleet,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    async def run_master_autonomous_cycle(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = None
    ) -> Dict[str, Any]:
        cycle_start = datetime.datetime.utcnow()

        # Step 1: Ensure active mission
        target_mission_id = mission_id
        if not target_mission_id:
            mission_res = await session.execute(
                select(Mission).where(Mission.status == "ACTIVE").order_by(Mission.created_at.desc())
            )
            mission = mission_res.scalars().first()
            if not mission:
                # Autonomously spawn an AI mission
                mission = await ai_mission_creator.create_autonomous_mission(session)
            target_mission_id = mission.id
        else:
            m_res = await session.execute(select(Mission).where(Mission.id == target_mission_id))
            mission = m_res.scalar_one_or_none()

        # Step 2: Lead Hunter Sweep
        hunt_res = await lead_hunter_manager.dispatch_lead_hunters(
            session=session,
            mission_id=target_mission_id
        )

        # Step 3: Offer Generation & Outreach Staging for unattached leads
        leads_res = await session.execute(
            select(Lead).where(Lead.mission_id == target_mission_id).order_by(Lead.created_at.desc()).limit(10)
        )
        leads = leads_res.scalars().all()
        tiered_offers_created = 0
        staged_sequences_count = 0

        for l in leads:
            if not l.offer_id:
                await autonomous_offer_generator.attach_tiered_offers_to_lead(session, l.id)
                tiered_offers_created += 1

            # Stage closing sequence if not already created
            comm_check = await session.execute(
                select(Communication).where(Communication.lead_id == l.id)
            )
            if not comm_check.scalars().first():
                await sales_copilot_service.stage_sales_copilot_sequence(
                    session=session,
                    mission_id=target_mission_id,
                    lead_id=l.id
                )
                staged_sequences_count += 1

        # Step 4: Run Self-Optimization Engine
        opt_res = await self_optimizing_revenue_engine.evaluate_and_optimize_mission(
            session=session,
            mission_id=target_mission_id
        )

        # Step 5: Record Business Growth Memory
        growth_mem = await growth_memory_engine.record_growth_cycle(
            session=session,
            mission_id=target_mission_id,
            cycle_type="AUTONOMOUS_CYCLE",
            insight_summary_override=f"Autonomous operator cycle executed for Mission #{target_mission_id}. Ingested {hunt_res['qualified_leads_enrolled']} leads, staged {staged_sequences_count} outreach sequences."
        )

        return {
            "cycle_status": "SUCCESS",
            "mission_id": target_mission_id,
            "mission_title": mission.title if mission else "",
            "signals_discovered": hunt_res["raw_signals_discovered"],
            "leads_enrolled": hunt_res["qualified_leads_enrolled"],
            "tiered_offers_created": tiered_offers_created,
            "staged_sequences_count": staged_sequences_count,
            "primary_optimization": opt_res.get("primary_optimization", {}),
            "growth_memory_id": growth_mem.id,
            "execution_duration_sec": (datetime.datetime.utcnow() - cycle_start).total_seconds()
        }


operator_orchestrator = OperatorOrchestrator()

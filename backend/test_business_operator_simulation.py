import asyncio
import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.core.database import Base
from app.models.entities import (
    Mission, Lead, Offer, Opportunity, RevenueOpportunity,
    Communication, RevenueTracking, BusinessGrowthMemory, OperatorActionLog
)
from app.services.business_operator.ai_mission_creator import ai_mission_creator
from app.services.business_operator.autonomous_offer_generator import autonomous_offer_generator
from app.services.business_operator.lead_hunter_manager import lead_hunter_manager
from app.services.business_operator.self_optimizing_revenue_engine import self_optimizing_revenue_engine
from app.services.business_operator.ceo_approval_execution_layer import ceo_approval_execution_layer
from app.services.business_operator.growth_memory_engine import growth_memory_engine
from app.services.business_operator.operator_orchestrator import operator_orchestrator

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def run_business_operator_simulation():
    print("=" * 75)
    print(">>> RUNNING AUTONOMOUS BUSINESS OPERATOR v5 SIMULATION <<<")
    print("=" * 75)

    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # 1. Test AI Mission Creator
        print("\n[1] TESTING AI MISSION CREATOR & BLUEPRINT SYNTHESIS:")
        blueprint = await ai_mission_creator.generate_mission_blueprint(session)
        print(f"    - Generated Blueprint: '{blueprint['mission_name']}'")
        print(f"    - Target Revenue: {blueprint['goal_amount']:,.0f} {blueprint['currency']} | Confidence: {blueprint['confidence_score']}%")
        print(f"    - Selected Industries: {blueprint['selected_industries']}")
        print(f"    - Selected Sources: {blueprint['selected_sources']}")
        print(f"    - Rationale: {blueprint['creation_rationale']}")
        assert blueprint["goal_amount"] > 0
        assert len(blueprint["selected_industries"]) >= 1

        # Instantiate Autonomous Mission
        m1 = await ai_mission_creator.create_autonomous_mission(session, blueprint)
        print(f"    - Instantiated Mission #{m1.id}: '{m1.title}' (Status: {m1.status})")
        assert m1.id is not None

        # 2. Test Lead Hunter Manager & Radar Fleet
        print("\n[2] TESTING LEAD HUNTER MANAGER & MULTI-CHANNEL FLEET:")
        fleet = await lead_hunter_manager.get_hunter_fleet_status(session)
        print(f"    - Hunter Fleet Channels: {len(fleet)}")
        for f in fleet[:3]:
            print(f"      [{f['status']}] {f['display_name']} -> Tier: {f['efficiency_tier']} | Priority: {f['priority_level']}")
        assert len(fleet) == 6

        # Dispatch sweep into Mission #1
        hunt_res = await lead_hunter_manager.dispatch_lead_hunters(session, mission_id=m1.id)
        print(f"    - Dispatched Lead Hunters: {hunt_res['raw_signals_discovered']} raw signals -> {hunt_res['qualified_leads_enrolled']} qualified leads enrolled")
        assert hunt_res["qualified_leads_enrolled"] > 0

        # 3. Test Autonomous Tiered Offer Generator
        print("\n[3] TESTING AUTONOMOUS TIERED OFFER GENERATOR (3-TIER ARCHITECTURE):")
        leads_res = await session.execute(select(Lead).where(Lead.mission_id == m1.id))
        leads = leads_res.scalars().all()
        assert len(leads) > 0
        sample_lead = leads[0]

        tier_res = await autonomous_offer_generator.attach_tiered_offers_to_lead(session, sample_lead.id)
        matrix = tier_res["tiered_matrix"]["tiers"]
        print(f"    - Prospect: {tier_res['prospect_name']} (Lead #{tier_res['lead_id']})")
        print(f"      [STARTER] {matrix['starter']['package_name']} ({matrix['starter']['price_aed']:,.0f} AED) - {matrix['starter']['delivery_days']}d")
        print(f"      [GROWTH] {matrix['growth']['package_name']} ({matrix['growth']['price_aed']:,.0f} AED) - {matrix['growth']['delivery_days']}d")
        print(f"      [ENTERPRISE] {matrix['enterprise']['package_name']} ({matrix['enterprise']['price_aed']:,.0f} AED) - {matrix['enterprise']['delivery_days']}d")
        assert matrix["starter"]["price_aed"] > 0
        assert matrix["growth"]["price_aed"] > matrix["starter"]["price_aed"]
        assert matrix["enterprise"]["price_aed"] > matrix["growth"]["price_aed"]

        # 4. Test Self-Optimizing Revenue Engine
        print("\n[4] TESTING SELF-OPTIMIZING REVENUE ENGINE:")
        opt_res = await self_optimizing_revenue_engine.evaluate_and_optimize_mission(session, m1.id)
        print(f"    - Mission: '{opt_res['mission_title']}'")
        print(f"    - Conversion Rate: {opt_res['conversion_rate_pct']}% | Pipeline: {opt_res['pipeline_value_aed']:,.0f} AED")
        print(f"    - Primary Optimization: [{opt_res['primary_optimization']['action_type']}] {opt_res['primary_optimization']['title']}")
        print(f"      Impact: +{opt_res['primary_optimization']['projected_revenue_impact_aed']:,.0f} AED (Conf: {opt_res['primary_optimization']['confidence_score']}%)")
        assert "primary_optimization" in opt_res

        # 5. Test CEO Approval Execution Layer (Human-in-the-loop Guardrail)
        print("\n[5] TESTING CEO APPROVAL EXECUTION LAYER:")
        approvals = await ceo_approval_execution_layer.get_pending_approvals(session, m1.id)
        print(f"    - Total Pending Approval Items: {approvals['total_pending_count']}")
        print(f"    - Pending Operator Actions: {len(approvals['pending_operator_actions'])}")
        print(f"    - Pending Outreach Comms: {len(approvals['pending_communications'])}")
        assert approvals["total_pending_count"] > 0

        # Execute Batch Approval
        batch_res = await ceo_approval_execution_layer.batch_approve_all(session, m1.id)
        print(f"    - Batch Approval Executed: {batch_res['total_approved']} items approved and safely dispatched")
        
        post_approvals = await ceo_approval_execution_layer.get_pending_approvals(session, m1.id)
        print(f"    - Remaining Pending Items: {post_approvals['total_pending_count']}")
        assert post_approvals["total_pending_count"] == 0

        # 6. Test Business Growth Memory Engine
        print("\n[6] TESTING BUSINESS GROWTH MEMORY ENGINE:")
        mem = await growth_memory_engine.record_growth_cycle(
            session=session,
            mission_id=m1.id,
            cycle_type="AUTONOMOUS_CYCLE"
        )
        print(f"    - Memory Record #{mem.id} Created")
        print(f"    - Insight Summary: {mem.insight_summary}")
        print(f"    - Best Industries: {mem.best_industries}")
        print(f"    - Best Sources: {mem.best_sources}")
        print(f"    - Efficiency Gain: +{mem.efficiency_gain_pct}%")
        
        growth_list = await growth_memory_engine.get_growth_memories(session)
        assert len(growth_list) >= 1

        # 7. Test Master Operator Orchestrator Cycle
        print("\n[7] TESTING MASTER OPERATOR ORCHESTRATOR CYCLE:")
        cycle_res = await operator_orchestrator.run_master_autonomous_cycle(session)
        print(f"    - Master Cycle Status: {cycle_res['cycle_status']}")
        print(f"    - Signals Discovered: {cycle_res['signals_discovered']} | Leads Enrolled: {cycle_res['leads_enrolled']}")
        print(f"    - Tiered Offers Attached: {cycle_res['tiered_offers_created']}")
        print(f"    - Staged Sequences: {cycle_res['staged_sequences_count']}")
        print(f"    - Execution Time: {cycle_res['execution_duration_sec']:.2f}s")
        assert cycle_res["cycle_status"] == "SUCCESS"

        # 8. Test Revenue Control Room Telemetry
        print("\n[8] TESTING REVENUE CONTROL ROOM TELEMETRY:")
        telemetry = await operator_orchestrator.get_control_room_telemetry(session)
        print(f"    - Active Missions: {telemetry['total_active_missions']}")
        print(f"    - Total Target Revenue: {telemetry['total_revenue_target_aed']:,.0f} AED")
        print(f"    - Total Active Pipeline: {telemetry['total_active_pipeline_aed']:,.0f} AED")
        print(f"    - Total Leads in Pipeline: {telemetry['total_leads_in_pipeline']}")
        print(f"    - Best Industry: {telemetry['best_performing_industry']}")
        print(f"    - Best Source: {telemetry['best_performing_source']}")
        assert telemetry["total_active_missions"] >= 1

    print("\n" + "=" * 75)
    print(">>> ALL BUSINESS OPERATOR v5 TESTS PASSED (100% SUCCESS) <<<")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_business_operator_simulation())

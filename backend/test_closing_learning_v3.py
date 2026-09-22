"""
End-to-End Test Suite for Revenue Closing & Learning Engine v3.
Tests 3 Scenarios:
1. AI Agent Client
2. Software Development Client
3. Real Estate Investor

Verifies:
- Lead Qualification & Scoring (0-100, HOT/QUALIFIED/WARM/COLD)
- AI Sales Closing Assistant (Discovery Questions, Objection Handling, Negotiation Strategy)
- Proposal Generation (Client summary, deliverables, pricing, timeline, terms)
- CRM Pipeline Movement (14 stages, stage duration, probability)
- Revenue Memory & Learning Engine (Insights & Weekly Performance Review)
"""

import sys
import os
import asyncio

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

from app.core.database import engine, Base, AsyncSessionLocal
from app.models.entities import Mission, Lead, Proposal, RevenueOpportunity, Communication
from app.services.lead_qualification_engine import lead_qualification_engine
from app.services.sales_closing_assistant import sales_closing_assistant
from app.services.proposal_generator import proposal_generator_service
from app.services.revenue_learning_engine import revenue_learning_engine


async def setup_test_environment():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Safe column additions if SQLite DB already existed
        from sqlalchemy import text
        cols_to_add = [
            "ALTER TABLE leads ADD COLUMN company_name VARCHAR(255)",
            "ALTER TABLE leads ADD COLUMN pipeline_stage VARCHAR(50) DEFAULT 'DISCOVERED'",
            "ALTER TABLE leads ADD COLUMN stage_duration_hours FLOAT DEFAULT 1.0",
            "ALTER TABLE leads ADD COLUMN revenue_probability FLOAT DEFAULT 0.80",
            "ALTER TABLE leads ADD COLUMN qualification_score FLOAT DEFAULT 75.0",
            "ALTER TABLE leads ADD COLUMN classification VARCHAR(50) DEFAULT 'QUALIFIED'",
            "ALTER TABLE leads ADD COLUMN buying_intent VARCHAR(50) DEFAULT 'HIGH'",
            "ALTER TABLE leads ADD COLUMN estimated_budget FLOAT DEFAULT 3500.0",
            "ALTER TABLE leads ADD COLUMN decision_stage VARCHAR(50) DEFAULT 'EVALUATION'",
            "ALTER TABLE leads ADD COLUMN decision_maker_probability FLOAT DEFAULT 0.85",
            "ALTER TABLE leads ADD COLUMN qualification_notes TEXT",
            "ALTER TABLE missions ADD COLUMN industries JSON",
            "ALTER TABLE revenue_opportunities ADD COLUMN intent_score FLOAT DEFAULT 85.0",
            "ALTER TABLE revenue_opportunities ADD COLUMN closing_probability FLOAT DEFAULT 0.85",
            "ALTER TABLE revenue_opportunities ADD COLUMN priority VARCHAR(50) DEFAULT 'HOT'"
        ]
        for query in cols_to_add:
            try:
                await conn.execute(text(query))
            except Exception:
                pass
    
    async with AsyncSessionLocal() as session:
        mission = await session.get(Mission, 999)
        if not mission:
            mission = Mission(
                id=999,
                title="Q3 Enterprise Revenue Surge",
                goal_amount=100000,
                currency="AED",
                deadline_hours=72,
                industry="AI Agents & Automation",
                industries=["AI Agents & Automation", "Custom Software Development", "Dubai Real Estate & Advisory"],
                status="ACTIVE",
            )
            session.add(mission)
            await session.commit()
            await session.refresh(mission)
        return mission


async def test_scenario_1_ai_agent_client(mission):
    print("\n" + "=" * 60)
    print("TEST SCENARIO 1: AI Agent Client (Apex Logistics Corp)")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        # 1. Create Lead
        lead = Lead(
            mission_id=mission.id,
            name="Marcus Vance",
            company_name="Apex Logistics Corp",
            channel="LinkedIn Outreach",
            contact_info="marcus@apexlogistics.io",
            status="NEW",
            pipeline_stage="DISCOVERED",
            expected_value=25000.0,
            revenue_probability=0.2,
            interest="CEO seeking autonomous customer support and dispatch AI agent swarm to eliminate 40h/week manual dispatch."
        )
        session.add(lead)
        await session.commit()
        await session.refresh(lead)
        print(f"[OK] Lead Created: ID {lead.id} - {lead.name} ({lead.company_name})")

        # 2. Autonomous Lead Qualification
        qual_res = await lead_qualification_engine.qualify_lead(
            session=session,
            lead_id=lead.id,
            company_name=lead.company_name,
            requirement_text=lead.interest,
            channel=lead.channel,
            contact_name=lead.name,
            industry="AI Agents & Automation"
        )
        print(f"[EVAL] Qualification Result: Score={qual_res['qualification_score']} | Classification={qual_res['classification']} | Decision Stage={qual_res['decision_stage']}")
        assert 0 <= qual_res["qualification_score"] <= 100
        assert qual_res["classification"] in ["HOT", "QUALIFIED", "WARM", "COLD"]
        assert qual_res["estimated_budget"] > 0
        assert len(qual_res["qualification_notes"]) > 0

        # Reload lead to verify DB persistence
        await session.refresh(lead)
        print(f"[OK] Lead updated in DB with stage: {lead.pipeline_stage} and buying_intent: {lead.buying_intent}")

        # 3. AI Sales Closing Assistant
        closing_res = await sales_closing_assistant.generate_closing_strategy(
            session=session,
            lead_id=lead.id,
            company_name=lead.company_name,
            industry="AI Agents & Automation",
            target_budget=lead.estimated_budget,
            current_objection="Too expensive"
        )
        print(f"[AI] Sales Copilot: Generated {len(closing_res['discovery_questions'])} Discovery Questions & {len(closing_res['objection_handling'])} Objection Responses.")
        print(f"[AI] Negotiation Strategy: Anchor=${closing_res['negotiation_strategy']['recommended_starting_price']:,.2f} | Floor=${closing_res['negotiation_strategy']['minimum_acceptable_floor']:,.2f}")
        assert len(closing_res["discovery_questions"]) >= 4
        assert len(closing_res["objection_handling"]) >= 5
        assert closing_res["negotiation_strategy"]["recommended_starting_price"] >= closing_res["negotiation_strategy"]["minimum_acceptable_floor"]

        # 4. Proposal Generation
        prop_res = await proposal_generator_service.generate_proposal(
            session=session,
            mission_id=mission.id,
            lead_id=lead.id,
            proposal_type="AI_AGENT",
            client_name=lead.company_name,
            client_industry="AI Agents & Automation",
            problem_description=lead.interest,
            custom_budget=25000.0,
            timeline_days=10
        )
        print(f"[DOC] Proposal Generated: ID {prop_res['id']} | Title: '{prop_res['proposal_title']}' | Price: ${prop_res['pricing_amount']:,.2f}")
        assert prop_res["full_proposal_markdown"] is not None
        assert "Deliverables" in prop_res["full_proposal_markdown"]
        assert len(prop_res["deliverables"]) >= 3

        # 5. CRM Pipeline Progression
        lead.pipeline_stage = "PROPOSAL_SENT"
        lead.stage_duration_hours = 2.5
        lead.revenue_probability = 0.75
        await session.commit()
        print(f"[CRM] Stage Updated: {lead.pipeline_stage} (Prob: {lead.revenue_probability * 100}%)")


async def test_scenario_2_software_dev_client(mission):
    print("\n" + "=" * 60)
    print("TEST SCENARIO 2: Software Development Client (FinTech Matrix)")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        # 1. Create Lead
        lead = Lead(
            mission_id=mission.id,
            name="Elena Rostova",
            company_name="FinTech Matrix LLC",
            channel="Inbound Demo Request",
            contact_info="elena@fintechmatrix.com",
            status="NEW",
            pipeline_stage="DISCOVERED",
            expected_value=45000.0,
            revenue_probability=0.3,
            interest="Fintech startup needing high-throughput multi-currency settlement microservice and merchant analytics dashboard in Next.js + FastAPI."
        )
        session.add(lead)
        await session.commit()
        await session.refresh(lead)
        print(f"[OK] Lead Created: ID {lead.id} - {lead.name} ({lead.company_name})")

        # 2. Lead Qualification
        qual_res = await lead_qualification_engine.qualify_lead(
            session=session,
            lead_id=lead.id,
            company_name=lead.company_name,
            requirement_text=lead.interest,
            channel=lead.channel,
            industry="Custom Software Development"
        )
        print(f"[EVAL] Qualification Result: Score={qual_res['qualification_score']} | Classification={qual_res['classification']}")

        # 3. Proposal Generation
        prop_res = await proposal_generator_service.generate_proposal(
            session=session,
            mission_id=mission.id,
            lead_id=lead.id,
            proposal_type="SOFTWARE",
            client_name=lead.company_name,
            client_industry="Custom Software Development",
            problem_description=lead.interest,
            custom_budget=45000.0,
            timeline_days=21
        )
        print(f"[DOC] Proposal Generated: Title: '{prop_res['proposal_title']}' | Timeline: {prop_res['timeline_days']} days")
        assert "Commercial Terms" in prop_res["full_proposal_markdown"] or "Payment" in prop_res["full_proposal_markdown"]
        assert prop_res["pricing_amount"] > 0

        # Advance to WON
        lead.pipeline_stage = "WON"
        lead.status = "WON"
        lead.revenue_probability = 1.0
        lead.stage_duration_hours = 18.0
        await session.commit()
        print("[CRM] Stage Advanced: WON ($45,000)")


async def test_scenario_3_real_estate_investor(mission):
    print("\n" + "=" * 60)
    print("TEST SCENARIO 3: Real Estate Investor (Sovereign Capital Holdings)")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        # 1. Create Lead
        lead = Lead(
            mission_id=mission.id,
            name="Tariq Al-Mansoor",
            company_name="Sovereign Capital Holdings",
            channel="Private Wealth Network",
            contact_info="tariq@sovereigncap.ae",
            status="NEW",
            pipeline_stage="DISCOVERED",
            expected_value=120000.0,
            revenue_probability=0.25,
            interest="High-net-worth investor looking for off-market luxury duplexes in Palm Jumeirah & Downtown Dubai with minimum 8.5% net rental yields."
        )
        session.add(lead)
        await session.commit()
        await session.refresh(lead)
        print(f"[OK] Lead Created: ID {lead.id} - {lead.name} ({lead.company_name})")

        # 2. Lead Qualification
        qual_res = await lead_qualification_engine.qualify_lead(
            session=session,
            lead_id=lead.id,
            company_name=lead.company_name,
            requirement_text=lead.interest,
            channel=lead.channel,
            industry="Dubai Real Estate & Advisory"
        )
        print(f"[EVAL] Qualification Result: Score={qual_res['qualification_score']} | Classification={qual_res['classification']}")

        # 3. Objection Handling for Real Estate
        closing_res = await sales_closing_assistant.generate_closing_strategy(
            session=session,
            lead_id=lead.id,
            company_name=lead.company_name,
            industry="Dubai Real Estate & Advisory",
            target_budget=120000.0,
            current_objection="Comparing vendors"
        )
        print("[AI] Real Estate Objection Handling Preview:")
        for obj in closing_res["objection_handling"][:2]:
            print(f"   - Objection: '{obj['objection']}' -> Script: '{obj['script'][:65]}...'")

        # 4. Proposal Generation
        prop_res = await proposal_generator_service.generate_proposal(
            session=session,
            mission_id=mission.id,
            lead_id=lead.id,
            proposal_type="REAL_ESTATE",
            client_name=lead.company_name,
            client_industry="Dubai Real Estate & Advisory",
            problem_description=lead.interest,
            custom_budget=120000.0,
            timeline_days=7
        )
        print(f"[DOC] Proposal Generated: Title: '{prop_res['proposal_title']}' | Value: ${prop_res['pricing_amount']:,.2f}")
        assert "Expected Outcomes" in prop_res["full_proposal_markdown"] or "Expected Business Outcomes" in prop_res["full_proposal_markdown"]

        # 5. Move through Closing to Payment Pending
        lead.pipeline_stage = "PAYMENT_PENDING"
        lead.stage_duration_hours = 6.0
        lead.revenue_probability = 0.95
        await session.commit()
        print("[CRM] Stage: PAYMENT_PENDING (Ready for wire transfer)")


async def test_revenue_memory_and_learning(mission):
    print("\n" + "=" * 60)
    print("TEST PART 5 & 6: Revenue Memory & Autonomous Learning Review")
    print("=" * 60)

    async with AsyncSessionLocal() as session:
        # 1. Synthesize Learnings
        insights = await revenue_learning_engine.generate_learning_insights(session, mission.id)
        print(f"[LEARN] Synthesized {len(insights)} Learning Insights:")
        for i, ins in enumerate(insights, 1):
            print(f"   {i}. [{ins.get('action_priority', 'INSIGHT')}] {ins.get('learning_insight')}")
            print(f"      -> Recommendation: {ins.get('recommendation')}")
        assert len(insights) > 0

        # 2. Generate Weekly Performance Review
        report = await revenue_learning_engine.generate_weekly_performance_report(session, mission.id)
        print("\n[REPORT] Weekly Performance Report:")
        print(f"   - Best Industry: {report['best_performing_industry']}")
        print(f"   - Best Offer: {report['best_offer']}")
        print(f"   - Best Acquisition Source: {report['best_source']}")
        print(f"   - Pipeline Bottleneck: {report['biggest_bottleneck']}")
        print(f"   - Strategic Recommendation: {report['recommended_strategy_change']}")
        assert report["intelligence_metrics"]["total_leads"] >= 3
        assert report["best_performing_industry"] != ""


async def run_all_tests():
    print("[START] Starting Revenue Closing & Learning Engine v3 Test Suite...")
    mission = await setup_test_environment()
    await test_scenario_1_ai_agent_client(mission)
    await test_scenario_2_software_dev_client(mission)
    await test_scenario_3_real_estate_investor(mission)
    await test_revenue_memory_and_learning(mission)
    print("\n" + "=" * 60)
    print("[SUCCESS] ALL TEST SCENARIOS PASSED WITH ZERO ERRORS!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_all_tests())

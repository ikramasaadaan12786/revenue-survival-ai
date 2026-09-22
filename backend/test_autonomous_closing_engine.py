import asyncio
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.core.database import Base
from app.models.entities import Mission, RevenueOpportunity, Lead, Offer, Communication, RevenueTracking, RevenueLearning, LongTermMemory
from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
from app.services.closing_engine.deal_qualifier import deal_qualification_engine
from app.services.closing_engine.offer_matcher import offer_matching_engine
from app.services.closing_engine.sales_copilot_service import sales_copilot_service
from app.services.closing_engine.daily_execution_planner import daily_execution_planner
from app.services.closing_engine.outcome_learner import revenue_outcome_learner

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def test_autonomous_revenue_closing_engine():
    print("=" * 70)
    print(">>> RUNNING AUTONOMOUS REVENUE CLOSING ENGINE TEST SUITE <<<")
    print("=" * 70)
    
    # 1. Setup in-memory DB
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        # 2. Create Mission
        mission = Mission(
            title="Q3 Dubai Multi-Industry High-Ticket Revenue Mission",
            goal_amount=10000.0,
            currency="AED",
            deadline_hours=72,
            budget=0.0,
            industry="AI Agents & Automation",
            industries=["AI Agents & Automation", "Dubai Real Estate & Advisory", "Website Development", "Custom Software Development"],
            status="ACTIVE",
            current_day=1,
            total_days=3,
            ai_strategy="Zero-budget outbound revenue acquisition and automated deal closing engine"
        )
        session.add(mission)
        await session.commit()
        await session.refresh(mission)
        
        print(f"\n[1] MISSION INITIALIZED: #{mission.id} - {mission.title}")
        print(f"    Target: {mission.goal_amount} {mission.currency} in {mission.deadline_hours}h")

        # 3. Test AI Deal Qualification Engine
        print("\n[2] TESTING AI DEAL QUALIFICATION ENGINE:")
        
        # Test Case A: High Intent Hot Buyer
        qual_a = deal_qualification_engine.qualify_opportunity(
            name="Zaid Al-Husseini",
            company="Apex Health Group DIFC",
            requirement="Need urgent deployment of 24/7 bilingual WhatsApp AI triage agent for 4 clinics. Budget approved 18,000 AED.",
            industry="AI Agents & Automation",
            source="TELEGRAM",
            stated_budget=18000.0
        )
        print(f"    - Case A (Founder with Approved Budget):")
        print(f"      Score: {qual_a['qualification_score']}% | Category: {qual_a['category']}")
        print(f"      Seriousness: {qual_a['buyer_seriousness']}% | Timeline: {qual_a['buying_timeline']}")
        print(f"      Decision Maker: {int(qual_a['decision_maker_probability']*100)}% | Closing Prob: {int(qual_a['closing_probability']*100)}%")
        print(f"      Best Offer: {qual_a['best_offer_type']}")
        assert qual_a["category"] == "HOT BUYER"
        assert qual_a["qualification_score"] >= 80.0

        # Test Case B: Spam / Broker
        qual_b = deal_qualification_engine.qualify_opportunity(
            name="Spam Broker Agency",
            company="Middleman LLC",
            requirement="I am a broker offering co-broke commission sharing on off-plan inventory.",
            industry="Dubai Real Estate & Advisory",
            source="LINKEDIN",
            stated_budget=0.0
        )
        print(f"\n    - Case B (Broker Solicitation):")
        print(f"      Score: {qual_b['qualification_score']}% | Category: {qual_b['category']}")
        assert qual_b["category"] == "REJECT"

        # 4. Ingest Real UAE Buyer Radar Signals
        print("\n[3] INGESTING REAL UAE BUYER RADAR SIGNALS:")
        sync_result = await uae_buyer_radar_bridge.sync_mission_signals(session, mission.id)
        print(f"    Signals Ingested: {sync_result['total_signals_imported']}")
        print(f"    Opps Created: {sync_result['opportunities_created']}")
        print(f"    Leads Created: {sync_result['leads_created']}")

        # 5. Test AI Offer Matching Engine
        print("\n[4] TESTING AI OFFER MATCHING ENGINE:")
        matched_ai = offer_matching_engine.match_offer_for_requirement(
            requirement="Need autonomous customer support bot for WhatsApp",
            industry="AI Agents & Automation",
            budget_capability=15000.0
        )
        print(f"    - Matched AI Offer: {matched_ai['product_name']}")
        print(f"      Price: {matched_ai['pricing']:,.0f} {matched_ai['currency']} | Delivery: {matched_ai['delivery_days']} days")
        assert matched_ai["pricing"] >= 5000.0

        matched_web = offer_matching_engine.match_offer_for_requirement(
            requirement="Need luxury portal with high conversion landing page",
            industry="Website Development",
            budget_capability=8000.0
        )
        print(f"    - Matched Web Offer: {matched_web['product_name']}")
        print(f"      Price: {matched_web['pricing']:,.0f} {matched_web['currency']} | Delivery: {matched_web['delivery_days']} days")
        assert matched_web["pricing"] >= 3000.0

        # 6. Test Sales Copilot & Safety Approval Staging
        print("\n[5] TESTING SALES COPILOT & SAFETY APPROVAL STAGING:")
        leads_res = await session.execute(select(Lead).where(Lead.mission_id == mission.id))
        leads = leads_res.scalars().all()
        assert len(leads) > 0
        sample_lead = leads[0]

        # Attach matched offer first
        offer = await offer_matching_engine.create_or_attach_offer_for_lead(session, mission.id, sample_lead.id)
        print(f"    - Attached Offer #{offer.id}: {offer.product_name} ({offer.pricing} AED)")

        # Stage Sales Copilot Sequence
        copilot_res = await sales_copilot_service.stage_sales_copilot_sequence(session, mission.id, sample_lead.id)
        print(f"    - Client Summary: {copilot_res['client_summary'][:80]}...")
        print(f"    - Pain Point: {copilot_res['pain_point']}")
        print(f"    - Solution: {copilot_res['recommended_solution']}")
        print(f"    - Staged Communication IDs: {copilot_res.get('staged_communication_ids')}")

        # Verify staged records in DB
        comms_res = await session.execute(
            select(Communication).where(Communication.lead_id == sample_lead.id)
        )
        staged_comms = comms_res.scalars().all()
        print(f"    - Stored Communications in DB: {len(staged_comms)}")
        for c in staged_comms:
            assert c.approval_status == "PENDING"
            assert c.requires_approval is True
            print(f"      Touch {c.sequence_step} [{c.message_type}]: {c.body[:65]}... (Status: {c.approval_status})")

        # 7. Test AI Daily Execution Plan
        print("\n[6] TESTING AI DAILY EXECUTION PLAN GENERATOR:")
        plan = await daily_execution_planner.generate_daily_plan(session, mission.id)
        print(f"    - Today's Goal: {plan['todays_goal']}")
        print(f"    - Remaining Target: {plan['remaining_target_aed']:,.0f} AED")
        print(f"    - Velocity Required: {plan['hourly_velocity_required_aed']:.2f} AED/hr")
        print(f"    - Deals Needed: {plan['deals_needed']}")
        print(f"    - Proposals Needed: {plan['proposals_needed']}")
        print(f"    - Calls Needed: {plan['calls_needed']}")
        print(f"    - Expected Revenue Forecast: {plan['expected_revenue_forecast_aed']:,.2f} AED")
        print(f"    - Top 20 Opportunities Count: {len(plan['top_20_opportunities'])}")
        print(f"    - Who to Contact First:")
        for cf in plan["who_to_contact_first"]:
            print(f"      - {cf['name']} ({cf['company']}) - {cf['deal_value_aed']:,.0f} AED via {cf['channel']}")

        assert len(plan["top_20_opportunities"]) > 0
        assert len(plan["who_to_contact_first"]) > 0

        # 8. Test Revenue Outcome Learning Loop (Deal WON & Deal LOST)
        print("\n[7] TESTING REVENUE OUTCOME LEARNING LOOP:")
        
        # Test WON outcome
        won_lead = leads[0]
        won_res = await revenue_outcome_learner.record_deal_outcome(
            session=session,
            mission_id=mission.id,
            lead_id=won_lead.id,
            outcome="WON",
            actual_revenue_aed=12500.0,
            reason="Approved WhatsApp AI agent proposal with 50% upfront deposit"
        )
        print(f"    - Deal WON Recorded for Lead #{won_lead.id}: {won_res['status']}")
        
        # Verify Revenue Tracking & Learning
        rev_tracking = (await session.execute(select(RevenueTracking).where(RevenueTracking.mission_id == mission.id))).scalars().all()
        learnings = (await session.execute(select(RevenueLearning).where(RevenueLearning.mission_id == mission.id))).scalars().all()
        memories = (await session.execute(select(LongTermMemory))).scalars().all()
        
        print(f"    - Revenue Tracking Entries: {len(rev_tracking)} (Amount: {rev_tracking[0].amount} AED)")
        print(f"    - Revenue Learnings Recorded: {len(learnings)} ({learnings[0].learning_insight[:70]}...)")
        print(f"    - Long-Term Memories Created: {len(memories)} ({memories[0].title})")
        
        assert len(rev_tracking) == 1
        assert len(learnings) == 1
        assert len(memories) == 1

        # Test LOST outcome
        if len(leads) > 1:
            lost_lead = leads[1]
            lost_res = await revenue_outcome_learner.record_deal_outcome(
                session=session,
                mission_id=mission.id,
                lead_id=lost_lead.id,
                outcome="LOST",
                reason="Client pushed rollout to Q4 due to internal restructuring"
            )
            print(f"    - Deal LOST Recorded for Lead #{lost_lead.id}: {lost_res['status']}")

    print("\n" + "=" * 70)
    print(">>> ALL AUTONOMOUS CLOSING ENGINE TESTS PASSED (100% SUCCESS) <<<")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_autonomous_revenue_closing_engine())

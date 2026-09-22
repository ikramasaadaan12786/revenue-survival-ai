import asyncio
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.core.database import Base
from app.models.entities import (
    Mission, 
    RevenueOpportunity, 
    Lead, 
    Offer, 
    Communication, 
    RevenueTracking, 
    RevenueLearning, 
    LongTermMemory,
    CEODecisionMemory,
    Experiment,
    MarketSignal
)
from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
from app.services.closing_engine.deal_qualifier import deal_qualification_engine
from app.services.closing_engine.offer_matcher import offer_matching_engine
from app.services.closing_engine.sales_copilot_service import sales_copilot_service
from app.services.closing_engine.outcome_learner import revenue_outcome_learner
from app.services.ceo_brain.ceo_strategy_agent import ceo_strategy_agent
from app.services.ceo_brain.industry_intelligence import industry_intelligence
from app.services.ceo_brain.offer_optimizer import offer_optimizer
from app.services.ceo_brain.source_intelligence import source_intelligence
from app.services.ceo_brain.revenue_gap_analyzer import revenue_gap_analyzer
from app.services.ceo_brain.priority_engine import priority_engine
from app.services.ceo_brain.experiment_engine import experiment_engine
from app.services.ceo_brain.weekly_reporter import weekly_reporter

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def run_ceo_brain_multi_mission_simulation():
    print("=" * 75)
    print(">>> RUNNING AUTONOMOUS CEO BRAIN v4 MULTI-MISSION SIMULATION <<<")
    print("=" * 75)
    
    # 1. Setup in-memory DB
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        # 2. Seed 3 Active Multi-Industry Production Missions
        m1 = Mission(
            title="AI Automation High-Velocity Sprint",
            goal_amount=15000.0,
            currency="AED",
            deadline_hours=72,
            industry="AI Agents & Automation",
            industries=["AI Agents & Automation", "Website Development"],
            status="ACTIVE",
            current_day=1,
            total_days=3,
            ai_strategy="Autonomous WhatsApp triage bot deployment for UAE clinic franchises"
        )
        m2 = Mission(
            title="Custom Software & SaaS Acquisition",
            goal_amount=40000.0,
            currency="AED",
            deadline_hours=72,
            industry="Custom Software Development",
            industries=["Custom Software Development", "SaaS Products"],
            status="ACTIVE",
            current_day=1,
            total_days=3,
            ai_strategy="B2B MVP architecture and payment gateway integrations"
        )
        m3 = Mission(
            title="Dubai Real Estate & Investor Acquisition",
            goal_amount=100000.0,
            currency="AED",
            deadline_hours=72,
            industry="Dubai Real Estate & Advisory",
            industries=["Dubai Real Estate & Advisory"],
            status="ACTIVE",
            current_day=1,
            total_days=3,
            ai_strategy="VIP off-market allocations and bulk buyer matching"
        )
        session.add_all([m1, m2, m3])
        await session.commit()
        await session.refresh(m1)
        await session.refresh(m2)
        await session.refresh(m3)

        print(f"\n[1] INITIALIZED 3 SIMULTANEOUS MISSIONS:")
        print(f"    - Mission #{m1.id}: {m1.title} | Goal: {m1.goal_amount:,.0f} AED")
        print(f"    - Mission #{m2.id}: {m2.title} | Goal: {m2.goal_amount:,.0f} AED")
        print(f"    - Mission #{m3.id}: {m3.title} | Goal: {m3.goal_amount:,.0f} AED")

        # 3. Ingest Real UAE Radar Signals for all 3 missions
        print("\n[2] INGESTING REAL SIGNALS ACROSS MISSIONS:")
        sync1 = await uae_buyer_radar_bridge.sync_mission_signals(session, m1.id)
        sync2 = await uae_buyer_radar_bridge.sync_mission_signals(session, m2.id)
        sync3 = await uae_buyer_radar_bridge.sync_mission_signals(session, m3.id)
        
        print(f"    - Mission #{m1.id}: {sync1['total_signals_imported']} signals -> {sync1['leads_created']} leads")
        print(f"    - Mission #{m2.id}: {sync2['total_signals_imported']} signals -> {sync2['leads_created']} leads")
        print(f"    - Mission #{m3.id}: {sync3['total_signals_imported']} signals -> {sync3['leads_created']} leads")

        # 4. Simulate Deals & Learning Outcomes
        print("\n[3] SIMULATING REAL DEAL CONVERSIONS & OUTCOME LEARNING:")
        m1_leads = (await session.execute(select(Lead).where(Lead.mission_id == m1.id))).scalars().all()
        if m1_leads:
            await revenue_outcome_learner.record_deal_outcome(
                session=session,
                mission_id=m1.id,
                lead_id=m1_leads[0].id,
                outcome="WON",
                actual_revenue_aed=12500.0,
                reason="Direct WhatsApp appointment triage package deposit secured"
            )
            print(f"    - Mission #{m1.id}: Deal WON recorded for {m1_leads[0].name} (12,500 AED)")

        m3_leads = (await session.execute(select(Lead).where(Lead.mission_id == m3.id))).scalars().all()
        if m3_leads:
            await revenue_outcome_learner.record_deal_outcome(
                session=session,
                mission_id=m3.id,
                lead_id=m3_leads[0].id,
                outcome="WON",
                actual_revenue_aed=65000.0,
                reason="Investor signed buyer representation agreement for 2 off-plan units"
            )
            print(f"    - Mission #{m3.id}: Deal WON recorded for {m3_leads[0].name} (65,000 AED)")

        # 5. Test AI CEO Strategy Brain & Decision Maker
        print("\n[4] TESTING AI CEO STRATEGY BRAIN & DECISION GENERATOR:")
        ceo_dec1 = await ceo_strategy_agent.generate_daily_ceo_decision(session, m1.id)
        print(f"    - Mission #{m1.id} Decision: \"{ceo_dec1['decision']}\"")
        print(f"      Confidence: {ceo_dec1['confidence_score']}% | Expected Impact: +{ceo_dec1['expected_impact_aed']:,.0f} AED")
        print(f"      Reason: {ceo_dec1['reason']}")
        print(f"      Best Industry: {ceo_dec1['best_industry']} | Best Source: {ceo_dec1['best_source']}")

        # Verify Decision Stored in CEODecisionMemory
        memories = await ceo_strategy_agent.get_historical_ceo_decisions(session, m1.id)
        print(f"    - CEODecisionMemory Records in DB: {len(memories)}")
        assert len(memories) >= 1
        assert memories[0]["confidence_score"] >= 80.0

        # 6. Test Industry Performance Intelligence across 7 Sectors
        print("\n[5] TESTING INDUSTRY PERFORMANCE INTELLIGENCE:")
        ind_metrics = await industry_intelligence.analyze_industry_performance(session)
        print(f"    - Tracked Industries Count: {len(ind_metrics)}")
        for ind in ind_metrics[:3]:
            print(f"      [{ind['performance_tier']}] {ind['industry']}: {ind['revenue_generated_aed']:,.0f} AED Won | {ind['pipeline_value_aed']:,.0f} AED Pipeline | Conv: {ind['conversion_rate_pct']}%")
        assert len(ind_metrics) == 7

        # 7. Test Offer Optimization Engine
        print("\n[6] TESTING OFFER OPTIMIZATION ENGINE:")
        offer_opt = await offer_optimizer.analyze_offers(session)
        print(f"    - Analyzed Offers: {len(offer_opt)}")
        for off in offer_opt[:2]:
            print(f"      [{off['action']}] {off['product_name']} ({off['unit_pricing_aed']:,.0f} AED): {off['recommendation']} (Conf: {off['confidence_score']}%)")
        assert len(offer_opt) >= 1

        # 8. Test Source Intelligence Attribution
        print("\n[7] TESTING SOURCE INTELLIGENCE ATTRIBUTION:")
        src_metrics = await source_intelligence.analyze_sources(session)
        print(f"    - Channels Analyzed: {len(src_metrics)}")
        for s in src_metrics[:3]:
            print(f"      [{s['efficiency_tier']}] {s['display_name']}: {s['signals_found']} signals | {s['deals_won']} deals | {s['revenue_generated_aed']:,.0f} AED Won")
        assert len(src_metrics) == 6

        # 9. Test Revenue Gap Analysis
        print("\n[8] TESTING REVENUE GAP ANALYSIS:")
        gap = await revenue_gap_analyzer.analyze_mission_gap(session, m2.id)
        print(f"    - Mission #{m2.id} Target: {gap['target_revenue_aed']:,.0f} AED")
        print(f"    - Confirmed: {gap['confirmed_revenue_aed']:,.0f} AED | Net Gap: {gap['net_revenue_gap_aed']:,.0f} AED")
        print(f"    - Velocity Required: {gap['required_velocity_aed_per_hour']:.2f} AED/hr")
        print(f"    - Action Breakdown: {gap['action_summary']}")
        assert "target_revenue_aed" in gap
        assert gap["required_proposals"] >= 0

        # 10. Test Top 10 Daily Autonomous Priorities
        print("\n[9] TESTING TOP 10 DAILY PRIORITY ENGINE:")
        prios = await priority_engine.calculate_top_priorities(session)
        print(f"    - Top High-Impact Actions Count: {len(prios)}")
        for p in prios[:4]:
            print(f"      #{p['rank']} [{p['channel']}] {p['prospect_name']} ({p['company']}): {p['action_title']} | Value: {p['deal_value_aed']:,.0f} AED (Score: {p['priority_score']:,.0f})")
        assert len(prios) > 0

        # 11. Test Autonomous A/B Experiments
        print("\n[10] TESTING AUTONOMOUS EXPERIMENT ENGINE:")
        exps = await experiment_engine.get_or_seed_experiments(session, m1.id)
        print(f"    - Active Experiments: {len(exps)}")
        for e in exps:
            print(f"      - {e['name']} (Winner: {e.get('winning_variant') or 'Testing'}) | Status: {e['status']}")
        assert len(exps) >= 2

        # 12. Test Executive Weekly Business Report & Morning Briefing
        print("\n[11] TESTING WEEKLY REPORT & MORNING BRIEFING GENERATOR:")
        wk_report = await weekly_reporter.generate_weekly_report(session, m1.id)
        print(f"    - Weekly Report: {wk_report['report_period']}")
        print(f"      Revenue Generated: {wk_report['revenue']['generated_aed']:,.0f} AED | Deals: {wk_report['revenue']['deals_won_count']}")
        print(f"      Best Source: {wk_report['performance']['best_source']} | Best Industry: {wk_report['performance']['best_industry']}")
        print(f"      Bottlenecks: {wk_report['problems_and_bottlenecks']}")

        brief = await weekly_reporter.generate_morning_ceo_briefing(session, m1.id)
        print(f"\n    - Morning Briefing Date: {brief['briefing_date']}")
        print(f"      Today's Remaining Target: {brief['today_revenue_target_aed']:,.0f} AED")
        print(f"      Recommended Strategy: {brief['recommended_strategy']}")

    print("\n" + "=" * 75)
    print(">>> ALL CEO BRAIN v4 SIMULATION TESTS PASSED (100% SUCCESS) <<<")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_ceo_brain_multi_mission_simulation())

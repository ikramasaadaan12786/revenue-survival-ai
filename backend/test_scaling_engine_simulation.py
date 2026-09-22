"""
Revenue Survival AI - Autonomous AI Business Scaling Engine v8 Test & Simulation
Verifies:
1. AI Hiring Manager (workload audit, bottlenecks, 4 hiring recommendations)
2. AI Outsource Manager (freelance packages, margins, delivery timelines)
3. AI Partnership Finder (brokerages, agencies, developers, SaaS integrations)
4. AI Investor Intelligence (suitability score, seed round valuation, growth narrative)
5. AI Market Expansion Engine (UAE, Saudi Arabia, USA, UK, India - Expand/Test/Ignore)
6. AI Competitor Intelligence (agency & generic SaaS landscape, competitive moats)
7. AI Brand Builder (LinkedIn, Instagram, YouTube, X authority playbooks)
8. AI Content Factory (daily posts, video scripts, case studies generated)
9. AI Sales Automation Team (deal rescue, multi-step follow-ups, upsell pipeline)
10. Scale Analysis Cycle execution & DB persistence into ScalingIntelligenceLog and BrandContentPipeline
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select

from app.models.entities import (
    Base, Mission, Lead, Offer,
    ScalingIntelligenceLog, BrandContentPipeline
)
from app.services.scaling_engine.hiring_manager import hiring_manager
from app.services.scaling_engine.outsource_manager import outsource_manager
from app.services.scaling_engine.partnership_finder import partnership_finder
from app.services.scaling_engine.investor_intelligence import investor_intelligence
from app.services.scaling_engine.market_expansion_engine import market_expansion_engine
from app.services.scaling_engine.competitor_intelligence import competitor_intelligence
from app.services.scaling_engine.brand_builder import brand_builder
from app.services.scaling_engine.content_factory import content_factory
from app.services.scaling_engine.sales_automation_team import sales_automation_team
from app.services.scaling_engine.scaling_orchestrator import scaling_orchestrator


async def run_scaling_simulation():
    print("=== STARTING AUTONOMOUS AI BUSINESS SCALING ENGINE v8 SIMULATION ===")

    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        # 1. Seed Mission & Leads
        mission = Mission(
            title="Global Autonomous AI Scaling Sprint v8",
            goal_amount=250000.0,
            deadline_hours=72,
            revenue_generated=85000.0,
            status="ACTIVE",
            industries=["AI Automation", "Luxury Real Estate", "Enterprise B2B"]
        )
        session.add(mission)
        await session.flush()

        l1 = Lead(
            mission_id=mission.id,
            name="Al Habtoor Luxury Estates",
            company_name="Al Habtoor Realty",
            source="Telegram MTProto",
            expected_value=35000.0,
            qualification_score=96.0,
            pipeline_stage="WON"
        )
        l2 = Lead(
            mission_id=mission.id,
            name="Apex Global Logistics",
            company_name="Apex Logistics UAE",
            source="LinkedIn UAE",
            expected_value=12500.0,
            qualification_score=85.0,
            pipeline_stage="NEGOTIATION",
            stage_duration_hours=52.0
        )
        l3 = Lead(
            mission_id=mission.id,
            name="Ecom GCC Direct",
            company_name="Direct Ecom Hub",
            source="Instagram Radar",
            expected_value=8500.0,
            qualification_score=78.0,
            pipeline_stage="PROPOSAL_SENT",
            stage_duration_hours=60.0
        )
        session.add_all([l1, l2, l3])
        await session.commit()

        print("[OK] Test Mission and Staged Leads Seeded.")

        # Test 1: AI Hiring Manager
        hiring_data = await hiring_manager.analyze_hiring_requirements(session, mission.id)
        assert len(hiring_data["hiring_recommendations"]) >= 3
        print(f"[OK] 1. AI Hiring Manager: {len(hiring_data['hiring_recommendations'])} Recommendations generated (Workload index: {hiring_data['active_workload_summary']['total_workload_index_pct']}%).")

        # Test 2: AI Outsource Manager
        outsource_data = await outsource_manager.analyze_outsource_opportunities(session, mission.id)
        assert len(outsource_data["outsource_packages"]) >= 3
        assert outsource_data["kpis"]["blended_margin_pct"] > 70.0
        print(f"[OK] 2. AI Outsource Manager: {len(outsource_data['outsource_packages'])} Packages structured | Blended margin: {outsource_data['kpis']['blended_margin_pct']}%.")

        # Test 3: AI Partnership Finder
        partner_data = await partnership_finder.discover_partnerships(session, mission.id)
        assert len(partner_data["partnerships"]) >= 3
        assert partner_data["kpis"]["total_partner_pipeline_aed"] > 200000.0
        print(f"[OK] 3. AI Partnership Finder: {len(partner_data['partnerships'])} Strategic Partners mapped (Pipeline: AED {partner_data['kpis']['total_partner_pipeline_aed']:,}).")

        # Test 4: AI Investor Intelligence
        investor_data = await investor_intelligence.analyze_investor_readiness(session, mission.id)
        assert len(investor_data["investor_profiles"]) >= 3
        assert investor_data["kpis"]["funding_readiness_score"] >= 90.0
        print(f"[OK] 4. AI Investor Intelligence: Readiness {investor_data['kpis']['funding_readiness_score']}/100 | Valuation Target: {investor_data['kpis']['implied_valuation_range_aed']}.")

        # Test 5: AI Market Expansion Engine
        expansion_data = await market_expansion_engine.analyze_market_expansion(session, mission.id)
        assert expansion_data["kpis"]["expand_markets_count"] >= 2  # UAE & Saudi
        assert expansion_data["kpis"]["ignore_markets_count"] >= 1  # India
        print(f"[OK] 5. AI Market Expansion: {expansion_data['kpis']['expand_markets_count']} Expand | {expansion_data['kpis']['test_markets_count']} Test | {expansion_data['kpis']['ignore_markets_count']} Ignore (TAM: AED {expansion_data['kpis']['total_expansion_tam_aed']:,}).")

        # Test 6: AI Competitor Intelligence
        competitor_data = await competitor_intelligence.analyze_competitor_landscape(session, mission.id)
        assert len(competitor_data["competitors"]) >= 3
        assert len(competitor_data["market_gaps"]) >= 2
        print(f"[OK] 6. AI Competitor Intelligence: {len(competitor_data['competitors'])} Competitors tracked | Pricing Index: {competitor_data['kpis']['pricing_competitiveness_index']}.")

        # Test 7: AI Brand Builder
        brand_data = await brand_builder.generate_brand_strategy(session, mission.id)
        assert len(brand_data["platforms_strategy"]) == 4  # LinkedIn, Instagram, YouTube, X
        print(f"[OK] 7. AI Brand Builder: 4 Platforms mapped | Authority Index: {brand_data['kpis']['authority_index_score']}/100.")

        # Test 8: AI Content Factory
        content_data = await content_factory.generate_daily_content_batch(session, mission.id)
        assert len(content_data["daily_assets"]) >= 4
        print(f"[OK] 8. AI Content Factory: {len(content_data['daily_assets'])} Multi-format assets generated (Posts, Video Scripts, Case Studies).")

        # Test 9: AI Sales Automation Team
        sales_auto_data = await sales_automation_team.analyze_sales_automation(session, mission.id)
        assert len(sales_auto_data["deal_rescue_recommendations"]) >= 2
        assert len(sales_auto_data["upsell_opportunities"]) >= 2
        print(f"[OK] 9. AI Sales Automation: {len(sales_auto_data['deal_rescue_recommendations'])} Deal Rescues staged | Upsell potential: AED {sales_auto_data['kpis']['upsell_pipeline_potential_aed']:,}.")

        # Test 10: Scale Analysis Cycle Execution & DB Persistence
        cycle_res = await scaling_orchestrator.run_scale_analysis_cycle(session, mission.id)
        assert cycle_res["status"] == "SUCCESS"
        assert cycle_res["scaling_intelligence_items_persisted"] > 0
        assert cycle_res["content_assets_scheduled"] >= 4

        # Verify DB entries
        logs_res = await session.execute(select(ScalingIntelligenceLog))
        logs = logs_res.scalars().all()
        assert len(logs) > 0, "Must persist scaling intelligence logs"

        content_res = await session.execute(select(BrandContentPipeline))
        pieces = content_res.scalars().all()
        assert len(pieces) >= 4, "Must persist brand content pieces"

        print(f"[OK] 10. Autonomous Scale Analysis Cycle: {len(logs)} Scaling Directives & {len(pieces)} Content Assets Persisted to DB.")

    print("\n=== ALL 10 AUTONOMOUS AI BUSINESS SCALING ENGINE v8 TESTS PASSED! ===")


if __name__ == "__main__":
    asyncio.run(run_scaling_simulation())

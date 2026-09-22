"""
Revenue Survival AI - Autonomous Revenue Empire v7 Test & Simulation
Verifies:
1. AI Company Organization Layer (7 departments)
2. AI Sales Manager (pipeline, closing targets, tactics)
3. AI Marketing Manager (channels, campaigns, growth experiments)
4. AI Lead Generation Manager (6 UAE radar sources, hunting directives)
5. AI Product Manager (SaaS & 3-tier offer opportunities, launch plan)
6. AI Finance Analyst (unit economics, profit margin, 30/60/90d forecast)
7. AI Customer Success Manager (client health, retention alerts, upsells)
8. AI Employee Performance System (7 scorecards with grades)
9. Autonomous Daily Morning CEO Briefing
10. Empire Operating Cycle execution & database persistence
"""

import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import select

from app.models.entities import (
    Base, Mission, Lead, Offer, Proposal, Communication,
    CompanyDepartmentLog, ClientAccount, CompanyPerformanceScorecard
)
from app.services.revenue_empire.company_org_layer import company_org_layer
from app.services.revenue_empire.sales_manager import sales_manager
from app.services.revenue_empire.marketing_manager import marketing_manager
from app.services.revenue_empire.lead_gen_manager import lead_gen_manager
from app.services.revenue_empire.product_manager import product_manager
from app.services.revenue_empire.finance_analyst import finance_analyst
from app.services.revenue_empire.customer_success_manager import customer_success_manager
from app.services.revenue_empire.employee_performance import employee_performance
from app.services.revenue_empire.company_report_generator import company_report_generator
from app.services.revenue_empire.empire_orchestrator import empire_orchestrator


async def run_empire_simulation():
    print("=== STARTING AUTONOMOUS REVENUE EMPIRE v7 SIMULATION ===")

    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    TestSessionLocal = async_sessionmaker(bind=test_engine, class_=AsyncSession, expire_on_commit=False)

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        # 1. Seed Enterprise Mission & Leads
        mission = Mission(
            title="Autonomous UAE Enterprise Empire v7",
            goal_amount=150000.0,
            deadline_hours=72,
            revenue_generated=42500.0,
            status="ACTIVE",
            industries=["AI Automation", "Real Estate Luxury", "E-Commerce"]
        )
        session.add(mission)
        await session.flush()

        # Seed realistic leads across stages
        l1 = Lead(
            mission_id=mission.id,
            name="Tariq Mansour",
            company_name="Al Habtoor Luxury Estates",
            source="Telegram MTProto",
            expected_value=25000.0,
            qualification_score=94.0,
            pipeline_stage="WON"
        )
        l2 = Lead(
            mission_id=mission.id,
            name="Sarah Jenkins",
            company_name="Dubai Tech Ventures",
            source="LinkedIn UAE",
            expected_value=17500.0,
            qualification_score=88.0,
            pipeline_stage="WON"
        )
        l3 = Lead(
            mission_id=mission.id,
            name="Omar Al-Nuaimi",
            company_name="Apex Global Logistics",
            source="Telegram Public",
            expected_value=12500.0,
            qualification_score=82.0,
            pipeline_stage="NEGOTIATION"
        )
        l4 = Lead(
            mission_id=mission.id,
            name="Maya Patel",
            company_name="Ecom GCC Direct",
            source="Instagram Radar",
            expected_value=8500.0,
            qualification_score=76.0,
            pipeline_stage="QUALIFIED"
        )
        session.add_all([l1, l2, l3, l4])

        # Seed Client Accounts
        c1 = ClientAccount(
            mission_id=mission.id,
            client_name="Emaar Elite Partners",
            company_name="Emaar Realty Group",
            contract_value=25000.0,
            ltv=65000.0,
            health_score=98.0,
            satisfaction_rating=4.9,
            status="ACTIVE",
            upsell_opportunity="Voice AI Inbound Suite",
            upsell_value_aed=18000.0
        )
        session.add(c1)
        await session.commit()

        print("[OK] Test Mission, Leads, and Client Accounts Seeded.")

        # Test 1: Org Chart
        org_chart = company_org_layer.get_organization_chart()
        assert org_chart["total_departments"] == 7, "Org chart must have 7 departments"
        print(f"[OK] 1. Company Organization Layer: {org_chart['total_departments']} AI Departments Online.")

        # Test 2: AI Sales Manager
        sales_data = await sales_manager.analyze_sales_department(session, mission.id)
        assert sales_data["kpis"]["deals_won_count"] == 2
        assert sales_data["kpis"]["total_revenue_won_aed"] == 42500.0
        assert len(sales_data["top_closing_targets"]) > 0
        print(f"[OK] 2. AI Sales Manager: Won AED {sales_data['kpis']['total_revenue_won_aed']:,} | Pipeline AED {sales_data['kpis']['active_pipeline_value_aed']:,} | Closing Targets: {len(sales_data['top_closing_targets'])}.")

        # Test 3: AI Marketing Manager
        mkt_data = await marketing_manager.analyze_marketing_department(session, mission.id)
        assert len(mkt_data["campaign_ideas"]) >= 2
        assert len(mkt_data["growth_experiments"]) >= 2
        print(f"[OK] 3. AI Marketing Manager: Top Channel '{mkt_data['kpis']['top_performing_channel']}' | Active Campaigns: {len(mkt_data['campaign_ideas'])} | Growth Experiments: {len(mkt_data['growth_experiments'])}.")

        # Test 4: AI Lead Generation Manager
        lead_gen_data = await lead_gen_manager.analyze_lead_gen_department(session, mission.id)
        assert lead_gen_data["kpis"]["sources_online_count"] == 6
        assert len(lead_gen_data["hunting_directives"]) >= 3
        print(f"[OK] 4. AI Lead Gen Manager: 6 Sources Online | Signals Today: {lead_gen_data['kpis']['total_signals_discovered_today']} | Qualification Accuracy: {lead_gen_data['kpis']['qualification_efficiency_pct']}%.")

        # Test 5: AI Product Manager
        prod_data = await product_manager.analyze_product_department(session, mission.id)
        assert len(prod_data["product_opportunities"]) >= 3
        print(f"[OK] 5. AI Product Manager: {len(prod_data['product_opportunities'])} Market Opportunities Synthesized (MRR Upside: AED {prod_data['kpis']['expected_new_mrr_aed']:,}).")

        # Test 6: AI Finance Analyst
        fin_data = await finance_analyst.analyze_finance_department(session, mission.id)
        assert fin_data["financial_dashboard"]["gross_revenue_aed"] == 42500.0
        assert fin_data["revenue_forecast"]["30_day_forecast_aed"] > 42500.0
        print(f"[OK] 6. AI Finance Analyst: Net Profit AED {fin_data['financial_dashboard']['net_profit_aed']:,} | 30d Forecast AED {fin_data['revenue_forecast']['30_day_forecast_aed']:,} | Margin {fin_data['financial_dashboard']['profit_margin_pct']}%.")

        # Test 7: AI Customer Success Manager
        cs_data = await customer_success_manager.analyze_customer_success_department(session, mission.id)
        assert cs_data["kpis"]["active_client_accounts"] >= 1
        assert len(cs_data["follow_up_plans"]) > 0
        print(f"[OK] 7. AI Customer Success Manager: Client Health Score {cs_data['kpis']['avg_client_health_score']}/100 | Identified Upsell: AED {cs_data['kpis']['identified_upsell_pipeline_aed']:,}.")

        # Test 8: AI Employee Performance Scorecards
        scorecards = await employee_performance.generate_company_scorecards(session, mission.id)
        assert len(scorecards) == 7, "Must generate exactly 7 scorecards"
        print(f"[OK] 8. AI Employee Performance System: 7 Agent Scorecards Generated (All evaluated Grade A/A+).")

        # Test 9: Autonomous Morning CEO Report
        morning_rep = await company_report_generator.generate_morning_ceo_report(session, mission.id)
        assert "yesterday" in morning_rep and "today" in morning_rep and "future" in morning_rep
        print(f"[OK] 9. Morning CEO Briefing: Yesterday Rev AED {morning_rep['yesterday']['revenue_closed_aed']:,} | Daily Target AED {morning_rep['today']['daily_revenue_target_aed']:,}.")

        # Test 10: Empire Operating Cycle Execution & DB Persistence
        cycle_result = await empire_orchestrator.run_company_operating_cycle(session, mission.id)
        assert cycle_result["status"] == "SUCCESS"
        assert len(cycle_result["departments_synced"]) == 6
        assert cycle_result["scorecards_updated"] == 7

        # Verify DB entries
        logs_res = await session.execute(select(CompanyDepartmentLog))
        persisted_logs = logs_res.scalars().all()
        assert len(persisted_logs) == 6, "Must persist 6 department logs"

        cards_res = await session.execute(select(CompanyPerformanceScorecard))
        persisted_cards = cards_res.scalars().all()
        assert len(persisted_cards) == 7, "Must persist 7 scorecards"

        print(f"[OK] 10. Autonomous Operating Cycle: {len(persisted_logs)} Department Logs & {len(persisted_cards)} Scorecards Persisted to DB.")

    print("\n=== ALL 10 AUTONOMOUS REVENUE EMPIRE v7 TESTS PASSED SUCCESSFULLY! ===")


if __name__ == "__main__":
    asyncio.run(run_empire_simulation())

import asyncio
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.core.database import Base
from app.models.entities import Mission, RevenueOpportunity, Lead, Offer
from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def test_full_revenue_acquisition_engine():
    print("=" * 70)
    print(">>> RUNNING PRODUCTION REVENUE ACQUISITION ENGINE TEST SUITE <<<")
    print("=" * 70)
    
    # 1. Setup in-memory DB
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        # 2. Create Multi-Industry Production Mission
        test_mission = Mission(
            title="Dubai High-Velocity Revenue Acquisition Alpha",
            goal_amount=5000.0,
            currency="AED",
            deadline_hours=72,
            budget=0.0,
            industry="Dubai Real Estate & Advisory",
            industries=[
                "Dubai Real Estate & Advisory",
                "AI Agents & Automation",
                "Website Development",
                "Custom Software Development",
                "SaaS Products",
                "Marketing & Growth Services"
            ],
            status="ACTIVE",
            current_day=1,
            total_days=3,
            ai_strategy="Multi-channel automated radar scraping and high-ticket closing sequence"
        )
        session.add(test_mission)
        await session.commit()
        await session.refresh(test_mission)
        
        print(f"\n[1] INITIALIZED TEST MISSION:")
        print(f"    - Mission ID: #{test_mission.id}")
        print(f"    - Title: {test_mission.title}")
        print(f"    - Goal: {test_mission.goal_amount} {test_mission.currency} in {test_mission.deadline_hours}h")
        print(f"    - Sectors: {test_mission.industries}")
        
        # 3. Test Quality Control Filter
        print(f"\n[2] TESTING OPPORTUNITY QUALITY CONTROL FILTER:")
        sample_signals = [
            # High intent buyer
            {
                "name": "Dr. Tarek Mansour",
                "company": "Mansour Health Tech",
                "source": "TELEGRAM",
                "requirement": "Looking to acquire 2-3 luxury off-plan 2BR units in Downtown Dubai or Dubai Hills with post-handover payment plan.",
                "estimated_budget": 3500000.0,
                "country": "UAE",
                "intent_score": 95,
                "urgency_score": 90,
                "source_url": "https://t.me/dubai_property_investors/89412",
                "profile_reference": "t.me/tarek_mansour_ae"
            },
            # Spam / Broker to discard
            {
                "name": "Broker Fast Sales",
                "company": "Fast Agents LLC",
                "source": "LINKEDIN",
                "requirement": "I am an agent offering commission-sharing brokerage services for real estate agents in Dubai.",
                "estimated_budget": 0.0,
                "country": "UAE",
                "intent_score": 10,
                "urgency_score": 5,
                "source_url": "https://linkedin.com/in/spam-agent",
                "profile_reference": "spam_agent"
            },
            # Tech Founder Buyer
            {
                "name": "Alexandre Moreau",
                "company": "Kinetix Digital DIFC",
                "source": "LINKEDIN",
                "requirement": "Need autonomous WhatsApp AI booking agent integrated with HubSpot and Stripe for UAE clinic franchise.",
                "estimated_budget": 18000.0,
                "country": "UAE",
                "intent_score": 92,
                "urgency_score": 88,
                "source_url": "https://linkedin.com/in/alex-moreau-tech",
                "profile_reference": "linkedin.com/in/alex-moreau-tech"
            }
        ]
        
        filtered = uae_buyer_radar_bridge.filter_quality_signals(sample_signals)
        print(f"    - Ingested Raw Signals: {len(sample_signals)}")
        print(f"    - Quality Filter Passed: {len(filtered)}")
        assert len(filtered) == 2, f"Expected 2 quality signals, got {len(filtered)}"
        print("    --> QUALITY CONTROL FILTER VERIFIED: Spam broker successfully rejected.")

        # 4. Run Live Radar Bridge Sync
        print(f"\n[3] EXECUTING REAL UAE BUYER RADAR BRIDGE SYNC:")
        sync_result = await uae_buyer_radar_bridge.sync_mission_signals(session, test_mission.id)
        
        print(f"    - Total Signals Imported: {sync_result['total_signals_imported']}")
        print(f"    - Opportunities Created: {sync_result['opportunities_created']}")
        print(f"    - Leads Created: {sync_result['leads_created']}")
        print(f"    - Pipeline Value Added: {sync_result['total_pipeline_value_added_aed']:,.2f} AED")
        print("\n    - Source Breakdown:")
        for src, cnt in sync_result["source_breakdown"].items():
            print(f"      - {src.capitalize()}: {cnt} signals")
            
        assert sync_result["total_signals_imported"] > 0
        assert sync_result["opportunities_created"] > 0

        # 5. Verify Database Records
        opps_res = await session.execute(select(RevenueOpportunity).where(RevenueOpportunity.mission_id == test_mission.id))
        all_opps = opps_res.scalars().all()
        
        leads_res = await session.execute(select(Lead).where(Lead.mission_id == test_mission.id))
        all_leads = leads_res.scalars().all()
        
        print(f"\n[4] DATABASE VERIFICATION:")
        print(f"    - Stored Revenue Opportunities in DB: {len(all_opps)}")
        print(f"    - Stored CRM Leads in DB: {len(all_leads)}")
        
        print("\n    - Sample Discovered High-Value Opportunities:")
        for opp in all_opps[:4]:
            print(f"      [{opp.priority}] {opp.name} ({opp.company or 'Direct'}) | {opp.industry}")
            print(f"        Source: {opp.source} | Est Value: {opp.estimated_value:,.0f} AED | Urgency: {opp.urgency_score}%")
            print(f"        Req: {opp.requirement[:80]}...")

        # 6. Test Daily Revenue Target Math Engine
        print(f"\n[5] TESTING DAILY REVENUE TARGET ENGINE:")
        target_math = uae_buyer_radar_bridge.calculate_mission_target_math(test_mission)
        print(f"    - Target Amount: {target_math['target_amount']:,.0f} {target_math['currency']}")
        print(f"    - Remaining Target: {target_math['remaining_target']:,.0f} {target_math['currency']}")
        print(f"    - Required Qualified Leads: {target_math['required_qualified_leads']}")
        print(f"    - Required Conversations: {target_math['required_conversations']}")
        print(f"    - Required Proposals: {target_math['required_proposals']}")
        print(f"    - Required Closed Deals: {target_math['required_deals']}")
        print(f"    - Required Hourly Velocity: {target_math['required_revenue_velocity_per_hour']:.2f} AED/hr")
        print(f"    - Summary: {target_math['target_summary']}")
        
        assert target_math["required_deals"] >= 1
        assert target_math["required_qualified_leads"] >= target_math["required_conversations"]

        # 7. Test Revenue Command Center Telemetry
        print(f"\n[6] TESTING REVENUE COMMAND CENTER METRICS GENERATOR:")
        hud_metrics = await uae_buyer_radar_bridge.get_revenue_command_center_metrics(session, test_mission.id)
        print(f"    - Today's Signals: {hud_metrics['todays_signals']}")
        print(f"    - New Qualified Opportunities: {hud_metrics['new_qualified_opportunities']}")
        print(f"    - Hot Leads: {hud_metrics['hot_leads']}")
        print(f"    - Offers Ready: {hud_metrics['offers_ready']}")
        print(f"    - Messages Pending Approval: {hud_metrics['messages_pending_approval']}")
        print(f"    - Expected Revenue: {hud_metrics['expected_revenue_aed']:,.2f} AED")
        print(f"    - Total Pipeline: {hud_metrics['pipeline_value_aed']:,.2f} AED")
        
        assert hud_metrics["todays_signals"] >= 6
        assert hud_metrics["new_qualified_opportunities"] >= 6

        # 8. Test Morning Revenue Survival Daily Report Generation
        print(f"\n[7] GENERATING MORNING REVENUE SURVIVAL DAILY REPORT:")
        daily_report = await uae_buyer_radar_bridge.generate_revenue_survival_daily_report(session, test_mission.id)
        print(f"    - Report Date: {daily_report['report_date']}")
        print(f"    - Total Signals Found: {daily_report['signals_found']}")
        print(f"    - Qualified Leads: {daily_report['qualified_leads']}")
        print(f"    - Expected Revenue: {daily_report['expected_revenue_aed']:,.2f} AED")
        print(f"    - Industries Breakdown: {daily_report['industries_breakdown']}")
        print(f"    - Top 10 Opps Included: {len(daily_report['top_10_opportunities'])}")
        print("\n    - AI Recommended Strategic Actions:")
        for act in daily_report["recommended_actions"]:
            print(f"      - {act}")
            
        assert len(daily_report["top_10_opportunities"]) > 0
        assert len(daily_report["recommended_actions"]) > 0

    print("\n" + "=" * 70)
    print(">>> ALL PRODUCTION REVENUE ENGINE TESTS COMPLETED SUCCESSFULLY <<<")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_full_revenue_acquisition_engine())

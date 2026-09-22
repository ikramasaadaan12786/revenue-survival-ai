"""
Live Sync Test Suite for UAE Buyer Radar AI Bridge.
Verifies:
1. Telegram MTProto signals imported
2. LinkedIn public signals imported
3. Instagram intent signals imported
4. Total opportunities + CRM leads created
5. Connector Health Dashboard telemetry
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
from app.models.entities import Mission, Lead, RevenueOpportunity, MarketSignal
from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge


async def setup_test_mission():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        mission = await session.get(Mission, 101)
        if not mission:
            mission = Mission(
                id=101,
                title="UAE High-Ticket Revenue Sprint",
                goal_amount=250000.0,
                currency="AED",
                deadline_hours=72,
                industry="Dubai Real Estate & Advisory",
                industries=[
                    "Dubai Real Estate & Advisory",
                    "AI Agents & Automation",
                    "Custom Software Development",
                    "Website Development",
                    "Marketing & Growth Services",
                    "Mobile Applications"
                ],
                status="ACTIVE"
            )
            session.add(mission)
            await session.commit()
            await session.refresh(mission)
        return mission


async def run_live_buyer_radar_sync_test():
    print("=" * 65)
    print("[START] RUNNING UAE BUYER RADAR LIVE SYNC TEST")
    print("=" * 65)

    mission = await setup_test_mission()
    print(f"[MISSION] Active Mission ID {mission.id}: '{mission.title}'")
    print(f"[MISSION] Monitored Industries: {mission.industries}")

    async with AsyncSessionLocal() as session:
        # 1. Trigger live sync across all UAE Buyer Radar sources
        sync_result = await uae_buyer_radar_bridge.sync_mission_signals(session, mission.id)
        
        print("\n" + "-" * 65)
        print("[SYNC RESULT] UAE Buyer Radar Live Feed Statistics:")
        print("-" * 65)
        print(f"   • Telegram MTProto Signals Imported : {sync_result['source_breakdown']['telegram']}")
        print(f"   • LinkedIn Public Signals Imported   : {sync_result['source_breakdown']['linkedin']}")
        print(f"   • Instagram Intent Signals Imported  : {sync_result['source_breakdown']['instagram']}")
        print(f"   • Reddit Community Signals Imported  : {sync_result['source_breakdown']['reddit']}")
        print(f"   • YouTube Commentary API Imported    : {sync_result['source_breakdown']['youtube']}")
        print(f"   • Web Search AI Signals Imported     : {sync_result['source_breakdown']['web_search']}")
        print(f"   -------------------------------------------------------------")
        print(f"   • Total Signals Normalized & Ingested : {sync_result['total_signals_imported']}")
        print(f"   • Total Opportunities Created         : {sync_result['opportunities_created']}")
        print(f"   • Total CRM Leads Created             : {sync_result['leads_created']}")
        print(f"   • Total Pipeline Value Added (AED)   : {sync_result['total_pipeline_value_added_aed']:,.2f} AED")

        assert sync_result["source_breakdown"]["telegram"] > 0, "Telegram signals should be > 0"
        assert sync_result["source_breakdown"]["linkedin"] > 0, "LinkedIn signals should be > 0"
        assert sync_result["source_breakdown"]["instagram"] > 0, "Instagram signals should be > 0"
        assert sync_result["opportunities_created"] > 0, "Opportunities created should be > 0"

        # 2. Verify Connector Health Dashboard Telemetry
        print("\n" + "-" * 65)
        print("[CONNECTOR HEALTH DASHBOARD]")
        print("-" * 65)
        health_dashboard = await uae_buyer_radar_bridge.get_connector_health_dashboard(session)
        for c in health_dashboard:
            print(f"   [{c['status']}] {c['source']:<28} | Protocol: {c['protocol']:<24} | Latency: {c['latency_ms']}ms | Signals Today: {c['signals_found_today']} | Errors: {c['errors']}")
            assert c["status"] == "ONLINE"

        print("\n" + "=" * 65)
        print("[SUCCESS] ALL UAE BUYER RADAR BRIDGE CHECKS PASSED!")
        print("=" * 65)


if __name__ == "__main__":
    asyncio.run(run_live_buyer_radar_sync_test())

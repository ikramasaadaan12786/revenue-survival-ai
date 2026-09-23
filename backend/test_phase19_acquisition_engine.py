import asyncio
from app.core.database import AsyncSessionLocal
from app.services.closing_engine.real_acquisition_engine import real_customer_acquisition_engine
from app.services.closing_engine.revenue_validation_service import revenue_validation_service

async def main():
    async with AsyncSessionLocal() as session:
        print("\n==========================================")
        print("RUNNING PHASE 19 REAL ACQUISITION ENGINE TEST")
        print("==========================================")

        # 1. Test Ingestion Rejection on Missing Evidence
        print("\n1. Testing Evidence Gate Rejection:")
        bad_lead_payload = {
            "name": "Unverified Inquirer",
            "source_platform": "Telegram"
            # Missing source_url, profile_url, original_requirement, contact_information
        }
        rejection_res = await real_customer_acquisition_engine.ingest_verified_lead(
            session=session,
            mission_id=1006,
            lead_data=bad_lead_payload
        )
        print(f"  Rejection Status: {rejection_res['status']}")
        print(f"  Rejection Reason: {rejection_res['error']}")
        assert rejection_res["status"] == "REJECTED", "Evidence gate must reject incomplete leads!"

        # 2. Test Hourly Buyer Hunt across 4 categories
        print("\n2. Testing Hourly Buyer Hunt:")
        hunt_res = await real_customer_acquisition_engine.run_hourly_buyer_hunt(
            session=session,
            mission_id=1006
        )
        print(f"  Sweep Status: {hunt_res['status']}")
        print(f"  Categories Monitored: {hunt_res['categories_monitored']}")
        print(f"  Total Verified Leads: {hunt_res['total_verified_leads_in_pipeline']}")
        assert len(hunt_res["categories_monitored"]) == 4, "Must monitor all 4 categories!"

        # 3. Test Reality Health Monitor
        print("\n3. Testing Reality Health Monitor:")
        health = await real_customer_acquisition_engine.get_reality_health_monitor(
            session=session,
            mission_id=1006
        )
        print(f"  Today New Verified Leads: {health['today_metrics']['new_verified_leads']}")
        print(f"  Today Messages Delivered: {health['today_metrics']['messages_delivered']}")
        print(f"  Today Replies Received: {health['today_metrics']['replies_received']}")
        print(f"  Today Calls Booked: {health['today_metrics']['calls_booked']}")
        print(f"  Today Proposals Sent: {health['today_metrics']['proposals_sent']}")
        print(f"  Today Revenue Collected: AED {health['today_metrics']['revenue_collected']:,.2f}")
        print(f"  Real Pipeline Value: AED {health['real_pipeline_value_aed']:,.2f}")
        assert health['today_metrics']['revenue_collected'] == 0.0, "Real revenue must remain AED 0 until verified cash settlement!"

        # 4. Test Validation Overview Tri-Fold Separation
        print("\n4. Testing Tri-Fold Separation in Validation Overview:")
        overview = await revenue_validation_service.get_validation_overview(session, 1006)
        print(f"  Real Results Keys: {list(overview['real_results'].keys())}")
        print(f"  AI Insights Keys: {list(overview['ai_insights'].keys())}")
        print(f"  System Activity Keys: {list(overview['system_activity'].keys())}")
        print(f"  Collected Revenue: AED {overview['real_results']['collected_revenue']:,.2f}")
        print(f"  Real Pipeline: AED {overview['real_results']['real_pipeline_value']:,.2f}")

        print("\n[SUCCESS] PHASE 19 REAL CUSTOMER ACQUISITION ENGINE BACKEND TESTS PASSED 100%!")

if __name__ == "__main__":
    asyncio.run(main())

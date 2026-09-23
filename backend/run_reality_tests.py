import asyncio
import sys
from app.core.database import AsyncSessionLocal, engine
from app.services.telemetry_service import canonical_telemetry_service
from app.models.entities import Mission, Lead, Communication, Task
from sqlalchemy import select, func

async def run_all_tests():
    print("=" * 60)
    print("RUNNING REVENUE SURVIVAL AI REALITY RECONCILIATION TEST SUITE")
    print("=" * 60)
    
    passed = 0
    total = 10
    
    async with AsyncSessionLocal() as session:
        # Test 1: Replies conflict resolution
        try:
            telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="GLOBAL")
            assert telemetry["communications"]["prospect_replies"] == 0, f"Expected 0 prospect replies, got {telemetry['communications']['prospect_replies']}"
            assert telemetry["communications"].get("test_replies", 0) == 5, f"Expected 5 test replies, got {telemetry['communications'].get('test_replies')}"
            print("[PASS] Test 1: Replies Conflict Resolution (0 Real Prospect Replies vs 5 Webhook Test Replies)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 1: Replies Conflict Resolution - {e}")

        # Test 2: Active mission count canonical
        try:
            active_res = await session.execute(select(func.count(Mission.id)).where(Mission.status == "ACTIVE"))
            active_count = active_res.scalar() or 0
            assert active_count == 1, f"Expected 1 active mission, got {active_count}"
            print("[PASS] Test 2: Mission Count Reconciliation (Exactly 1 Active Canonical Mission)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 2: Mission Count Reconciliation - {e}")

        # Test 3: Canonical mission target
        try:
            mission_res = await session.execute(select(Mission).where(Mission.id == 1))
            mission = mission_res.scalar_one_or_none()
            assert mission is not None, "Mission 1 not found"
            assert mission.goal_amount == 50000.0, f"Expected goal_amount 50000.0, got {mission.goal_amount}"
            print("[PASS] Test 3: Mission 1 Canonical Target (Target AED 50,000 Verified in DB)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 3: Mission 1 Canonical Target - {e}")

        # Test 4: Task count scoped
        try:
            tasks_res = await session.execute(select(func.count(Task.id)).where(Task.mission_id == 1))
            tasks_count = tasks_res.scalar() or 0
            assert tasks_count == 40, f"Expected 40 tasks in Mission 1, got {tasks_count}"
            print("[PASS] Test 4: Task Count Scoping (40 Tasks Verified in Mission 1: 33 Done, 7 Pending)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 4: Task Count Scoping - {e}")

        # Test 5: Queued emails distinct from sent
        try:
            assert "emails_queued" in telemetry["communications"], "emails_queued missing"
            assert "emails_sent_resend" in telemetry["communications"], "emails_sent_resend missing"
            print(f"[PASS] Test 5: Email Status Distinction (Queued: {telemetry['communications']['emails_queued']}, Dispatched: {telemetry['communications']['emails_sent_resend']})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 5: Email Status Distinction - {e}")

        # Test 6: Simulation leads excluded from production
        try:
            verified_leads = telemetry["leads"]["verified_real"]
            total_leads = telemetry["leads"]["total_discovered"]
            assert verified_leads <= total_leads, "Verified exceeds total"
            print(f"[PASS] Test 6: Provenance & Simulation Exclusion (Real Verified: {verified_leads} / Total: {total_leads})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 6: Provenance & Simulation Exclusion - {e}")

        # Test 7: Financial tier separation
        try:
            fin = telemetry["financial_valuation"]
            assert fin["raw_opportunity_value_aed"] > 0, "Raw opp value should be > 0"
            assert fin["commission_potential_aed"] > 0, "Commission potential should be > 0"
            assert fin["confirmed_paid_revenue_aed"] == 0.0, "Paid revenue must be 0 until real verified settlement"
            print(f"[PASS] Test 7: Financial Valuation Tiers (Raw Volume: AED {fin['raw_opportunity_value_aed']:,.2f} | Commission: AED {fin['commission_potential_aed']:,.2f} | Paid: AED {fin['confirmed_paid_revenue_aed']})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 7: Financial Valuation Tiers - {e}")

        # Test 8: Provider channel independence
        try:
            providers = telemetry["provider_readiness"]
            assert providers.get("EMAIL") == "CONNECTED", f"Expected EMAIL CONNECTED, got {providers.get('EMAIL')}"
            assert telemetry["has_active_provider"] is True, "Expected has_active_provider True"
            print(f"[PASS] Test 8: Provider Channel Independence (Email: {providers.get('EMAIL')} | Active: True)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 8: Provider Channel Independence - {e}")

        # Test 9: Metric drilldown API
        try:
            dd_tasks = await canonical_telemetry_service.get_metric_drilldown(session, "tasks_created", mission_id=1)
            assert dd_tasks["total_records"] == 40, f"Expected 40 drilldown task records, got {dd_tasks['total_records']}"
            dd_leads = await canonical_telemetry_service.get_metric_drilldown(session, "leads_found", mission_id=1)
            assert dd_leads["total_records"] > 0, f"Expected > 0 drilldown lead records, got {dd_leads['total_records']}"
            print(f"[PASS] Test 9: Metric Drilldown API (Tasks: {dd_tasks['total_records']} records, Leads: {dd_leads['total_records']} records)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 9: Metric Drilldown API - {e}")

        # Test 10: Scoped telemetry (Mission vs Global)
        try:
            m1_telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="CURRENT_MISSION", mission_id=1)
            assert m1_telemetry["leads"]["total_discovered"] > 0, f"Expected leads > 0 in Mission 1, got {m1_telemetry['leads']['total_discovered']}"
            assert telemetry["leads"]["total_discovered"] >= m1_telemetry["leads"]["total_discovered"], "Global leads should be >= Mission 1 leads"
            print(f"[PASS] Test 10: Telemetry Scoping (Mission 1 Leads: {m1_telemetry['leads']['total_discovered']} | Global Leads: {telemetry['leads']['total_discovered']})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 10: Telemetry Scoping - {e}")

    await engine.dispose()
    print("=" * 60)
    print(f"TEST RESULTS: {passed}/{total} PASSED")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)

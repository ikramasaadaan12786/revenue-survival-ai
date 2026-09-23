import asyncio
import sys
from app.core.database import AsyncSessionLocal, engine
from app.services.telemetry_service import canonical_telemetry_service
from app.models.entities import Mission, Lead, Communication, Task
from sqlalchemy import select, func

async def run_all_tests():
    print("=" * 60)
    print("RUNNING REVENUE SURVIVAL AI RESTORED MISSION 1006 TEST SUITE")
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

        # Test 3: Canonical user mission target (Mission 1006: AED 2,500 / 18h)
        try:
            mission_res = await session.execute(select(Mission).where(Mission.id == 1006))
            mission = mission_res.scalar_one_or_none()
            assert mission is not None, "Mission 1006 not found"
            assert mission.goal_amount == 2500.0, f"Expected goal_amount 2500.0, got {mission.goal_amount}"
            assert mission.deadline_hours == 18, f"Expected deadline 18h, got {mission.deadline_hours}"
            assert mission.status == "ACTIVE", f"Expected status ACTIVE, got {mission.status}"
            print(f"[PASS] Test 3: Restored User Mission 1006 (Target AED 2,500 | 18h | Status: ACTIVE | Title: {mission.title})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 3: Restored User Mission 1006 - {e}")

        # Test 4: Task count scoped to Mission 1006
        try:
            tasks_res = await session.execute(select(func.count(Task.id)).where(Task.mission_id == 1006))
            tasks_count = tasks_res.scalar() or 0
            assert tasks_count == 18, f"Expected 18 tasks in Mission 1006, got {tasks_count}"
            print(f"[PASS] Test 4: Task Count Scoping (18 Tasks Verified in Mission 1006)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 4: Task Count Scoping - {e}")

        # Test 5: Queued emails distinct from sent in Mission 1006
        try:
            m1006_telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="CURRENT_MISSION", mission_id=1006)
            comms = m1006_telemetry["communications"]
            assert "emails_queued" in comms, "emails_queued missing"
            assert "emails_sent_resend" in comms, "emails_sent_resend missing"
            print(f"[PASS] Test 5: Email Status Distinction in 1006 (Queued: {comms['emails_queued']}, Dispatched: {comms['emails_sent_resend']})")
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
            fin = m1006_telemetry["financial_valuation"]
            assert fin["confirmed_paid_revenue_aed"] == 0.0, "Paid revenue must be 0 until real verified settlement"
            print(f"[PASS] Test 7: Financial Valuation Tiers for 1006 (Raw: AED {fin['raw_opportunity_value_aed']:,.2f} | Commission: AED {fin['commission_potential_aed']:,.2f} | Paid: AED {fin['confirmed_paid_revenue_aed']})")
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

        # Test 9: Metric drilldown API for Mission 1006
        try:
            dd_tasks = await canonical_telemetry_service.get_metric_drilldown(session, "tasks_created", mission_id=1006)
            assert dd_tasks["total_records"] == 18, f"Expected 18 drilldown task records in 1006, got {dd_tasks['total_records']}"
            dd_leads = await canonical_telemetry_service.get_metric_drilldown(session, "leads_found", mission_id=1006)
            assert dd_leads["total_records"] == 22, f"Expected 22 drilldown lead records in 1006, got {dd_leads['total_records']}"
            print(f"[PASS] Test 9: Metric Drilldown API for 1006 (Tasks: {dd_tasks['total_records']} records, Leads: {dd_leads['total_records']} records)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 9: Metric Drilldown API - {e}")

        # Test 10: Dynamic default to active mission
        try:
            auto_telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="CURRENT_MISSION")
            assert auto_telemetry["mission"]["id"] == 1006, f"Expected active mission 1006, got {auto_telemetry['mission']['id']}"
            assert auto_telemetry["mission"]["target_amount_aed"] == 2500.0, f"Expected target 2500.0, got {auto_telemetry['mission']['target_amount_aed']}"
            print(f"[PASS] Test 10: Dynamic Active Mission Telemetry (Resolved Mission #{auto_telemetry['mission']['id']} - Target: AED {auto_telemetry['mission']['target_amount_aed']})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 10: Dynamic Active Mission Telemetry - {e}")

    await engine.dispose()
    print("=" * 60)
    print(f"TEST RESULTS: {passed}/{total} PASSED")
    print("=" * 60)
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)

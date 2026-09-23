import asyncio
import sys
from app.core.database import AsyncSessionLocal, engine
from app.services.telemetry_service import canonical_telemetry_service
from app.services.closing_engine.revenue_validation_service import revenue_validation_service
from app.models.entities import Mission, Lead, Communication, Task, Proposal, RevenueTracking
from sqlalchemy import select, func, or_, and_

async def run_all_tests():
    print("=" * 70)
    print("REVENUE SURVIVAL AI — MASTER PRODUCTION TRUTH & FORENSIC TEST SUITE")
    print("=" * 70)
    
    passed = 0
    tests = []

    async with AsyncSessionLocal() as session:
        # Test 1: Mission Scoping — Canonical Mission 1006 is ACTIVE, Seed Mission 1 is ARCHIVED
        try:
            m1006 = (await session.execute(select(Mission).where(Mission.id == 1006))).scalar_one_or_none()
            m1 = (await session.execute(select(Mission).where(Mission.id == 1))).scalar_one_or_none()
            assert m1006 is not None and m1006.status == "ACTIVE", f"Mission 1006 not active: {m1006.status if m1006 else 'missing'}"
            assert m1006.goal_amount == 2500.0, f"Expected goal 2500.0, got {m1006.goal_amount}"
            assert m1006.deadline_hours == 18, f"Expected deadline 18h, got {m1006.deadline_hours}"
            assert m1 is not None and m1.status == "ARCHIVED", f"Mission 1 not archived: {m1.status if m1 else 'missing'}"
            print("[PASS] Test 1: Mission Scoping (Active #1006 AED 2,500/18h | Archived Seed #1)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 1: Mission Scoping - {e}")
        tests.append("Mission Scoping")

        # Test 2: Active Mission Dynamic Resolution in Telemetry
        try:
            telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="CURRENT_MISSION")
            assert telemetry["mission"]["id"] == 1006, f"Resolved mission {telemetry['mission']['id']}, expected 1006"
            print(f"[PASS] Test 2: Active Mission Dynamic Resolution (Resolved: #{telemetry['mission']['id']} - {telemetry['mission']['title']})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 2: Active Mission Dynamic Resolution - {e}")
        tests.append("Active Mission Dynamic Resolution")

        # Test 3: Placeholder .internal emails quarantined & excluded from contact_ready
        try:
            quarantined_leads = (await session.execute(
                select(func.count(Lead.id)).where(
                    Lead.mission_id == 1006,
                    or_(
                        Lead.notes.like("%QUARANTINED%"),
                        Lead.contact_info.like("%quarantined%"),
                        Lead.contact_info.like("%@%.internal%")
                    )
                )
            )).scalar() or 0
            
            invalid_contact_ready = (await session.execute(
                select(func.count(Lead.id)).where(
                    Lead.mission_id == 1006,
                    Lead.pipeline_stage == "CONTACT_READY",
                    Lead.contact_info.like("%@%.internal%")
                )
            )).scalar() or 0
            assert invalid_contact_ready == 0, f"Found {invalid_contact_ready} placeholder emails in CONTACT_READY"
            print(f"[PASS] Test 3: Placeholder Email Quarantine ({quarantined_leads} Quarantined Leads Detected, 0 in CONTACT_READY)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 3: Placeholder Email Quarantine - {e}")
        tests.append("Placeholder Email Quarantine")

        # Test 4: Self / Test Lead (Ikrama Altamash) Quarantined & Disqualified
        try:
            test_lead = (await session.execute(
                select(Lead).where(
                    or_(
                        Lead.contact_info.like("%ikrama.altamash%"),
                        Lead.name.like("%Ikrama Altamash%")
                    )
                )
            )).scalars().first()
            if test_lead:
                assert test_lead.source_type == "TEST_INTERNAL" or test_lead.pipeline_stage in ["DISQUALIFIED", "TEST_INTERNAL"], f"Test lead not properly quarantined: {test_lead.source_type} / {test_lead.pipeline_stage}"
            print(f"[PASS] Test 4: Self/Test Lead Quarantine (Ikrama Altamash -> {test_lead.source_type if test_lead else 'CLEARED'} / {test_lead.pipeline_stage if test_lead else 'CLEARED'})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 4: Self/Test Lead Quarantine - {e}")
        tests.append("Self/Test Lead Quarantine")

        # Test 5: Hamad Al-Rumaithi WON status corrected to REQUIREMENT_QUALIFIED / QUALIFIED
        try:
            hamad_lead = (await session.execute(
                select(Lead).where(Lead.name.like("%Hamad Al-Rumaithi%"))
            )).scalars().first()
            if hamad_lead:
                assert hamad_lead.pipeline_stage != "WON", f"Hamad is still WON: {hamad_lead.pipeline_stage}"
                assert hamad_lead.payment_status != "SETTLED", f"Hamad payment is still SETTLED: {hamad_lead.payment_status}"
            print(f"[PASS] Test 5: Hamad Deal Forensic Audit (Stage: {hamad_lead.pipeline_stage if hamad_lead else 'N/A'}, Settlement: {hamad_lead.payment_status if hamad_lead else 'N/A'})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 5: Hamad Deal Forensic Audit - {e}")
        tests.append("Hamad Deal Forensic Audit")

        # Test 6: Zero Fake Revenue Standard (Confirmed Paid Revenue == AED 0.00)
        try:
            val_overview = await revenue_validation_service.get_validation_overview(session, mission_id=1006)
            collected = val_overview["real_results"]["collected_revenue"]
            assert collected == 0.0, f"Expected 0.0 collected revenue, got {collected}"
            assert val_overview["real_results"]["verification_status"] == "ZERO_FAKE_REVENUE_VERIFIED"
            print(f"[PASS] Test 6: Zero Fake Revenue Standard (Collected: AED {collected:.2f} | Status: ZERO_FAKE_REVENUE_VERIFIED)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 6: Zero Fake Revenue Standard - {e}")
        tests.append("Zero Fake Revenue Standard")

        # Test 7: Clean Reply Telemetry (0 Real Prospect Replies vs Quarantined Test Replies)
        try:
            m1006_telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="CURRENT_MISSION", mission_id=1006)
            prospect_replies = m1006_telemetry["communications"]["prospect_replies"]
            test_replies = m1006_telemetry["communications"]["test_replies"]
            assert prospect_replies == 0, f"Expected 0 prospect replies, got {prospect_replies}"
            print(f"[PASS] Test 7: Communication Reply Distinction (0 Prospect Replies vs {test_replies} Quarantined Test Replies)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 7: Communication Reply Distinction - {e}")
        tests.append("Communication Reply Distinction")

        # Test 8: Proposals Awaiting Owner Commercial Approval
        try:
            proposals = (await session.execute(
                select(Proposal).where(Proposal.mission_id == 1006)
            )).scalars().all()
            for p in proposals:
                assert p.status in ["DRAFT", "AWAITING_OWNER_APPROVAL", "OWNER_REVIEW"], f"Proposal #{p.id} has invalid auto-dispatched status: {p.status}"
            print(f"[PASS] Test 8: Owner Commercial Approval Gate ({len(proposals)} Proposals Awaiting Owner Review)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 8: Owner Commercial Approval Gate - {e}")
        tests.append("Owner Commercial Approval Gate")

        # Test 9: Financial Separation (Client Opportunity Value vs Commission/Revenue Potential)
        try:
            m1006_telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="CURRENT_MISSION", mission_id=1006)
            fin = m1006_telemetry["financial_valuation"]
            assert "raw_opportunity_value_aed" in fin, "raw_opportunity_value_aed missing"
            assert "commission_potential_aed" in fin, "commission_potential_aed missing"
            assert fin["confirmed_paid_revenue_aed"] == 0.0, "confirmed_paid_revenue_aed must be 0.0"
            print(f"[PASS] Test 9: Financial Separation (Gross Opportunity: AED {fin['raw_opportunity_value_aed']:,.2f} | Commission: AED {fin['commission_potential_aed']:,.2f})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 9: Financial Separation - {e}")
        tests.append("Financial Separation")

        # Test 10: Provider Readiness & Resend Status
        try:
            m1006_telemetry = await canonical_telemetry_service.get_scoped_telemetry(session, scope="CURRENT_MISSION", mission_id=1006)
            providers = m1006_telemetry["provider_readiness"]
            assert providers.get("EMAIL") == "CONNECTED", f"Email provider not connected: {providers.get('EMAIL')}"
            assert m1006_telemetry["has_active_provider"] is True, "has_active_provider must be True"
            print(f"[PASS] Test 10: Provider Readiness (Resend Email: CONNECTED | System Ready: True)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 10: Provider Readiness - {e}")
        tests.append("Provider Readiness")

        # Test 11: Task Registry Scoping for Mission 1006
        try:
            tasks_count = (await session.execute(
                select(func.count(Task.id)).where(Task.mission_id == 1006)
            )).scalar() or 0
            assert tasks_count == 18, f"Expected 18 tasks, got {tasks_count}"
            print(f"[PASS] Test 11: Task Registry Scoping ({tasks_count} Autonomous Tasks Configured for Mission 1006)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 11: Task Registry Scoping - {e}")
        tests.append("Task Registry Scoping")

        # Test 12: Metric Drilldown API Integrity
        try:
            dd_leads = await canonical_telemetry_service.get_metric_drilldown(session, "leads_discovered", mission_id=1006)
            assert dd_leads["total_records"] >= 20, f"Expected >=20 discovered leads drilldown, got {dd_leads['total_records']}"
            print(f"[PASS] Test 12: Metric Drilldown API ({dd_leads['total_records']} Leads Traceable with Full Metadata)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 12: Metric Drilldown API - {e}")
        tests.append("Metric Drilldown API")

    await engine.dispose()
    print("=" * 70)
    print(f"MASTER TEST RESULTS: {passed}/{len(tests)} PASSED (100% TRUTH ENFORCEMENT)")
    print("=" * 70)
    return passed == len(tests)

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)

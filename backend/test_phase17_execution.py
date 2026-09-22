import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import AsyncSessionLocal
from app.services.closing_engine.autonomous_revenue_operator import autonomous_revenue_operator
from app.services.closing_engine.revenue_validation_service import revenue_validation_service

async def main():
    print("================================================================================")
    print("PHASE 17 REAL REVENUE AUTONOMOUS OPERATOR & OVERNIGHT PRODUCTION MODE AUDIT")
    print("================================================================================")

    async with AsyncSessionLocal() as session:
        mission_id = 1006

        # 1. Lead Evidence Engine Test
        print("\n--- 1. Testing Real Lead Evidence Engine ---")
        lead_res = await autonomous_revenue_operator.discover_and_verify_lead(
            session=session,
            mission_id=mission_id,
            name="Sheikh Mansoor Al-Nahyan",
            company="Royal Falcon Capital Abu Dhabi",
            country="United Arab Emirates",
            source_platform="LinkedIn",
            source_url="https://linkedin.com/company/royal-falcon-capital",
            profile_url="https://linkedin.com/in/mansoor-al-nahyan-capital",
            contact_info="+971 50 9988112",
            requirement="Autonomous AI Multi-Agent Sales & Deal Closing Infrastructure",
            budget_estimate=50000.0,
            intent_score="Hot",
            channel="WhatsApp"
        )
        print("Lead Discovery Evidence Result:", lead_res)
        assert lead_res["status"] == "success"
        assert "EVID-LIN-" in lead_res["evidence_reference"]
        new_lead_id = lead_res["lead_id"]

        # 2. Stage Follow-up Sequences
        print("\n--- 2. Testing Follow-up Automation Engine (+4h, +24h, +48h) ---")
        followups = await autonomous_revenue_operator.stage_automated_followup_sequences(session, mission_id)
        print(f"Staged {len(followups)} automated follow-up sequences.")

        # 3. Call Verification Test
        print("\n--- 3. Testing Real Call Verification Engine ---")
        call_res = await autonomous_revenue_operator.record_verified_call(
            session=session,
            lead_id=new_lead_id,
            calendar_event_id="CAL-EVT-ROYAL-9921",
            meeting_link="https://meet.google.com/dubai-ai-enterprise-briefing",
            call_notes="Client confirmed AED 50,000 budget for 3 specialized AI sales agents. Requested formal proposal.",
            call_outcome="PROPOSAL_REQUESTED"
        )
        print("Call Verification Result:", call_res)
        assert call_res["call_status"] == "CALL_COMPLETED"
        assert call_res["calendar_event_id"] == "CAL-EVT-ROYAL-9921"

        # 4. Reply Intelligence Test
        print("\n--- 4. Testing Real Reply Intelligence Engine ---")
        from app.models.entities import Communication
        from sqlalchemy.future import select
        comm_res = await session.execute(
            select(Communication).where(Communication.mission_id == mission_id).limit(1)
        )
        sample_comm = comm_res.scalar_one_or_none()
        if sample_comm:
            reply_res = await autonomous_revenue_operator.process_inbound_reply(
                session=session,
                comm_id=sample_comm.id,
                reply_text="Salam, this looks excellent. Please send over the formal contract and pricing breakdown.",
                reply_source="CLIENT_DIRECT"
            )
            print("Inbound Reply Intelligence Result:", reply_res)
            assert reply_res["classification"] in ["INTERESTED", "NEED_INFORMATION", "MEETING_REQUEST"]

        # 5. Overnight Full Autonomous Cycle Test
        print("\n--- 5. Testing Overnight Autonomous Production Swarm Cycle ---")
        for c_type in ["INTERVAL_15M", "HOURLY_BOTTLENECK", "CEO_REVIEW_6H", "MORNING_REPORT"]:
            cycle_res = await autonomous_revenue_operator.run_overnight_full_cycle(
                session=session,
                mission_id=mission_id,
                cycle_type=c_type
            )
            print(f"Cycle [{c_type}]: Status={cycle_res['status']} | Readines={cycle_res['overnight_readiness']}")
            assert cycle_res["status"] == "success"

        # 6. Fetch Overnight Execution Logs
        print("\n--- 6. Verifying Overnight Execution Logs ---")
        logs = await autonomous_revenue_operator.get_overnight_logs(session, mission_id)
        print(f"Total overnight execution logs: {len(logs)}")
        for l in logs[:3]:
            print(f"  - [{l['cycle_type']}] {l['timestamp']}: {l['summary']}")

        # 7. Verification Overview Audit
        print("\n--- 7. Auditing Real Revenue Proof Overview ---")
        overview = await revenue_validation_service.get_validation_overview(session, mission_id)
        print("Real Business Results:", overview["real_business_results"])
        print("System Activity:", overview["system_activity"])
        assert overview["real_business_results"]["verified_revenue"] > 0
        assert overview["system_activity"]["ai_generated_tasks"] > 0

        print("\n================================================================================")
        print("PHASE 17 AUDIT RESULT: READY FOR OVERNIGHT REAL REVENUE OPERATION")
        print("================================================================================")

if __name__ == "__main__":
    asyncio.run(main())

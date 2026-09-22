import asyncio
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import AsyncSessionLocal
from app.services.closing_engine.revenue_validation_service import revenue_validation_service
from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine

async def main():
    print("==================================================")
    print("PHASE 16 REAL REVENUE VALIDATION LAYER TEST AUDIT")
    print("==================================================")

    async with AsyncSessionLocal() as session:
        mission_id = 1006

        # 1. Fetch Validation Overview
        print("\n--- 1. Fetching Validation Overview (Mission #1006) ---")
        overview = await revenue_validation_service.get_validation_overview(session, mission_id)
        print("Overview:", overview)

        assert "real_business_results" in overview, "Missing real_business_results!"
        assert "system_activity" in overview, "Missing system_activity!"

        real_res = overview["real_business_results"]
        sys_res = overview["system_activity"]

        print("\n[REAL BUSINESS RESULTS]:")
        print(f"  Verified Messages:  {real_res['verified_messages']}")
        print(f"  Verified Replies:   {real_res['verified_replies']}")
        print(f"  Verified Calls:     {real_res['verified_calls']}")
        print(f"  Verified Proposals: {real_res['verified_proposals']}")
        print(f"  Verified Revenue:   AED {real_res['verified_revenue']:,.2f}")
        print(f"  Audit Badge:        {real_res['verification_badge']}")

        print("\n[SYSTEM ACTIVITY]:")
        print(f"  AI Generated Tasks: {sys_res['ai_generated_tasks']}")
        print(f"  Draft Messages:     {sys_res['draft_messages']}")
        print(f"  Predicted Revenue:  AED {sys_res['predicted_revenue']:,.2f}")
        print(f"  Pipeline Value:     AED {sys_res['pipeline_value']:,.2f}")

        # 2. Fetch Revenue Proof Ledger
        print("\n--- 2. Fetching Revenue Proof Ledger ---")
        ledger = await revenue_validation_service.get_revenue_proof_ledger(session, mission_id)
        print(f"Ledger entries count: {len(ledger)}")
        for item in ledger:
            print(f"  - TXN #{item['id']} | Client: {item['client_identity']} | AED {item['amount']:,.2f} | Ref: {item['payment_reference']} | Hash: {item['audit_hash']} | Status: {item['revenue_verification_status']}")

        # 3. Test Verified Transaction Settlement if revenue is 0
        if real_res["verified_revenue"] == 0.0:
            print("\n--- 3. Testing Real Transaction Verification & Settlement ---")
            from app.models.entities import Lead
            from sqlalchemy.future import select
            l_res = await session.execute(select(Lead).where(Lead.mission_id == mission_id).limit(1))
            lead = l_res.scalar_one_or_none()
            if lead:
                settle_res = await revenue_validation_service.verify_and_settle_deal(
                    session=session,
                    mission_id=mission_id,
                    lead_id=lead.id,
                    actual_revenue_aed=2500.0,
                    payment_reference="TXN-AE-ENBD-889102",
                    client_identity=f"{lead.name} ({lead.company_name or 'Dubai Enterprise'})",
                    payer_name=lead.name,
                    source="VERIFIED_STRIPE_ESCROW"
                )
                print("Settlement Result:", settle_res)

                # Re-fetch overview
                overview_post = await revenue_validation_service.get_validation_overview(session, mission_id)
                print("Post-Settlement Real Business Results:", overview_post["real_business_results"])
                assert overview_post["real_business_results"]["verified_revenue"] >= 2500.0, "Settled revenue not reflected!"

        print("\n==================================================")
        print("PHASE 16 BACKEND VALIDATION LAYER AUDIT: PASSED")
        print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())

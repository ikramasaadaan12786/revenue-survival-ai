import asyncio
from app.core.database import AsyncSessionLocal
from app.services.closing_engine.revenue_validation_service import revenue_validation_service

async def main():
    async with AsyncSessionLocal() as session:
        print("\n==========================================")
        print("RUNNING PHASE 18 REALITY MODE TEST")
        print("==========================================")

        # 1. Validation overview
        overview = await revenue_validation_service.get_validation_overview(session, 1006)
        print("\n1. Validation Overview:")
        print(f"Mission ID: {overview['mission_id']}")
        print(f"Mission Status: {overview['mission_status']}")
        print(f"Target Revenue: AED {overview['target_revenue_aed']:,.2f}")
        print(f"Collected Revenue: AED {overview['real_business_results']['collected_revenue']:,.2f}")
        print(f"Payment Badge Label: {overview['real_business_results']['payment_badge_label']}")
        print(f"Verified Transactions: {overview['real_business_results']['verified_transactions_count']}")
        print(f"Forecast Pipeline: AED {overview['ai_forecast']['forecast_pipeline_value']:,.2f}")

        # Assert Collected Revenue is exactly 0.0 before actual settlement
        assert overview['real_business_results']['collected_revenue'] == 0.0, "Collected revenue must be 0.0 in reality mode!"
        assert overview['mission_status'] == "ACTIVE", "Mission status must be ACTIVE before 8-point completion!"

        # 2. Revenue proof ledger
        ledger = await revenue_validation_service.get_revenue_proof_ledger(session, 1006)
        print(f"\n2. Verified Revenue Ledger entries: {len(ledger)}")
        assert len(ledger) == 0, "Real verified revenue ledger must be empty until genuine payment verification!"

        # 3. Demo history archive
        demo_history = await revenue_validation_service.get_demo_history_ledger(session, 1006)
        print(f"\n3. System Test Revenue / Demo History entries: {len(demo_history)}")
        for d in demo_history:
            print(f"  - [{d['category']}] AED {d['amount']:,.2f} | Payer: {d['client_identity']} | Status: {d['deal_status']}")

        # 4. Reality Audit Page Data
        audit = await revenue_validation_service.get_reality_audit(session, 1006)
        print("\n4. Reality Audit Completion Rules Checklist:")
        for r in audit['completion_rules_checklist']:
            icon = "[PASS]" if r['verified'] else "[PENDING]"
            print(f"  {icon} Rule {r['rule_number']}: {r['title']} -> {r['status']} (Count: {r['evidence_count']})")
        print(f"All Rules Satisfied: {audit['all_rules_satisfied']}")
        print(f"Mission Status: {audit['mission_status']}")
        print(f"Buyer Terminal Evidence Count: {len(audit['buyer_terminal_evidence'])}")
        
        print("\n[SUCCESS] PHASE 18 REALITY MODE BACKEND TEST PASSED 100%!")

if __name__ == "__main__":
    asyncio.run(main())

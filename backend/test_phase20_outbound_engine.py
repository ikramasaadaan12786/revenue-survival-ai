import asyncio
from app.core.database import AsyncSessionLocal
from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
from app.services.closing_engine.real_acquisition_engine import real_customer_acquisition_engine

async def main():
    async with AsyncSessionLocal() as session:
        print("\n==========================================")
        print("RUNNING PHASE 20 REAL OUTBOUND ACTIVATION TEST")
        print("==========================================")

        # 1. Test Provider Status Check
        print("\n1. Testing Provider Statuses:")
        status_res = await real_provider_dispatch_service.get_provider_statuses()
        print(f"  Status: {status_res['status']}")
        print(f"  Connected Providers: {[p['provider'] for p in status_res['providers']]}")
        assert len(status_res["providers"]) == 3, "Must have 3 active providers!"

        # 2. Test Daily Revenue Operating Cycle Execution
        print("\n2. Testing Daily Revenue Operating Cycle:")
        cycle_res = await real_customer_acquisition_engine.execute_daily_revenue_operating_cycle(
            session=session,
            mission_id=1006
        )
        print(f"  Cycle Status: {cycle_res['status']}")
        print(f"  Sectors Swept: {cycle_res['sectors_swept']}")
        print(f"  Pitches Staged in Safety Gate: {cycle_res['pitches_staged_in_safety_gate']}")
        assert cycle_res["status"] == "success", "Daily operating cycle must succeed!"

        # 3. Test Webhook Ingestion
        print("\n3. Testing Webhook Status Ingestion:")
        webhook_payload = {
            "event_type": "DELIVERY_RECEIPT",
            "provider_message_id": "wamid.NONEXISTENT_TEST_TOKEN",
            "status": "DELIVERED"
        }
        hook_res = await real_provider_dispatch_service.process_incoming_webhook(
            session=session,
            provider="WHATSAPP",
            payload=webhook_payload
        )
        print(f"  Webhook Processing Result: {hook_res['status']}")

        print("\n[SUCCESS] PHASE 20 REAL OUTBOUND ACTIVATION ENGINE BACKEND TESTS PASSED 100%!")

if __name__ == "__main__":
    asyncio.run(main())

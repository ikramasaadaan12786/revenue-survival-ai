import asyncio
import httpx
from app.main import app
from app.core.database import engine, Base

async def test_backend():
    print("1. Initializing DB schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("-> DB Schema initialized.")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver/api/v1") as client:
        # Test Root
        res = await client.get("http://testserver/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print("-> Root GET passed:", res.json()["status"])

        # 1. Create Mission
        m_payload = {
            "title": "Dubai Autonomous Distress Sprint",
            "goal_amount": 50000.0,
            "currency": "AED",
            "deadline_hours": 72,
            "budget": 0.0,
            "industry": "Dubai Prime Real Estate & Digital Advisory"
        }
        res = await client.post("/missions/", json=m_payload)
        assert res.status_code == 200, f"Create mission failed: {res.text}"
        mission = res.json()
        m_id = mission["id"]
        print(f"-> Mission #{m_id} created successfully.")

        # 2. Get Dashboard HUD
        res = await client.get(f"/missions/{m_id}/dashboard")
        assert res.status_code == 200
        dash = res.json()
        print(f"-> Dashboard loaded: target={dash['target_amount']} {dash['mission']['currency']}, status={dash['survival_status']}")

        # 3. Connectors & Data Acquisition
        res = await client.post(f"/connectors/scan-all/{m_id}")
        assert res.status_code == 200
        scan_res = res.json()
        print(f"-> Connectors scan-all passed: {scan_res['total_signals_acquired']} signals acquired across sources.")

        # Ingest custom signal
        custom_sig = {
            "mission_id": m_id,
            "source": "TELEGRAM",
            "signal_text": "VIP Investor with 4M AED liquid looking for distress 2BR in Palm Jumeirah. Immediate cash DM.",
            "lead_name": "Sultan Al-Otaiba",
            "country": "United Arab Emirates",
            "intent_score": "Hot",
            "channel": "WhatsApp"
        }
        res = await client.post("/connectors/ingest", json=custom_sig)
        assert res.status_code == 200
        print("-> Custom signal ingested:", res.json()["signal_id"])

        # Verify signals
        res = await client.get(f"/connectors/signals/{m_id}")
        assert res.status_code == 200
        signals_data = res.json()
        print(f"-> Total verified signals: {signals_data['total_signals']}, Breakdown: {signals_data['breakdown']}")

        # 4. Seller Intelligence
        res = await client.post(f"/seller-intelligence/scan/{m_id}")
        assert res.status_code == 200
        seller_res = res.json()
        print(f"-> Seller distress scan passed: {seller_res['distress_deals_discovered']} deals discovered.")

        # Seller scoring
        res = await client.post("/seller-intelligence/score", json={
            "original_price": 2000000.0,
            "distress_price": 1700000.0,
            "reason": "Facing balloon payment at handover."
        })
        assert res.status_code == 200
        print("-> Seller scoring passed:", res.json()["metrics"])

        # 5. Browser Research Agent
        res = await client.post(f"/missions/{m_id}/browser-research")
        assert res.status_code == 200
        print("-> Browser research passed:", res.json()["summary"])

        # 6. Outreach Automation & Campaigns
        res = await client.post("/outreach-automation/campaign", json={
            "mission_id": m_id,
            "target_intent": "Hot"
        })
        assert res.status_code == 200
        camp_res = res.json()
        print(f"-> Outreach campaign created: {camp_res['total_messages_staged']} messages staged for approval.")

        # Check follow-up pipeline
        res = await client.get(f"/outreach-automation/pipeline/{m_id}")
        assert res.status_code == 200
        pipe_data = res.json()
        print(f"-> Follow-up pipeline tracking: {pipe_data['total_leads_tracked']} leads tracked.")

        # 7. Long Term Memory
        res = await client.get("/long-term-memory/")
        assert res.status_code == 200
        mems = res.json()
        print(f"-> Long Term Memory queried: {len(mems)} historical memories present.")

        # 8. Survival Manager Upgrades
        res = await client.get(f"/missions/{m_id}/progress")
        assert res.status_code == 200
        prog = res.json()
        print(f"-> Progress evaluation: {prog['revenue_progress_pct']}% rev, {prog['time_elapsed_pct']}% time elapsed. Next best action: {prog['next_best_action']}")

        res = await client.get(f"/missions/{m_id}/strategy-decision")
        assert res.status_code == 200
        strat = res.json()
        print(f"-> Daily Strategy Decision: Day {strat['day_number']} - {strat['strategy_theme']}")

        res = await client.get(f"/missions/{m_id}/bottlenecks")
        assert res.status_code == 200
        b_res = res.json()
        print(f"-> Bottleneck diagnostic: Detected={b_res.get('bottleneck_detected')}, Stage={b_res.get('bottleneck_stage')}, Severity={b_res.get('severity')}")

        # Run next autonomous step
        res = await client.post(f"/missions/{m_id}/run-next-step")
        assert res.status_code == 200
        print("-> Run next autonomous step passed:", res.json()["result"])

    print("\nALL BACKEND API TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_backend())

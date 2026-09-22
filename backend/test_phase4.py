import asyncio
import sys
from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_phase4_tests():
    print("================================================================")
    print("STARTING PHASE 4: LIVE ECOSYSTEM INTEGRATION TESTS")
    print("================================================================")

    transport = ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Health check
            resp = await client.get("/")
            assert resp.status_code == 200, f"Root failed: {resp.text}"
            print("[PASS] [API ROOT]: ONLINE")

            # 2. Create Live Mission (e.g. 50,000 AED Commission target in 30 days)
            mission_payload = {
                "title": "Dubai Prime Real Estate 50k Commission Sprint",
                "goal_amount": 50000.0,
                "currency": "AED",
                "deadline_hours": 720,
                "budget": 0.0,
                "industry": "Dubai Distress Property & Private Client Advisory"
            }
            resp = await client.post("/api/v1/missions/", json=mission_payload)
            assert resp.status_code == 200, f"Create mission failed: {resp.text}"
            mission = resp.json()
            mission_id = mission["id"]
            print(f"[PASS] [LIVE MISSION CREATED]: ID={mission_id}, Target={mission['goal_amount']} {mission['currency']}")

            # 3. Live Connectors: Poll Live Connectors (Telegram, Reddit, YouTube, LinkedIn, UAE Buyer Radar)
            resp = await client.post(f"/api/v1/connectors/poll-live/{mission_id}")
            assert resp.status_code == 200, f"Poll live failed: {resp.text}"
            poll_res = resp.json()
            print(f"[PASS] [LIVE CONNECTORS POLLED]: Acquired {poll_res.get('total_signals_acquired')} signals across 5 live channels")

            # 4. Message Templates
            resp = await client.get("/api/v1/communications/templates")
            assert resp.status_code == 200, f"Templates failed: {resp.text}"
            templates_res = resp.json()
            print(f"[PASS] [MESSAGE TEMPLATES]: {len(templates_res.get('templates', []))} compliant templates loaded")

            # 5. Playwright Browser Automation Market Scan
            resp = await client.post(f"/api/v1/browser-automation/scan/{mission_id}")
            assert resp.status_code == 200, f"Playwright scan failed: {resp.text}"
            scan_res = resp.json()
            print(f"[PASS] [PLAYWRIGHT BROWSER WORKER]: Scanned portals, detected {scan_res.get('opportunities_detected')} distress deals")

            # 6. Price Drops Tracking
            resp = await client.get(f"/api/v1/browser-automation/price-drops/{mission_id}")
            assert resp.status_code == 200, f"Price drops failed: {resp.text}"
            drops_res = resp.json()
            print(f"[PASS] [PRICE DROP MONITOR]: Tracked {drops_res.get('price_reductions_tracked')} price reductions")

            # 7. Inbound Webhook Simulator (WhatsApp / Twilio / Email)
            webhook_payload = {
                "sender": "+971509124489",
                "message": "Salam, I saw the Marina Gate distress deal. Can we arrange escrow deposit today?",
                "provider_message_id": "wamid.simulated_test_01"
            }
            resp = await client.post("/api/v1/communications/webhooks/WHATSAPP", json=webhook_payload)
            assert resp.status_code == 200, f"Webhook failed: {resp.text}"
            webhook_res = resp.json()
            print(f"[PASS] [INBOUND WEBHOOK ROUTED]: Matched lead='{webhook_res.get('matched_lead_name')}', AI Sales Analysis generated")

            # 8. Live 30-Day Roadmap Generation
            resp = await client.get(f"/api/v1/missions/{mission_id}/live-roadmap?total_days=30")
            assert resp.status_code == 200, f"Roadmap failed: {resp.text}"
            roadmap_res = resp.json()
            print(f"[PASS] [30-DAY LIVE ROADMAP]: Generated {len(roadmap_res.get('phases', []))} milestone phases")

            # 9. Execute 1-Click Live Autonomous Execution Cycle
            resp = await client.post(f"/api/v1/missions/{mission_id}/live-cycle")
            assert resp.status_code == 200, f"Live cycle failed: {resp.text}"
            cycle_res = resp.json()
            print(f"[PASS] [1-CLICK LIVE AUTONOMOUS CYCLE]: Pipeline={cycle_res.get('pipeline_value_aed'):,.0f} AED, Commission={cycle_res.get('total_commission_potential_aed'):,.0f} AED")

            # 10. Dashboard Summary Telemetry
            resp = await client.get(f"/api/v1/missions/{mission_id}/summary")
            assert resp.status_code == 200, f"Summary failed: {resp.text}"
            summary = resp.json()
            print(f"[PASS] [DASHBOARD TELEMETRY]: Survival Status={summary.get('survival_status')}, Leads={summary.get('leads_count')}, Deals={summary.get('deals_count')}")

    print("================================================================")
    print("ALL PHASE 4 BACKEND INTEGRATION TESTS PASSED PERFECTLY!")
    print("================================================================")

if __name__ == "__main__":
    asyncio.run(run_phase4_tests())

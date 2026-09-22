import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_multi_industry_tests():
    print("========================================================================")
    print("TESTING AUTONOMOUS MULTI-INDUSTRY REVENUE OPERATOR")
    print("========================================================================")

    transport = ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Test 8-Industry Marketplace Catalog
            resp = await client.get("/api/v1/marketplace/industries")
            assert resp.status_code == 200, f"Industries failed: {resp.text}"
            data = resp.json()
            industries = data.get("industries", [])
            print(f"[PASS] [MARKETPLACE CATALOG]: {len(industries)} industries registered: {', '.join(industries)}")
            assert len(industries) == 8, f"Expected 8 industries, got {len(industries)}"

            # 2. Test Services Listing
            resp = await client.get("/api/v1/marketplace/services")
            assert resp.status_code == 200, f"Services failed: {resp.text}"
            services_data = resp.json()
            print(f"[PASS] [SERVICE OFFERINGS]: {services_data.get('total_services')} standard service packages loaded across all niches.")

            # 3. Test Revenue Strategy Brain Evaluation (Goal: AED 5,000 in 72h, Budget: 0 AED)
            eval_payload = {
                "target_amount": 5000.0,
                "deadline_hours": 72,
                "budget": 0.0,
                "currency": "AED"
            }
            resp = await client.post("/api/v1/strategy-brain/evaluate", json=eval_payload)
            assert resp.status_code == 200, f"Evaluate failed: {resp.text}"
            eval_res = resp.json()
            print(f"[PASS] [STRATEGY BRAIN EVALUATION]:")
            print(f"       -> Target: 5,000 AED | Deadline: 72h | Budget: 0 AED")
            print(f"       -> Goal Tier: {eval_res.get('goal_tier')}")
            print(f"       -> Recommended Primary Industry: {eval_res.get('primary_industry')}")
            print(f"       -> Recommended Service: {eval_res['primary_service']['service_name']}")
            print(f"       -> Required Clients: {eval_res['primary_service']['required_clients']} Client(s)")
            print(f"       -> 50% Immediate Upfront Cash: {eval_res['primary_service']['immediate_cash_collected_aed']} AED")
            print(f"       -> Feasibility / Conviction: {eval_res.get('confidence_score')}%")

            # 4. Test One-Click Auto Mission Creation from Brain
            auto_mission_payload = {
                "title": "Autonomous 5k Revenue Operator Sprint",
                "target_amount": 5000.0,
                "deadline_hours": 72,
                "budget": 0.0,
                "currency": "AED"
            }
            resp = await client.post("/api/v1/strategy-brain/auto-create-mission", json=auto_mission_payload)
            assert resp.status_code == 200, f"Auto-create mission failed: {resp.text}"
            mission_res = resp.json()
            mission_id = mission_res["mission_id"]
            print(f"[PASS] [AUTO-CREATED MISSION]: ID={mission_id} | Industry='{mission_res.get('industry')}' | AI Strategy='{mission_res.get('ai_strategy')[:70]}...'")

            # 5. Test Multi-Industry Opportunity Hunter (Mining buying intent across Reddit, LinkedIn, Telegram, YouTube)
            resp = await client.post(f"/api/v1/marketplace/hunt-signals/{mission_id}", json={"industry": "ALL"})
            assert resp.status_code == 200, f"Hunter failed: {resp.text}"
            hunt_res = resp.json()
            print(f"[PASS] [MULTI-INDUSTRY HUNTER]: Ingested {hunt_res.get('signals_ingested')} buying signals and created {hunt_res.get('leads_created')} CRM leads across 8 industries.")

            # 6. Test Autonomous Strategy Pivot (e.g. pivoting to fastest backup industry)
            resp = await client.post(f"/api/v1/strategy-brain/pivot/{mission_id}")
            assert resp.status_code == 200, f"Pivot failed: {resp.text}"
            pivot_res = resp.json()
            print(f"[PASS] [AUTONOMOUS STRATEGY PIVOT]: Pivoted from '{pivot_res.get('previous_industry')}' to '{pivot_res.get('new_industry')}'. Ingested {pivot_res.get('signals_ingested')} fresh leads.")

            # 7. Test Dashboard Summary Telemetry
            resp = await client.get(f"/api/v1/missions/{mission_id}/summary")
            assert resp.status_code == 200, f"Summary failed: {resp.text}"
            summary = resp.json()
            print(f"[PASS] [MISSION TELEMETRY]: Leads={summary.get('leads_count')}, Deals={summary.get('deals_count')}, Status={summary.get('survival_status')}")

    print("========================================================================")
    print("ALL MULTI-INDUSTRY OPERATOR TESTS PASSED PERFECTLY!")
    print("========================================================================")

if __name__ == "__main__":
    asyncio.run(run_multi_industry_tests())

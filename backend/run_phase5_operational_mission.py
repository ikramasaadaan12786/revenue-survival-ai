import asyncio
import json
from httpx import AsyncClient, ASGITransport
from app.main import app

async def run_live_mission_workflow():
    transport = ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            print("======================================================================")
            print("PHASE 5: OPERATIONAL TESTING — FIRST LIVE MISSION WORKFLOW")
            print("======================================================================")

            # 1. Create Live Mission Workflow
            # Mission Parameters:
            # - Goal: Generate Dubai real estate buyer and seller opportunities
            # - Target: 50 qualified opportunities
            # - Duration: 72 hours
            # - Budget: 0 AED
            mission_payload = {
                "title": "Dubai Real Estate Buyer & Seller Opportunity Generation Sprint",
                "goal_amount": 50.0,  # 50 Qualified Opportunities target
                "currency": "OPPS",
                "deadline_hours": 72,
                "budget": 0.0,
                "industry": "Dubai Prime Real Estate & Off-Market Distressed Assets"
            }
            
            resp = await client.post("/api/v1/missions/", json=mission_payload)
            if resp.status_code != 200:
                print(f"Error creating mission: {resp.text}")
                return
            mission = resp.json()
            mission_id = mission["id"]
            print(f"[MISSION INITIALIZED]: ID={mission_id} | Title='{mission['title']}' | Duration=72h | Budget=0 AED")

            # 2. Run Multi-Source Connector Pipeline (Buyer Radar, Telegram, Reddit, YouTube, LinkedIn)
            print("\n>>> [1/5] RUNNING LIVE CONNECTOR PIPELINE...")
            poll_resp = await client.post(f"/api/v1/connectors/poll-live/{mission_id}")
            poll_data = poll_resp.json()
            print(f"-> Signals Acquired: {poll_data.get('total_signals_acquired')} signals across 5 live connectors.")
            print(f"-> Breakdown: {json.dumps(poll_data.get('breakdown', {}), indent=2)}")

            # Also run standard multi-connector sweep
            scan_all_resp = await client.post(f"/api/v1/connectors/scan-all/{mission_id}")
            scan_all_data = scan_all_resp.json()
            print(f"-> Additional Multi-Source Signals Ingested: {scan_all_data.get('total_signals_acquired')} signals.")

            # 3. Run Browser Automation & Market Research
            print("\n>>> [2/5] EXECUTING BROWSER AUTOMATION & MARKET RESEARCH...")
            browser_scan_resp = await client.post(f"/api/v1/browser-automation/scan/{mission_id}")
            browser_scan_data = browser_scan_resp.json()
            print(f"-> Portals Monitored: {browser_scan_data.get('portals_scanned')} (PropertyFinder, Bayut, Dubizzle)")
            print(f"-> Distress Deals Captured: {browser_scan_data.get('opportunities_detected')}")

            # 4. Run Seller Intelligence & Opportunity Scoring
            print("\n>>> [3/5] RUNNING SELLER INTELLIGENCE ENGINE...")
            seller_resp = await client.get(f"/api/v1/seller-intelligence/listings/{mission_id}")
            seller_listings = seller_resp.json()
            print(f"-> Active Distress Seller Listings Scored: {len(seller_listings)}")
            for sl in seller_listings:
                print(f"   * [{sl.get('motivation_tier')}] {sl.get('project_name')} ({sl.get('location')}): {sl.get('distress_price'):,.0f} AED (Discount: {sl.get('discount_pct')}%, Urgency: {sl.get('urgency_score')}/100, Commission: {sl.get('commission_potential', sl.get('distress_price', 0)*0.02):,.0f} AED)")

            # 5. Run Buyer Signal Processing & Qualified Lead Ingestion
            print("\n>>> [4/5] PROCESSING BUYER SIGNALS & QUALIFYING LEADS...")
            leads_resp = await client.get(f"/api/v1/leads/mission/{mission_id}")
            leads = leads_resp.json()
            qualified_leads = [l for l in leads if l.get("intent_score") in ["Hot", "Qualified"]]
            print(f"-> Total CRM Leads Ingested: {len(leads)}")
            print(f"-> High-Intent / Qualified Leads: {len(qualified_leads)}")
            for ql in qualified_leads[:5]:
                print(f"   * [{ql.get('intent_score')}] {ql.get('name')} ({ql.get('country')} via {ql.get('channel')}): {ql.get('interest')} [Exp Value: {ql.get('expected_value')} AED, Comm: {ql.get('commission_potential'):,.0f} AED]")

            # 6. Generate 3-Step Outreach Queue & Stage in Safety Approval Queue
            print("\n>>> [5/5] GENERATING MULTI-CHANNEL OUTREACH SEQUENCES...")
            campaign_resp = await client.post(f"/api/v1/outreach-automation/campaign", json={
                "mission_id": mission_id,
                "target_intent": "Hot",
                "custom_pitch_angle": "Direct Developer Escrow Allocation with 9%+ Net Yield"
            })
            campaign_data = campaign_resp.json()
            print(f"-> Campaign Generated for {campaign_data.get('leads_processed')} Hot Leads.")
            print(f"-> Total Sequence Steps Created: {campaign_data.get('total_messages_created')} (Staged for Human-In-The-Loop Approval)")

            # Check Approval Queue
            approvals_resp = await client.get(f"/api/v1/communications/approvals/{mission_id}")
            approvals = approvals_resp.json()
            print(f"-> Pending Safety Approvals: {len(approvals)} messages waiting in queue.")

            # 7. Evaluate Mission Performance & Next Recommended Actions
            print("\n>>> EVALUATING MISSION PERFORMANCE & NEXT BEST ACTIONS...")
            summary_resp = await client.get(f"/api/v1/missions/{mission_id}/summary")
            summary = summary_resp.json()

            progress_resp = await client.get(f"/api/v1/missions/{mission_id}/progress")
            progress = progress_resp.json()

            strategy_resp = await client.get(f"/api/v1/missions/{mission_id}/strategy-decision")
            strategy = strategy_resp.json()

            # Print Final Comprehensive Telemetry
            print("\n======================================================================")
            print("MISSION PERFORMANCE SUMMARY REPORT")
            print("======================================================================")
            print(f"Mission ID:                {mission_id}")
            print(f"Title:                     {mission['title']}")
            print(f"Status:                    {summary.get('survival_status')}")
            print(f"Time Remaining:            {summary.get('hours_remaining')} hours")
            print(f"Budget Spent:              {summary.get('budget_spent')} AED (Zero Ad Spend Compliant)")
            print(f"Confidence Score:          {summary.get('confidence_score')}%")
            print(f"Signals Acquired:          {poll_data.get('total_signals_acquired', 0) + scan_all_data.get('total_signals_acquired', 0)}")
            print(f"Total Leads Ingested:      {summary.get('leads_count')}")
            print(f"Qualified Opportunities:   {len(qualified_leads) + len(seller_listings)}")
            print(f"Seller Distress Deals:     {len(seller_listings)}")
            print(f"Total Commission Pipeline: {summary.get('total_commission_potential'):,.0f} AED")
            print(f"Staged Outreach Messages:  {len(approvals)}")
            print(f"Next Best Action:          {summary.get('next_best_action')}")
            print("======================================================================")

if __name__ == "__main__":
    asyncio.run(run_live_mission_workflow())

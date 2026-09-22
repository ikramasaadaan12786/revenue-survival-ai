import asyncio
import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_api():
    print("[Test] Starting Phase 2 Backend Verification...")

    # 1. Mission Dashboard
    req = urllib.request.urlopen(f"{BASE_URL}/missions/1/dashboard")
    dash = json.loads(req.read().decode())
    assert dash["survival_status"] in ["ACTIVE", "PIVOTING", "COMPLETED"], "Invalid survival status"
    assert "crm_funnel_counts" in dash, "Missing crm_funnel_counts in dashboard"
    assert dash["total_commission_potential"] >= 0, "Missing total_commission_potential"
    print(f"[OK] Dashboard API Verified: Goal {dash['target_amount']} AED | Achieved {dash['revenue_achieved']} AED | Commission Potential {dash['total_commission_potential']} AED")

    # 2. Leads & 8-Stage CRM
    req = urllib.request.urlopen(f"{BASE_URL}/leads/mission/1")
    leads = json.loads(req.read().decode())
    assert len(leads) > 0, "No leads found"
    print(f"[OK] Leads API Verified: {len(leads)} leads active in 8-stage CRM")

    # 3. Real Estate Deals
    req = urllib.request.urlopen(f"{BASE_URL}/real-estate/deals/1")
    deals = json.loads(req.read().decode())
    assert len(deals) > 0, "No real estate deals found"
    print(f"[OK] Real Estate Deals API Verified: {len(deals)} distress inventory items loaded")

    # 4. AI Matchmaker
    match_data = json.dumps({"mission_id": 1}).encode()
    req = urllib.request.Request(f"{BASE_URL}/real-estate/matchmaker", data=match_data, headers={"Content-Type": "application/json"})
    match_res = json.loads(urllib.request.urlopen(req).read().decode())
    assert "buyer_name" in match_res, "Matchmaker failed to return buyer"
    print(f"[OK] AI Investor Matchmaker Verified: Matched {match_res.get('buyer_name')} with {match_res.get('matched_deal')} (Score: {match_res.get('match_score')}%)")

    # 5. Daily Autonomous Scheduler
    cycle_data = json.dumps({}).encode()
    req = urllib.request.Request(f"{BASE_URL}/scheduler/run-cycle/1", data=cycle_data, headers={"Content-Type": "application/json"})
    cycle_res = json.loads(urllib.request.urlopen(req).read().decode())
    assert cycle_res["status"] == "success", "Daily scheduler cycle failed"
    print(f"[OK] Daily Autonomous Scheduler Verified: All 4 phases completed successfully for Day {cycle_res.get('current_day')}")

    print("\n[SUCCESS] ALL PHASE 2 BACKEND TESTS PASSED!")

if __name__ == "__main__":
    test_api()

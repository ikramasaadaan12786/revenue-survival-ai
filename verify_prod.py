import urllib.request
import json

BASE = "https://backend-sigma-six-79.vercel.app/api/v1"

def post(endpoint, data=None):
    payload = json.dumps(data).encode() if data else b""
    req = urllib.request.Request(f"{BASE}{endpoint}", data=payload, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def get(endpoint):
    req = urllib.request.Request(f"{BASE}{endpoint}", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode())

def main():
    print("=== TESTING LIVE PRODUCTION BACKEND ON VERCEL ===")
    
    # 1. Create Mission 1: AI Agent Sales Sprint
    m1 = post("/missions/", {
        "title": "AI Agent Sales Sprint",
        "goal_amount": 10000,
        "currency": "AED",
        "deadline_hours": 72,
        "budget": 0,
        "industry": "AI Agents & Automation",
        "industries": ["AI Agents & Automation"]
    })
    print(f"Created Mission #1: ID {m1['id']} - '{m1['title']}'")

    # 2. Create Mission 2: Software Client Acquisition
    m2 = post("/missions/", {
        "title": "Software Client Acquisition",
        "goal_amount": 25000,
        "currency": "AED",
        "deadline_hours": 72,
        "budget": 0,
        "industry": "Custom Software Development, SaaS Products (+2 more)",
        "industries": ["Custom Software Development", "SaaS Products", "Website Development", "Mobile Applications"]
    })
    print(f"Created Mission #2: ID {m2['id']} - '{m2['title']}'")

    # 3. Create Mission 3: Dubai Investor Acquisition
    m3 = post("/missions/", {
        "title": "Dubai Investor Acquisition",
        "goal_amount": 50000,
        "currency": "AED",
        "deadline_hours": 72,
        "budget": 0,
        "industry": "Dubai Real Estate & Advisory",
        "industries": ["Dubai Real Estate & Advisory"]
    })
    print(f"Created Mission #3: ID {m3['id']} - '{m3['title']}'")

    # 4. Run autonomous step on all 3
    print("\n--- Triggering Autonomous Step across all 3 missions in Production ---")
    for m in [m1, m2, m3]:
        step_res = post(f"/missions/{m['id']}/run-next-step")
        print(f"Mission #{m['id']} Autonomous Step Status: {step_res.get('status')}")

    # 5. Fetch Global Overview
    print("\n--- Fetching Global Overview from Production ---")
    overview = get("/missions/global/overview")
    print("Total Active Missions:", overview["total_active_missions"])
    print("Total Opportunities:", overview["total_opportunities"])
    print("Hot Opportunities:", overview["hot_opportunities"])
    print("Total Pipeline Value:", f"{overview['total_pipeline_value']:,.2f} AED")
    print("Source Breakdown:", overview["source_breakdown"])

    print("\n=== PRODUCTION LIVE VERIFICATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    main()

import asyncio
import json
import glob
from app.core.database import AsyncSessionLocal
from app.models.entities import Mission, Task, Lead, Opportunity, Communication, Proposal, RevenueTracking
from sqlalchemy import select

async def inspect():
    print("=== INSPECTING BACKUPS ===")
    for bf in glob.glob("backups/*.json"):
        try:
            with open(bf, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and "missions" in data:
                    print(f"\n--- FILE: {bf} (Missions: {len(data['missions'])}) ---")
                    for m in data["missions"]:
                        print(f"ID: {m.get('id')} | Goal: {m.get('goal_amount')} | Hours: {m.get('deadline_hours')} | Title: {m.get('title')} | Status: {m.get('status')} | Created: {m.get('created_at')}")
        except Exception as e:
            print(f"Error reading {bf}: {e}")

    print("\n=== INSPECTING CURRENT NEON DATABASE ===")
    async with AsyncSessionLocal() as session:
        res = await session.execute(select(Mission).order_by(Mission.id.asc()))
        missions = res.scalars().all()
        print(f"Total Missions in Neon: {len(missions)}")
        for m in missions:
            print(f"ID: {m.id} | Goal: {m.goal_amount} | Hours: {m.deadline_hours} | Status: {m.status} | Title: {m.title} | Created: {m.created_at} | Expires: {m.expires_at}")

if __name__ == "__main__":
    asyncio.run(inspect())

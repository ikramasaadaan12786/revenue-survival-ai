import asyncio
import datetime
from app.core.database import AsyncSessionLocal
from app.models.entities import Mission
from sqlalchemy import select, update

async def restore_mission_1006():
    async with AsyncSessionLocal() as session:
        # 1. Fetch Mission 1006
        m = await session.get(Mission, 1006)
        if not m:
            print("[ERROR] Mission 1006 not found in Neon database!")
            return False
            
        print(f"Found Mission 1006 before restore: Status={m.status}, Created={m.created_at}, Goal={m.goal_amount}")
        
        # 2. Restore status to ACTIVE
        m.status = "ACTIVE"
        
        # 3. Ensure Mission 1 is marked as COMPLETED or ARCHIVED_SEED so only genuine user missions are active
        # Let's check Mission 1 status: Mission 1 is the 50k seed sprint. Let's set it to ARCHIVED or COMPLETED
        m1 = await session.get(Mission, 1)
        if m1:
            m1.status = "ARCHIVED"  # Phase 1 seed sprint archived to give 100% priority to genuine user mission 1006
            print("Mission 1 (50k seed) marked as ARCHIVED.")
            
        await session.commit()
        print(f"[SUCCESS] Mission 1006 successfully restored to ACTIVE! Title='{m.title}', Goal=AED {m.goal_amount}, Duration={m.deadline_hours}h")
        return True

if __name__ == "__main__":
    asyncio.run(restore_mission_1006())

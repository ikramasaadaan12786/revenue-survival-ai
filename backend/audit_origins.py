import asyncio
from app.core.database import AsyncSessionLocal
from app.models.entities import Mission, OperatorActionLog, User
from sqlalchemy import select

async def audit_all_origins():
    async with AsyncSessionLocal() as session:
        m_res = await session.execute(select(Mission).order_by(Mission.id.asc()))
        missions = m_res.scalars().all()
        print("=== ALL 28 MISSIONS AUDIT ===")
        for m in missions:
            # Check if user associated
            user_res = await session.get(User, m.user_id) if m.user_id else None
            user_name = user_res.name if user_res else "None"
            
            # Check action logs
            l_res = await session.execute(
                select(OperatorActionLog).where(OperatorActionLog.mission_id == m.id, OperatorActionLog.action_type == "CREATE_MISSION")
            )
            create_log = l_res.scalars().first()
            log_title = create_log.title if create_log else "No CREATE_MISSION log"
            
            print(f"Mission ID: {m.id:<5} | Goal: {m.goal_amount:<7} | Hrs: {m.deadline_hours:<3} | User: {user_name:<10} | Created: {m.created_at} | Status: {m.status:<10} | Title: {m.title}")

if __name__ == "__main__":
    asyncio.run(audit_all_origins())

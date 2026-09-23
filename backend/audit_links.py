import asyncio
from app.core.database import AsyncSessionLocal
from app.models.entities import Mission, Task, Lead, Opportunity, Communication, Proposal, Offer, RevenueTracking, OperatorActionLog
from sqlalchemy import select, func

async def audit_mission_records():
    async with AsyncSessionLocal() as session:
        # Check all missions
        m_res = await session.execute(select(Mission).order_by(Mission.id.asc()))
        missions = m_res.scalars().all()
        
        print(f"{'ID':<6} | {'Goal':<8} | {'Hours':<6} | {'Status':<10} | {'Tasks':<6} | {'Leads':<6} | {'Opps':<6} | {'Comms':<6} | {'Props':<6} | {'Offers':<6} | {'Title'}")
        print("-" * 110)
        
        for m in missions:
            # tasks
            t_res = await session.execute(select(func.count(Task.id)).where(Task.mission_id == m.id))
            tasks_count = t_res.scalar() or 0
            
            # leads
            l_res = await session.execute(select(func.count(Lead.id)).where(Lead.mission_id == m.id))
            leads_count = l_res.scalar() or 0
            
            # opps
            o_res = await session.execute(select(func.count(Opportunity.id)).where(Opportunity.mission_id == m.id))
            opps_count = o_res.scalar() or 0
            
            # comms
            c_res = await session.execute(select(func.count(Communication.id)).where(Communication.mission_id == m.id))
            comms_count = c_res.scalar() or 0
            
            # props
            p_res = await session.execute(select(func.count(Proposal.id)).where(Proposal.mission_id == m.id))
            props_count = p_res.scalar() or 0
            
            # offers
            off_res = await session.execute(select(func.count(Offer.id)).where(Offer.mission_id == m.id))
            offers_count = off_res.scalar() or 0
            
            print(f"{m.id:<6} | {m.goal_amount:<8} | {m.deadline_hours:<6} | {m.status:<10} | {tasks_count:<6} | {leads_count:<6} | {opps_count:<6} | {comms_count:<6} | {props_count:<6} | {offers_count:<6} | {m.title}")

if __name__ == "__main__":
    asyncio.run(audit_mission_records())

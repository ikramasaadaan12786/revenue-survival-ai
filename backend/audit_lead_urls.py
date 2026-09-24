import asyncio
import json
import urllib.request
from app.core.database import AsyncSessionLocal
from app.models.entities import Lead, Mission
from sqlalchemy import select

async def audit_leads():
    async with AsyncSessionLocal() as session:
        # Check active mission (1006) and Mission 1
        for m_id in [1006, 1]:
            res = await session.execute(select(Lead).where(Lead.mission_id == m_id).order_by(Lead.id.asc()))
            leads = res.scalars().all()
            print(f"\n==================== MISSION {m_id} LEADS (Total: {len(leads)}) ====================")
            for l in leads:
                print(f"Lead ID: {l.id:<4} | Name: {l.name:<25} | Company: {l.company_name or 'None':<25} | Platform: {l.source_platform:<12} | Stage: {l.pipeline_stage:<14} | SourceURL: {l.source_url} | Contact: {l.contact_info}")

if __name__ == '__main__':
    asyncio.run(audit_leads())

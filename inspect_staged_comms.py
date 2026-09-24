import asyncio
import sys
import os

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.database import AsyncSessionLocal
from app.models.entities import Lead, Communication
from sqlalchemy import select

async def inspect():
    async with AsyncSessionLocal() as session:
        comms = (await session.execute(select(Communication).where(Communication.mission_id == 1013))).scalars().all()
        print(f"Total Staged Comms for Mission #1013: {len(comms)}")
        for c in comms[:3]:
            lead = await session.get(Lead, c.lead_id)
            print("=" * 80)
            print(f"Comm #{c.id} | Lead #{lead.id if lead else 'N/A'}: {lead.name if lead else ''} at {lead.company_name if lead else ''}")
            print(f"Recipient: {c.recipient}")
            print(f"Subject: {c.subject}")
            print(f"Body:\n{c.body}")

if __name__ == "__main__":
    asyncio.run(inspect())

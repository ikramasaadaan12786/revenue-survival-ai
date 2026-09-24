import asyncio
import os
import sys
from sqlalchemy import select, delete, text
from dotenv import load_dotenv

# Ensure backend root is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.database import AsyncSessionLocal
from app.models.entities import Lead, Communication, RevenueOpportunity, MarketSignal, Mission

async def clean_duplicates():
    print("=== QUARANTINE & REMOVAL OF DUPLICATE MISSION #1013 RECORDS ===")
    async with AsyncSessionLocal() as session:
        # 1. Verify historical leads 435-461 exist and are preserved
        hist_stmt = select(Lead).where(Lead.id.between(435, 461))
        hist_leads = (await session.execute(hist_stmt)).scalars().all()
        print(f"Preserving Canonical Historical Leads (IDs 435-461): {len(hist_leads)} records intact.")
        assert len(hist_leads) == 27, f"Expected 27 historical leads, found {len(hist_leads)}"

        # 2. Delete Mission 1013 Communications (IDs 716-742)
        del_comms = await session.execute(
            delete(Communication).where(Communication.mission_id == 1013)
        )
        print(f"Deleted Mission #1013 Communications: {del_comms.rowcount} rows removed.")

        # 3. Delete Mission 1013 Revenue Opportunities
        del_opps = await session.execute(
            delete(RevenueOpportunity).where(RevenueOpportunity.mission_id == 1013)
        )
        print(f"Deleted Mission #1013 Opportunities: {del_opps.rowcount} rows removed.")

        # 4. Delete Mission 1013 Market Signals
        del_sigs = await session.execute(
            delete(MarketSignal).where(MarketSignal.mission_id == 1013)
        )
        print(f"Deleted Mission #1013 Market Signals: {del_sigs.rowcount} rows removed.")

        # 5. Delete Mission 1013 Duplicate Leads (IDs 463-489)
        del_leads = await session.execute(
            delete(Lead).where(Lead.mission_id == 1013)
        )
        print(f"Deleted Mission #1013 Duplicate Leads (IDs 463-489): {del_leads.rowcount} rows removed.")

        # 6. Reset Mission #1013 counters
        m = await session.get(Mission, 1013)
        if m:
            m.pipeline_value = 0.0
            m.revenue_generated = 0.0
            m.total_commission_potential = 0.0
            print(f"Reset Mission #1013 metrics: pipeline_value=0.0, revenue_generated=0.0")

        await session.commit()
        print("=== CLEANUP COMMITTED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(clean_duplicates())

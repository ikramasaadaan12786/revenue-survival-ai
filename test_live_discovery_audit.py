import asyncio
import os
import sys
import datetime
from sqlalchemy import select
from dotenv import load_dotenv

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.core.database import AsyncSessionLocal
from app.models.entities import Lead, Communication, RevenueOpportunity, MarketSignal, Mission
from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge, get_global_crm_registry
from app.cli.autonomous_runner import run_buyer_discovery
from app.services.intelligence.daily_excel_service import daily_excel_service

async def run_audit():
    t0 = datetime.datetime.utcnow()
    t0_str = t0.strftime("%Y-%m-%d %H:%M:%S UTC")
    print(f"=== POST-FIX LIVE DISCOVERY TEST (T0: {t0_str}) ===")

    async with AsyncSessionLocal() as session:
        # 1. Capture existing canonical fingerprints
        registry = await get_global_crm_registry(session)
        print(f"[*] Canonical CRM Leads Indexed: {len(registry['lead_details'])} leads across database.")
        print(f"    Unique Emails: {len(registry['emails'])}")
        print(f"    Unique Phones: {len(registry['phones'])}")
        print(f"    Unique URLs:   {len(registry['urls'])}")
        print(f"    Unique Names:  {len(registry['names'])}")

        # 2. Run Live Buyer Discovery for Mission #1013
        print("\n[*] Executing Production Buyer Discovery Cycle for Mission #1013...")
        discovery_telemetry = await run_buyer_discovery(session, mission_id=1013)
        print("[+] Discovery Run Finished:")
        for k, v in discovery_telemetry.items():
            if k != "freshness_indicators":
                print(f"    {k}: {v}")

        # 3. Check DB state for Mission 1013
        m1013_leads = (await session.execute(select(Lead).where(Lead.mission_id == 1013))).scalars().all()
        m1013_opps = (await session.execute(select(RevenueOpportunity).where(RevenueOpportunity.mission_id == 1013))).scalars().all()
        m1013_comms = (await session.execute(select(Communication).where(Communication.mission_id == 1013))).scalars().all()
        
        print(f"\n[+] MISSION #1013 VERIFIED DB STATE:")
        print(f"    Mission #1013 New Real Leads Created: {len(m1013_leads)}")
        print(f"    Mission #1013 Opportunities Created: {len(m1013_opps)}")
        print(f"    Mission #1013 Communications Staged: {len(m1013_comms)}")

        # 4. Regenerate Clean Excel Workbook
        print("\n[*] Regenerating Clean Excel Workbook for Mission #1013...")
        buf, filename, summary = await daily_excel_service.build_daily_workbook(session, mission_id=1013)
        excel_path = os.path.join(backend_path, filename)
        with open(excel_path, "wb") as f:
            f.write(buf.getvalue())
        print(f"[+] Saved Excel to: {excel_path}")
        print(f"    Total Leads in Excel: {summary.get('total_leads', 0)}")
        print(f"    Pipeline Value: AED {summary.get('pipeline_value_aed', 0.0):,.2f}")

    print("\n=== AUDIT RUN COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_audit())

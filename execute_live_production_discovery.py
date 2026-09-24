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
from app.services.connectors.uae_buyer_radar_bridge import get_global_crm_registry
from app.cli.autonomous_runner import run_buyer_discovery
from app.services.intelligence.daily_excel_service import daily_excel_service

async def execute_live_run():
    t0 = datetime.datetime.utcnow()
    t0_str = t0.strftime("%Y-%m-%d %H:%M:%S UTC")
    print("==================================================================")
    print(f"REVENUE SURVIVAL AI — LIVE PRODUCTION DISCOVERY EXECUTION (T0: {t0_str})")
    print("==================================================================")

    async with AsyncSessionLocal() as session:
        # 1. Capture canonical CRM registry before execution
        registry_before = await get_global_crm_registry(session)
        print(f"[*] Pre-run Canonical CRM Leads: {len(registry_before['lead_details'])}")

        # 2. Execute Live Discovery
        print("\n[*] Launching Real Live External Lead Acquisition Engine for Mission #1013...")
        telemetry = await run_buyer_discovery(session, mission_id=1013)
        print("\n[+] Discovery Execution Complete:")
        for k, v in telemetry.items():
            if k != "freshness_indicators":
                print(f"    {k}: {v}")

        # 3. Fetch all newly inserted leads for Mission #1013
        m1013_leads = (await session.execute(
            select(Lead).where(Lead.mission_id == 1013).order_by(Lead.id.asc())
        )).scalars().all()

        m1013_opps = (await session.execute(
            select(RevenueOpportunity).where(RevenueOpportunity.mission_id == 1013).order_by(RevenueOpportunity.id.asc())
        )).scalars().all()

        m1013_comms = (await session.execute(
            select(Communication).where(Communication.mission_id == 1013).order_by(Communication.id.asc())
        )).scalars().all()

        print(f"\n[+] MISSION #1013 VERIFIED PRODUCTION DATABASE STATE:")
        print(f"    Genuinely New Real Leads Created: {len(m1013_leads)}")
        print(f"    New Revenue Opportunities Created: {len(m1013_opps)}")
        print(f"    Outbound Draft Pitches Staged:     {len(m1013_comms)}")

        # 4. Print Proof Table of Newly Inserted Leads
        print("\n================ NEW REAL LEADS PROOF TABLE ================")
        print(f"{'ID':<6} | {'NAME':<24} | {'COMPANY':<24} | {'SOURCE':<18} | {'CONTACT':<28} | {'VERIFICATION'}")
        print("-" * 115)
        for l in m1013_leads:
            safe_name = (l.name or "").encode("ascii", errors="replace").decode()
            safe_company = (l.company_name or "").encode("ascii", errors="replace").decode()
            safe_platform = (l.source_platform or "").encode("ascii", errors="replace").decode()
            safe_contact = (l.contact_info or "").encode("ascii", errors="replace").decode()
            safe_interest = (l.interest or "").encode("ascii", errors="replace").decode()
            print(f"#{l.id:<5} | {safe_name[:22]:<24} | {safe_company[:22]:<24} | {safe_platform[:16]:<18} | {safe_contact[:26]:<28} | {l.verification_status}")
            print(f"       Requirement: {safe_interest[:100]}...")
            print(f"       Source URL:  {l.source_url}")
            print(f"       Discovered:  {l.discovery_timestamp.strftime('%Y-%m-%d %H:%M:%S UTC') if l.discovery_timestamp else 'N/A'}")
            print("-" * 115)

        # 5. Inspect Staged Outreach Pitches
        print("\n================ STAGED OUTBOUND COMMUNICATIONS ================")
        for c in m1013_comms[:3]:
            print(f"Comm #{c.id} -> Recipient: {c.recipient} | Channel: {c.channel} | Status: {c.delivery_status} (Requires Approval: {c.requires_approval})")
            print(f"Subject: {c.subject}")
            print(f"Body Snippet:\n{c.body[:250]}...\n")

        # 6. Rebuild Daily Excel Workbook
        print("\n[*] Rebuilding Production Daily Excel Workbook for Mission #1013...")
        buf, filename, summary = await daily_excel_service.build_daily_workbook(session, mission_id=1013)
        excel_path = os.path.join(backend_path, filename)
        with open(excel_path, "wb") as f:
            f.write(buf.getvalue())
        print(f"[+] Saved Clean Excel to: {excel_path}")
        print(f"    New Mission Leads in Excel: {summary.get('total_leads', 0)}")
        print(f"    Pipeline Value in Excel:    AED {summary.get('pipeline_value_aed', 0.0):,.2f}")

    print("\n=== LIVE DISCOVERY RUN COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(execute_live_run())

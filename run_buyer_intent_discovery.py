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
from app.models.entities import Lead, Communication, RevenueOpportunity, Proposal, Mission
from app.services.connectors.uae_buyer_radar_bridge import get_global_crm_registry
from app.cli.autonomous_runner import run_buyer_discovery
from app.services.intelligence.daily_excel_service import daily_excel_service

async def run_live_test():
    t1 = datetime.datetime.utcnow()
    t1_str = t1.strftime("%Y-%m-%d %H:%M:%S UTC")
    print("==================================================================")
    print(f"REVENUE SURVIVAL AI — NEW BUYER-INTENT DISCOVERY RUN (T1: {t1_str})")
    print("==================================================================")

    async with AsyncSessionLocal() as session:
        # 1. Capture snapshot before run
        registry_before = await get_global_crm_registry(session)
        print(f"[*] Pre-run Canonical CRM Leads Indexed: {len(registry_before['lead_details'])}")

        # 2. Run Live Buyer-Intent Discovery
        print("\n[*] Executing Live Discovery with Strict Buyer-Intent Gate...")
        telemetry = await run_buyer_discovery(session, mission_id=1013)
        print("\n[+] Discovery Execution Output:")
        for k, v in telemetry.items():
            if k != "freshness_indicators":
                print(f"    {k}: {v}")

        # 3. Check DB state for Mission #1013
        m1013_sales_leads = (await session.execute(
            select(Lead).where(
                Lead.mission_id == 1013,
                Lead.pipeline_stage == "VERIFIED_SALES_LEAD"
            )
        )).scalars().all()

        m1013_research_leads = (await session.execute(
            select(Lead).where(
                Lead.mission_id == 1013,
                Lead.pipeline_stage != "VERIFIED_SALES_LEAD"
            )
        )).scalars().all()

        m1013_opps = (await session.execute(
            select(RevenueOpportunity).where(RevenueOpportunity.mission_id == 1013)
        )).scalars().all()

        m1013_approved_comms = (await session.execute(
            select(Communication).where(
                Communication.mission_id == 1013,
                Communication.approval_status != "REJECTED_AUDIT_JOB_VACANCY"
            )
        )).scalars().all()

        m1013_rejected_comms = (await session.execute(
            select(Communication).where(
                Communication.mission_id == 1013,
                Communication.approval_status == "REJECTED_AUDIT_JOB_VACANCY"
            )
        )).scalars().all()

        m = await session.get(Mission, 1013)

        print(f"\n[+] MISSION #1013 VERIFIED STATE:")
        print(f"    Real Sales Leads Qualified (Explicit Buyer Intent): {len(m1013_sales_leads)}")
        print(f"    Research / Job Signals Segregated:                 {len(m1013_research_leads)}")
        print(f"    Evidence-Backed Opportunities:                      {len(m1013_opps)}")
        print(f"    Evidence-Backed Pipeline Value:                     AED {m.pipeline_value if m else 0.0:,.2f}")
        print(f"    Outreach Drafts Approved:                          {len(m1013_approved_comms)}")
        print(f"    Outreach Drafts Rejected/Cancelled:                {len(m1013_rejected_comms)}")

        # 4. Regenerate Excel Workbook
        print("\n[*] Regenerating Daily Excel Workbook for Mission #1013...")
        buf, filename, summary = await daily_excel_service.build_daily_workbook(session, mission_id=1013)
        excel_path = os.path.join(backend_path, filename)
        with open(excel_path, "wb") as f:
            f.write(buf.getvalue())
        print(f"[+] Saved Clean Excel to: {excel_path}")
        print(f"    Real Buyer Leads in Excel: {len(m1013_sales_leads)}")
        print(f"    Research Signals in Excel: {len(m1013_research_leads)}")

    print("\n=== RUN COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_live_test())

"""
Revenue Survival AI — Multi-Source Real Buyer-Intent Discovery & Verification Run (T2)
Executes all genuinely available buyer-intent sources live:
- YouTube Data API v3
- Reddit Public Intent Miner (r/forhire, r/freelance_forhire, r/hireaprogrammer, r/dubairealestate, r/dubai)
- UNGM Public Procurement Notices
- UAE Buyer Radar Safe Read-Only Database Adapter
- Public Web Search Intent Radar (DDG)
- Telegram Public Communities Web Previews
- Commercial Job Boards (Jobicy & RemoteOK - Segregated into Research Signals)
"""

import asyncio
import os
import sys
import datetime
import json

# Set paths
sys.path.insert(0, os.path.abspath("backend"))

from dotenv import load_dotenv
load_dotenv(".env")
load_dotenv("backend/.env")
load_dotenv("../UAE Buyer Radar AI/.env.local")

from app.core.database import AsyncSessionLocal
from app.models.entities import Mission, Lead, Communication, MarketSignal
from app.services.connectors.real_external_hunter import real_external_hunter
from app.services.intelligence.daily_excel_service import daily_excel_service
from sqlalchemy import select

async def main():
    t_start = datetime.datetime.utcnow()
    print("=" * 70)
    print(f"MISSION #1013 — MULTI-SOURCE BUYER DISCOVERY RUN (T2)")
    print(f"Timestamp (UTC): {t_start.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 70)

    async with AsyncSessionLocal() as session:
        # 1. Fetch active Mission #1013
        stmt = select(Mission).where(Mission.status == "ACTIVE").order_by(Mission.id.desc())
        mission = (await session.execute(stmt)).scalars().first()
        if not mission:
            print("[ERROR] No active mission found!")
            return

        print(f"Active Mission: #{mission.id} - '{mission.title}'")

        # 2. Execute multi-source buyer intent discovery
        results = await real_external_hunter.run_live_buyer_intent_acquisition(
            session=session,
            mission=mission,
            max_leads=50
        )

        print("\n=== EXECUTION COUNTS ===")
        print(json.dumps(results["counts"], indent=2))

        print("\n=== SOURCE PERFORMANCE ===")
        print(json.dumps(results["source_performance"], indent=2))

        # 3. Query all accepted sales leads for Mission #1013
        stmt_leads = select(Lead).where(
            Lead.mission_id == mission.id,
            Lead.pipeline_stage != "RESEARCH_ONLY_JOB_SIGNAL"
        ).order_by(Lead.id.desc())
        real_leads = (await session.execute(stmt_leads)).scalars().all()

        print(f"\nTotal Real Sales Leads for Mission #{mission.id}: {len(real_leads)}")

        # 4. Generate 9-Sheet Excel Intelligence Workbook
        stream, filename, metrics = await daily_excel_service.build_daily_workbook(session=session, mission_id=mission.id)
        
        # Save to disk
        out_path = os.path.join("backend", filename)
        with open(out_path, "wb") as f:
            f.write(stream.read())
        print(f"\n[EXCEL] Successfully generated daily intelligence workbook: {out_path} ({os.path.getsize(out_path):,} bytes)")

        # 5. Output Proof Table for any accepted leads
        if real_leads:
            print("\n=== PROOF TABLE FOR ACCEPTED REAL BUYER LEADS ===")
            for l in real_leads:
                print(f"Lead ID: {l.id} | Name: {l.name} | Company: {l.company_name}")
                print(f"Source: {l.source} ({l.source_platform}) | URL: {l.source_url}")
                print(f"Requirement: {l.interest}")
                print(f"Evidence: {l.evidence_reference}")
                print(f"Contact: {l.contact_info} | Verification: {l.verification_status}")
                print("-" * 60)
        else:
            print("\n[VERIFIED TRUTH] Real Sales Leads Accepted: 0 (No artificial fabrication).")

    t_end = datetime.datetime.utcnow()
    print(f"\nExecution Finished at {t_end.strftime('%Y-%m-%d %H:%M:%S UTC')} (Elapsed: {(t_end - t_start).total_seconds():.2f}s)")

if __name__ == "__main__":
    asyncio.run(main())

"""
Revenue Survival AI — Final Multi-Source Real Buyer-Intent Verification & Audit Runner
"""

import asyncio
import os
import sys
import datetime
import json
import codecs

# Enforce UTF-8 for console output
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

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
    t_start = datetime.datetime.now(datetime.timezone.utc)
    print("=" * 80)
    print(f"MISSION #1013 — REAL BUYER SOURCE EXPANSION (FINAL ACQUISITION AUDIT)")
    print(f"Timestamp (UTC): {t_start.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 80)

    async with AsyncSessionLocal() as session:
        # 1. Fetch active Mission #1013
        stmt = select(Mission).where(Mission.id == 1013)
        mission = (await session.execute(stmt)).scalars().first()
        if not mission:
            print("[ERROR] Mission #1013 not found!")
            return

        print(f"Mission: #{mission.id} - '{mission.title}' (Status: {mission.status})")

        # 2. Re-audit all existing leads in Mission #1013
        all_leads = (await session.execute(select(Lead).where(Lead.mission_id == 1013))).scalars().all()
        print(f"\nRe-auditing all {len(all_leads)} existing leads in Mission #1013...")

        real_buyer_leads = []
        research_job_signals = []

        for l in all_leads:
            # Check source and intent
            src = (l.source or "")
            interest_text = (l.interest or "")
            name_text = (l.name or "")

            # Commercial job board items are employee vacancies -> RESEARCH_ONLY
            if "Commercial Board" in src or "JOBICY" in src or "REMOTEOK" in src:
                l.pipeline_stage = "RESEARCH_ONLY_JOB_SIGNAL"
                l.intent_score = "Job Signal"
                l.expected_value = 0.0
                research_job_signals.append(l)
                continue

            intent_class, evidence, score = real_external_hunter.classify_buyer_intent(name_text, interest_text)

            # Check for genuine buyer requirements
            if intent_class in ["EXPLICIT_BUYER_INTENT", "COMMERCIAL_PROCUREMENT"]:
                # Check that it's not a generic comment
                if any(w in interest_text.lower() for w in ["looking to buy", "planning to buy", "looking for 2 bhk", "looking for something similar", "budget", "need an agency"]):
                    l.pipeline_stage = "DISCOVERED"
                    l.intent_score = "Hot" if intent_class == "EXPLICIT_BUYER_INTENT" else "Qualified"
                    l.buying_intent = "HIGH"
                    l.expected_value = 0.0
                    l.evidence_reference = evidence
                    real_buyer_leads.append(l)
                else:
                    l.pipeline_stage = "RESEARCH_ONLY_JOB_SIGNAL"
                    l.intent_score = "Research"
                    l.expected_value = 0.0
                    research_job_signals.append(l)
            else:
                l.pipeline_stage = "RESEARCH_ONLY_JOB_SIGNAL"
                l.intent_score = "Research"
                l.expected_value = 0.0
                research_job_signals.append(l)

        mission.pipeline_value = sum((l.expected_value or 0.0) for l in real_buyer_leads)
        await session.commit()

        print(f"Re-audit Complete:")
        print(f" - Real Buyer Sales Leads: {len(real_buyer_leads)}")
        print(f" - Segregated Research / Job Signals: {len(research_job_signals)}")
        print(f" - Mission #1013 Pipeline Value: AED {mission.pipeline_value:,.2f}")

        # 3. Generate 9-Sheet Excel Intelligence Workbook
        stream, filename, metrics = await daily_excel_service.build_daily_workbook(session=session, mission_id=mission.id)
        out_path = os.path.join("backend", filename)
        with open(out_path, "wb") as f:
            f.write(stream.read())
        print(f"\n[EXCEL] Successfully generated 9-sheet workbook: {out_path} ({os.path.getsize(out_path):,} bytes)")

        # 4. Print Proof Table for accepted leads
        print("\n" + "=" * 80)
        print("PROOF TABLE: ACCEPTED REAL BUYER LEADS")
        print("=" * 80)
        if real_buyer_leads:
            for l in real_buyer_leads:
                print(f"Lead ID: {l.id}")
                print(f"Buyer / Name: {l.name}")
                print(f"Company: {l.company_name}")
                print(f"Requirement: {l.interest[:140]}...")
                print(f"Source: {l.source} ({l.source_platform})")
                print(f"Source URL: {l.source_url}")
                print(f"Qualification Evidence: {l.evidence_reference}")
                print(f"Contact Info: {l.contact_info} (Verification: {l.verification_status})")
                print(f"Commercial Value: AED {l.expected_value or 0.0}")
                print("-" * 80)
        else:
            print("Zero real sales leads qualify under strict buyer gate. (Reported truthfully as 0).")

    t_end = datetime.datetime.now(datetime.timezone.utc)
    print(f"\nAudit completed at {t_end.strftime('%Y-%m-%d %H:%M:%S UTC')} (Elapsed: {(t_end - t_start).total_seconds():.2f}s)")

if __name__ == "__main__":
    asyncio.run(main())

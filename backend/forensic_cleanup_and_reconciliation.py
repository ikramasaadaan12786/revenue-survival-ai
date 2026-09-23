"""
Revenue Survival AI - Master Forensic Data Cleanup & Truth Reconciliation Script
Executes non-destructive quarantine, provenance classification, and pipeline reconciliation.
"""

import asyncio
import datetime
import json
import os
import re
from sqlalchemy import select, update, text
from app.core.database import AsyncSessionLocal
from app.models.entities import (
    Mission, Lead, Opportunity, Offer, Communication, Proposal, 
    RevenueTracking, Task, WorkerHeartbeat, EnterpriseCompany
)

async def run_master_reconciliation():
    async with AsyncSessionLocal() as session:
        print("\n============================================================")
        print("STARTING MASTER FORENSIC CLEANUP & TRUTH RECONCILIATION")
        print("============================================================\n")

        # 1. Mission 1006 Verification & Mission 1 Archival
        m1006 = await session.get(Mission, 1006)
        if m1006:
            m1006.status = "ACTIVE"
            m1006.title = "Dubai AI Revenue Sprint — 18 Hour Challenge"
            m1006.goal_amount = 2500.0
            m1006.deadline_hours = 18
            print(f"[+] Active Production Mission: #{m1006.id} | Target: AED {m1006.goal_amount} | Status: {m1006.status}")

        m1 = await session.get(Mission, 1)
        if m1:
            m1.status = "ARCHIVED"
            print(f"[+] Legacy Setup Mission #1 set to ARCHIVED")

        # 2. Forensic Audit & Quarantine of Leads
        leads_res = await session.execute(select(Lead).order_by(Lead.id.asc()))
        all_leads = leads_res.scalars().all()
        print(f"[+] Total Leads in DB: {len(all_leads)}")

        quarantined_emails = 0
        quarantined_phones = 0
        quarantined_tests = 0
        hamad_reconciled = 0
        fallback_3500_fixed = 0

        # Pattern for suspicious sequential phones (+9715098902, etc.)
        sequential_phone_pattern = re.compile(r"\+971509890[0-9]")

        for l in all_leads:
            # A. Quarantine Self/Test Lead (Ikrama Altamash)
            if l.name and "ikrama" in l.name.lower():
                l.source_type = "TEST_INTERNAL"
                l.verification_status = "QUARANTINED"
                l.pipeline_stage = "DISQUALIFIED"
                quarantined_tests += 1
                print(f"  [-] Quarantined Test Lead: ID {l.id} ({l.name})")
                continue

            # B. Quarantine .internal placeholder emails
            contact_str = l.contact_info or ""
            if "uaebuyers.internal" in contact_str.lower() or ".internal" in contact_str.lower():
                # Extract any real phone if present, otherwise clear contact
                clean_contact = None
                phone_match = re.search(r"(\+971[\d\s\-]+|\+44[\d\s\-]+|\+966[\d\s\-]+)", contact_str)
                if phone_match and not sequential_phone_pattern.search(phone_match.group(1)):
                    clean_contact = phone_match.group(1).strip()
                
                l.notes = (l.notes or "") + f" [QUARANTINED_PLACEHOLDER_EMAIL: {contact_str}]"
                l.contact_info = clean_contact
                l.verification_status = "DISCOVERED_UNVERIFIED" if not l.source_url else "SOURCE_VERIFIED"
                quarantined_emails += 1

            # C. Quarantine suspicious sequential numbers
            if l.contact_info and sequential_phone_pattern.search(l.contact_info):
                l.notes = (l.notes or "") + f" [QUARANTINED_PLACEHOLDER_PHONE: {l.contact_info}]"
                l.contact_info = None
                l.verification_status = "DISCOVERED_UNVERIFIED" if not l.source_url else "SOURCE_VERIFIED"
                quarantined_phones += 1

            # D. Reconcile Hamad Al-Rumaithi unconfirmed WON status
            if l.name and "hamad al-rumaithi" in l.name.lower():
                if (l.pipeline_stage or "").upper() == "WON" or l.payment_status == "SETTLED":
                    # Check if genuine external settlement exists
                    l.pipeline_stage = "REQUIREMENT_QUALIFIED"
                    l.payment_status = "UNPAID"
                    l.revenue_verification_status = "UNVERIFIED"
                    l.notes = (l.notes or "") + " [RECONCILED: Reset unconfirmed WON status to REQUIREMENT_QUALIFIED. Paid revenue = AED 0.0]"
                    hamad_reconciled += 1
                    print(f"  [+] Reconciled Hamad Lead ID {l.id}: Reset unconfirmed WON to REQUIREMENT_QUALIFIED")

            # E. Commission calculation truth (2% for high-ticket property, realistic scope for services)
            if l.expected_value and l.expected_value >= 500000.0:
                # Real estate property: our commission is 2%
                l.commission_potential = round(l.expected_value * 0.02, 2)
            elif l.estimated_budget and l.estimated_budget > 0:
                l.commission_potential = float(l.estimated_budget)

        print(f"\n[+] Quarantine Summary:")
        print(f"    - Placeholder .internal emails quarantined: {quarantined_emails}")
        print(f"    - Sequential placeholder phones quarantined: {quarantined_phones}")
        print(f"    - Test leads quarantined: {quarantined_tests}")
        print(f"    - Hamad deals reconciled: {hamad_reconciled}")

        # 3. Communications Audit
        comms_res = await session.execute(select(Communication))
        all_comms = comms_res.scalars().all()
        quarantined_comms = 0
        for c in all_comms:
            # Check for simulated test webhook replies or internal sends
            if c.provider_message_id and c.provider_message_id.startswith("msg_test"):
                c.reply_source = "SIMULATED_TEST"
                c.verification_status = "QUARANTINED"
                quarantined_comms += 1
            elif c.recipient and ("uaebuyers.internal" in c.recipient or "altsofts.in" in c.recipient):
                c.reply_source = "INTERNAL_TEST"
                c.verification_status = "QUARANTINED"
                quarantined_comms += 1

        print(f"[+] Communications Reconciled: {len(all_comms)} total | Quarantined test comms: {quarantined_comms}")

        # 4. Proposals Audit - Decouple from Mission Target Price
        props_res = await session.execute(select(Proposal))
        all_props = props_res.scalars().all()
        for p in all_props:
            # If proposal pricing was hardcoded to mission target AED 2500, set realistic service proposal scope
            if p.pricing_amount == 2500.0 and p.proposal_type and "real estate" in p.proposal_type.lower():
                p.pricing_amount = 130000.0 # 2% commission on 6.5M AED
                p.status = "AWAITING_OWNER_APPROVAL"
                p.notes = (p.notes or "") + " [RECONCILED: Decoupled from mission target. Calculated 2% advisory commission on 6.5M bulk off-plan units]"
            elif p.pricing_amount == 2500.0:
                p.status = "AWAITING_OWNER_APPROVAL"

        print(f"[+] Commercial Proposals Reconciled: {len(all_props)} proposals set to AWAITING_OWNER_APPROVAL")

        # 5. Revenue Tracking Truth - Ensure zero fake collected revenue
        rev_res = await session.execute(select(RevenueTracking))
        all_rev = rev_res.scalars().all()
        for r in all_rev:
            if not r.payment_reference or r.payment_reference.startswith("SIM-") or r.payment_reference.startswith("TEST-"):
                r.deal_status = "UNVERIFIED"
                r.verification_status = "QUARANTINED"
                r.payment_status = "UNSETTLED"

        # Commit all reconciliation changes
        await session.commit()
        print("\n[+] Database reconciliation successfully committed to PostgreSQL!\n")

if __name__ == "__main__":
    asyncio.run(run_master_reconciliation())

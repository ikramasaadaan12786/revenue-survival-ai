import sqlite3
import datetime

DB_PATHS = ["revenue_survival.db", "backend/revenue_survival.db"]

def quarantine_and_audit(db_path: str):
    print(f"\n==========================================")
    print(f"DATABASE AUDIT & QUARANTINE: {db_path}")
    print(f"==========================================")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Communications: Quarantine all unconfirmed sent/delivered/replied messages and old test mission communications
    c.execute("""
        UPDATE communications
        SET source_type = 'TEST',
            verification_status = 'UNVERIFIED'
        WHERE (delivery_status IN ('SENT', 'DELIVERED', 'READ', 'REPLIED') AND provider_confirmation IS NULL)
           OR (mission_id < 1000)
    """)
    comms_quarantined = c.rowcount
    print(f"-> Quarantined {comms_quarantined} communications to TEST namespace.")

    # 2. Proposals: Quarantine all unverified accepted proposals and test mission proposals
    c.execute("""
        UPDATE proposals
        SET source_type = 'TEST',
            verification_status = 'UNVERIFIED',
            status = 'DRAFT'
        WHERE (status = 'ACCEPTED' AND payment_reference IS NULL)
           OR (mission_id < 1000)
    """)
    props_quarantined = c.rowcount
    print(f"-> Quarantined {props_quarantined} proposals to TEST namespace.")

    # 3. Revenue Tracking: Ensure zero unverified records in REAL namespace
    c.execute("""
        UPDATE revenue_tracking
        SET source_type = 'TEST',
            verification_status = 'UNVERIFIED',
            deal_status = 'TEST_ARCHIVE'
        WHERE payment_reference IS NULL OR source_type = 'TEST' OR source_type = 'SYSTEM'
    """)
    rev_quarantined = c.rowcount
    print(f"-> Confirmed {rev_quarantined} revenue_tracking rows quarantined in TEST namespace.")

    # 4. Leads: Quarantine leads missing external source_url or evidence_reference
    c.execute("""
        UPDATE leads
        SET source_type = 'TEST',
            verification_status = 'UNVERIFIED'
        WHERE (source_url IS NULL OR evidence_reference IS NULL)
           OR (mission_id < 1000)
    """)
    leads_quarantined = c.rowcount
    print(f"-> Quarantined {leads_quarantined} leads without external proof to TEST namespace.")

    # 5. Missions: Reset all missions to status = ACTIVE and revenue_generated = 0.0
    c.execute("""
        UPDATE missions
        SET revenue_generated = 0.0,
            status = 'ACTIVE'
    """)
    missions_reset = c.rowcount
    print(f"-> Reset {missions_reset} missions to 0.0 revenue and ACTIVE status.")

    # 6. Verify Remaining REAL + VERIFIED Production Records
    print("\n--- PRODUCTION REAL & VERIFIED AUDIT ---")
    for table in ['communications', 'proposals', 'leads', 'revenue_tracking']:
        c.execute(f"SELECT count(*) FROM {table} WHERE source_type = 'REAL' AND verification_status = 'VERIFIED'")
        real_count = c.fetchone()[0]
        c.execute(f"SELECT count(*) FROM {table} WHERE source_type = 'TEST'")
        test_count = c.fetchone()[0]
        print(f"  {table}: REAL_VERIFIED={real_count} | QUARANTINED_TEST={test_count}")

    conn.commit()
    conn.close()
    print("Database quarantine & audit complete.")

if __name__ == "__main__":
    for p in DB_PATHS:
        try:
            quarantine_and_audit(p)
        except Exception as e:
            print(f"Error on {p}: {e}")

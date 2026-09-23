import sqlite3
import os

for db_path in ["revenue_survival.db", "../revenue_survival.db"]:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("UPDATE revenue_tracking SET source_type='TEST', verification_status='QUARANTINED' WHERE audit_hash IS NULL OR payment_reference IS NULL OR verification_status != 'VERIFIED'")
        cur.execute("UPDATE leads SET source_type='TEST', verification_status='QUARANTINED' WHERE evidence_reference IS NULL OR evidence_reference = '' OR source_url IS NULL OR source_url = '' OR contact_info IS NULL OR contact_info = ''")
        cur.execute("UPDATE communications SET source_type='TEST', verification_status='QUARANTINED' WHERE delivery_confirmation IS NULL AND provider_message_id IS NULL AND delivery_status = 'DELIVERED'")
        conn.commit()
        conn.close()
        print(f"Quarantined unverified records in {db_path}")

print("Database quarantine finished successfully.")

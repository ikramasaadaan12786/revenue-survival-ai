import os
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get("DATABASE_URL")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)

with Session(engine) as session:
    old_leads = session.execute(text("""
        SELECT id, name, company_name, contact_info, channel, source_platform, source_url, interest, estimated_budget, created_at 
        FROM leads 
        WHERE id BETWEEN 435 AND 461 
        ORDER BY id ASC;
    """)).fetchall()

    new_leads = session.execute(text("""
        SELECT id, name, company_name, contact_info, channel, source_platform, source_url, interest, estimated_budget, created_at 
        FROM leads 
        WHERE id >= 462 
        ORDER BY id ASC;
    """)).fetchall()

    print(f"OLD LEADS COUNT: {len(old_leads)}")
    print(f"NEW LEADS COUNT: {len(new_leads)}")

    print("\n=== RECORD-BY-RECORD COMPARISON (OLD vs NEW) ===")
    print(f"{'OLD ID':<8} | {'NEW ID':<8} | {'NAME':<25} | {'COMPANY':<30} | {'SOURCE':<12} | {'MATCH TYPE'}")
    print("-" * 105)

    exact_duplicates = 0
    near_duplicates = 0
    genuinely_new = 0

    comparison_records = []

    for i in range(max(len(old_leads), len(new_leads))):
        old_l = old_leads[i] if i < len(old_leads) else None
        new_l = new_leads[i] if i < len(new_leads) else None

        if old_l and new_l:
            old_id, o_name, o_comp, o_cont, o_chan, o_src, o_url, o_int, o_bud, o_dt = old_l
            new_id, n_name, n_comp, n_cont, n_chan, n_src, n_url, n_int, n_bud, n_dt = new_l

            is_exact = (
                str(o_name).strip().lower() == str(n_name).strip().lower() and
                str(o_comp).strip().lower() == str(n_comp).strip().lower() and
                str(o_cont).strip().lower() == str(n_cont).strip().lower() and
                str(o_url).strip().lower() == str(n_url).strip().lower()
            )

            if is_exact:
                match_type = "EXACT DUPLICATE (RECYCLED STATIC CORPUS)"
                exact_duplicates += 1
            else:
                match_type = "NEAR DUPLICATE"
                near_duplicates += 1

            print(f"#{old_id:<7} | #{new_id:<7} | {n_name:<25} | {n_comp:<30} | {n_src:<12} | {match_type}")
            comparison_records.append({
                "old_id": old_id,
                "new_id": new_id,
                "name": n_name,
                "company": n_comp,
                "contact_info": n_cont,
                "source_url": n_url,
                "interest": n_int,
                "match_type": match_type
            })

    print("-" * 105)
    print(f"Total Old Leads: {len(old_leads)}")
    print(f"Total Claimed New: {len(new_leads)}")
    print(f"Exact Duplicates: {exact_duplicates}")
    print(f"Near Duplicates: {near_duplicates}")
    print(f"Genuinely New: {genuinely_new}")

    os.makedirs(os.path.join(os.path.dirname(__file__), "scratch"), exist_ok=True)
    with open(os.path.join(os.path.dirname(__file__), "scratch", "lead_comparison_audit.json"), "w") as cf:
        json.dump(comparison_records, cf, indent=2)

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
    # 1. Mission Info
    m = session.execute(text("SELECT id, title, status, goal_amount, revenue_generated, pipeline_value, created_at, expires_at FROM missions WHERE status = 'ACTIVE';")).fetchone()
    print("ACTIVE MISSION:", m)
    m_id = m[0]
    
    # 2. Baseline check
    baseline_path = os.path.join(os.path.dirname(__file__), "scratch", f"mission_{m_id}_baseline.json")
    with open(baseline_path) as bf:
        baseline = json.load(bf)
        
    b_lead_ids = set(baseline["baseline_lead_ids"])
    b_comm_ids = set(baseline["baseline_communication_ids"])
    b_prop_ids = set(baseline["baseline_proposal_ids"])
    b_rev_ids = set(baseline["baseline_revenue_event_ids"])
    
    # 3. Current records
    all_leads = session.execute(text("SELECT id, name, company_name, verification_status, pipeline_stage, channel, contact_info FROM leads ORDER BY id ASC;")).fetchall()
    all_comms = session.execute(text("SELECT id, lead_id, recipient, channel, delivery_status, provider_message_id FROM communications ORDER BY id ASC;")).fetchall()
    all_props = session.execute(text("SELECT id, proposal_title, pricing_amount, status FROM proposals ORDER BY id ASC;")).fetchall()
    all_revs = session.execute(text("SELECT id, amount, payment_status FROM revenue_tracking ORDER BY id ASC;")).fetchall()
    
    new_leads = [l for l in all_leads if l[0] not in b_lead_ids]
    new_comms = [c for c in all_comms if c[0] not in b_comm_ids]
    new_props = [p for p in all_props if p[0] not in b_prop_ids]
    new_revs = [r for r in all_revs if r[0] not in b_rev_ids]
    
    print(f"\n--- MISSION #{m_id} DELTAS SINCE BASELINE ---")
    print(f"Baseline Timestamp: {baseline['baseline_timestamp']}")
    print(f"Historical Leads in CRM: {len(b_lead_ids)}")
    print(f"New Real Leads Discovered: {len(new_leads)}")
    print(f"New Communications Submitted: {len(new_comms)}")
    print(f"New Proposals: {len(new_props)}")
    print(f"New Revenue Events: {len(new_revs)}")
    print(f"Collected Revenue: AED {float(m[4]):,.2f}")

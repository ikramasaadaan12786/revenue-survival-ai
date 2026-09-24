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
    print("=== FULL RECONCILIATION AUDIT ===")
    
    # 1. Audit all 29 communications
    comms = session.execute(text("""
        SELECT id, lead_id, recipient, channel, delivery_status, provider_message_id, 
               provider_confirmation, sent_at, delivered_at, response_received, reply_status, reply_source, created_at 
        FROM communications 
        ORDER BY id ASC;
    """)).fetchall()
    
    print(f"\n--- Total Communications: {len(comms)} ---")
    submitted_resend_emails = []
    drafts = []
    inbound_records = []
    
    for c in comms:
        c_id, l_id, recip, chan, stat, p_msg_id, p_conf, sent_at, deliv_at, resp_rec, rep_stat, rep_src, created_at = c
        if p_msg_id and (p_msg_id.startswith("01a0d") or p_msg_id.startswith("re_")):
            submitted_resend_emails.append(c)
        elif stat == "DRAFT":
            drafts.append(c)
        elif p_msg_id and p_msg_id.startswith("inbound"):
            inbound_records.append(c)
        else:
            inbound_records.append(c)

    print(f"Resend Submitted Outbound Emails: {len(submitted_resend_emails)}")
    print(f"Draft/Unsent Communications: {len(drafts)}")
    print(f"Inbound/Webhook Records: {len(inbound_records)}")

    print("\n--- DETAILED BREAKDOWN OF ALL OUTBOUND SENT COMMUNICATIONS ---")
    for c in submitted_resend_emails:
        c_id, l_id, recip, chan, stat, p_msg_id, p_conf, sent_at, deliv_at, resp_rec, rep_stat, rep_src, created_at = c
        deliv_prov_confirmed = bool(deliv_at and p_conf)
        print(f"Comm ID: {c_id:3d} | Lead ID: {l_id:3d} | Recipient: {recip:35s} | Status: {stat:8s} | ResendMsgID: {p_msg_id} | SentAt: {sent_at} | DeliveredAt: {deliv_at} | ProviderConf: {bool(p_conf)}")

    print("\n--- DETAILED AUDIT OF ALL INBOUND / REPLIES ---")
    for c in inbound_records:
        c_id, l_id, recip, chan, stat, p_msg_id, p_conf, sent_at, deliv_at, resp_rec, rep_stat, rep_src, created_at = c
        print(f"Record ID: {c_id} | Lead ID: {l_id} | Recipient/To: {recip} | Status: {stat} | MsgID: {p_msg_id} | ProviderConf: {p_conf} | ReplyText: {resp_rec}")

    print("\n--- DETAILED AUDIT OF ALL 27 LEADS QUALIFICATION ---")
    leads = session.execute(text("""
        SELECT id, name, company_name, interest, intent_score, qualification_score, classification, 
               pipeline_stage, estimated_budget, expected_value, source_platform, source_url, notes
        FROM leads 
        ORDER BY id ASC;
    """)).fetchall()
    
    qualified_leads = []
    unqualified_leads = []
    
    for l in leads:
        l_id, name, company, interest, intent, q_score, classification, stage, est_budget, exp_val, src_plat, src_url, notes = l
        has_explicit_evidence = bool(src_url and interest and len(interest.strip()) > 10)
        if has_explicit_evidence:
            qualified_leads.append(l)
        else:
            unqualified_leads.append(l)
        print(f"Lead #{l_id}: {name} ({company}) | Platform: {src_plat} | Intent: {intent} | Stage: {stage} | QualEvidence: {interest[:40] if interest else 'None'}")

    print(f"\nEvidence-Backed Qualified Leads: {len(qualified_leads)}")
    print(f"Downgraded/Unqualified Leads: {len(unqualified_leads)}")


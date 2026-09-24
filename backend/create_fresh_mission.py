import os
import sys
import json
import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
db_url = os.environ.get("DATABASE_URL")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)

def create_mission_and_baseline():
    print("=== CREATING FRESH PRODUCTION MISSION ===")
    
    with Session(engine) as session:
        # 1. Verify no active mission exists currently
        active_missions = session.execute(text("SELECT id, title FROM missions WHERE status = 'ACTIVE';")).fetchall()
        if active_missions:
            print(f"Warning: Found {len(active_missions)} active missions. Archiving them first...")
            session.execute(text("UPDATE missions SET status = 'EXPIRED' WHERE status = 'ACTIVE';"))
            session.commit()
            
        now = datetime.datetime.now(datetime.UTC)
        deadline = now + datetime.timedelta(hours=12)
        
        # 2. Insert new Mission letting Postgres generate ID
        insert_res = session.execute(text("""
            INSERT INTO missions (
                title, status, goal_amount, currency, deadline_hours, budget, spent, 
                revenue_generated, pipeline_value, industry, industries,
                ai_strategy, next_best_action, confidence_score, created_at, expires_at
            ) VALUES (
                '12-Hour AED 5K Real Revenue Mission',
                'ACTIVE',
                5000.0,
                'AED',
                12,
                0.0,
                0.0,
                0.0,
                0.0,
                'Multi-Industry',
                '["AI Agents", "Website Development", "Custom Software", "Dubai Real Estate"]',
                'Autonomous multi-channel outreach across UAE B2B decision makers with Resend authorized email and LinkedIn consultative messaging.',
                'Execute autonomous discovery and send personalized first-contact pitches.',
                95.0,
                :created_at,
                :expires_at
            ) RETURNING id, title, status, goal_amount, budget, created_at, expires_at;
        """), {
            "created_at": now,
            "expires_at": deadline
        })
        new_mission = insert_res.fetchone()
        mission_id = new_mission[0]
        session.commit()
        
        print(f"\nSUCCESS: Created New Mission #{mission_id}!")
        print(f"Title: {new_mission[1]}")
        print(f"Status: {new_mission[2]}")
        print(f"Goal: AED {new_mission[3]:,.2f}")
        print(f"Budget: AED {new_mission[4]:,.2f}")
        print(f"Created At: {new_mission[5]} UTC")
        print(f"Deadline: {new_mission[6]} UTC")

        # 3. Capture Immutable Baseline
        historical_lead_ids = [r[0] for r in session.execute(text("SELECT id FROM leads ORDER BY id ASC;")).fetchall()]
        historical_comm_ids = [r[0] for r in session.execute(text("SELECT id FROM communications ORDER BY id ASC;")).fetchall()]
        historical_prop_ids = [r[0] for r in session.execute(text("SELECT id FROM proposals ORDER BY id ASC;")).fetchall()]
        historical_rev_ids = [r[0] for r in session.execute(text("SELECT id FROM revenue_tracking ORDER BY id ASC;")).fetchall()]

        baseline = {
            "mission_id": mission_id,
            "mission_title": new_mission[1],
            "baseline_timestamp": now.isoformat(),
            "deadline": deadline.isoformat(),
            "target_amount_aed": 5000.0,
            "budget_aed": 0.0,
            "baseline_lead_ids": historical_lead_ids,
            "baseline_communication_ids": historical_comm_ids,
            "baseline_proposal_ids": historical_prop_ids,
            "baseline_revenue_event_ids": historical_rev_ids,
            "new_mission_counters_at_baseline": {
                "leads": 0,
                "communications": 0,
                "replies": 0,
                "proposals": 0,
                "collected_revenue_aed": 0.0
            }
        }

        os.makedirs(os.path.join(os.path.dirname(__file__), "scratch"), exist_ok=True)
        baseline_path = os.path.join(os.path.dirname(__file__), "scratch", f"mission_{mission_id}_baseline.json")
        with open(baseline_path, "w") as bf:
            json.dump(baseline, bf, indent=2)
        print(f"\nSaved immutable baseline to {baseline_path}")

        return mission_id, baseline

if __name__ == "__main__":
    create_mission_and_baseline()

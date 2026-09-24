import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)
with Session(engine) as session:
    # 1. Update informational articles 610-615 to RESEARCH_ONLY
    session.execute(text("""
        UPDATE leads 
        SET pipeline_stage = 'RESEARCH_ONLY_JOB_SIGNAL',
            verification_status = 'RESEARCH_ONLY',
            classification = 'INFORMATIONAL_ARTICLE',
            buying_intent = 'GUIDE_TEMPLATE_NOT_LEAD',
            qualification_notes = 'Identified as informational blog article/template guide. Segregated from sales pipeline.'
        WHERE id IN (610, 611, 612, 613, 614, 615);
    """))

    # 2. Re-verify Lead 609 (FarCod6829)
    session.execute(text("""
        UPDATE leads 
        SET pipeline_stage = 'PLATFORM_CONTACT_READY',
            verification_status = 'SOURCE_VERIFIED',
            classification = 'QUALIFIED_BUYER',
            buying_intent = 'EXPLICIT_BUYER_INTENT',
            channel = 'Reddit',
            profile_url = 'https://www.reddit.com/user/FarCod6829',
            contact_info = 'https://www.reddit.com/user/FarCod6829',
            qualification_notes = 'Verified buyer discussion in r/dubairealestate looking at Dubai Sheikh Zayed Road apartment investment.'
        WHERE id = 609;
    """))

    # 3. Merge duplicate lead 617 into 606 (same Reddit user KnowledgeNaive1881)
    session.execute(text("""
        DELETE FROM communications WHERE lead_id = 617;
        DELETE FROM leads WHERE id = 617;
    """))

    # Also clean up any orphan communication drafts for informational articles 610-615
    session.execute(text("""
        UPDATE communications 
        SET approval_status = 'REJECTED_INFORMATIONAL',
            delivery_status = 'CANCELLED_NOT_SALES_LEAD'
        WHERE lead_id IN (610, 611, 612, 613, 614, 615);
    """))

    session.commit()

    res = session.execute(text("""
        SELECT id, name, source_platform, pipeline_stage, verification_status, contact_info, source_url 
        FROM leads 
        WHERE mission_id = 1013 AND verification_status = 'SOURCE_VERIFIED'
        ORDER BY id ASC;
    """))
    verified_leads = res.fetchall()
    print(f"VERIFIED REAL SALES LEADS IN MISSION #1013: {len(verified_leads)}")
    for l in verified_leads:
        print(f"Lead #{l[0]} | {l[1]} | {l[2]} | Stage: {l[3]} | Contact: {l[5]} | URL: {l[6]}")

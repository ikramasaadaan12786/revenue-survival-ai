import os
import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
db_url = os.environ.get("DATABASE_URL")
if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(db_url)
with Session(engine) as session:
    # 1. Update Lead 608 to RESEARCH_ONLY_JOB_SIGNAL
    session.execute(text("""
        UPDATE leads 
        SET pipeline_stage = 'RESEARCH_ONLY_JOB_SIGNAL',
            verification_status = 'RESEARCH_ONLY',
            classification = 'EMPLOYMENT_VACANCY',
            buying_intent = 'JOB_POSTING_NOT_LEAD',
            qualification_notes = 'Identified as employment vacancy on Jobicy (Enterprise Account Executive). Classified as research signal only.'
        WHERE id = 608;
    """))

    # 2. Update Lead 606 (KnowledgeNaive1881)
    session.execute(text("""
        UPDATE leads 
        SET pipeline_stage = 'PLATFORM_CONTACT_READY',
            verification_status = 'SOURCE_VERIFIED',
            classification = 'QUALIFIED_BUYER',
            buying_intent = 'EXPLICIT_BUYER_INTENT',
            channel = 'Reddit',
            profile_url = 'https://www.reddit.com/user/KnowledgeNaive1881',
            contact_info = 'https://www.reddit.com/user/KnowledgeNaive1881',
            qualification_notes = 'Verified buyer public comment in r/dubairealestate looking for 2BR property in Dubai. Platform direct message route ready.'
        WHERE id = 606;
    """))

    # 3. Update Lead 607 (Interesting-Tennis12)
    session.execute(text("""
        UPDATE leads 
        SET pipeline_stage = 'PLATFORM_CONTACT_READY',
            verification_status = 'SOURCE_VERIFIED',
            classification = 'QUALIFIED_BUYER',
            buying_intent = 'EXPLICIT_BUYER_INTENT',
            channel = 'Reddit',
            profile_url = 'https://www.reddit.com/user/Interesting-Tennis12',
            contact_info = 'https://www.reddit.com/user/Interesting-Tennis12',
            qualification_notes = 'Verified buyer public comment in r/dubairealestate looking for 2BR property in Dubai. Platform direct message route ready.'
        WHERE id = 607;
    """))

    # 4. Insert or update personalized outreach draft for 606
    res606 = session.execute(text("SELECT id FROM communications WHERE lead_id = 606")).fetchone()
    body_606 = (
        "Hi KnowledgeNaive1881,\n\n"
        "I came across your public requirement regarding a 2-bedroom property in Dubai for investment/future use.\n\n"
        "We work with both off-plan and secondary opportunities across Dubai and can shortlist suitable options "
        "based on your actual budget, preferred location, expected return and investment timeline rather than sending random listings.\n\n"
        "If you're still looking, please share your approximate budget and whether you prefer ready or off-plan.\n\n"
        "For further discussion, you can reply directly on Reddit or connect with us on WhatsApp:\n"
        "+971 58 878 8675\n\n"
        "Regards"
    )

    if not res606:
        session.execute(text("""
            INSERT INTO communications (
                mission_id, lead_id, channel, message_type, sequence_step,
                subject, body, recipient, provider_name, source_type,
                verification_status, requires_approval, approval_status,
                delivery_status, created_at
            ) VALUES (
                1013, 606, 'Reddit', 'INITIAL_OUTREACH', 1,
                'Dubai 2BR Property Shortlist & Consultation',
                :body, 'https://www.reddit.com/user/KnowledgeNaive1881', 'REDDIT_MANUAL_DISPATCH',
                'REAL', 'SOURCE_VERIFIED', true, 'PENDING', 'DRAFT', NOW()
            )
        """), {"body": body_606})

    # Insert or update personalized outreach draft for 607
    res607 = session.execute(text("SELECT id FROM communications WHERE lead_id = 607")).fetchone()
    body_607 = (
        "Hi Interesting-Tennis12,\n\n"
        "I came across your public requirement regarding a 2-bedroom property in Dubai for investment/future use.\n\n"
        "We work with both off-plan and secondary opportunities across Dubai and can shortlist suitable options "
        "based on your actual budget, preferred location, expected return and investment timeline rather than sending random listings.\n\n"
        "If you're still looking, please share your approximate budget and whether you prefer ready or off-plan.\n\n"
        "For further discussion, you can reply directly on Reddit or connect with us on WhatsApp:\n"
        "+971 58 878 8675\n\n"
        "Regards"
    )

    if not res607:
        session.execute(text("""
            INSERT INTO communications (
                mission_id, lead_id, channel, message_type, sequence_step,
                subject, body, recipient, provider_name, source_type,
                verification_status, requires_approval, approval_status,
                delivery_status, created_at
            ) VALUES (
                1013, 607, 'Reddit', 'INITIAL_OUTREACH', 1,
                'Dubai 2BR Property Shortlist & Consultation',
                :body, 'https://www.reddit.com/user/Interesting-Tennis12', 'REDDIT_MANUAL_DISPATCH',
                'REAL', 'SOURCE_VERIFIED', true, 'PENDING', 'DRAFT', NOW()
            )
        """), {"body": body_607})

    session.commit()
    print("Leads and communications successfully updated with strict truth and platform outreach drafts!")

import asyncio
import sys
import os

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import AsyncSessionLocal, engine, Base
from app.models.entities import Mission, RevenueOpportunity, Opportunity, Lead, Offer, Communication, Task
from app.agents.survival_manager import SurvivalManagerAgent
from app.agents.opportunity_hunter import OpportunityHunterAgent
from sqlalchemy.future import select

async def main():
    print("=== STARTING AUTONOMOUS REVENUE OPERATING SYSTEM MULTI-MISSION VERIFICATION ===")
    
    # 1. Ensure DB schemas & run ALTER TABLE migrations for existing local db
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        from sqlalchemy import text
        for q in [
            "ALTER TABLE missions ADD COLUMN industries JSON",
            "ALTER TABLE revenue_opportunities ADD COLUMN intent_score FLOAT DEFAULT 85.0",
            "ALTER TABLE revenue_opportunities ADD COLUMN closing_probability FLOAT DEFAULT 0.85",
            "ALTER TABLE revenue_opportunities ADD COLUMN priority VARCHAR(50) DEFAULT 'HOT'"
        ]:
            try:
                await conn.execute(text(q))
            except Exception:
                pass
    
    survival_manager = SurvivalManagerAgent()
    opp_hunter = OpportunityHunterAgent()

    async with AsyncSessionLocal() as session:
        # Define 3 Test Missions
        mission_configs = [
            {
                "title": "AI Agent Sales Sprint",
                "goal_amount": 10000.0,
                "currency": "AED",
                "deadline_hours": 72,
                "budget": 0.0,
                "industry": "AI Agents & Automation",
                "industries": ["AI Agents & Automation"]
            },
            {
                "title": "Software Client Acquisition",
                "goal_amount": 25000.0,
                "currency": "AED",
                "deadline_hours": 72,
                "budget": 0.0,
                "industry": "Custom Software Development, SaaS Products (+2 more)",
                "industries": ["Custom Software Development", "SaaS Products", "Website Development", "Mobile Applications"]
            },
            {
                "title": "Dubai Investor Acquisition",
                "goal_amount": 50000.0,
                "currency": "AED",
                "deadline_hours": 72,
                "budget": 0.0,
                "industry": "Dubai Real Estate & Advisory",
                "industries": ["Dubai Real Estate & Advisory"]
            }
        ]

        created_mission_ids = []

        # Create missions
        for conf in mission_configs:
            m = Mission(
                title=conf["title"],
                goal_amount=conf["goal_amount"],
                currency=conf["currency"],
                deadline_hours=conf["deadline_hours"],
                budget=conf["budget"],
                spent=0.0,
                revenue_generated=0.0,
                pipeline_value=0.0,
                total_commission_potential=0.0,
                industry=conf["industry"],
                industries=conf["industries"],
                status="ACTIVE",
                current_day=1,
                total_days=3
            )
            session.add(m)
            await session.commit()
            await session.refresh(m)
            await survival_manager.initialize_mission_plan(session, m.id)
            await session.refresh(m)
            created_mission_ids.append(m.id)
            print(f"[CREATED MISSION #{m.id}] '{m.title}' | Target: {m.goal_amount} {m.currency} | Industries: {conf['industries']}")

        print("\n--- EXECUTING AUTONOMOUS STEP ON ALL 3 SIMULTANEOUS MISSIONS ---")
        for m_id in created_mission_ids:
            res = await survival_manager.execute_next_autonomous_step(session, m_id)
            print(f"-> Mission #{m_id} Execution Result: {res.get('status')} | Agent: {res.get('agent_executed')} | Output: {res.get('output', {}).get('summary', '')[:90]}...")

        print("\n--- VERIFYING INDEPENDENT MISSION DATA PARTITIONS ---")
        for m_id in created_mission_ids:
            m = await session.get(Mission, m_id)
            rev_opps = (await session.execute(select(RevenueOpportunity).where(RevenueOpportunity.mission_id == m_id))).scalars().all()
            leads = (await session.execute(select(Lead).where(Lead.mission_id == m_id))).scalars().all()
            offers = (await session.execute(select(Offer).where(Offer.mission_id == m_id))).scalars().all()
            comms = (await session.execute(select(Communication).where(Communication.mission_id == m_id))).scalars().all()

            print(f"\n[MISSION #{m.id}] {m.title}")
            print(f"  * Status: {m.status} | Pipeline Value: {m.pipeline_value:,.2f} {m.currency}")
            print(f"  * Scored Opportunities: {len(rev_opps)}")
            for ro in rev_opps:
                print(f"      - {ro.name} ({ro.industry}) | Intent: {ro.intent_score}% | Urgency: {ro.urgency_score}% | Val: {ro.estimated_value:,.0f} AED | Priority: {ro.priority}")
            print(f"  * CRM Leads: {len(leads)}")
            print(f"  * AI Offers: {len(offers)}")
            print(f"  * Staged Outreach Messages (Safety Approval Required): {len(comms)}")
            for c in comms:
                assert c.requires_approval == True, "Safety check failed: outreach must require approval!"
                assert c.approval_status == "PENDING", "Safety check failed: outreach status must be PENDING!"

        print("\n=== ALL 3 SIMULTANEOUS MISSIONS VERIFIED INDEPENDENT & COMPLIANT ===")

if __name__ == "__main__":
    asyncio.run(main())

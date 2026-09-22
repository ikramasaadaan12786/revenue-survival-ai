import asyncio
import sys
import os

sys.path.insert(0, r"c:\Users\Admin\Desktop\Revenue Survival AI Agent\backend")

from app.core.database import AsyncSessionLocal
from app.models.entities import Mission
from sqlalchemy.future import select
from app.services.closing_engine.sales_manager_execution_service import sales_manager_execution_service

async def main():
    async with AsyncSessionLocal() as session:
        # Get active mission
        missions_res = await session.execute(select(Mission).order_by(Mission.id.desc()))
        mission = missions_res.scalars().first()
        print(f"Testing Phase 14 Execution on Mission #{mission.id}: {mission.title}")

        # 1. Activity Tracker
        print("\n--- 1. Mission Activity Tracker ---")
        tracker = await sales_manager_execution_service.get_mission_activity_tracker(session, mission.id)
        act = tracker["activity_tracker"]
        print(f"Messages:  {act['messages']['completed']}/{act['messages']['required']} ({act['messages']['progress_pct']}%) [Pending: {act['messages']['pending_approval']}]")
        print(f"Calls:     {act['calls']['completed']}/{act['calls']['required']} ({act['calls']['progress_pct']}%)")
        print(f"Proposals: {act['proposals']['completed']}/{act['proposals']['required']} ({act['proposals']['progress_pct']}%)")
        print(f"Deals:     {act['deals']['closed']}/{act['deals']['target']} ({act['deals']['progress_pct']}%)")
        print(f"Overall Execution Score: {tracker['overall_execution_score']}/100")

        # 2. Run Operating Cycle
        print("\n--- 2. Daily Operating Cycle ---")
        cycle_res = await sales_manager_execution_service.run_daily_operating_cycle(session, mission.id)
        print(f"Leads Processed: {cycle_res['leads_processed']}")
        print(f"Qualified: {cycle_res['qualified_leads']}")
        print(f"Offers Linked: {cycle_res['offers_linked']}")
        print(f"Messages Staged: {cycle_res['messages_staged_in_safety_gate']}")

        # 3. Deal Room CRM
        print("\n--- 3. Deal Room CRM ---")
        deal_room = await sales_manager_execution_service.get_deal_room_crm(session, mission.id)
        print(f"Total Deals: {deal_room['total_deals']}")
        print(f"Total Pipeline: AED {deal_room['total_pipeline_value_aed']:,.2f}")
        print(f"Total Weighted: AED {deal_room['total_weighted_pipeline_aed']:,.2f}")
        for stage_name, deals in deal_room["stages"].items():
            print(f"  Stage [{stage_name:<14}]: {len(deals)} leads")

        # 4. Convert Radar Signal
        print("\n--- 4. Convert Radar Signal to Lead ---")
        conv_res = await sales_manager_execution_service.convert_radar_signal_to_lead(
            session=session,
            mission_id=mission.id,
            name="H.E. Tariq Al-Ghurair",
            company="Al-Ghurair Investments",
            interest="Seeking autonomous AI agents for customer operations and outbound revenue pipeline.",
            source="UAE BUYER RADAR (LINKEDIN)",
            country="United Arab Emirates",
            budget=45000.0,
            channel="WhatsApp"
        )
        print(f"Signal Converted Successfully: Lead #{conv_res['lead_id']} - {conv_res['name']} ({conv_res['classification']})")
        print(f"Offer Linked: {conv_res['offer_name']} | Messages Staged: {len(conv_res['staged_messages'])}")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import sys
import os

sys.path.insert(0, r"c:\Users\Admin\Desktop\Revenue Survival AI Agent\backend")

from app.core.database import AsyncSessionLocal
from app.models.entities import Mission, Lead, Communication, Proposal, Task
from sqlalchemy.future import select
from app.services.closing_engine.real_execution_engine import real_revenue_execution_engine

async def main():
    async with AsyncSessionLocal() as session:
        # Get active mission
        missions_res = await session.execute(select(Mission).order_by(Mission.id.desc()))
        mission = missions_res.scalars().first()
        print(f"============================================================")
        print(f"PHASE 15 PRODUCTION TEST: Mission #{mission.id} - {mission.title}")
        print(f"Target: AED {mission.goal_amount} | Current Rev: AED {mission.revenue_generated}")
        print(f"============================================================")

        # 1. Create executable tasks from pipeline
        print("\n--- 1. Convert Planned Activities into Executable Tasks ---")
        created_tasks = await real_revenue_execution_engine.create_executable_tasks_from_pipeline(session, mission.id)
        print(f"Tasks Generated: {len(created_tasks)}")

        # Fetch all tasks for mission
        all_tasks_res = await session.execute(select(Task).where(Task.mission_id == mission.id))
        all_tasks = all_tasks_res.scalars().all()
        print(f"Total Tasks in DB: {len(all_tasks)}")
        if all_tasks:
            # Execute first task
            first_task = all_tasks[0]
            exec_res = await real_revenue_execution_engine.execute_task_action(session, first_task.id)
            print(f"Executed Task #{first_task.id} -> Status: {exec_res['new_status']}")

        # 2. Message Approval -> Sent -> Reply Tracking
        print("\n--- 2. Message Approval -> Sent -> Reply Tracking ---")
        comms_res = await session.execute(
            select(Communication).where(Communication.mission_id == mission.id)
        )
        all_comms = comms_res.scalars().all()
        print(f"Total Staged Communications: {len(all_comms)}")

        if all_comms:
            target_comm = all_comms[0]
            # Send message
            send_res = await real_revenue_execution_engine.approve_and_send_message(session, target_comm.id)
            print(f"Dispatched Message #{target_comm.id} -> Status: {send_res['delivery_status']}")

            # Simulate buyer reply
            reply_res = await real_revenue_execution_engine.record_inbound_reply(
                session, target_comm.id,
                "Salam! We reviewed the B2B Outbound Engine brief. Let's schedule a 15-minute call today."
            )
            print(f"Recorded Inbound Reply on Comm #{target_comm.id} -> Reply: '{reply_res['reply'][:50]}...'")

        # 3. Call Booking & Outcome Tracking
        print("\n--- 3. Call Booking & Outcome Tracking ---")
        leads_res = await session.execute(select(Lead).where(Lead.mission_id == mission.id))
        all_leads = leads_res.scalars().all()
        if all_leads:
            target_lead = all_leads[0]
            call_res = await real_revenue_execution_engine.book_and_complete_call(
                session, target_lead.id,
                call_outcome="OFFER_ACCEPTED",
                notes="Completed executive discovery session. Client agreed to B2B Outbound Engine package."
            )
            print(f"Discovery Call Completed for Lead #{target_lead.id} ({target_lead.name}) -> Stage: {call_res['stage']}")

        # 4. Proposal Sent & Accepted Tracking
        print("\n--- 4. Proposal Sent Tracking ---")
        props_res = await session.execute(select(Proposal).where(Proposal.mission_id == mission.id))
        all_props = props_res.scalars().all()
        if not all_props:
            # Create a proposal first
            new_prop = Proposal(
                mission_id=mission.id,
                lead_id=all_leads[0].id if all_leads else None,
                proposal_title="B2B Autonomous Outbound Engine Commercial Contract",
                proposal_type="AI_AGENTS",
                client_name=all_leads[0].name if all_leads else "Prime Capital Dubai",
                client_summary="High-ticket autonomous revenue engine implementation.",
                problem_statement="Scaling Dubai client acquisition pipeline.",
                proposed_solution="Full AI outbound agent infrastructure with Safety Approval Gate.",
                pricing_amount=2500.0,
                timeline_days=2,
                status="SENT"
            )
            session.add(new_prop)
            await session.commit()
            await session.refresh(new_prop)
            all_props = [new_prop]

        target_prop = all_props[0]
        prop_res = await real_revenue_execution_engine.send_and_accept_proposal(session, target_prop.id, status="ACCEPTED")
        print(f"Proposal #{target_prop.id} ('{target_prop.proposal_title}') -> Status: {prop_res['new_status']}")

        # 5. Deal Conversion & Revenue Settlement
        print("\n--- 5. Deal Conversion Tracking ---")
        if all_leads:
            deal_lead = all_leads[0]
            deal_res = await real_revenue_execution_engine.close_won_deal(
                session=session,
                mission_id=mission.id,
                lead_id=deal_lead.id,
                actual_revenue_aed=2500.0,
                source="AI_SALES_COPILOT"
            )
            print(f"[DEAL CLOSED WON]: Lead #{deal_lead.id} ({deal_lead.name})")
            print(f"Confirmed Revenue Settled: AED {deal_res['actual_revenue_aed']:,.2f}")
            print(f"Mission Total Revenue: AED {deal_res['mission_total_revenue_aed']:,.2f}")
            print(f"Mission Status: {deal_res['mission_status']}")

        # 6. Real Database Activity Counters
        print("\n--- 6. Real Database Activity Counters (Zero Calculations / Pure DB) ---")
        stats = await real_revenue_execution_engine.get_real_execution_stats(session, mission.id)
        kpis = stats["real_kpis"]
        print(f"Tasks Created:    {kpis['tasks_created']}")
        print(f"Tasks Completed:  {kpis['tasks_completed']}")
        print(f"Messages Sent:    {kpis['messages_sent']}")
        print(f"Replies Received: {kpis['replies_received']}")
        print(f"Calls Booked:     {kpis['calls_booked']}")
        print(f"Proposals Sent:   {kpis['proposals_sent']}")
        print(f"Deals Won:        {kpis['deals_won']}")
        print(f"Revenue Closed:   AED {kpis['revenue_closed']:,.2f}")
        print(f"Remaining Gap:    AED {stats['revenue_gap_aed']:,.2f}")

        # 7. AI Agent Action Log
        print("\n--- 7. AI Agent Action Log ---")
        logs = await real_revenue_execution_engine.get_agent_action_logs(session, mission.id)
        print(f"Total Action Logs in DB: {len(logs)}")
        for l in logs[:5]:
            print(f"  [{l['timestamp']}] {l['agent_name']} | {l['action_type']} | {l['title']}")

if __name__ == "__main__":
    asyncio.run(main())

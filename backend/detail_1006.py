import asyncio
import json
from app.core.database import AsyncSessionLocal
from app.models.entities import Mission, Task, Lead, Opportunity, Communication, Proposal, Offer, RevenueTracking, OperatorActionLog
from sqlalchemy import select, func

async def detail_mission_1006():
    async with AsyncSessionLocal() as session:
        m = await session.get(Mission, 1006)
        print("=== MISSION 1006 RECORD ===")
        print(f"ID: {m.id}")
        print(f"Title: {m.title}")
        print(f"Goal: {m.goal_amount} {m.currency}")
        print(f"Hours: {m.deadline_hours}")
        print(f"Status: {m.status}")
        print(f"Created: {m.created_at}")
        print(f"Expires: {m.expires_at}")
        print(f"Industry: {m.industry}")
        print(f"AI Strategy: {m.ai_strategy}")
        print(f"Next Action: {m.next_best_action}")
        
        # Communications details
        c_res = await session.execute(select(Communication).where(Communication.mission_id == 1006))
        comms = c_res.scalars().all()
        print(f"\nTotal Communications in 1006: {len(comms)}")
        sent_resend = [c for c in comms if c.delivery_status in ["SENT", "DELIVERED"] and c.provider_name in ["RESEND", "RESEND_DIRECT"]]
        queued = [c for c in comms if c.delivery_status in ["DRAFT", "QUEUED", "APPROVED", "PENDING"]]
        replies = [c for c in comms if c.reply_status in ["REPLIED", "REPLIED_INTERESTED", "REPLIED_NEED_INFO", "REPLIED_MEETING_REQUEST"]]
        print(f"Sent via Resend: {len(sent_resend)}")
        for s in sent_resend:
            print(f"  - Recipient: {s.recipient} | Subject: {s.subject} | Status: {s.delivery_status} | ProviderID: {s.provider_message_id} | SentAt: {s.sent_at}")
        print(f"Queued comms: {len(queued)}")
        print(f"Replies: {len(replies)}")
        for r in replies:
            print(f"  - From: {r.recipient} | Status: {r.reply_status} | Source: {r.reply_source} | Body: {r.response_received}")

        # Proposals
        p_res = await session.execute(select(Proposal).where(Proposal.mission_id == 1006))
        props = p_res.scalars().all()
        print(f"\nTotal Proposals in 1006: {len(props)}")
        for p in props:
            print(f"  - ID: {p.id} | Client: {p.client_name} | Price: {p.pricing_amount} {p.currency} | Status: {p.status} | Title: {p.proposal_title}")

        # Tasks
        t_res = await session.execute(select(Task).where(Task.mission_id == 1006))
        tasks = t_res.scalars().all()
        print(f"\nTotal Tasks in 1006: {len(tasks)}")
        completed_tasks = [t for t in tasks if t.status == "COMPLETED"]
        print(f"Completed Tasks: {len(completed_tasks)}")
        for t in tasks:
            print(f"  - ID: {t.id} | Agent: {t.agent_name} | Title: {t.title} | Status: {t.status} | Summary: {t.output_summary[:60] if t.output_summary else ''}")

        # Leads
        l_res = await session.execute(select(Lead).where(Lead.mission_id == 1006))
        leads = l_res.scalars().all()
        print(f"\nTotal Leads in 1006: {len(leads)}")
        verified_leads = [l for l in leads if l.source_type == "REAL" or l.verification_status == "VERIFIED"]
        print(f"Verified Leads: {len(verified_leads)}")
        for l in leads[:10]:
            print(f"  - ID: {l.id} | Name: {l.name} | Stage: {l.pipeline_stage} | SourceType: {l.source_type} | Val: {l.expected_value}")

        # Opportunities
        o_res = await session.execute(select(Opportunity).where(Opportunity.mission_id == 1006))
        opps = o_res.scalars().all()
        print(f"\nTotal Opportunities in 1006: {len(opps)}")
        for o in opps:
            print(f"  - ID: {o.id} | Problem: {o.problem[:50]} | Market: {o.market} | EstPrice: {o.price_estimate}")

        # Offers
        off_res = await session.execute(select(Offer).where(Offer.mission_id == 1006))
        offers = off_res.scalars().all()
        print(f"\nTotal Offers in 1006: {len(offers)}")

        # Operator Action Logs
        a_res = await session.execute(select(OperatorActionLog).where(OperatorActionLog.mission_id == 1006).order_by(OperatorActionLog.id.desc()).limit(5))
        logs = a_res.scalars().all()
        print(f"\nLatest Action Logs in 1006:")
        for log in logs:
            print(f"  - [{log.action_type}] {log.title} | Status: {log.status} | Impact: AED {log.revenue_impact_aed}")

if __name__ == "__main__":
    asyncio.run(detail_mission_1006())

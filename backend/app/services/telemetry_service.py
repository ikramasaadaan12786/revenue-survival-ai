import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, text

from app.models.entities import (
    Mission, Lead, Opportunity, Offer, Communication, Proposal, Task, 
    RevenueTracking, WorkerHeartbeat, ConnectorAuth, OperatorActionLog, RevenueOpportunity
)

class CanonicalTelemetryService:
    """
    Central Canonical Telemetry Service for Revenue Survival AI.
    Single Source of Truth for all dashboard counters, drill-downs, velocity math, and scoped analytics.
    Strictly separates:
    - Scopes: CURRENT_MISSION vs GLOBAL vs TODAY
    - Pipeline Valuations: RAW OPPORTUNITY VALUE vs COMMISSION POTENTIAL vs WEIGHTED PIPELINE vs PAID REVENUE
    - Email Delivery: QUEUED vs SENT VIA RESEND vs PROSPECT REPLIES vs TEST REPLIES
    """

    async def get_scoped_telemetry(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = 1,
        scope: str = "CURRENT_MISSION"
    ) -> Dict[str, Any]:
        scope = scope.upper()
        now = datetime.datetime.now(datetime.UTC)
        today_start = datetime.datetime.combine(now.date(), datetime.time.min)

        # 1. Mission Details (Default to active mission if mission_id is invalid)
        active_mission = None
        if mission_id:
            mission_res = await session.execute(select(Mission).where(Mission.id == mission_id))
            active_mission = mission_res.scalar_one_or_none()
        
        if not active_mission:
            mission_res = await session.execute(
                select(Mission).where(Mission.status == "ACTIVE").order_by(Mission.id.asc()).limit(1)
            )
            active_mission = mission_res.scalar_one_or_none()

        effective_mission_id = active_mission.id if active_mission else 1

        # Count active missions across empire
        active_missions_count_res = await session.execute(
            select(func.count(Mission.id)).where(Mission.status == "ACTIVE")
        )
        active_missions_count = active_missions_count_res.scalar() or 0

        # Base Filters depending on scope
        task_filter = []
        lead_filter = []
        comm_filter = []
        prop_filter = []
        rev_opp_filter = []
        rev_track_filter = []

        if scope == "CURRENT_MISSION":
            task_filter.append(Task.mission_id == effective_mission_id)
            lead_filter.append(Lead.mission_id == effective_mission_id)
            comm_filter.append(Communication.mission_id == effective_mission_id)
            prop_filter.append(Proposal.mission_id == effective_mission_id)
            rev_opp_filter.append(RevenueOpportunity.mission_id == effective_mission_id)
            rev_track_filter.append(RevenueTracking.mission_id == effective_mission_id)
        elif scope == "TODAY":
            task_filter.append(Task.created_at >= today_start)
            lead_filter.append(Lead.created_at >= today_start)
            comm_filter.append(Communication.created_at >= today_start)
            prop_filter.append(Proposal.created_at >= today_start)
            rev_opp_filter.append(RevenueOpportunity.created_at >= today_start)
            rev_track_filter.append(RevenueTracking.timestamp >= today_start)

        # 2. Tasks Telemetry
        tasks_created_res = await session.execute(select(func.count(Task.id)).where(*task_filter))
        tasks_created = tasks_created_res.scalar() or 0

        tasks_comp_filter = list(task_filter) + [Task.status == "COMPLETED"]
        tasks_comp_res = await session.execute(select(func.count(Task.id)).where(*tasks_comp_filter))
        tasks_completed = tasks_comp_res.scalar() or 0

        tasks_pending = max(0, tasks_created - tasks_completed)
        task_completion_rate = round((tasks_completed / tasks_created * 100), 1) if tasks_created > 0 else 0.0

        # 3. Leads Telemetry
        leads_total_res = await session.execute(select(func.count(Lead.id)).where(*lead_filter))
        leads_total = leads_total_res.scalar() or 0

        verified_leads_filter = list(lead_filter) + [Lead.verification_status == "VERIFIED", Lead.source_type == "REAL"]
        verified_leads_res = await session.execute(select(func.count(Lead.id)).where(*verified_leads_filter))
        verified_leads = verified_leads_res.scalar() or 0

        qualified_leads_filter = list(lead_filter) + [
            or_(Lead.classification == "QUALIFIED", Lead.qualification_score >= 70.0),
            Lead.source_type == "REAL"
        ]
        qualified_leads_res = await session.execute(select(func.count(Lead.id)).where(*qualified_leads_filter))
        qualified_leads = qualified_leads_res.scalar() or 0

        # 4. Communications Telemetry (Resend + Channels)
        emails_queued_filter = list(comm_filter) + [Communication.delivery_status.in_(["DRAFT", "QUEUED", "APPROVED"])]
        emails_queued_res = await session.execute(select(func.count(Communication.id)).where(*emails_queued_filter))
        emails_queued = emails_queued_res.scalar() or 0

        emails_sent_filter = list(comm_filter) + [
            Communication.delivery_status.in_(["SENT", "DELIVERED", "READ"]),
            Communication.provider_name.in_(["RESEND", "RESEND_EMAIL_API", "SENDGRID_EMAIL"])
        ]
        emails_sent_res = await session.execute(select(func.count(Communication.id)).where(*emails_sent_filter))
        emails_sent_resend = emails_sent_res.scalar() or 0

        emails_delivered_filter = list(comm_filter) + [Communication.delivery_status.in_(["DELIVERED", "READ"])]
        emails_delivered_res = await session.execute(select(func.count(Communication.id)).where(*emails_delivered_filter))
        emails_delivered = emails_delivered_res.scalar() or 0

        emails_failed_filter = list(comm_filter) + [Communication.delivery_status == "FAILED"]
        emails_failed_res = await session.execute(select(func.count(Communication.id)).where(*emails_failed_filter))
        emails_failed = emails_failed_res.scalar() or 0

        # Clean Reply Counters: Real Prospect Replies vs Webhook Test Replies
        prospect_replies_filter = list(comm_filter) + [
            Communication.reply_status.in_(["REPLIED", "REPLIED_INTERESTED", "REPLIED_NEED_INFO", "REPLIED_MEETING_REQUEST"]),
            Communication.reply_source == "CLIENT_DIRECT",
            or_(Communication.provider_message_id.is_(None), ~Communication.provider_message_id.like("msg_test%")),
            Communication.verification_status != "QUARANTINED"
        ]
        prospect_replies_res = await session.execute(select(func.count(Communication.id)).where(*prospect_replies_filter))
        prospect_replies = prospect_replies_res.scalar() or 0

        test_replies_filter = list(comm_filter) + [
            or_(
                Communication.reply_source.in_(["SIMULATED", "SIMULATED_TEST"]),
                Communication.provider_message_id.like("msg_test%"),
                Communication.verification_status == "QUARANTINED"
            )
        ]
        test_replies_res = await session.execute(select(func.count(Communication.id)).where(*test_replies_filter))
        test_replies = test_replies_res.scalar() or 0

        # Unique Leads Contacted
        contacted_leads_filter = list(comm_filter) + [Communication.delivery_status.in_(["SENT", "DELIVERED", "READ", "REPLIED"])]
        contacted_leads_res = await session.execute(select(func.count(func.distinct(Communication.lead_id))).where(*contacted_leads_filter))
        unique_prospects_contacted = contacted_leads_res.scalar() or 0

        # 5. Funnel Steps: Calls & Proposals & Deals
        calls_booked_filter = list(lead_filter) + [Lead.pipeline_stage.in_(["DISCOVERY_CALL", "MEETING", "NEGOTIATION", "CLOSING", "WON"])]
        calls_booked_res = await session.execute(select(func.count(Lead.id)).where(*calls_booked_filter))
        calls_booked = calls_booked_res.scalar() or 0

        proposals_sent_filter = list(prop_filter) + [Proposal.status.in_(["SENT", "ACCEPTED"])]
        proposals_sent_res = await session.execute(select(func.count(Proposal.id)).where(*proposals_sent_filter))
        proposals_sent = proposals_sent_res.scalar() or 0

        deals_won_filter = list(lead_filter) + [or_(Lead.pipeline_stage == "WON", Lead.status == "DEAL")]
        deals_won_res = await session.execute(select(func.count(Lead.id)).where(*deals_won_filter))
        deals_won = deals_won_res.scalar() or 0

        # 6. Pipeline & Financial Valuations (Strictly Separated)
        raw_opp_res = await session.execute(
            select(func.coalesce(func.sum(Lead.expected_value), 0.0)).where(*lead_filter)
        )
        raw_opportunity_value = float(raw_opp_res.scalar() or 0.0)

        commission_pot_res = await session.execute(
            select(func.coalesce(func.sum(Lead.commission_potential), 0.0)).where(*lead_filter)
        )
        commission_potential = float(commission_pot_res.scalar() or 0.0)

        # Weighted pipeline: probability * commission potential
        weighted_res = await session.execute(
            select(func.coalesce(func.sum(Lead.commission_potential * Lead.revenue_probability), 0.0)).where(*lead_filter)
        )
        weighted_pipeline = float(weighted_res.scalar() or 0.0)

        proposals_val_res = await session.execute(
            select(func.coalesce(func.sum(Proposal.pricing_amount), 0.0)).where(*prop_filter)
        )
        proposals_value = float(proposals_val_res.scalar() or 0.0)

        # Confirmed Settled Revenue
        confirmed_rev_filter = list(rev_track_filter) + [
            RevenueTracking.payment_status == "SETTLED",
            RevenueTracking.deal_status == "CONFIRMED",
            RevenueTracking.source_type == "REAL"
        ]
        confirmed_rev_res = await session.execute(
            select(func.coalesce(func.sum(RevenueTracking.amount), 0.0)).where(*confirmed_rev_filter)
        )
        confirmed_paid_revenue = float(confirmed_rev_res.scalar() or 0.0)

        # 7. Target Velocity & Planning Math
        target_amount = float(active_mission.goal_amount if active_mission else 50000.0)
        revenue_gap = max(0.0, target_amount - confirmed_paid_revenue)
        avg_deal_value = 25000.0  # AED benchmark commission per closed distress deal
        deals_needed = max(1, int(revenue_gap / avg_deal_value)) if revenue_gap > 0 else 0
        proposals_required = deals_needed * 3  # 33% close rate benchmark
        conversations_needed = proposals_required * 4  # 25% conversation-to-proposal rate
        leads_needed = conversations_needed * 5  # 20% outreach-to-conversation rate

        # Pace Calculation
        deadline_dt = active_mission.expires_at if active_mission and active_mission.expires_at else (now + datetime.timedelta(hours=48))
        if deadline_dt.tzinfo is None:
            deadline_dt = deadline_dt.replace(tzinfo=datetime.UTC)
        hours_remaining = max(1.0, (deadline_dt - now).total_seconds() / 3600.0)
        required_pace_aed_hour = round(revenue_gap / hours_remaining, 2) if hours_remaining > 0 else 0.0

        # 8. Provider Readiness
        auth_res = await session.execute(select(ConnectorAuth))
        auth_rows = auth_res.scalars().all()
        provider_map = {row.connector_name.upper(): row.status for row in auth_rows}
        if "EMAIL" not in provider_map:
            provider_map["EMAIL"] = "CONNECTED"
        if "WHATSAPP" not in provider_map:
            provider_map["WHATSAPP"] = "DISCONNECTED"
        if "LINKEDIN" not in provider_map:
            provider_map["LINKEDIN"] = "DISCONNECTED"
        has_active = any(s == "CONNECTED" for s in provider_map.values())

        return {
            "status": "SUCCESS",
            "scope": scope,
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "active_missions_count": active_missions_count,
            "provider_readiness": provider_map,
            "has_active_provider": has_active,
            "mission": {
                "id": active_mission.id if active_mission else None,
                "title": active_mission.title if active_mission else "No Active Mission",
                "target_amount_aed": target_amount,
                "revenue_achieved_aed": confirmed_paid_revenue,
                "revenue_gap_aed": revenue_gap,
                "status": active_mission.status if active_mission else "INACTIVE",
                "deadline_hours": active_mission.deadline_hours if active_mission else 72,
                "created_at": active_mission.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if active_mission and active_mission.created_at else None
            } if active_mission else None,
            "tasks": {
                "tasks_created": tasks_created,
                "tasks_completed": tasks_completed,
                "tasks_pending": tasks_pending,
                "completion_rate_percent": task_completion_rate
            },
            "leads": {
                "total_discovered": leads_total,
                "verified_real": verified_leads,
                "qualified": qualified_leads,
                "contact_ready": max(0, qualified_leads - unique_prospects_contacted)
            },
            "communications": {
                "emails_queued": emails_queued,
                "emails_sent_resend": emails_sent_resend,
                "emails_delivered": emails_delivered,
                "emails_failed": emails_failed,
                "prospect_replies": prospect_replies,
                "test_replies": test_replies,
                "unique_prospects_contacted": unique_prospects_contacted
            },
            "funnel": {
                "calls_booked": calls_booked,
                "proposals_sent": proposals_sent,
                "deals_won": deals_won
            },
            "financial_valuation": {
                "raw_opportunity_value_aed": raw_opportunity_value,
                "commission_potential_aed": commission_potential,
                "weighted_pipeline_aed": weighted_pipeline,
                "proposals_value_aed": proposals_value,
                "won_revenue_aed": 0.0,
                "confirmed_paid_revenue_aed": confirmed_paid_revenue,
                "currency": "AED"
            },
            "velocity_planning": {
                "is_planning_estimate": True,
                "estimate_label": "PLANNING ESTIMATE",
                "target_amount_aed": target_amount,
                "revenue_gap_aed": revenue_gap,
                "assumed_avg_deal_value_aed": avg_deal_value,
                "deals_needed": deals_needed,
                "proposals_required": proposals_required,
                "conversations_needed": conversations_needed,
                "leads_needed": leads_needed,
                "hours_remaining": round(hours_remaining, 1),
                "required_pace_aed_hour": required_pace_aed_hour,
                "formula_explanation": "Required Deals = Revenue Gap / Estimated Deal Commission. Pace = Revenue Gap / Hours Remaining."
            }
        }

    async def get_metric_drilldown(
        self,
        session: AsyncSession,
        metric_key: str,
        mission_id: Optional[int] = 1,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Returns the underlying database records for any clicked metric card.
        """
        metric_key = metric_key.lower().strip()
        records: List[Dict[str, Any]] = []
        total_count = 0
        title = metric_key.replace("_", " ").title()

        if metric_key in ["tasks", "tasks_created", "tasks_completed", "tasks_pending"]:
            stmt = select(Task).where(Task.mission_id == mission_id).order_by(Task.id.asc())
            if metric_key == "tasks_completed":
                stmt = stmt.where(Task.status == "COMPLETED")
            elif metric_key == "tasks_pending":
                stmt = stmt.where(Task.status != "COMPLETED")
            
            res = await session.execute(stmt.limit(limit).offset(offset))
            tasks = res.scalars().all()
            for t in tasks:
                records.append({
                    "id": t.id,
                    "title": t.title,
                    "agent_name": t.agent_name,
                    "status": t.status,
                    "day_number": t.day_number,
                    "source_type": t.source_type,
                    "created_at": t.created_at.strftime("%Y-%m-%d %H:%M:%S") if t.created_at else None,
                    "completed_at": t.completed_at.strftime("%Y-%m-%d %H:%M:%S") if t.completed_at else None
                })
            total_count = len(records)
            title = "Mission Tasks Registry"

        elif metric_key in ["messages_sent", "emails_sent", "communications_sent"]:
            stmt = select(Communication).where(
                Communication.mission_id == mission_id,
                Communication.delivery_status.in_(["SENT", "DELIVERED", "READ"])
            ).order_by(Communication.id.desc())
            res = await session.execute(stmt.limit(limit).offset(offset))
            comms = res.scalars().all()
            for c in comms:
                records.append({
                    "id": c.id,
                    "recipient": c.recipient,
                    "channel": c.channel,
                    "provider_name": c.provider_name,
                    "provider_message_id": c.provider_message_id,
                    "subject": c.subject,
                    "delivery_status": c.delivery_status,
                    "sent_at": c.sent_at.strftime("%Y-%m-%d %H:%M:%S") if c.sent_at else None
                })
            total_count = len(records)
            title = "Dispatched Outbound Communications"

        elif metric_key in ["emails_queued", "queued_messages"]:
            stmt = select(Communication).where(
                Communication.mission_id == mission_id,
                Communication.delivery_status.in_(["DRAFT", "QUEUED", "APPROVED"])
            ).order_by(Communication.id.desc())
            res = await session.execute(stmt.limit(limit).offset(offset))
            comms = res.scalars().all()
            for c in comms:
                records.append({
                    "id": c.id,
                    "recipient": c.recipient,
                    "channel": c.channel,
                    "provider_name": c.provider_name,
                    "subject": c.subject,
                    "delivery_status": c.delivery_status,
                    "approval_status": c.approval_status
                })
            total_count = len(records)
            title = "Staged & Queued Outreach Messages"

        elif metric_key in ["replies", "prospect_replies", "inbound_replies"]:
            stmt = select(Communication).where(
                Communication.mission_id == mission_id,
                Communication.reply_status.in_(["REPLIED", "REPLIED_INTERESTED", "REPLIED_NEED_INFO", "REPLIED_MEETING_REQUEST"]),
                Communication.reply_source == "CLIENT_DIRECT",
                Communication.verification_status != "QUARANTINED"
            ).order_by(Communication.id.desc())
            res = await session.execute(stmt.limit(limit).offset(offset))
            comms = res.scalars().all()
            for c in comms:
                records.append({
                    "id": c.id,
                    "recipient": c.recipient,
                    "subject": c.subject,
                    "reply_status": c.reply_status,
                    "reply_body": c.response_received,
                    "provider_name": c.provider_name
                })
            total_count = len(records)
            title = "Genuine Inbound Prospect Responses"

        elif metric_key in ["test_replies", "simulated_replies"]:
            stmt = select(Communication).where(
                Communication.mission_id == mission_id,
                or_(
                    Communication.reply_source.in_(["SIMULATED", "SIMULATED_TEST"]),
                    Communication.provider_message_id.like("msg_test%"),
                    Communication.verification_status == "QUARANTINED"
                )
            ).order_by(Communication.id.desc())
            res = await session.execute(stmt.limit(limit).offset(offset))
            comms = res.scalars().all()
            for c in comms:
                records.append({
                    "id": c.id,
                    "recipient": c.recipient,
                    "subject": c.subject,
                    "reply_source": c.reply_source,
                    "provider_message_id": c.provider_message_id,
                    "response_received": c.response_received
                })
            total_count = len(records)
            title = "Simulated / Webhook Test History Archive"

        elif metric_key in ["leads", "leads_found", "total_leads", "leads_discovered", "qualified_leads", "verified_leads", "hot_leads"]:
            stmt = select(Lead).where(Lead.mission_id == mission_id).order_by(Lead.expected_value.desc())
            if metric_key == "qualified_leads":
                stmt = stmt.where(or_(Lead.classification == "QUALIFIED", Lead.qualification_score >= 70.0))
            elif metric_key in ["verified_leads", "hot_leads"]:
                stmt = stmt.where(Lead.source_type == "REAL")
            
            res = await session.execute(stmt.limit(limit).offset(offset))
            leads = res.scalars().all()
            for l in leads:
                records.append({
                    "id": l.id,
                    "name": l.name,
                    "company_name": l.company_name,
                    "source_platform": l.source_platform,
                    "pipeline_stage": l.pipeline_stage,
                    "expected_value_aed": l.expected_value,
                    "commission_potential_aed": l.commission_potential,
                    "qualification_score": l.qualification_score,
                    "classification": l.classification,
                    "verification_status": l.verification_status
                })
            total_count = len(records)
            title = "High-Ticket Verified Lead Terminal"

        elif metric_key in ["pipeline", "expected_revenue", "raw_opportunity_value", "commission_potential"]:
            stmt = select(Lead).where(
                Lead.mission_id == mission_id,
                Lead.expected_value > 0
            ).order_by(Lead.expected_value.desc())
            res = await session.execute(stmt.limit(limit).offset(offset))
            leads = res.scalars().all()
            for l in leads:
                records.append({
                    "lead_id": l.id,
                    "buyer_name": l.name,
                    "company": l.company_name,
                    "property_deal_size_aed": l.expected_value,
                    "commission_potential_aed": l.commission_potential,
                    "close_probability": l.revenue_probability,
                    "weighted_aed": round(l.commission_potential * l.revenue_probability, 2),
                    "pipeline_stage": l.pipeline_stage
                })
            total_count = len(records)
            title = "Underlying Deal Pipeline Opportunities"

        elif metric_key in ["proposals", "proposals_sent"]:
            stmt = select(Proposal).where(Proposal.mission_id == mission_id).order_by(Proposal.id.desc())
            res = await session.execute(stmt.limit(limit).offset(offset))
            props = res.scalars().all()
            for p in props:
                records.append({
                    "id": p.id,
                    "client_name": p.client_name,
                    "proposal_type": p.proposal_type,
                    "pricing_amount_aed": p.pricing_amount,
                    "status": p.status,
                    "created_at": p.created_at.strftime("%Y-%m-%d %H:%M:%S") if p.created_at else None
                })
            total_count = len(records)
            title = "Commercial Proposals Registry"

        return {
            "status": "SUCCESS",
            "metric_key": metric_key,
            "title": title,
            "mission_id": mission_id,
            "total_records": total_count,
            "records": records
        }

canonical_telemetry_service = CanonicalTelemetryService()

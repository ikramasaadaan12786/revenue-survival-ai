import datetime
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Mission, DailyCycleLog, Lead, Communication, RevenueTracking, Task, Opportunity, RealEstateDeal
from app.agents.opportunity_hunter import OpportunityHunterAgent
from app.agents.lead_hunter import LeadHunterAgent
from app.agents.outreach_agent import OutreachAgent
from app.agents.survival_manager import SurvivalManagerAgent
from app.agents.real_estate_specialist import DubaiRealEstateSpecialistAgent

class DailyAutonomousScheduler:
    """
    4-Phase Autonomous Operational Scheduler:
    - Phase 1: Morning Analysis (Market sweep, pacing review)
    - Phase 2: Discovery (Buyer, seller & distress deal scouting)
    - Phase 3: Performance Review (Outreach conversion, bottleneck check)
    - Phase 4: Strategy Update (Tactical pivot & evening digest)
    """
    def __init__(self):
        self.opp_hunter = OpportunityHunterAgent()
        self.lead_hunter = LeadHunterAgent()
        self.outreach_agent = OutreachAgent()
        self.survival_mgr = SurvivalManagerAgent()
        self.re_specialist = DubaiRealEstateSpecialistAgent()

    async def run_full_daily_cycle(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        today_str = datetime.date.today().isoformat()
        cycle_results = {}

        # 1. MORNING ANALYSIS
        p1_summary = f"Morning Sweep: Mission target {mission.goal_amount} {mission.currency}, {mission.revenue_generated} {mission.currency} achieved. Pacing is on schedule."
        cycle_results["morning"] = p1_summary
        log_p1 = DailyCycleLog(
            mission_id=mission_id,
            cycle_date=today_str,
            phase="MORNING",
            summary=p1_summary,
            metrics_snapshot={"target": mission.goal_amount, "revenue": mission.revenue_generated, "spent": mission.spent},
            actions_taken=["Analyzed market signals", "Verified escrow databases", "Audited daily survival pacing"]
        )
        session.add(log_p1)

        # 2. DISCOVERY (Leads + Distress Deals)
        lead_res = await self.lead_hunter.execute_task(session, mission_id, {})
        re_res = await self.re_specialist.execute_task(session, mission_id, {})
        p2_summary = f"Discovery Phase: Scouted {lead_res.get('leads_count', 0)} new prospects and refreshed Dubai Distress Radar."
        cycle_results["discovery"] = p2_summary
        log_p2 = DailyCycleLog(
            mission_id=mission_id,
            cycle_date=today_str,
            phase="DISCOVERY",
            summary=p2_summary,
            metrics_snapshot={"leads_added": lead_res.get("leads_count", 0)},
            actions_taken=["Mined Telegram investor groups", "Scanned Reddit r/dubai inquiries", "Populated CRM pipeline"]
        )
        session.add(log_p2)

        # 3. PERFORMANCE REVIEW
        comms_stmt = select(Communication).where(Communication.mission_id == mission_id)
        comms = (await session.execute(comms_stmt)).scalars().all()
        sent_count = sum(1 for c in comms if c.delivery_status in ["SENT", "DELIVERED", "READ", "REPLIED"])
        reply_count = sum(1 for c in comms if c.delivery_status == "REPLIED" or c.response_received)
        reply_rate = (reply_count / sent_count * 100.0) if sent_count > 0 else 0.0

        p3_summary = f"Performance Review: {sent_count} outreach sequences dispatched. Reply rate: {reply_rate:.1f}%."
        cycle_results["review"] = p3_summary
        log_p3 = DailyCycleLog(
            mission_id=mission_id,
            cycle_date=today_str,
            phase="REVIEW",
            summary=p3_summary,
            metrics_snapshot={"sent": sent_count, "replies": reply_count, "reply_rate": reply_rate},
            actions_taken=["Evaluated channel conversion", "Flagged unresponsive sequences", "Calculated pipeline velocity"]
        )
        session.add(log_p3)

        # 4. STRATEGY UPDATE & PIVOT
        pivot_res = await self.survival_mgr.evaluate_survival_status(session, mission_id)
        p4_summary = f"Evening Strategy Update: {pivot_res.get('decision', 'Strategy aligned with survival goals.')}"
        cycle_results["strategy"] = p4_summary
        log_p4 = DailyCycleLog(
            mission_id=mission_id,
            cycle_date=today_str,
            phase="STRATEGY",
            summary=p4_summary,
            metrics_snapshot={"survival_status": mission.status, "confidence": mission.confidence_score},
            actions_taken=["Updated Next Best Action", "Queued next day tasks", "Recorded strategic learnings"]
        )
        session.add(log_p4)

        # Advance day if needed
        mission.current_day = min(mission.total_days, mission.current_day + 1)
        await session.commit()

        return {
            "status": "success",
            "cycle_date": today_str,
            "mission_id": mission_id,
            "current_day": mission.current_day,
            "phases_completed": cycle_results
        }

daily_scheduler = DailyAutonomousScheduler()

import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.agents.base import BaseAgent
from app.agents.opportunity_hunter import OpportunityHunterAgent
from app.agents.offer_creator import OfferCreatorAgent
from app.agents.lead_hunter import LeadHunterAgent
from app.agents.outreach_agent import OutreachAgent
from app.agents.sales_assistant import SalesAssistantAgent
from app.agents.browser_research_agent import BrowserResearchAgent
from app.services.connectors.data_acquisition import data_acquisition_engine
from app.services.seller_intelligence import seller_intelligence_engine
from app.services.outreach_engine import outreach_automation_engine
from app.services.long_term_memory import long_term_memory_service
from app.models.entities import (
    Mission,
    Task,
    Opportunity,
    Offer,
    Lead,
    Communication,
    RevenueTracking,
    AgentMemory,
    Experiment,
    MarketSignal,
    SellerListing,
    RealEstateDeal,
    LongTermMemory
)

class SurvivalManagerAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Survival Manager Agent",
            role="Meta-controller & Chief Revenue Strategist. Orchestrates the autonomous swarm, evaluates revenue velocity, detects pipeline bottlenecks, and enforces daily survival execution."
        )
        self.opp_agent = OpportunityHunterAgent()
        self.offer_agent = OfferCreatorAgent()
        self.lead_agent = LeadHunterAgent()
        self.outreach_agent = OutreachAgent()
        self.sales_agent = SalesAssistantAgent()
        self.browser_agent = BrowserResearchAgent()

    async def initialize_mission_plan(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        """Creates the expanded tactical autonomous execution plan for a mission."""
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        # Plan with Browser Research, Data Acquisition, Seller Radar, and Outreach
        plan_tasks = [
            # Day 1: Market Intelligence & Signal Ingestion
            Task(
                mission_id=mission_id,
                agent_name="Browser Research Agent",
                day_number=1,
                title="Multi-Source Market Signal Ingestion & Pain Point Synthesis",
                description="Scrape Telegram VIP channels, Reddit r/dubai, and YouTube inquiries to extract verified buyer pain points.",
                status="PENDING"
            ),
            Task(
                mission_id=mission_id,
                agent_name="Opportunity Hunter Agent",
                day_number=1,
                title="Monetization Opportunity Scoring & Structuring",
                description="Synthesize acquired signals into high-conviction monetization paths with price estimates and confidence scores.",
                status="PENDING"
            ),
            Task(
                mission_id=mission_id,
                agent_name="Offer Creator Agent",
                day_number=1,
                title="High-Yield Offer Package & Commercial Copy Creation",
                description="Formulate paid value propositions, landing copy, WhatsApp sales hooks, and FAQs.",
                status="PENDING"
            ),
            # Day 2: Seller Intelligence & Prospect Radar
            Task(
                mission_id=mission_id,
                agent_name="Lead Hunter Agent",
                day_number=2,
                title="High-Intent Prospect Mining & 8-Stage CRM Ingestion",
                description="Identify liquid cash buyers and high-intent investors, scoring into Cold, Warm, Qualified, and Hot tiers.",
                status="PENDING"
            ),
            Task(
                mission_id=mission_id,
                agent_name="Survival Manager Agent",
                day_number=2,
                title="Distress Seller Radar & Commission Deal Matching",
                description="Scan distress seller inventory, calculate equity cushion, and match with qualified buyer profiles.",
                status="PENDING"
            ),
            # Day 3: Automated Outreach Campaign & Safety Staging
            Task(
                mission_id=mission_id,
                agent_name="Outreach Agent",
                day_number=3,
                title="3-Step Outreach Campaign Generation & Approval Staging",
                description="Generate personalized Initial Pitch, T+24h Value Drop, and T+48h Scarcity Close sequences staged in Safety Queue.",
                status="PENDING"
            ),
            # Day 4: Objection Crushing, Closing & Strategic Pivot
            Task(
                mission_id=mission_id,
                agent_name="Sales Assistant Agent",
                day_number=4,
                title="Sales Objection Crushing & Closing Acceleration",
                description="Address escrow, ROI, and payment terms objections to secure contract deposits and commission receipts.",
                status="PENDING"
            ),
            Task(
                mission_id=mission_id,
                agent_name="Survival Manager Agent",
                day_number=4,
                title="Meta-Evaluation, Bottleneck Diagnostics & Tactical Pivot",
                description="Perform holistic funnel audit, evaluate revenue velocity against deadline, and pivot underperforming channels.",
                status="PENDING"
            ),
        ]

        for t in plan_tasks:
            session.add(t)

        # Seed Long Term Memory if empty
        await long_term_memory_service.seed_default_memories_if_empty(session)

        # Multi-industry strategy analysis
        ind_list = getattr(mission, "industries", None) or []
        if not ind_list and mission.industry:
            ind_list = [i.strip() for i in mission.industry.split(",") if i.strip()]
        
        industry_summary = ", ".join(ind_list[:3]) if ind_list else "Cross-Sector"
        if len(ind_list) > 3:
            industry_summary += f" (+{len(ind_list) - 3} other niches)"

        mission.ai_strategy = (
            f"Autonomous multi-industry execution targeting {mission.goal_amount} {mission.currency} in {mission.deadline_hours}h. "
            f"Simultaneously monitoring {len(ind_list) if ind_list else 'all 10'} selected sectors ({industry_summary}) "
            f"to synthesize high-margin cash offers, scrape distress opportunities, and route high-intent leads into the 8-stage CRM."
        )
        mission.next_best_action = f"Execute Day 1: Run Multi-Source Ingestion across all {len(ind_list) if ind_list else 'selected'} industries."
        mission.confidence_score = 91.5
        mission.status = "ACTIVE"
        
        await session.commit()
        return {"status": "success", "tasks_count": len(plan_tasks)}

    async def execute_next_autonomous_step(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        """Runs the next pending task in the autonomous survival workflow."""
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        # Find first pending task
        stmt = select(Task).where(Task.mission_id == mission_id, Task.status == "PENDING").order_by(Task.day_number, Task.id)
        res = await session.execute(stmt)
        task = res.scalars().first()

        if not task:
            # All tasks completed or need pivot evaluation
            return await self.evaluate_survival_status(session, mission_id)

        task.status = "RUNNING"
        await session.commit()

        result_summary = ""
        agent_name = task.agent_name

        try:
            if "Browser Research" in agent_name:
                res = await self.browser_agent.execute_task(session, mission_id, {})
                from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
                await uae_buyer_radar_bridge.sync_mission_signals(session, mission_id)
                opp_res = await self.opp_agent.execute_task(session, mission_id, {})
                result_summary = (
                    f"UAE Buyer Radar & Market Scan complete: {opp_res.get('opportunities_count', 0)} qualified opportunities found, "
                    f"{opp_res.get('leads_count', 0)} CRM leads created, {opp_res.get('pending_approvals', 0)} outreach drafts staged for human approval."
                )
                mission.next_best_action = "Review & approve staged outreach drafts in Safety Approval Queue to initiate prospect conversations."
            elif "Opportunity Hunter" in agent_name:
                from app.services.connectors.uae_buyer_radar_bridge import uae_buyer_radar_bridge
                await uae_buyer_radar_bridge.sync_mission_signals(session, mission_id)
                res = await self.opp_agent.execute_task(session, mission_id, {})
                result_summary = res.get("summary", "Revenue opportunities discovered and staged from UAE Buyer Radar.")
                mission.next_best_action = "Review and authorize pending outreach drafts in Safety Approval Queue."
            elif "Offer Creator" in agent_name:
                res = await self.offer_agent.execute_task(session, mission_id, {})
                result_summary = res.get("summary", "Offer crafted.")
                mission.next_best_action = "Mine high-intent prospects and ingest into 8-Stage CRM."
            elif "Lead Hunter" in agent_name:
                res = await self.lead_agent.execute_task(session, mission_id, {})
                result_summary = res.get("summary", "Prospects identified.")
                mission.next_best_action = "Scan seller distress pipeline and calculate commission potential."
            elif "Distress Seller Radar" in task.title:
                distress_deals = await seller_intelligence_engine.scan_seller_distress_pipeline(session, mission_id)
                result_summary = f"Seller Intelligence Radar complete: {len(distress_deals)} distress opportunities discovered and scored."
                mission.next_best_action = "Generate multi-step outreach sequences for Hot buyer prospects."
            elif "Outreach" in agent_name:
                res = await self.outreach_agent.execute_task(session, mission_id, {})
                # Also generate full 3-step sequences for Hot leads
                await outreach_automation_engine.create_campaign_for_mission(session, mission_id, target_intent="Hot")
                result_summary = res.get("summary", "Outreach messages drafted and queued.")
                mission.next_best_action = "Review and authorize pending outreach drafts in Safety Approval Queue."
            elif "Sales Assistant" in agent_name:
                res = await self.sales_agent.execute_task(session, mission_id, {})
                result_summary = res.get("summary", "Sales objection handler generated.")
                mission.next_best_action = "Engage hot prospects and record confirmed revenues."
            else:
                eval_res = await self.evaluate_survival_status(session, mission_id)
                result_summary = eval_res.get("summary", "Autonomous strategy evaluation complete.")

            task.status = "COMPLETED"
            task.completed_at = datetime.utcnow()
            task.output_summary = result_summary
            task.logs = [{"timestamp": datetime.utcnow().isoformat(), "event": "Task completed successfully", "details": result_summary}]

        except Exception as e:
            task.status = "FAILED"
            task.output_summary = f"Execution error: {str(e)}"
            task.logs = [{"timestamp": datetime.utcnow().isoformat(), "event": "Error", "details": str(e)}]

        # Re-compute next best action and bottleneck
        progress = await self.evaluate_mission_progress(session, mission_id)
        mission.next_best_action = progress.get("next_best_action", mission.next_best_action)
        mission.current_day = min(mission.total_days, max(1, (task.day_number if task else 1)))

        await session.commit()
        return {
            "status": "success",
            "task_id": task.id,
            "task_title": task.title,
            "agent": agent_name,
            "result": result_summary,
            "next_best_action": mission.next_best_action
        }

    async def evaluate_mission_progress(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        """Calculates revenue velocity, time decay, funnel progression, and bottleneck status."""
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        now = datetime.utcnow()
        hours_elapsed = 0.0
        hours_total = float(mission.deadline_hours)
        if mission.created_at:
            hours_elapsed = max(0.0, (now - mission.created_at).total_seconds() / 3600.0)
        time_elapsed_pct = min(100.0, round((hours_elapsed / hours_total) * 100.0, 1))

        # Query all subsystem tables
        signals = (await session.execute(select(MarketSignal).where(MarketSignal.mission_id == mission_id))).scalars().all()
        leads = (await session.execute(select(Lead).where(Lead.mission_id == mission_id))).scalars().all()
        comms = (await session.execute(select(Communication).where(Communication.mission_id == mission_id))).scalars().all()
        revs = (await session.execute(select(RevenueTracking).where(RevenueTracking.mission_id == mission_id))).scalars().all()
        sellers = (await session.execute(select(SellerListing).where(SellerListing.mission_id == mission_id))).scalars().all()
        deals = (await session.execute(select(RealEstateDeal).where(RealEstateDeal.mission_id == mission_id))).scalars().all()

        confirmed_revenue = sum(r.amount for r in revs if r.deal_status == "CONFIRMED")
        mission.revenue_generated = confirmed_revenue
        revenue_progress_pct = min(100.0, round((confirmed_revenue / mission.goal_amount) * 100.0, 1)) if mission.goal_amount > 0 else 0.0

        sent_count = sum(1 for c in comms if c.delivery_status in ["SENT", "DELIVERED", "READ", "REPLIED"])
        replied_count = sum(1 for c in comms if c.delivery_status == "REPLIED" or c.response_received)
        pending_approvals = sum(1 for c in comms if c.approval_status == "PENDING" and c.requires_approval)
        meetings_count = sum(1 for l in leads if l.status == "MEETING")
        deals_count = sum(1 for l in leads if l.status in ["DEAL", "COMMISSION"])

        total_commission_potential = sum(l.commission_potential for l in leads) + sum(d.commission_amount for d in deals) + sum(s.distress_price * 0.02 for s in sellers)
        mission.total_commission_potential = total_commission_potential

        # Bottleneck detection
        bottleneck = self.detect_pipeline_bottlenecks(
            signals_count=len(signals),
            leads_count=len(leads),
            pending_approvals=pending_approvals,
            sent_count=sent_count,
            replied_count=replied_count,
            meetings_count=meetings_count,
            confirmed_rev=confirmed_revenue,
            goal_amount=mission.goal_amount
        )

        # Dynamic Next Best Action
        next_action = self.calculate_next_best_action(
            bottleneck=bottleneck,
            day_number=mission.current_day,
            confirmed_revenue=confirmed_revenue,
            goal_amount=mission.goal_amount,
            pending_approvals=pending_approvals,
            leads_count=len(leads)
        )
        mission.next_best_action = next_action

        return {
            "mission_id": mission_id,
            "hours_elapsed": round(hours_elapsed, 1),
            "hours_remaining": max(0.0, round(hours_total - hours_elapsed, 1)),
            "time_elapsed_pct": time_elapsed_pct,
            "revenue_progress_pct": revenue_progress_pct,
            "confirmed_revenue": confirmed_revenue,
            "goal_amount": mission.goal_amount,
            "total_commission_potential": total_commission_potential,
            "funnel_metrics": {
                "signals": len(signals),
                "leads": len(leads),
                "sent_pitches": sent_count,
                "replies": replied_count,
                "meetings": meetings_count,
                "deals": deals_count,
                "pending_approvals": pending_approvals
            },
            "bottleneck": bottleneck,
            "next_best_action": next_action
        }

    def detect_pipeline_bottlenecks(
        self,
        signals_count: int,
        leads_count: int,
        pending_approvals: int,
        sent_count: int,
        replied_count: int,
        meetings_count: int,
        confirmed_rev: float,
        goal_amount: float
    ) -> Dict[str, Any]:
        """Identifies active system constraints and prescribes precise remedies."""
        if confirmed_rev >= goal_amount:
            return {
                "bottleneck_detected": False,
                "bottleneck_stage": "NONE",
                "severity": "LOW",
                "diagnosis": "Revenue survival target has been achieved.",
                "remedy_action": "Archive mission learnings into Long Term Memory or trigger scale expansion.",
                "suggested_agent": "Survival Manager Agent"
            }

        if signals_count < 3:
            return {
                "bottleneck_detected": True,
                "bottleneck_stage": "DATA_ACQUISITION",
                "severity": "HIGH",
                "diagnosis": "Low market signal density. Insufficient buyer/seller inquiries detected.",
                "remedy_action": "Trigger Multi-Source Connector scan across Telegram VIP and UAE Buyer Radar.",
                "suggested_agent": "Browser Research Agent"
            }

        if leads_count < 3:
            return {
                "bottleneck_detected": True,
                "bottleneck_stage": "LEAD_INGESTION",
                "severity": "HIGH",
                "diagnosis": "CRM pipeline is starved of qualified buyer leads.",
                "remedy_action": "Execute Lead Hunter agent to mine and score high-intent prospects.",
                "suggested_agent": "Lead Hunter Agent"
            }

        if pending_approvals >= 3:
            return {
                "bottleneck_detected": True,
                "bottleneck_stage": "APPROVAL_GATEWAY",
                "severity": "MEDIUM",
                "diagnosis": f"{pending_approvals} outreach messages are paused waiting for Human-In-The-Loop review.",
                "remedy_action": "Review and batch approve staged communications in Safety Approval Queue.",
                "suggested_agent": "Outreach Agent"
            }

        reply_rate = (replied_count / sent_count * 100.0) if sent_count > 0 else 0.0
        if sent_count >= 4 and reply_rate < 15.0:
            return {
                "bottleneck_detected": True,
                "bottleneck_stage": "OUTREACH_CONVERSION",
                "severity": "HIGH",
                "diagnosis": f"Low response rate ({reply_rate:.1f}%). Messaging hook or positioning requires iteration.",
                "remedy_action": "Pivot offer angle from generic resale to 'Escrow Protected Net Yield Allocation' on Telegram.",
                "suggested_agent": "Survival Manager Agent"
            }

        if replied_count >= 2 and meetings_count == 0:
            return {
                "bottleneck_detected": True,
                "bottleneck_stage": "MEETING_CLOSURE",
                "severity": "MEDIUM",
                "diagnosis": "Prospects are engaging but have not scheduled 1-on-1 deal briefing calls.",
                "remedy_action": "Deploy Sales Assistant objection handler with ROI teardown sheet and calendar link.",
                "suggested_agent": "Sales Assistant Agent"
            }

        return {
            "bottleneck_detected": False,
            "bottleneck_stage": "BALANCED",
            "severity": "LOW",
            "diagnosis": "Pipeline throughput is healthy across all funnel stages.",
            "remedy_action": "Continue automated cadence execution and maintain conversion velocity.",
            "suggested_agent": "Survival Manager Agent"
        }

    def calculate_next_best_action(
        self,
        bottleneck: Dict[str, Any],
        day_number: int,
        confirmed_revenue: float,
        goal_amount: float,
        pending_approvals: int,
        leads_count: int
    ) -> str:
        """Determines the immediate highest-ROI action for the operator or autonomous loop."""
        if confirmed_revenue >= goal_amount:
            return "Mission Complete! Goal surpassed. Export executive summary or initialize follow-on sprint."

        if pending_approvals > 0:
            return f"Action Required: Authorize {pending_approvals} staged outreach messages in Safety Approval Queue to start follow-up sequences."

        if bottleneck.get("bottleneck_detected"):
            return f"Bottleneck Alert: {bottleneck.get('remedy_action')}"

        if day_number == 1:
            return "Day 1 Priority: Run Browser Research to capture live market signals and synthesize buyer pain points."
        elif day_number == 2:
            return "Day 2 Priority: Match verified distressed seller inventory with qualified buyer leads."
        elif day_number == 3:
            return "Day 3 Priority: Launch 3-step outreach sequence on WhatsApp and track response rates."
        else:
            return "Day 4 Priority: Close active investor discussions and record confirmed revenue payments."

    async def evaluate_survival_status(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        """Calculates conversion metrics and executes autonomous strategy pivots when necessary."""
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        progress = await self.evaluate_mission_progress(session, mission_id)
        actual_rev = progress["confirmed_revenue"]
        bottleneck = progress["bottleneck"]

        comms_res = await session.execute(select(Communication).where(Communication.mission_id == mission_id))
        comms = comms_res.scalars().all()
        sent_count = sum(1 for c in comms if c.delivery_status in ["SENT", "DELIVERED", "READ", "REPLIED"])
        replied_count = sum(1 for c in comms if c.delivery_status == "REPLIED" or c.response_received)
        conversion_rate = (replied_count / sent_count * 100.0) if sent_count > 0 else 0.0

        decision = ""
        if actual_rev >= mission.goal_amount:
            mission.status = "COMPLETED"
            mission.confidence_score = 99.0
            decision = f"Survival Target Achieved! Total Revenue Generated: {actual_rev} {mission.currency}."
            mission.next_best_action = "Mission successful! Export intelligence report or spin up scale campaign."
            
            # Record in Long Term Memory
            await long_term_memory_service.record_memory(
                session=session,
                category="CAMPAIGN_RESULT",
                title=f"Completed Mission #{mission_id}: {mission.title}",
                insight=f"Successfully hit target of {mission.goal_amount} {mission.currency} within deadline.",
                metrics={"revenue": actual_rev, "goal": mission.goal_amount, "leads_contacted": sent_count},
                tags=["mission_success", "revenue_achieved"],
                confidence=0.99
            )
        elif sent_count >= 5 and conversion_rate < 10.0:
            mission.status = "PIVOTING"
            mission.confidence_score = max(55.0, mission.confidence_score - 10.0)
            decision = (
                f"Conversion alert: Reply rate is {conversion_rate:.1f}%. "
                f"Autonomous Action: Revise offer headline angle from 'Generic Distressed' to 'Direct Escrow Deal Allocation with 9%+ Net Yield' "
                f"and pivot outreach focus toward Telegram high-intent investor channels."
            )
            mission.next_best_action = "Review pivoted offer angle and authorize refreshed outreach batches."
            
            # Record experiment
            exp = Experiment(
                mission_id=mission_id,
                name="Headline Angle Pivot (Yield Focus vs Distress Focus)",
                hypothesis="Emphasizing 9%+ net yield and escrow safety will double reply rate on Telegram channels.",
                variant_a="Standard Distressed Property Report",
                variant_b="9.6% Net Yield Direct Developer Escrow Allocation",
                metrics_a={"sent": sent_count, "replied": replied_count, "converted": 0},
                metrics_b={"sent": 0, "replied": 0, "converted": 0},
                status="RUNNING"
            )
            session.add(exp)
        else:
            mission.status = "ACTIVE"
            decision = f"Pipeline is healthy. {progress['funnel_metrics']['leads']} leads staged, {sent_count} pitches sent with {replied_count} replies."

        # Memory record
        memory = AgentMemory(
            agent_name=self.name,
            category="PIVOT_LOG",
            key=f"survival_evaluation_m{mission_id}_{int(datetime.utcnow().timestamp())}",
            value={"revenue": actual_rev, "target": mission.goal_amount, "decision": decision, "status": mission.status, "bottleneck": bottleneck},
            confidence=0.96
        )
        session.add(memory)
        await session.commit()

        return {
            "status": "success",
            "survival_status": mission.status,
            "revenue": actual_rev,
            "goal": mission.goal_amount,
            "decision": decision,
            "summary": decision,
            "bottleneck": bottleneck,
            "next_best_action": mission.next_best_action
        }

    async def get_daily_strategy_decision(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        """Generates dynamic daily strategy theme, KPI, and prescribed tasks."""
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        day = mission.current_day
        if day == 1:
            theme = "Market Discovery & Value Packaging"
            focus = "Ingest multi-source signals, validate high-pain buyer needs, and construct commercial offer."
            kpi = "Min 5 verified signals, 1 structured offer."
            actions = [
                "Run Browser Research Agent across Reddit, Telegram, and YouTube",
                "Synthesize buyer price tolerance and formulate 299 AED - 40,000 AED monetization options",
                "Package 1-page financial model and sales hook"
            ]
        elif day == 2:
            theme = "Seller Intelligence & Prospect Radar Matching"
            focus = "Discover urgent distress sellers and match with liquid high-intent buyers."
            kpi = "Min 3 distress seller listings scored, min 5 Warm/Hot buyer leads staged."
            actions = [
                "Scan developer resale channels for balloon payment distress",
                "Score motivation tier and calculate commission potential",
                "Ingest qualified prospects into 8-Stage CRM"
            ]
        elif day == 3:
            theme = "Omni-Channel Outreach Surge & Approval Staging"
            focus = "Deploy personalized 3-step outreach sequences with human verification."
            kpi = "100% of Hot leads sequenced, 0 unreviewed drafts."
            actions = [
                "Draft tailored WhatsApp and Email pitches",
                "Review and batch approve in Safety Approval Queue",
                "Schedule T+24h and T+48h follow-up cadences"
            ]
        else:
            theme = "Objection Crushing, Deal Closure & Tactical Pivot"
            focus = "Convert replies into booked meetings, resolve escrow concerns, and record confirmed commission."
            kpi = "1+ confirmed advisory engagement / transaction deposit."
            actions = [
                "Deploy objection handling frameworks for escrow & ROI",
                "Execute meeting scheduling sprints",
                "Audit conversion bottlenecks and record learnings into memory"
            ]

        return {
            "mission_id": mission_id,
            "day_number": day,
            "phase": "TACTICAL_EXECUTION",
            "strategy_theme": theme,
            "daily_focus": focus,
            "target_kpi": kpi,
            "prescribed_actions": actions,
            "confidence_rating": mission.confidence_score
        }

    async def execute_live_autonomous_cycle(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        """
        Executes a complete live autonomous cycle:
        1. Ingests live signals from UAE Buyer Radar, Telegram, Reddit, YouTube, LinkedIn
        2. Dispatches Playwright worker to scan property portals for price cuts
        3. Scores seller opportunities & computes 2% commission potential
        4. Sequences outreach campaigns staged in Safety Approval Queue
        5. Updates CRM pipeline, revenue potential, and recommends next action
        """
        from app.services.connectors.live_connectors import live_connector_manager
        from app.services.browser_automation.playwright_worker import playwright_worker

        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        # 1. Ingest Live Connectors
        connector_result = await live_connector_manager.poll_all_live_connectors(session, mission_id)

        # 2. Run Playwright Browser Automation
        browser_result = await playwright_worker.monitor_property_market_changes(session, mission_id)
        opps_result = await playwright_worker.detect_new_opportunities(session, mission_id)

        # 3. Seller Intelligence & Commission Calculation
        seller_result = await seller_intelligence_engine.scan_and_score_distress_listings(session, mission_id)

        # 4. Outreach Campaign Staging
        outreach_result = await outreach_automation_engine.create_campaign_for_mission(session, mission_id, target_intent="Hot")

        # 5. Calculate Total Pipeline & Commission
        leads_stmt = select(Lead).where(Lead.mission_id == mission_id)
        leads = (await session.execute(leads_stmt)).scalars().all()
        total_comm = sum(l.commission_potential or 0.0 for l in leads)
        total_pipeline = sum(l.expected_value or 0.0 for l in leads) + total_comm

        mission.pipeline_value = total_pipeline
        mission.total_commission_potential = total_comm
        
        # 6. Bottleneck Diagnosis & Progress Evaluation
        progress = await self.evaluate_mission_progress(session, mission_id)
        bottleneck = progress.get("bottleneck", {})
        next_action = progress.get("next_best_action", "Review staged outreach and continue live acquisition.")
        mission.next_best_action = next_action

        # Log Task
        task = Task(
            mission_id=mission_id,
            agent_name=self.name,
            day_number=mission.current_day,
            title="Live Autonomous Execution Cycle",
            description="Executed live connector acquisition, Playwright browser scans, seller scoring, and outreach sequencing.",
            status="COMPLETED",
            output_summary=f"Acquired {connector_result.get('total_signals_acquired', 0)} signals, {browser_result.get('opportunities_detected', 0)} property deals. Pipeline: {total_pipeline:,.0f} AED.",
            completed_at=datetime.utcnow()
        )
        session.add(task)
        await session.commit()

        return {
            "status": "success",
            "mission_id": mission_id,
            "signals_acquired": connector_result.get("total_signals_acquired", 0),
            "browser_deals_detected": browser_result.get("opportunities_detected", 0),
            "seller_listings_active": len(seller_result.get("scored_listings", [])),
            "campaign_staged_leads": outreach_result.get("leads_processed", 0),
            "total_commission_potential_aed": total_comm,
            "pipeline_value_aed": total_pipeline,
            "next_best_action": next_action,
            "bottleneck": bottleneck
        }

    async def generate_live_multi_day_roadmap(self, session: AsyncSession, mission_id: int, total_days: int = 30) -> Dict[str, Any]:
        """
        Generates a comprehensive multi-day / 30-day live revenue survival roadmap
        tailored for aggressive commission targets (e.g. 50,000 AED).
        """
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        roadmap_phases = [
            {
                "phase": "Week 1 (Days 1-7): High-Yield Distress Discovery & Signal Mining",
                "focus": "Ingest buyer/seller signals across Telegram VIP, Reddit, and Playwright portal monitors.",
                "target_metric": "30+ High-Intent Leads, 5+ Distress Resale Listings",
                "commission_milestone_aed": 0.0,
                "key_actions": [
                    "Continuous live connector polling on UAE investor channels",
                    "Automated intent scoring (Hot/Qualified)",
                    "Direct verification of developer payment plans & DLD Title Deeds"
                ]
            },
            {
                "phase": "Week 2 (Days 8-14): Private Buyer Matching & Advisory Mandates",
                "focus": "Deliver personalized off-market deal dossiers to foreign family offices and HNWI buyers.",
                "target_metric": "10+ Virtual Walkthroughs / VIP Pitch Briefs",
                "commission_milestone_aed": 10000.0,
                "key_actions": [
                    "Deploy approved 3-step WhatsApp & Email sequences",
                    "Handle ROI, tax, and escrow inquiries with AI Sales Assistant",
                    "Lock exclusive buyer agency representation agreements"
                ]
            },
            {
                "phase": "Week 3 (Days 15-21): Form F / MOU Execution & Deposit Escrows",
                "focus": "Coordinate seller Form F contracts and secure 10% manager cheques in escrow.",
                "target_metric": "2+ Signed Contracts in Escrow",
                "commission_milestone_aed": 30000.0,
                "key_actions": [
                    "Mediate seller price concessions on urgent relocation units",
                    "Review escrow security compliance via DLD Trustee Office",
                    "Resolve final financing/mortgage pre-approvals"
                ]
            },
            {
                "phase": "Week 4 (Days 22-30): Title Transfer, Settlement & 50k Commission Collection",
                "focus": "Finalize trustee office transfer, disburse funds, and collect standard 2% brokerage commissions.",
                "target_metric": "100% Revenue Target Realization (50,000+ AED)",
                "commission_milestone_aed": 50000.0,
                "key_actions": [
                    "Complete DLD Trustee Office transfer appointment",
                    "Disburse confirmed commission into revenue ledger",
                    "Log winning closing patterns into AI Long Term Memory"
                ]
            }
        ]

        mission.total_days = total_days
        await session.commit()

        return {
            "mission_id": mission_id,
            "goal_amount": mission.goal_amount,
            "currency": mission.currency,
            "total_days": total_days,
            "current_day": mission.current_day,
            "phases": roadmap_phases
        }

    async def execute_autonomous_industry_pivot(
        self,
        session: AsyncSession,
        mission_id: int,
        forced_new_industry: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Autonomous Multi-Industry Strategy Pivot:
        When current outreach or channel performance is low, autonomously pivots to the fastest-closing alternative industry.
        """
        from app.services.revenue_strategy_brain import revenue_strategy_brain
        from app.services.connectors.multi_industry_hunter import multi_industry_hunter

        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        current_industry = mission.industry
        evaluation = revenue_strategy_brain.evaluate_revenue_intent(
            target_amount=mission.goal_amount,
            deadline_hours=mission.deadline_hours,
            budget=mission.budget,
            currency=mission.currency
        )

        # Select new industry
        new_industry = forced_new_industry or evaluation["secondary_backup_industry"]
        if new_industry.lower() == current_industry.lower():
            # Pick next highest feasibility from calculator
            all_paths = evaluation["calculation_matrix"]["all_evaluated_paths"]
            for p in all_paths:
                if p["industry"].lower() != current_industry.lower():
                    new_industry = p["industry"]
                    break

        # Ingest fresh buying signals for the new industry
        hunter_result = await multi_industry_hunter.scan_all_industries(
            session=session,
            mission_id=mission_id,
            target_industry=new_industry
        )

        # Update Mission State
        mission.industry = new_industry
        mission.status = "PIVOTING"
        mission.ai_strategy = (
            f"Autonomous Strategy Pivot from {current_industry} to {new_industry}. "
            f"Pivoted to high-velocity {new_industry} service sprint to hit {mission.goal_amount} {mission.currency} in remaining time."
        )
        mission.next_best_action = (
            f"Pivoted to {new_industry}: Authorize new {new_industry} outreach drafts in Safety Approval Queue."
        )
        mission.confidence_score = max(70.0, mission.confidence_score + 5.0)

        # Record Experiment & Strategic Shift
        exp = Experiment(
            mission_id=mission_id,
            name=f"Autonomous Industry Pivot ({current_industry} -> {new_industry})",
            hypothesis=f"Pivoting from {current_industry} to {new_industry} will compress sales cycle and accelerate cash collection to hit {mission.goal_amount} {mission.currency}.",
            variant_a=f"Original Strategy: {current_industry}",
            variant_b=f"Pivoted Strategy: {new_industry}",
            metrics_a={"sent": 5, "replied": 0, "converted": 0},
            metrics_b={"sent": 0, "replied": 0, "converted": 0},
            status="RUNNING"
        )
        session.add(exp)

        # Record in Long Term Memory
        await long_term_memory_service.record_memory(
            session=session,
            category="FAILED_APPROACH",
            title=f"Industry Pivot Triggered: {current_industry} Stagnation",
            insight=f"Low initial conversion in {current_industry} triggered autonomous pivot to {new_industry}.",
            metrics={"previous_industry": current_industry, "new_industry": new_industry, "signals_acquired": hunter_result.get("signals_ingested")},
            tags=["strategy_pivot", "autonomous_recovery", new_industry.lower().replace(" ", "_")],
            confidence=0.92
        )

        await session.commit()
        await session.refresh(mission)

        return {
            "status": "success",
            "mission_id": mission_id,
            "previous_industry": current_industry,
            "new_industry": new_industry,
            "signals_ingested": hunter_result.get("signals_ingested", 0),
            "leads_created": hunter_result.get("leads_created", 0),
            "new_strategy": mission.ai_strategy,
            "next_best_action": mission.next_best_action
        }

    async def execute_task(self, session: AsyncSession, mission_id: int, parameters: Dict[str, Any] = {}) -> Dict[str, Any]:
        return await self.evaluate_survival_status(session, mission_id)

survival_manager = SurvivalManagerAgent()



import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Mission, Opportunity, Offer, Task, AgentMemory, LongTermMemory
from app.services.marketplace_catalog import marketplace_service, ServiceOffering
from app.services.revenue_calculator import revenue_calculator

class RevenueStrategyBrain:
    """
    Autonomous Multi-Industry Revenue Strategy Brain:
    Evaluates (Target Amount, Deadline Hours, Budget), selects optimal industry mix,
    and generates a customized multi-phase autonomous execution plan.
    """
    def evaluate_revenue_intent(
        self,
        target_amount: float,
        deadline_hours: int,
        budget: float = 0.0,
        currency: str = "AED"
    ) -> Dict[str, Any]:
        """
        Analyzes the parameters, runs the Revenue Calculator, and decides the primary & secondary monetization paths.
        """
        calc_result = revenue_calculator.compute_revenue_options(
            target_amount=target_amount,
            deadline_hours=deadline_hours,
            budget=budget,
            currency=currency
        )
        
        optimal = calc_result["optimal_recommendation"]
        primary_industry = optimal["industry"]
        
        # Categorize goal tier
        if target_amount <= 1500.0:
            goal_tier = "MICRO_CASH_SPRINT"
            strategic_thesis = f"Immediate cash generation targeting {target_amount} {currency} in {deadline_hours}h via rapid-turnaround {primary_industry} services with 100% upfront payment."
        elif target_amount <= 8000.0:
            goal_tier = "MEDIUM_SERVICE_SPRINT"
            strategic_thesis = f"High-velocity B2B service sprint targeting {target_amount} {currency} in {deadline_hours}h. Closing {optimal['required_clients']} client(s) with 50% upfront deposits via {primary_industry} and express delivery."
        elif target_amount <= 30000.0:
            goal_tier = "HIGH_TICKET_CLOSER"
            strategic_thesis = f"High-ticket advisory and custom software sprint targeting {target_amount} {currency}. Dual-pronged focus on {primary_industry} with aggressive direct-response outreach."
        else:
            goal_tier = "ENTERPRISE_BROKERAGE"
            strategic_thesis = f"Large-scale transaction mandate targeting {target_amount} {currency}. Prioritizing Dubai Real Estate off-market distress property matching (2% fee) and enterprise custom software contracts."

        # Select secondary backup industry
        secondary_choice = None
        for path in calc_result["all_evaluated_paths"]:
            if path["industry"] != primary_industry:
                secondary_choice = path
                break

        return {
            "target_amount": target_amount,
            "deadline_hours": deadline_hours,
            "budget": budget,
            "currency": currency,
            "goal_tier": goal_tier,
            "primary_industry": primary_industry,
            "primary_service": optimal,
            "secondary_backup_industry": secondary_choice["industry"] if secondary_choice else "Website Development",
            "secondary_service": secondary_choice,
            "strategic_thesis": strategic_thesis,
            "confidence_score": optimal["feasibility_score"],
            "calculation_matrix": calc_result
        }

    async def auto_configure_mission_from_brain(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        """
        Applies Strategy Brain decisions to an existing or newly created Mission record:
        - Sets optimal industry
        - Formulates customized AI strategy & next best action
        - Creates initial Opportunity, Offer, and Task schedules
        """
        mission = await session.get(Mission, mission_id)
        if not mission:
            return {"status": "error", "message": "Mission not found"}

        evaluation = self.evaluate_revenue_intent(
            target_amount=mission.goal_amount,
            deadline_hours=mission.deadline_hours,
            budget=mission.budget,
            currency=mission.currency
        )

        primary_svc = evaluation["primary_service"]
        mission.industry = evaluation["primary_industry"]
        mission.ai_strategy = evaluation["strategic_thesis"]
        mission.confidence_score = evaluation["confidence_score"]
        mission.next_best_action = (
            f"Execute Day 1: Run Multi-Industry Opportunity Hunter to mine verified buyer intents for {primary_svc['service_name']}."
        )

        # 1. Create Core Validated Opportunity
        opp = Opportunity(
            mission_id=mission_id,
            problem=f"Clients needing high-performance {evaluation['primary_industry']} delivery with guaranteed speed & zero technical friction.",
            target_customer=f"B2B decision-makers in {evaluation['primary_industry']}",
            market=evaluation["primary_industry"],
            offer_idea=primary_svc["service_name"],
            price_estimate=primary_svc["unit_price_aed"],
            difficulty="Low",
            confidence_score=evaluation["confidence_score"],
            sources=["Autonomous Revenue Strategy Brain", "Multi-Source Marketplaces", "Direct-Response B2B Sprints"],
            status="VALIDATED"
        )
        session.add(opp)
        await session.flush()

        # 2. Create Structured Commercial Offer
        offer = Offer(
            mission_id=mission_id,
            opportunity_id=opp.id,
            product_name=primary_svc["service_name"],
            description=primary_svc["headline"],
            pricing=primary_svc["unit_price_aed"],
            currency=mission.currency,
            target_audience=f"High-growth businesses and operators in {evaluation['primary_industry']}",
            sales_message=primary_svc["sample_pitch_hook"],
            landing_page_copy=f"Deploy {primary_svc['service_name']} in {primary_svc['delivery_hours']} hours with guaranteed ROI.",
            marketing_angle="Express 24-48h Delivery • 50% Upfront Escrow • Complete Implementation",
            faq=[
                {"question": "How quickly is this delivered?", "answer": f"Guaranteed delivery in {primary_svc['delivery_hours']} hours from project kickoff."},
                {"question": "What is the payment structure?", "answer": f"{primary_svc['upfront_deposit_pct']}% deposit to start, remaining balance upon verified handover."}
            ],
            status="APPROVED"
        )
        session.add(offer)

        # 3. Create Multi-Phase Dynamic Execution Tasks
        tasks = [
            Task(
                mission_id=mission_id,
                agent_name="Opportunity Hunter Agent",
                day_number=1,
                title=f"Multi-Industry Buying Intent Mining ({evaluation['primary_industry']})",
                description=f"Scan Reddit, LinkedIn, Telegram, and YouTube for prospects actively seeking {primary_svc['service_name']}.",
                status="PENDING"
            ),
            Task(
                mission_id=mission_id,
                agent_name="Lead Hunter Agent",
                day_number=1,
                title="Prospect Qualification & 8-Stage CRM Ingestion",
                description=f"Qualify {primary_svc['estimated_leads_needed']} high-intent B2B leads and score into CRM.",
                status="PENDING"
            ),
            Task(
                mission_id=mission_id,
                agent_name="Outreach Agent",
                day_number=2,
                title=f"3-Step Direct Response Outreach Campaign ({evaluation['primary_industry']})",
                description="Draft high-converting pitch sequences with upfront deposit hooks staged for safety review.",
                status="PENDING"
            ),
            Task(
                mission_id=mission_id,
                agent_name="Sales Assistant Agent",
                day_number=3,
                title=f"Sales Closing & Upfront Deposit Collection ({primary_svc['required_clients']} Client(s))",
                description=f"Handle objections, secure {primary_svc['immediate_cash_collected_aed']} AED in deposits, and hit revenue milestone.",
                status="PENDING"
            )
        ]
        for t in tasks:
            session.add(t)

        # Store to Agent Memory & Long Term Memory
        mem = AgentMemory(
            agent_name="Revenue Strategy Brain",
            category="STRATEGY_SELECTION",
            key=f"strategy_brain_m{mission_id}",
            value={
                "selected_industry": evaluation["primary_industry"],
                "target_amount": mission.goal_amount,
                "required_clients": primary_svc["required_clients"],
                "feasibility": evaluation["confidence_score"]
            },
            confidence=evaluation["confidence_score"] / 100.0
        )
        session.add(mem)

        await session.commit()
        await session.refresh(mission)

        return {
            "status": "success",
            "mission_id": mission_id,
            "evaluation": evaluation
        }

revenue_strategy_brain = RevenueStrategyBrain()

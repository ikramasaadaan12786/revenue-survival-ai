import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entities import Lead, Opportunity, RevenueOpportunity

class SalesClosingAssistant:
    """
    PART 2 — AI Sales Closing Assistant:
    Synthesizes tactical closing intelligence:
    1. Discovery Questions (Problem, Current Process, Budget Range, Timeline)
    2. Objection Handling (Too expensive, Need more time, Comparing vendors, Not interested, Need approval)
    3. Negotiation Strategy (Starting price, Minimum acceptable floor, Value justification, Upsell play)
    """

    async def generate_closing_strategy(
        self,
        session: Optional[AsyncSession],
        lead_id: Optional[int] = None,
        opportunity_id: Optional[int] = None,
        company_name: Optional[str] = None,
        industry: Optional[str] = None,
        target_budget: Optional[float] = None,
        current_objection: Optional[str] = None
    ) -> Dict[str, Any]:
        company = company_name or "Enterprise Prospect"
        ind = industry or "Digital Services & Technology"
        budget = target_budget or 5000.0
        contact = "Client"

        if session and lead_id:
            lead = await session.get(Lead, lead_id)
            if lead:
                company = lead.company_name or lead.name
                contact = lead.name
                budget = lead.estimated_budget or lead.expected_value or budget

        # Calculate pricing floors
        starting_price = round(budget, 0)
        floor_price = round(budget * 0.75, 0)
        upsell_price = round(budget * 1.6, 0)

        # 1. Discovery Questions
        discovery_questions = [
            {
                "question": f"What specific bottleneck is currently costing {company} the most revenue or operational time?",
                "purpose": "Isolate the primary financial pain point to anchor ROI."
            },
            {
                "question": "How is your team currently handling this process manually, and what are the drop-off rates?",
                "purpose": "Quantify operational inefficiency and lost customer opportunity."
            },
            {
                "question": f"Have you allocated an active capital budget for this solution in the {starting_price:,.0f} {ind} range?",
                "purpose": "Confirm purchasing authority and price bracket qualification."
            },
            {
                "question": "If we deploy a working system within 48 to 72 hours, what is your preferred start date?",
                "purpose": "Lock in urgency and establish closing commitment timeline."
            }
        ]

        # 2. Objection Handling Battlecards
        objection_handling = [
            {
                "objection": "Too expensive / Over budget",
                "script": (
                    f"I completely respect that, {contact}. Let's look at the financial return: "
                    f"eliminating manual drop-off recovers an estimated 3x the {starting_price:,.0f} AED cost within 30 days. "
                    f"To make this zero-risk, we can structure this as 50% upfront ({starting_price * 0.5:,.0f} AED) "
                    f"with the balance due only upon verified delivery."
                ),
                "tactical_pivot": "Offer 2-stage milestone split or reduced scope package at minimum floor."
            },
            {
                "objection": "We need more time to think about it",
                "script": (
                    f"Understood. Just so you know, our deployment queue allows only 2 express build sprints this week. "
                    f"If we lock in your slot today, we can guarantee delivery before the weekend so you capture upcoming traffic."
                ),
                "tactical_pivot": "Introduce scarcity and 24-hour priority deployment incentive."
            },
            {
                "objection": "We are currently comparing other vendors / agencies",
                "script": (
                    f"That is smart diligence. Unlike traditional agencies that take 4 to 6 weeks and charge retainers, "
                    f"our AI automation systems are turnkey, custom-tailored, and deployed in 48 hours with zero monthly vendor lock-in."
                ),
                "tactical_pivot": "Highlight speed-to-market and zero recurring maintenance fees."
            },
            {
                "objection": "I need approval from my business partner / CEO",
                "script": (
                    f"Makes total sense. I can prepare a 1-page Executive ROI Summary with scope and numbers so you have "
                    f"everything required for a 5-minute decision. Would it help if I send that over right now?"
                ),
                "tactical_pivot": "Arm the internal champion with a concise 1-page proposal dossier."
            },
            {
                "objection": "Not interested / No immediate need",
                "script": (
                    f"No problem at all! I will keep you updated with our latest industry benchmark case studies. "
                    f"If your volume increases next month, our door is always open."
                ),
                "tactical_pivot": "Tag for 14-day nurture drip without sales friction."
            }
        ]

        # 3. Negotiation Strategy Matrix
        negotiation_strategy = {
            "recommended_starting_price": starting_price,
            "minimum_acceptable_floor": floor_price,
            "target_profit_margin": "78%",
            "suggested_payment_terms": "50% upfront deposit upon contract sign, 50% upon verified staging",
            "value_justification": (
                f"Anchored on 3.8x ROI multiplier and 48-hour delivery timeline compared to industry standard 30-day turnaround."
            ),
            "upsell_opportunity": {
                "upsell_package_name": "Premium AI Retainer & Multichannel Expansion",
                "upsell_price": upsell_price,
                "upsell_deliverables": [
                    "Full WhatsApp + Telegram multi-agent sync",
                    "Real-time CRM dashboard with live deal telemetry",
                    "30 days of VIP priority support and prompt optimization"
                ]
            }
        }

        # Recommended Next Action
        next_action = f"Dispatch discovery diagnostic message to {contact} via WhatsApp and secure agreement on 50% deposit terms."

        return {
            "lead_name": contact,
            "company_name": company,
            "industry": ind,
            "discovery_questions": discovery_questions,
            "objection_handling": objection_handling,
            "negotiation_strategy": negotiation_strategy,
            "recommended_next_action": next_action
        }

sales_closing_assistant = SalesClosingAssistant()

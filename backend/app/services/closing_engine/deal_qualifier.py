import re
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import RevenueOpportunity, Lead, Mission

class DealQualificationEngine:
    """
    Autonomous AI Deal Qualification Engine.
    Evaluates raw market signals and opportunities against:
    - Buyer Seriousness (0-100)
    - Budget Capability (AED)
    - Buying Timeline (Immediate <48h, This Week, This Month, Flexible)
    - Decision Maker Probability (0-100%)
    - Best Offer Selection
    - Closing Probability (0-100%)
    - Qualification Score (0-100)
    
    Categorizes into:
    - HOT BUYER (Score 80-100)
    - WARM BUYER (Score 55-79)
    - NURTURE (Score 35-54)
    - REJECT (Score < 35: Spam, brokers, competitors, fake RFPs)
    """

    SPAM_OR_BROKER_PATTERNS = [
        r"\b(i am a broker|brokerage service|agent looking for commission|co-broke|sub-agent|real estate agent looking to collaborate)\b",
        r"\b(cheap followers|telegram member boost|crypto pump|forex signal|binary option|whatsapp spam)\b",
        r"\b(freelancers bidding for work|hire me|i am a developer looking for job|cv attached|portfolio)\b",
        r"\b(test signal|asdf|dummy test|ignore this)\b"
    ]

    HIGH_INTENT_PATTERNS = [
        r"\b(ready to buy|cash buyer|budget approved|approved budget|immediate deployment|need immediately|within 48 hours|asap|urgent requirement|rfp|looking to contract|escrow ready)\b",
        r"\b(founder|managing director|ceo|head of digital|cio|owner|general manager|partner|cmo)\b",
        r"\b(off-plan|downtown|palm jumeirah|difc|dubai hills|creek harbour|business bay)\b"
    ]

    def is_spam_or_competitor(self, text: str) -> bool:
        low = text.lower()
        for p in self.SPAM_OR_BROKER_PATTERNS:
            if re.search(p, low, re.IGNORECASE):
                return True
        return False

    def qualify_opportunity(
        self,
        name: str,
        company: Optional[str],
        requirement: str,
        industry: str,
        source: str,
        stated_budget: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates full 5-dimension qualification vector and strict classification for an opportunity.
        Dimensions:
        1. Buyer Intent (0 - 100)
        2. Budget Confirmation (0 - 100)
        3. Decision Maker Probability (0 - 100)
        4. Timeline Urgency (0 - 100)
        5. Requirement Clarity (0 - 100)
        """
        combined = f"{name} {company or ''} {requirement} {industry} {source}".lower()

        # Check immediate reject
        if self.is_spam_or_competitor(combined):
            return {
                "qualification_score": 15.0,
                "category": "REJECT",
                "buyer_intent_score": 10.0,
                "budget_confirmation_score": 5.0,
                "decision_maker_score": 10.0,
                "timeline_score": 10.0,
                "requirement_clarity_score": 10.0,
                "budget_capability_aed": 0.0,
                "buying_timeline": "Flexible",
                "decision_maker_probability": 0.10,
                "closing_probability": 0.05,
                "weighted_revenue_aed": 0.0,
                "best_offer_type": "None",
                "qualification_reason": "Rejected: Identified as broker solicitation, spam, or competitor noise."
            }

        # 1. Buyer Intent (0 - 100)
        intent_score = 65.0
        if any(w in combined for w in ["ready to buy", "cash buyer", "approved budget", "immediate deployment", "looking to contract", "escrow ready", "urgently need"]):
            intent_score = 95.0
        elif any(w in combined for w in ["need", "looking for", "hire", "build", "acquire", "implement"]):
            intent_score = 80.0
        elif any(w in combined for w in ["just exploring", "curious", "checking price", "maybe later"]):
            intent_score = 35.0

        # 2. Budget Confirmation (0 - 100) & Value
        budget = stated_budget if (stated_budget and stated_budget > 0) else 0.0
        budget_confirmed_score = 50.0
        if budget > 0:
            budget_confirmed_score = 95.0
        else:
            if "real estate" in industry.lower() or "property" in combined:
                budget = 2500000.0
                budget_confirmed_score = 85.0
            elif "software" in industry.lower():
                budget = 35000.0
                budget_confirmed_score = 75.0
            elif "ai" in industry.lower() or "agent" in combined or "automation" in combined:
                budget = 12500.0
                budget_confirmed_score = 80.0
            elif "website" in industry.lower():
                budget = 7500.0
                budget_confirmed_score = 70.0
            elif "saas" in industry.lower():
                budget = 22000.0
                budget_confirmed_score = 75.0
            else:
                budget = 9000.0
                budget_confirmed_score = 60.0

        # 3. Decision Maker Probability & Score (0 - 100)
        dm_score = 70.0
        dm_prob = 0.70
        if any(w in combined for w in ["founder", "ceo", "director", "owner", "partner", "investor", "managing director", "principal"]):
            dm_score = 95.0
            dm_prob = 0.95
        elif any(w in combined for w in ["vp", "head of", "manager", "lead"]):
            dm_score = 80.0
            dm_prob = 0.80
        elif any(w in combined for w in ["assistant", "student", "intern", "junior"]):
            dm_score = 30.0
            dm_prob = 0.30

        # 4. Buying Timeline (0 - 100)
        if any(w in combined for w in ["immediate", "48h", "asap", "this week", "urgent", "today"]):
            timeline = "Immediate (<48h)"
            timeline_score = 95.0
        elif any(w in combined for w in ["this month", "in 2 weeks", "q3", "q4"]):
            timeline = "This Month"
            timeline_score = 75.0
        elif any(w in combined for w in ["next month", "planning", "next quarter"]):
            timeline = "This Quarter"
            timeline_score = 55.0
        else:
            timeline = "Flexible"
            timeline_score = 40.0

        # 5. Requirement Clarity (0 - 100)
        req_clarity_score = 60.0
        if len(requirement) > 50 and any(w in combined for w in ["system", "api", "leads", "revenue", "crm", "workflow", "portfolio", "villa", "penthouse"]):
            req_clarity_score = 90.0
        elif len(requirement) > 20:
            req_clarity_score = 75.0

        # 6. Best Offer Selection
        ind_low = industry.lower()
        if "real estate" in ind_low or "property" in combined:
            best_offer = "Dubai Real Estate Investment Advisory (2% Commission Match)"
        elif "ai" in ind_low or "agent" in combined or "automation" in combined:
            best_offer = "AI Autonomous Agent & Workflow Automation System (AED 12,500)"
        elif "website" in ind_low or "portal" in combined:
            best_offer = "High-Converting Premium Business Portal & Web Engine (AED 7,500)"
        elif "software" in ind_low or "custom" in combined:
            best_offer = "Bespoke Custom Software Architecture & MVP (AED 35,000)"
        elif "saas" in ind_low:
            best_offer = "Micro-SaaS Production Accelerator MVP (AED 22,000)"
        else:
            best_offer = "Revenue Growth & High-Ticket Lead Acquisition Engine (AED 9,000)"

        # 7. Strict Overall Qualification Score (Weighted Average)
        qual_score = round(
            (intent_score * 0.30) + 
            (budget_confirmed_score * 0.20) + 
            (dm_score * 0.20) + 
            (timeline_score * 0.15) + 
            (req_clarity_score * 0.15),
            1
        )

        # Stricter Categorization Gate
        # Only leads with high intent, verified decision-maker, and urgent timeline qualify as HOT
        if qual_score >= 82.0 and intent_score >= 80.0 and dm_score >= 80.0 and timeline_score >= 70.0:
            category = "HOT BUYER"
            closing_prob = 0.85
        elif qual_score >= 68.0 and dm_score >= 60.0:
            category = "QUALIFIED BUYER"
            closing_prob = 0.65
        elif qual_score >= 45.0:
            category = "WARM BUYER"
            closing_prob = 0.40
        elif qual_score >= 25.0:
            category = "NURTURE"
            closing_prob = 0.20
        else:
            category = "REJECT"
            closing_prob = 0.05

        weighted_rev = round(budget * closing_prob, 2)

        return {
            "qualification_score": qual_score,
            "category": category,
            "buyer_intent_score": intent_score,
            "budget_confirmation_score": budget_confirmed_score,
            "decision_maker_score": dm_score,
            "timeline_score": timeline_score,
            "requirement_clarity_score": req_clarity_score,
            "buyer_seriousness": intent_score,
            "budget_capability_aed": budget,
            "buying_timeline": timeline,
            "decision_maker_probability": dm_prob,
            "closing_probability": closing_prob,
            "weighted_revenue_aed": weighted_rev,
            "best_offer_type": best_offer,
            "qualification_reason": f"Strict AI validation ({qual_score}% score): Intent {intent_score:.0f}%, DM {dm_score:.0f}%, Timeline {timeline} ({budget:,.0f} AED budget capability)."
        }

    async def qualify_and_upgrade_lead(
        self,
        session: AsyncSession,
        lead_id: int
    ) -> Optional[Dict[str, Any]]:
        """
        Updates an existing Lead record with AI deal qualification metrics.
        """
        res = await session.execute(select(Lead).where(Lead.id == lead_id))
        lead = res.scalar_one_or_none()
        if not lead:
            return None

        eval_result = self.qualify_opportunity(
            name=lead.name,
            company=lead.company_name,
            requirement=lead.interest or "",
            industry=lead.country or "Dubai Real Estate & Advisory",
            source=lead.source or "TELEGRAM",
            stated_budget=lead.estimated_budget
        )

        lead.qualification_score = eval_result["qualification_score"]
        lead.classification = eval_result["category"]
        lead.decision_maker_probability = eval_result["decision_maker_probability"]
        lead.estimated_budget = eval_result["budget_capability_aed"]
        lead.qualification_notes = eval_result["qualification_reason"]
        lead.revenue_probability = eval_result["closing_probability"]

        if eval_result["category"] == "HOT BUYER":
            lead.intent_score = "Hot"
            lead.pipeline_stage = "QUALIFIED"
            lead.status = "AI_VERIFIED"
        elif eval_result["category"] == "QUALIFIED BUYER":
            lead.intent_score = "Qualified"
            lead.pipeline_stage = "QUALIFIED"
            lead.status = "AI_VERIFIED"
        elif eval_result["category"] == "WARM BUYER":
            lead.intent_score = "Warm"
            lead.pipeline_stage = "DISCOVERED"
        elif eval_result["category"] == "NURTURE":
            lead.intent_score = "Nurture"
            lead.pipeline_stage = "DISCOVERED"
        elif eval_result["category"] == "REJECT":
            lead.status = "LOST"
            lead.pipeline_stage = "LOST"

        await session.commit()
        await session.refresh(lead)

        return eval_result


deal_qualification_engine = DealQualificationEngine()

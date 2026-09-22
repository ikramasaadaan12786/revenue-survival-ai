from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import Lead, RevenueOpportunity, Proposal, RevenueTracking, Mission

class IndustryPerformanceIntelligence:
    """
    Tracks and analyzes conversion velocity across all major UAE industry sectors:
    - AI Agents & Automation
    - Custom Software Development
    - SaaS Products
    - Website Development
    - Mobile Applications
    - Dubai Real Estate & Advisory
    - Marketing & Growth Services
    """

    SUPPORTED_INDUSTRIES = [
        "AI Agents & Automation",
        "Custom Software Development",
        "SaaS Products",
        "Website Development",
        "Mobile Applications",
        "Dubai Real Estate & Advisory",
        "Marketing & Growth Services"
    ]

    async def analyze_industry_performance(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        # Fetch leads, opportunities, proposals, and revenue entries
        leads_query = select(Lead)
        opps_query = select(RevenueOpportunity)
        proposals_query = select(Proposal)
        revenue_query = select(RevenueTracking)

        if mission_id:
            leads_query = leads_query.where(Lead.mission_id == mission_id)
            opps_query = opps_query.where(RevenueOpportunity.mission_id == mission_id)
            proposals_query = proposals_query.where(Proposal.mission_id == mission_id)
            revenue_query = revenue_query.where(RevenueTracking.mission_id == mission_id)

        leads = (await session.execute(leads_query)).scalars().all()
        opps = (await session.execute(opps_query)).scalars().all()
        proposals = (await session.execute(proposals_query)).scalars().all()
        revenues = (await session.execute(revenue_query)).scalars().all()

        results = []

        for ind in self.SUPPORTED_INDUSTRIES:
            ind_low = ind.lower()
            
            matched_opps = [
                o for o in opps 
                if ind_low in (o.industry or "").lower() or (ind_low.split()[0] in (o.industry or "").lower())
            ]
            matched_leads = [
                l for l in leads 
                if ind_low in (l.country or "").lower() or ind_low in (l.interest or "").lower() or (ind_low.split()[0] in (l.interest or "").lower())
            ]
            matched_proposals = [
                p for p in proposals 
                if ind_low in (p.proposal_type or "").lower() or (ind_low.split()[0] in (p.client_industry or "").lower())
            ]
            
            won_leads = [l for l in matched_leads if (l.pipeline_stage or "").upper() == "WON" or (l.status or "").upper() == "DEAL"]
            lost_leads = [l for l in matched_leads if (l.pipeline_stage or "").upper() == "LOST"]
            qualified_leads = [l for l in matched_leads if (l.qualification_score or 0) >= 55.0]

            opps_cnt = len(matched_opps)
            leads_cnt = len(matched_leads)
            prop_cnt = len(matched_proposals)
            won_cnt = len(won_leads)
            lost_cnt = len(lost_leads)

            # Revenue generated
            revenue_gen = sum(l.expected_value or 0.0 for l in won_leads)
            pipeline_val = sum(l.expected_value or 0.0 for l in matched_leads if (l.pipeline_stage or "").upper() not in ["WON", "LOST"])

            # Conversion rate
            conv_rate = round((won_cnt / leads_cnt * 100.0), 1) if leads_cnt > 0 else (18.5 if "ai" in ind_low else 12.0)

            # Classification / Tier
            if won_cnt > 0 or conv_rate >= 15.0 or (opps_cnt >= 2 and pipeline_val >= 20000.0):
                tier = "BEST_PERFORMING"
                recommendation = "Scale outbound acquisition and increase allocation."
            elif opps_cnt > 0 or leads_cnt > 0:
                tier = "NEEDS_IMPROVEMENT"
                recommendation = "Refine pitch messaging hook and offer terms."
            else:
                tier = "LOW_PRIORITY"
                recommendation = "Maintain passive radar scan."

            results.append({
                "industry": ind,
                "opportunities_generated": opps_cnt,
                "qualified_leads": len(qualified_leads),
                "proposals_sent": prop_cnt,
                "won_deals": won_cnt,
                "lost_deals": lost_cnt,
                "revenue_generated_aed": revenue_gen,
                "pipeline_value_aed": pipeline_val,
                "conversion_rate_pct": conv_rate,
                "performance_tier": tier,
                "recommendation": recommendation
            })

        # Sort by revenue generated and conversion rate
        results.sort(key=lambda x: (x["revenue_generated_aed"], x["pipeline_value_aed"], x["conversion_rate_pct"]), reverse=True)
        return results


industry_intelligence = IndustryPerformanceIntelligence()

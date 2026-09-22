import asyncio
import sys
import os

# Set backend path
sys.path.insert(0, r"c:\Users\Admin\Desktop\Revenue Survival AI Agent\backend")

from app.core.database import AsyncSessionLocal
from app.models.entities import Mission, Lead
from sqlalchemy.future import select
from app.services.closing_engine.deal_qualifier import deal_qualification_engine
from app.services.closing_engine.revenue_sprint_service import revenue_sprint_service
from app.services.ceo_brain.target_achievement_engine import target_achievement_engine

async def main():
    async with AsyncSessionLocal() as session:
        # Get active mission
        missions_res = await session.execute(select(Mission).order_by(Mission.id.desc()))
        mission = missions_res.scalars().first()
        print(f"Active Mission: #{mission.id} - {mission.title} (Target: AED {mission.goal_amount})")

        # 1. Re-evaluate leads with strict 5-dimension scoring
        leads_res = await session.execute(select(Lead).where(Lead.mission_id == mission.id))
        leads = leads_res.scalars().all()
        print(f"\n--- STEP 1: Strict HOT Lead Validation ({len(leads)} leads) ---")
        
        hot_count = 0
        qualified_count = 0
        warm_count = 0
        nurture_count = 0
        
        for l in leads:
            res = await deal_qualification_engine.qualify_and_upgrade_lead(session, l.id)
            cat = res["category"]
            if cat == "HOT BUYER":
                hot_count += 1
            elif cat == "QUALIFIED BUYER":
                qualified_count += 1
            elif cat == "WARM BUYER":
                warm_count += 1
            else:
                nurture_count += 1
            print(f"Lead [{l.id}] {l.name[:25]:<25} | Score: {res['qualification_score']:4.1f} | Intent: {res['buyer_intent_score']:3.0f} | DM: {res['decision_maker_score']:3.0f} | Timeline: {res['buying_timeline']:<18} | Cat: {cat:<15} | Closing Prob: {res['closing_probability']*100:4.1f}%")

        print(f"\nClassification Breakdown:")
        print(f"  HOT BUYERS:       {hot_count}")
        print(f"  QUALIFIED BUYERS: {qualified_count}")
        print(f"  WARM BUYERS:      {warm_count}")
        print(f"  NURTURE / REJECT: {nurture_count}")

        # 2. Priority Approval Queue
        print(f"\n--- STEP 2: Safety Approval Priority Queue (Top 5 to Contact First) ---")
        priority_queue = await revenue_sprint_service.get_priority_approval_queue(session, mission.id)
        for idx, item in enumerate(priority_queue, 1):
            print(f"{idx}. {item['name']} ({item['source']} - {item['industry']})")
            print(f"   Offer: {item['offer']} | Expected Rev: AED {item['expected_revenue']:,.0f} | Closing Prob: {item['closing_probability_percent']}% | Weighted: AED {item['weighted_revenue']:,.0f}")
            print(f"   Recommended Action: {item['recommended_action']}")

        # 3. Deal Probability Layer
        print(f"\n--- STEP 3: Deal Probability Layer ---")
        deal_probs = await revenue_sprint_service.get_deal_probabilities(session, mission.id)
        print(f"Total Pipeline: AED {deal_probs['total_pipeline_value_aed']:,.2f}")
        print(f"Total Weighted Pipeline: AED {deal_probs['total_weighted_pipeline_aed']:,.2f}")

        # 4. Revenue Sprint Mode
        print(f"\n--- STEP 4: Revenue Sprint Mode ---")
        sprint = await revenue_sprint_service.calculate_revenue_sprint(session, mission.id)
        print(f"Sprint Target: AED {sprint['target_revenue_aed']:,.2f} | Gap: AED {sprint['revenue_gap_aed']:,.2f} | Remaining Hours: {sprint['remaining_hours']}h")
        print(f"Fastest Closing Opportunity: {sprint['fastest_closing_opportunity']['name']} ({sprint['fastest_closing_opportunity']['offer']})")
        print(f"Fastest Offer: {sprint['fastest_offer']['offer_name']} (Price: AED {sprint['fastest_offer']['price_aed']:,.0f}, Delivery: {sprint['fastest_offer']['delivery_timeline']})")
        print(f"Fastest Channel: {sprint['fastest_channel']['channel']} (Response: {sprint['fastest_channel']['response_time']})")
        print(f"Tactical Plan:")
        for step in sprint['tactical_closing_plan']:
            print(f"  - {step}")

        # 5. CEO Brain Target Achievement Plan
        print(f"\n--- STEP 5: CEO Brain Target Achievement Plan ---")
        target_plan = await target_achievement_engine.calculate_target_achievement_plan(session, mission.id)
        quotas = target_plan['quotas']
        print(f"Strategy: {target_plan['strategy_summary']}")
        print(f"Activity Quotas: Calls Needed: {quotas['calls_needed']} | Messages Needed: {quotas['messages_needed']} | Offers Needed: {quotas['offers_needed']} | Conversion: {quotas['expected_conversion_percent']}%")
        print(f"Directives:")
        for d in target_plan['executive_directives']:
            print(f"  * {d}")

if __name__ == "__main__":
    asyncio.run(main())

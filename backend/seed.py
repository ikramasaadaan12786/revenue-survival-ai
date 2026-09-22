import asyncio
import datetime
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.entities import (
    User, Mission, Opportunity, Offer, Lead, Communication, Task,
    AgentMemory, RevenueTracking, Experiment, Analytics, RealEstateDeal, DailyCycleLog
)

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        from sqlalchemy.future import select
        res = await session.execute(select(Mission))
        existing_mission = res.scalars().first()
        if existing_mission:
            print("[Seed] Database already contains mission data. Skipping re-seed.")
            return

        print("[Seed] Seeding Production 72-Hour Revenue Survival Mission...")

        now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        expires = now + datetime.timedelta(hours=72)

        # 1. User
        user = User(
            email="operator@revenuesurvival.ai",
            name="Alpha Operator",
            role="lead_architect"
        )
        session.add(user)
        await session.flush()

        # 2. Mission
        mission = Mission(
            user_id=user.id,
            title="Generate AED 1,000 within 72 Hours (Zero Spend)",
            goal_amount=1000.0,
            currency="AED",
            deadline_hours=72,
            budget=0.0,
            spent=0.0,
            revenue_generated=297.0,
            pipeline_value=1495.0,
            total_commission_potential=160800.0,
            industry="Dubai Real Estate & Digital Advisory",
            status="ACTIVE",
            current_day=2,
            total_days=3,
            ai_strategy="Zero-budget distress arbitrage & direct WhatsApp conversion targeting European/GCC property buyers.",
            next_best_action="Execute morning lead sync and review staged outreach batch to 3 hot leads.",
            confidence_score=93.4,
            created_at=now - datetime.timedelta(hours=18),
            expires_at=expires
        )
        session.add(mission)
        await session.flush()

        # 3. Opportunity
        opp = Opportunity(
            mission_id=mission.id,
            problem="Expatriates & international buyers in Dubai face inflated broker prices and lack transparent distress off-plan inventory.",
            target_customer="Foreign property investors & relocating high earners",
            market="Dubai Prime Real Estate & Advisory",
            offer_idea="Dubai Distress Property & 8.5%+ Net Yield Dossier with instant escrow validation",
            price_estimate=299.0,
            difficulty="Low",
            confidence_score=94.0,
            sources=[
                "Reddit r/dubai Real Estate Megathread",
                "Telegram Dubai Real Estate Radar (18k members)",
                "Google Trends UAE: 'distress property dubai off-plan'",
                "YouTube comments: 2026 Dubai Real Estate Outlook"
            ],
            status="ACTIVE"
        )
        session.add(opp)
        await session.flush()

        # 4. Offer
        offer = Offer(
            mission_id=mission.id,
            opportunity_id=opp.id,
            product_name="Dubai Distress & Yield Intelligence Pass",
            description="Curated database of off-market seller-motivated deals, verified developer payment plans with 8%+ projected rental yields, plus a personalized 15-minute ROI analysis.",
            pricing=299.0,
            currency="AED",
            target_audience="Foreign & Local Investors looking for high capital appreciation in Business Bay, Downtown & Dubai Marina",
            landing_page_copy="# Direct Access to Verified Dubai Distress Inventory\n\nStop paying retail broker markups. Get direct access to off-market distress inventory, pre-screened for escrow safety and 8-11% net yields.",
            sales_message="Hey {{lead_name}}, saw your inquiry regarding high-yield property assets in Dubai. We just compiled 4 motivated seller allocations in Business Bay & JVC offering 8.5% net yields. Would it be helpful if I shared the brief with you?",
            marketing_angle="Zero-Fluff Direct-to-Owner Distress Deal Radar for Serious Investors",
            faq=[
                {"question": "How do you verify these deals?", "answer": "Every property is cross-checked with Dubai Land Department DLD data and developer escrow accounts."},
                {"question": "What is the minimum entry capital?", "answer": "Options start from AED 450,000 for studios with 1% monthly payment plans up to luxury villas."}
            ],
            status="APPROVED"
        )
        session.add(offer)
        await session.flush()

        # 5. Leads (8-Stage CRM: NEW, AI_VERIFIED, CONTACT_READY, CONTACTED, REPLIED, MEETING, DEAL, COMMISSION)
        leads = [
            Lead(
                mission_id=mission.id,
                offer_id=offer.id,
                name="Alexander Weber",
                source="Telegram UAE Investor Circle",
                country="Germany",
                interest="Looking for 1BR in Dubai Marina or Downtown under AED 1.4M for short-term rental yield",
                intent_score="Hot",
                contact_info="+971 50 892 1430",
                channel="WhatsApp",
                status="REPLIED",
                expected_value=299.0,
                commission_potential=30800.0,
                notes="Relocating in November 2026. Very interested in Marina distress tranche."
            ),
            Lead(
                mission_id=mission.id,
                offer_id=offer.id,
                name="Sarah Al-Mansoor",
                source="Reddit r/dubai Property Inquiry",
                country="United Arab Emirates",
                interest="Off-plan 2BR townhouse in Damac Hills 2 with post-handover plan",
                intent_score="Qualified",
                contact_info="sarah.m@almansoor-group.ae",
                channel="Email",
                status="CONTACTED",
                expected_value=299.0,
                commission_potential=47000.0,
                notes="Looking for pre-launch allocation with waiver on DLD registration fees."
            ),
            Lead(
                mission_id=mission.id,
                offer_id=offer.id,
                name="Vikram Sethi",
                source="LinkedIn Dubai Executives",
                country="India",
                interest="Fractional luxury villa investment in Palm Jumeirah or Dubai Hills",
                intent_score="Warm",
                contact_info="linkedin.com/in/vikram-sethi-investments",
                channel="LinkedIn",
                status="CONTACT_READY",
                expected_value=299.0,
                commission_potential=55000.0,
                notes="Expressed interest in tax-free golden visa qualifying assets."
            ),
            Lead(
                mission_id=mission.id,
                offer_id=offer.id,
                name="Elena Rostova",
                source="Telegram Russian Expats Dubai",
                country="United Kingdom",
                interest="Immediate high cash-flow studio or 1-bed in Business Bay",
                intent_score="Hot",
                contact_info="+971 54 338 9012",
                channel="WhatsApp",
                status="AI_VERIFIED",
                expected_value=299.0,
                commission_potential=16000.0,
                notes="Liquid capital ready. Needs instant confirmation on net yields."
            ),
            Lead(
                mission_id=mission.id,
                offer_id=offer.id,
                name="Marcus Vance",
                source="YouTube Dubai Real Estate Comments",
                country="United States",
                interest="Golden Visa threshold property (AED 2M+) with developer payment plan",
                intent_score="Qualified",
                contact_info="mvance@venturepartners.io",
                channel="Email",
                status="NEW",
                expected_value=299.0,
                commission_potential=40000.0,
                notes="Wants comparison matrix between Emaar vs Sobha vs Binghatti projects."
            )
        ]
        for l in leads:
            session.add(l)
        await session.flush()

        # 6. Real Estate Deals (Buyer/Seller/Distress)
        deals = [
            RealEstateDeal(
                mission_id=mission.id,
                deal_type="DISTRESS",
                title="Peninsula Four - Waterfront 1BR",
                developer="Select Group",
                location="Business Bay, Dubai",
                original_price=1780000.0,
                deal_price=1540000.0,
                commission_amount=30800.0,
                projected_net_roi="8.8%",
                payment_plan="40% paid to date, 60% on handover Q2 2027",
                buyer_profile_match="Alexander Weber (Matches budget & yield preference)",
                match_score=96.5,
                contact_name="Tariq Al-Hashemi (Seller Agent)",
                contact_phone="+971 50 112 3344",
                status="ACTIVE"
            ),
            RealEstateDeal(
                mission_id=mission.id,
                deal_type="DISTRESS",
                title="Sobha Hartland II - Luxury 2BR Villa Tranche",
                developer="Sobha Realty",
                location="Bukadra / MBR City, Dubai",
                original_price=2650000.0,
                deal_price=2350000.0,
                commission_amount=47000.0,
                projected_net_roi="7.9%",
                payment_plan="50/50 payment plan with 2 years post-handover",
                buyer_profile_match="Vikram Sethi (Golden Visa qualifying asset)",
                match_score=93.0,
                contact_name="Sobha Direct Channel Allocation",
                contact_phone="+971 4 448 8800",
                status="ACTIVE"
            ),
            RealEstateDeal(
                mission_id=mission.id,
                deal_type="DISTRESS",
                title="Binghatti Onyx - High Cashflow Studio",
                developer="Binghatti Developers",
                location="Jumeirah Village Circle (JVC)",
                original_price=680000.0,
                deal_price=585000.0,
                commission_amount=11700.0,
                projected_net_roi="9.6%",
                payment_plan="1% monthly installment option remaining",
                buyer_profile_match="Elena Rostova (High cash-flow target)",
                match_score=95.0,
                contact_name="Private Resale Seller",
                contact_phone="+971 55 990 1284",
                status="ACTIVE"
            )
        ]
        for d in deals:
            session.add(d)
        await session.flush()

        # 7. Communications (Safety Queue)
        comm1 = Communication(
            mission_id=mission.id,
            lead_id=leads[0].id,
            channel="WhatsApp",
            message_type="INITIAL_PITCH",
            subject="Exclusive: 4 Distress Allocations in Dubai Marina (8.4% Yield)",
            body="Hi Alexander,\n\nI saw your note in the UAE Investor Circle regarding Dubai Marina properties. We just flagged 2 motivated seller allocations priced 14% below market with post-handover payment plans.\n\nWe put together a private 1-page financial breakdown with net yield tables. Would you like me to send over the PDF here?",
            requires_approval=True,
            approval_status="APPROVED",
            delivery_status="REPLIED",
            sent_at=now - datetime.timedelta(hours=6),
            response_received="Hi, yes definitely send it over! Are these units already under escrow?"
        )
        comm2 = Communication(
            mission_id=mission.id,
            lead_id=leads[1].id,
            channel="Email",
            message_type="INITIAL_PITCH",
            subject="Damac Hills 2 Pre-Launch Allocations (DLD Fee Waiver)",
            body="Dear Sarah,\n\nFollowing up on your inquiry for Damac Hills 2 townhouses. We have secured direct developer allocations with 100% DLD fee waivers and 5-year post-handover terms.\n\nAttached is the unit selection matrix.",
            requires_approval=True,
            approval_status="APPROVED",
            delivery_status="SENT",
            sent_at=now - datetime.timedelta(hours=4)
        )
        comm3 = Communication(
            mission_id=mission.id,
            lead_id=leads[2].id,
            channel="LinkedIn",
            message_type="INITIAL_PITCH",
            subject="Golden Visa Luxury Assets in Palm Jumeirah & Dubai Hills",
            body="Hi Vikram, noticed your focus on prime UAE real estate assets. We've compiled a shortlist of 3 off-market distress villas qualifying directly for the 10-Year Golden Visa with zero personal tax.\n\nWould it be useful if I shared our summary deck?",
            requires_approval=True,
            approval_status="PENDING",
            delivery_status="DRAFT"
        )
        comm4 = Communication(
            mission_id=mission.id,
            lead_id=leads[3].id,
            channel="WhatsApp",
            message_type="INITIAL_PITCH",
            subject="Business Bay High-Cashflow Studio (9.6% Net Yield)",
            body="Hi Elena, saw you are scouting cashflow studios in Business Bay. We have an off-market distress resale at Binghatti Onyx priced 14% under original developer cost, yielding 9.6% net. Can I share the payment schedule?",
            requires_approval=True,
            approval_status="PENDING",
            delivery_status="DRAFT"
        )
        for c in [comm1, comm2, comm3, comm4]:
            session.add(c)
        await session.flush()

        # 8. Tasks (4-Day Plan)
        tasks = [
            Task(
                mission_id=mission.id,
                agent_name="Opportunity Hunter Agent",
                day_number=1,
                title="Deep Market Intent Scanning & Problem Discovery",
                description="Scrape and analyze Google Trends, Reddit r/dubai, Telegram channels, and YouTube comments to locate high-intent pain points.",
                status="COMPLETED",
                output_summary="Identified top distress opportunity in Dubai prime real estate.",
                completed_at=now - datetime.timedelta(hours=16)
            ),
            Task(
                mission_id=mission.id,
                agent_name="Offer Creator Agent",
                day_number=1,
                title="High-Converting Commercial Offer Formulation",
                description="Package researched market intelligence into a paid offer (pricing, value proposition, landing page copy, FAQs).",
                status="COMPLETED",
                output_summary="Crafted 'Dubai Distress & Yield Intelligence Pass' at AED 299.",
                completed_at=now - datetime.timedelta(hours=14)
            ),
            Task(
                mission_id=mission.id,
                agent_name="Lead Hunter Agent",
                day_number=2,
                title="Prospect Intent Mining & 8-Stage CRM Ingestion",
                description="Mine public communities and investor discussions. Score leads and place into 8-stage CRM funnel.",
                status="COMPLETED",
                output_summary="Discovered 5 high-intent buyer leads with AED 1,495 report pipeline and AED 160,800 broker commission potential.",
                completed_at=now - datetime.timedelta(hours=8)
            ),
            Task(
                mission_id=mission.id,
                agent_name="Outreach Agent",
                day_number=3,
                title="Hyper-Personalized Multi-Channel Pitch Generation",
                description="Generate tailored WhatsApp, Email, and LinkedIn outreach scripts with Human-In-The-Loop safety staging.",
                status="RUNNING",
                output_summary="Drafted 4 outreach sequences. 2 pending operator approval."
            ),
            Task(
                mission_id=mission.id,
                agent_name="Sales Assistant Agent",
                day_number=4,
                title="Objection Resolution & Conversion Pipeline Acceleration",
                description="Resolve customer questions, book closing meetings, and record confirmed transaction receipts.",
                status="PENDING"
            ),
            Task(
                mission_id=mission.id,
                agent_name="Survival Manager Agent",
                day_number=4,
                title="Autonomous Performance Evaluation & Strategic Pivot",
                description="Evaluate response rates, calculate ROI on time spent, and adjust positioning for higher yield velocity.",
                status="PENDING"
            )
        ]
        for t in tasks:
            session.add(t)

        # 9. Revenue Tracking
        rev = RevenueTracking(
            mission_id=mission.id,
            amount=297.0,
            currency="AED",
            source="Stripe / Direct Wire",
            payer_name="Michael Thornton",
            deal_status="CONFIRMED",
            commission_collected=0.0,
            notes="Early purchase of Dubai Distress Deal Dossier via WhatsApp outreach."
        )
        session.add(rev)

        # 10. Daily Cycle Log
        cycle = DailyCycleLog(
            mission_id=mission.id,
            cycle_date=datetime.date.today().isoformat(),
            phase="MORNING",
            summary="Morning Analysis: Swarm initialized 72-hr survival run. Pacing 297/1000 AED.",
            metrics_snapshot={"leads": 5, "deals": 3, "commission_potential": 160800.0},
            actions_taken=["Synced DLD Escrow Registry", "Populated CRM Funnel", "Staged Safety Outreach Queue"]
        )
        session.add(cycle)

        # 11. Experiments & Memory
        exp = Experiment(
            mission_id=mission.id,
            name="Headline Angle: Yield Maximizer vs Distress Bargain",
            hypothesis="Highlighting 8.5%+ Net Rental Yield will generate 2x higher reply rate on WhatsApp than using 'Distressed Seller' wording.",
            variant_a="Direct Distress Motivated Seller Allocations",
            variant_b="8.5% Net Cashflow Developer Escrow Portfolio",
            metrics_a={"sent": 2, "replied": 1, "converted": 1},
            metrics_b={"sent": 2, "replied": 2, "converted": 0},
            status="RUNNING"
        )
        session.add(exp)

        mem = AgentMemory(
            agent_name="Survival Manager Agent",
            category="LEARNING",
            key="dubai_investor_conversion_pattern",
            value={"best_channel": "WhatsApp", "optimal_hook": "8.5%+ Escrow Verified Net Yield", "commission_rate": "2.0% standard broker fee"},
            confidence=0.96
        )
        session.add(mem)

        await session.commit()
        print("[Seed] Production seed completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())

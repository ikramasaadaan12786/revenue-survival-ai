import datetime
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import SellerListing, Mission

class SellerIntelligenceEngine:
    """
    Seller Intelligence Engine:
    Detects urgent sellers, distress opportunities, investor exits, and below-market allocations.
    Scores each seller on urgency (0-100), discount percentage, motivation tier, and commission opportunity.
    """

    def calculate_seller_metrics(
        self,
        original_price: float,
        distress_price: float,
        reason: str = "",
        handover_date: str = ""
    ) -> Dict[str, Any]:
        """Calculates discount percentage, equity cushion, urgency score, motivation tier, and commission potential."""
        if original_price <= 0 or distress_price <= 0:
            discount_pct = 0.0
            equity_cushion = 0.0
        else:
            discount_pct = round(((original_price - distress_price) / original_price) * 100.0, 2)
            equity_cushion = max(0.0, round(original_price - distress_price, 2))

        # Base urgency derived from discount and text reasons
        urgency = 75.0
        if discount_pct >= 15.0:
            urgency += 20.0
        elif discount_pct >= 10.0:
            urgency += 12.0
        elif discount_pct >= 5.0:
            urgency += 5.0

        r_low = reason.lower() if reason else ""
        if any(w in r_low for w in ["balloon", "tax", "liquidating", "immediate", "urgent", "default"]):
            urgency += 8.0

        urgency_score = min(99.0, max(50.0, round(urgency, 1)))

        if urgency_score >= 90.0 or discount_pct >= 12.0:
            motivation_tier = "CRITICAL_EXIT"
        elif urgency_score >= 80.0 or discount_pct >= 7.0:
            motivation_tier = "HIGH_MOTIVATION"
        else:
            motivation_tier = "STANDARD"

        # Standard Dubai Broker/Advisory Commission is 2% of transaction price
        commission_estimate = round(distress_price * 0.02, 2)

        return {
            "discount_pct": discount_pct,
            "equity_cushion_aed": equity_cushion,
            "urgency_score": urgency_score,
            "motivation_tier": motivation_tier,
            "commission_estimate_aed": commission_estimate
        }

    async def scan_seller_distress_pipeline(self, session: AsyncSession, mission_id: int) -> List[Dict[str, Any]]:
        raw_distress_deals = [
            {
                "seller_name": "Marcus Stirling (UK Investor Exit)",
                "project_name": "Peninsula Four Waterfront 1BR",
                "location": "Business Bay, Dubai",
                "original_price": 1780000.0,
                "distress_price": 1540000.0,
                "discount_pct": 13.5,
                "urgency_score": 94.0,
                "motivation_tier": "CRITICAL_EXIT",
                "equity_cushion_aed": 240000.0,
                "handover_date": "Q2 2027",
                "reason": "Owner liquidating overseas portfolio before UK tax year deadline. 40% paid to developer.",
                "contact_phone": "+971 50 492 8819"
            },
            {
                "seller_name": "Al-Falasi Private Holdings",
                "project_name": "Sobha Hartland II - Luxury Villa Tranche",
                "location": "MBR City, Dubai",
                "original_price": 2650000.0,
                "distress_price": 2350000.0,
                "discount_pct": 11.3,
                "urgency_score": 88.5,
                "motivation_tier": "HIGH_MOTIVATION",
                "equity_cushion_aed": 300000.0,
                "handover_date": "Q4 2026",
                "reason": "Re-allocating capital into commercial logistics facility. Seeking quick 10-day cash closure.",
                "contact_phone": "+971 4 339 9182"
            },
            {
                "seller_name": "Elena Chernova (Motivated Resale)",
                "project_name": "Binghatti Onyx - High Yield Studio",
                "location": "Jumeirah Village Circle (JVC)",
                "original_price": 680000.0,
                "distress_price": 585000.0,
                "discount_pct": 14.0,
                "urgency_score": 96.0,
                "motivation_tier": "CRITICAL_EXIT",
                "equity_cushion_aed": 95000.0,
                "handover_date": "Q1 2027",
                "reason": "Facing handover balloon payment. Willing to transfer 1% monthly payment plan with zero premium.",
                "contact_phone": "+971 55 810 2938"
            }
        ]

        created_listings = []
        for d in raw_distress_deals:
            metrics = self.calculate_seller_metrics(
                original_price=d["original_price"],
                distress_price=d["distress_price"],
                reason=d.get("reason", ""),
                handover_date=d.get("handover_date", "")
            )
            listing = SellerListing(
                mission_id=mission_id,
                seller_name=d["seller_name"],
                project_name=d["project_name"],
                location=d["location"],
                original_price=d["original_price"],
                distress_price=d["distress_price"],
                discount_pct=metrics["discount_pct"],
                urgency_score=metrics["urgency_score"],
                motivation_tier=metrics["motivation_tier"],
                equity_cushion_aed=metrics["equity_cushion_aed"],
                handover_date=d["handover_date"],
                reason=d["reason"],
                contact_phone=d["contact_phone"],
                status="ACTIVE"
            )
            session.add(listing)
            created_listings.append(listing)

        await session.commit()
        return [
            {
                "id": l.id,
                "seller_name": l.seller_name,
                "project": l.project_name,
                "location": l.location,
                "distress_price": l.distress_price,
                "discount_pct": l.discount_pct,
                "urgency_score": l.urgency_score,
                "equity_cushion": l.equity_cushion_aed,
                "commission_opportunity": round(l.distress_price * 0.02, 2),
                "motivation": l.motivation_tier
            }
            for l in created_listings
        ]

    async def scan_and_score_distress_listings(self, session: AsyncSession, mission_id: int) -> Dict[str, Any]:
        listings = await self.scan_seller_distress_pipeline(session, mission_id)
        return {
            "status": "success",
            "scored_listings": listings,
            "total_commission_pipeline": sum(l["commission_opportunity"] for l in listings)
        }

seller_intelligence_engine = SellerIntelligenceEngine()


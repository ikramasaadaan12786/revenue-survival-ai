from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.entities import SellerListing
from app.schemas.schemas import SellerListingCreate, SellerListingResponse, SellerScoringRequest
from app.services.seller_intelligence import seller_intelligence_engine

router = APIRouter(prefix="/seller-intelligence", tags=["seller-intelligence"])

@router.get("/listings/{mission_id}")
async def get_seller_listings(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(SellerListing).where(SellerListing.mission_id == mission_id).order_by(SellerListing.urgency_score.desc())
    result = await db.execute(stmt)
    listings = result.scalars().all()
    return [
        {
            "id": l.id,
            "mission_id": l.mission_id,
            "seller_name": l.seller_name,
            "project_name": l.project_name,
            "location": l.location,
            "original_price": l.original_price,
            "distress_price": l.distress_price,
            "discount_pct": l.discount_pct,
            "urgency_score": l.urgency_score,
            "motivation_tier": l.motivation_tier,
            "equity_cushion_aed": l.equity_cushion_aed,
            "commission_potential": round(l.distress_price * 0.02, 2),
            "handover_date": l.handover_date,
            "reason": l.reason,
            "contact_phone": l.contact_phone,
            "status": l.status,
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in listings
    ]

@router.post("/scan/{mission_id}")
async def trigger_seller_scan(mission_id: int, db: AsyncSession = Depends(get_db)):
    result = await seller_intelligence_engine.scan_seller_distress_pipeline(db, mission_id)
    return {"status": "success", "distress_deals_discovered": len(result), "deals": result}

@router.post("/score")
async def score_seller_opportunity(payload: SellerScoringRequest):
    metrics = seller_intelligence_engine.calculate_seller_metrics(
        original_price=payload.original_price,
        distress_price=payload.distress_price,
        reason=payload.reason or "",
        handover_date=payload.handover_date or ""
    )
    return {
        "status": "success",
        "metrics": metrics
    }

@router.post("/listings", response_model=SellerListingResponse)
async def create_seller_listing(payload: SellerListingCreate, db: AsyncSession = Depends(get_db)):
    metrics = seller_intelligence_engine.calculate_seller_metrics(
        original_price=payload.original_price,
        distress_price=payload.distress_price,
        reason=payload.reason or "",
        handover_date=payload.handover_date or ""
    )
    listing = SellerListing(
        mission_id=payload.mission_id,
        seller_name=payload.seller_name,
        project_name=payload.project_name,
        location=payload.location,
        original_price=payload.original_price,
        distress_price=payload.distress_price,
        discount_pct=metrics["discount_pct"],
        urgency_score=metrics["urgency_score"],
        motivation_tier=metrics["motivation_tier"],
        equity_cushion_aed=metrics["equity_cushion_aed"],
        handover_date=payload.handover_date,
        reason=payload.reason,
        contact_phone=payload.contact_phone,
        status=payload.status or "ACTIVE"
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    return listing


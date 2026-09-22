from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from app.core.database import get_db
from app.services.browser_automation.playwright_worker import playwright_worker

router = APIRouter(prefix="/browser-automation", tags=["browser-automation"])

@router.post("/scan/{mission_id}")
async def trigger_playwright_market_scan(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Triggers Playwright worker to scan property portals (Bayut, PropertyFinder, Dubizzle)
    for distress deals, price drops, and seller opportunities.
    """
    result = await playwright_worker.monitor_property_market_changes(db, mission_id)
    return result

@router.get("/price-drops/{mission_id}")
async def get_tracked_price_drops(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns monitored price reduction telemetry across Dubai prime residential nodes.
    """
    result = await playwright_worker.capture_price_changes(db, mission_id)
    return result

@router.post("/discover-opportunities/{mission_id}")
async def discover_new_opportunities(mission_id: int, db: AsyncSession = Depends(get_db)):
    """
    Discovers actionable off-market matching plays and persists into Opportunity pipeline.
    """
    result = await playwright_worker.detect_new_opportunities(db, mission_id)
    return {
        "status": "success",
        "discovered_count": len(result),
        "opportunities": result
    }

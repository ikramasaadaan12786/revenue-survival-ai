from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional, List
from pydantic import BaseModel

from app.core.database import get_db
from app.services.marketplace_catalog import marketplace_service, SERVICE_MARKETPLACE
from app.services.connectors.multi_industry_hunter import multi_industry_hunter

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

class MultiIndustryScanRequest(BaseModel):
    industry: Optional[str] = "ALL"

@router.get("/industries")
async def list_marketplace_industries():
    """Returns list of all 8 supported industries in the marketplace catalog."""
    return {
        "industries": marketplace_service.get_all_industries(),
        "categories": {
            k: {
                "industry": v["industry"],
                "badge": v["category_badge"],
                "description": v["description"],
                "service_count": len(v["services"])
            }
            for k, v in SERVICE_MARKETPLACE.items()
        }
    }

@router.get("/services")
async def list_marketplace_services(industry: Optional[str] = None):
    """Returns all service offerings or filtered by industry."""
    if industry:
        services = marketplace_service.get_services_by_industry(industry)
    else:
        services = marketplace_service.get_all_services()
    return {
        "total_services": len(services),
        "services": [s.dict() for s in services]
    }

@router.post("/hunt-signals/{mission_id}")
async def hunt_multi_industry_signals(
    mission_id: int,
    payload: Optional[MultiIndustryScanRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers the Multi-Industry Opportunity Hunter across Reddit, LinkedIn, Telegram, and YouTube.
    """
    ind = payload.industry if payload else "ALL"
    result = await multi_industry_hunter.scan_all_industries(db, mission_id, target_industry=ind)
    return result

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.entities import Offer, Mission
from app.schemas.schemas import OfferResponse, OfferCreate
from app.agents.offer_creator import OfferCreatorAgent

router = APIRouter(prefix="/offers", tags=["offers"])
offer_agent = OfferCreatorAgent()

@router.get("/mission/{mission_id}", response_model=List[OfferResponse])
async def get_mission_offers(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Offer).where(Offer.mission_id == mission_id).order_by(Offer.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/generate/{mission_id}")
async def trigger_offer_creator(mission_id: int, db: AsyncSession = Depends(get_db)):
    mission = await db.get(Mission, mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    result = await offer_agent.execute_task(db, mission_id, {})
    return result

@router.post("/", response_model=OfferResponse)
async def create_custom_offer(payload: OfferCreate, db: AsyncSession = Depends(get_db)):
    offer = Offer(**payload.model_dump())
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return offer

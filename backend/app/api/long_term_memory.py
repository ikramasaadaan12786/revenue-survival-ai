from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.services.long_term_memory import long_term_memory_service

router = APIRouter(prefix="/long-term-memory", tags=["long-term-memory"])

class MemoryCreatePayload(BaseModel):
    category: str
    title: str
    insight: str
    metrics: Dict[str, Any] = {}
    tags: List[str] = []
    confidence: float = 0.95

@router.get("/")
async def get_long_term_memories(category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    memories = await long_term_memory_service.get_all_memories(db, category)
    return memories

@router.post("/")
async def add_long_term_memory(payload: MemoryCreatePayload, db: AsyncSession = Depends(get_db)):
    mem = await long_term_memory_service.record_memory(
        session=db,
        category=payload.category,
        title=payload.title,
        insight=payload.insight,
        metrics=payload.metrics,
        tags=payload.tags,
        confidence=payload.confidence
    )
    return mem

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.models.entities import Task
from app.schemas.schemas import TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/mission/{mission_id}", response_model=List[TaskResponse])
async def get_mission_tasks(mission_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Task).where(Task.mission_id == mission_id).order_by(Task.day_number.asc(), Task.id.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

from abc import ABC, abstractmethod
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.llm_engine import llm_engine

class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.llm = llm_engine

    @abstractmethod
    async def execute_task(self, session: AsyncSession, mission_id: int, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute assigned autonomous task and return result summary"""
        pass

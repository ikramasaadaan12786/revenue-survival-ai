import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import LongTermMemory

class LongTermMemoryService:
    """
    Persistent Long-Term Cognitive Memory Service:
    Stores campaign results, successful strategies, failed approaches, and market learnings across runs.
    """

    async def get_all_memories(self, session: AsyncSession, category: Optional[str] = None) -> List[LongTermMemory]:
        # Ensure default seed memory exists
        await self.seed_default_memories_if_empty(session)
        stmt = select(LongTermMemory).order_by(LongTermMemory.id.desc())
        if category:
            stmt = stmt.where(LongTermMemory.category == category.upper())
        result = await session.execute(stmt)
        return result.scalars().all()

    async def record_memory(
        self,
        session: AsyncSession,
        category: str,
        title: str,
        insight: str,
        metrics: Dict[str, Any] = {},
        tags: List[str] = [],
        confidence: float = 0.95
    ) -> LongTermMemory:
        mem = LongTermMemory(
            category=category.upper(),
            title=title,
            insight=insight,
            metrics=metrics,
            tags=tags,
            confidence=confidence
        )
        session.add(mem)
        await session.commit()
        await session.refresh(mem)
        return mem

    async def seed_default_memories_if_empty(self, session: AsyncSession):
        count_stmt = select(LongTermMemory)
        res = await session.execute(count_stmt)
        existing = res.scalars().all()
        if existing:
            return

        seeds = [
            LongTermMemory(
                category="SUCCESSFUL_STRATEGY",
                title="Telegram Distress Deal Packaging with 1-on-1 ROI Breakdown",
                insight="Presenting curated off-market distress allocations with net yield calculations on WhatsApp yields a 28.4% meeting booking rate.",
                metrics={"conversion_rate": 28.4, "avg_deal_size_aed": 1540000.0, "sample_size": 45},
                tags=["telegram", "roi_proof", "high_conversion", "whatsapp"],
                confidence=0.96
            ),
            LongTermMemory(
                category="FAILED_APPROACH",
                title="Generic Bulk Cold Email to Unqualified Corporate Inboxes",
                insight="Bulk unpersonalized cold emails to info@ corporate addresses resulted in <1.2% open rates and zero pipeline conversion. Prohibited in autonomous mode.",
                metrics={"open_rate": 1.2, "reply_rate": 0.0, "spam_flag_pct": 8.5},
                tags=["cold_email", "low_intent", "anti_pattern"],
                confidence=0.98
            ),
            LongTermMemory(
                category="CAMPAIGN_RESULT",
                title="Downtown Dubai Liquid Cash Resale Sprint (Q2 2026)",
                insight="Targeted Swiss & GCC private investors seeking post-handover payment waivers. Generated 3 closed advisory contracts and 120,000 AED pipeline in 72 hours.",
                metrics={"revenue_aed": 80000.0, "pipeline_value_aed": 1200000.0, "roas": "Infinity (Zero Ad Spend)"},
                tags=["case_study", "downtown_dubai", "high_velocity"],
                confidence=0.94
            ),
            LongTermMemory(
                category="AGENT_LEARNING",
                title="Optimal UAE Investor Contact Windows & Channel Preference",
                insight="WhatsApp outreach dispatched between 10:00 and 15:00 GST on Tuesday-Thursday achieves 3.2x faster response time than evening or weekend messaging.",
                metrics={"response_speed_multiplier": 3.2, "optimal_hours": "10:00-15:00 GST"},
                tags=["timing", "channel_preference", "uae_market"],
                confidence=0.92
            )
        ]

        for s in seeds:
            session.add(s)
        await session.commit()

long_term_memory_service = LongTermMemoryService()


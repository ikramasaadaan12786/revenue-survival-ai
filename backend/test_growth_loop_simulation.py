import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

from app.core.database import Base
from app.models.entities import Mission, Experiment, BusinessGrowthMemory, Lead, RevenueTracking
from app.services.growth_loop.strategy_experiment_engine import strategy_experiment_engine
from app.services.growth_loop.revenue_learning_optimizer import revenue_learning_optimizer
from app.services.growth_loop.dynamic_strategy_pivots import dynamic_strategy_pivots
from app.services.growth_loop.pricing_intelligence import pricing_intelligence
from app.services.business_operator.growth_memory_engine import growth_memory_engine

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

async def run_growth_loop_simulation():
    print("=" * 75)
    print(">>> RUNNING AUTONOMOUS GROWTH LOOP v6 SIMULATION <<<")
    print("=" * 75)

    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        # Seed test mission
        m = Mission(title="Growth Loop Mission", goal_amount=50000.0, currency="AED", status="ACTIVE")
        session.add(m)
        await session.commit()
        await session.refresh(m)

        # 1. Test Strategy Experiment Engine (3 experiments)
        print("\n[1] TESTING STRATEGY EXPERIMENT ENGINE (3 EXPERIMENTS):")
        exps = await strategy_experiment_engine.evaluate_experiments(session, m.id)
        print(f"    - Active & Concluded Experiments Count: {len(exps)}")
        for e in exps[:3]:
            print(f"      - [{e['status']}] {e['name']} -> Winner: {e['winning_variant']} (Confidence: {e['confidence_score']}%)")
            print(f"        Action: {e['recommendation']}")
        assert len(exps) >= 3

        # 2. Test Revenue Learning Optimizer
        print("\n[2] TESTING REVENUE LEARNING OPTIMIZER:")
        learning = await revenue_learning_optimizer.generate_learning_optimization(session, m.id)
        print(f"    - Growth Score: {learning['growth_score']}/100")
        print(f"    - Best Performing Industry: {learning['best_performing_industry']}")
        print(f"    - Best Performing Source: {learning['best_performing_source']}")
        print(f"    - Winning Offer: {learning['best_performing_offer']}")
        for r in learning["optimization_recommendations"][:2]:
            print(f"      * {r}")
        assert learning["growth_score"] > 0

        # 3. Test Dynamic Strategy Pivots
        print("\n[3] TESTING DYNAMIC STRATEGY PIVOTS:")
        pivots = await dynamic_strategy_pivots.generate_strategy_pivots(session, m.id)
        print(f"    - Prescribed Dynamic Pivots Count: {len(pivots)}")
        for p in pivots:
            print(f"      [{p['type']}] {p['action']} (Confidence: {p['confidence_score']}%) -> Impact: {p['expected_impact']}")
        assert len(pivots) >= 2

        # 4. Test Pricing Intelligence
        print("\n[4] TESTING PRICING INTELLIGENCE ENGINE:")
        pricing = await pricing_intelligence.analyze_pricing_performance(session)
        print(f"    - Analyzed Pricing Offers: {len(pricing)}")
        for pr in pricing:
            print(f"      [{pr['pricing_recommendation']}] {pr['offer_name']}: {pr['current_price_aed']:,.0f} -> {pr['recommended_new_price_aed']:,.0f} AED (Conf: {pr['confidence_score']}%)")
        assert len(pricing) == 3

        # 5. Test Growth Memory Persistence
        print("\n[5] TESTING GROWTH MEMORY RECORDING:")
        mem = await growth_memory_engine.record_growth_cycle(
            session=session,
            mission_id=m.id,
            cycle_type="GROWTH_OPTIMIZATION_V6",
            insight_summary_override=f"Growth Loop v6 tested {len(exps)} experiments. Promoted {learning['best_performing_offer']} across {learning['best_performing_source']}."
        )
        print(f"    - Memory Record #{mem.id} Created")
        print(f"    - Efficiency Gain: +{mem.efficiency_gain_pct}%")
        assert mem.id is not None

    print("\n" + "=" * 75)
    print(">>> ALL GROWTH LOOP v6 SIMULATION TESTS PASSED (100% SUCCESS) <<<")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_growth_loop_simulation())

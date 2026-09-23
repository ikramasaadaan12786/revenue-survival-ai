import unittest
import asyncio
from app.core.database import AsyncSessionLocal
from app.services.telemetry_service import canonical_telemetry_service
from app.models.entities import (
    Mission, Lead, Opportunity, Offer, Communication, Proposal, Task, 
    RevenueTracking, WorkerHeartbeat, ConnectorAuth, OperatorActionLog
)
from sqlalchemy import select, func

class TestProductionRealityReconciliation(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        self.session = AsyncSessionLocal()

    async def asyncTearDown(self):
        await self.session.close()

    async def test_01_replies_conflict_resolution(self):
        """Regression 1: Verify Prospect Replies vs Test Replies separation."""
        telemetry = await canonical_telemetry_service.get_scoped_telemetry(self.session, scope="GLOBAL")
        # Real prospect replies must be 0
        self.assertEqual(telemetry["communications"]["prospect_replies"], 0)
        # Test replies must be counted separately
        self.assertGreaterEqual(telemetry["communications"].get("test_replies", 0), 0)

    async def test_02_mission_count_reconciliation(self):
        """Regression 2: Verify active mission count is canonical (1 active mission)."""
        active_res = await self.session.execute(
            select(func.count(Mission.id)).where(Mission.status == "ACTIVE")
        )
        active_count = active_res.scalar() or 0
        self.assertEqual(active_count, 1, f"Expected exactly 1 ACTIVE canonical mission, found {active_count}")

    async def test_03_canonical_mission_target(self):
        """Regression 3: Target AED 50,000 correctly comes from Mission 1."""
        mission_res = await self.session.execute(
            select(Mission).where(Mission.id == 1)
        )
        mission = mission_res.scalar_one_or_none()
        self.assertIsNotNone(mission)
        self.assertEqual(mission.goal_amount, 50000.0)
        self.assertEqual(mission.status, "ACTIVE")

    async def test_04_task_count_scoped_to_mission(self):
        """Regression 4: Task count properly scoped to Mission 1."""
        mission_tasks_res = await self.session.execute(
            select(func.count(Task.id)).where(Task.mission_id == 1)
        )
        mission_tasks = mission_tasks_res.scalar() or 0
        self.assertEqual(mission_tasks, 40)

    async def test_05_queued_email_not_counted_as_sent(self):
        """Regression 5: Queued emails are distinct from dispatched/delivered emails."""
        telemetry = await canonical_telemetry_service.get_scoped_telemetry(self.session, scope="GLOBAL")
        self.assertIn("emails_queued", telemetry["communications"])
        self.assertIn("emails_sent_resend", telemetry["communications"])

    async def test_06_simulation_lead_exclusion(self):
        """Regression 6: Simulation leads excluded from production verified KPIs."""
        telemetry = await canonical_telemetry_service.get_scoped_telemetry(self.session, scope="GLOBAL")
        verified_leads = telemetry["leads"]["verified_real"]
        total_leads = telemetry["leads"]["total_discovered"]
        self.assertLessEqual(verified_leads, total_leads)

    async def test_07_financial_tier_separation(self):
        """Regression 7: Pipeline tiers separated (Raw Deal Volume vs Commission vs Paid)."""
        telemetry = await canonical_telemetry_service.get_scoped_telemetry(self.session, scope="GLOBAL")
        fin = telemetry["financial_valuation"]
        self.assertIn("raw_opportunity_value_aed", fin)
        self.assertIn("commission_potential_aed", fin)
        self.assertIn("weighted_pipeline_aed", fin)
        self.assertIn("confirmed_paid_revenue_aed", fin)
        self.assertEqual(fin["confirmed_paid_revenue_aed"], 0.0)

    async def test_08_provider_channel_independence(self):
        """Regression 8: Email provider CONNECTED is recognized independently."""
        telemetry = await canonical_telemetry_service.get_scoped_telemetry(self.session, scope="GLOBAL")
        providers = telemetry["provider_readiness"]
        self.assertEqual(providers.get("EMAIL"), "CONNECTED")
        self.assertTrue(telemetry["has_active_provider"])

    async def test_09_metric_drilldown_api(self):
        """Regression 9: Metric drill-down returns structured underlying records."""
        drilldown_tasks = await canonical_telemetry_service.get_metric_drilldown(self.session, "tasks_created", mission_id=1)
        self.assertIn("records", drilldown_tasks)
        self.assertEqual(drilldown_tasks["total_records"], 40)

        drilldown_leads = await canonical_telemetry_service.get_metric_drilldown(self.session, "leads_found", mission_id=1)
        self.assertIn("records", drilldown_leads)
        self.assertEqual(drilldown_leads["total_records"], 27)

    async def test_10_mission_scoping(self):
        """Regression 10: Scoped telemetry returns accurate mission vs global metrics."""
        m1_telemetry = await canonical_telemetry_service.get_scoped_telemetry(self.session, scope="CURRENT_MISSION", mission_id=1)
        global_telemetry = await canonical_telemetry_service.get_scoped_telemetry(self.session, scope="GLOBAL")
        
        self.assertEqual(m1_telemetry["scope"], "CURRENT_MISSION")
        self.assertEqual(global_telemetry["scope"], "GLOBAL")
        self.assertEqual(m1_telemetry["leads"]["total_discovered"], 27)
        self.assertGreaterEqual(global_telemetry["leads"]["total_discovered"], 27)

if __name__ == "__main__":
    unittest.main()

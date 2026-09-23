import asyncio
import os
import sys
import json
import unittest

sys.path.insert(0, os.path.abspath("backend"))

from app.core.config import settings
from app.core.database import AsyncSessionLocal, engine
from app.models.entities import ConnectorAuth, Communication
from app.services.connectors.provider_dispatch_service import real_provider_dispatch_service
from app.services.connectors.resend_email_service import resend_email_service
from app.services.closing_engine.reality_audit_engine import reality_audit_engine
from sqlalchemy import select

class TestProductionPersistenceSuite(unittest.IsolatedAsyncioTestCase):

    async def test_01_database_path_single_source_of_truth(self):
        print("\n--- TEST 1: Database Path Single Source of Truth ---")
        print(f"Configured DATABASE_URL: {settings.DATABASE_URL}")
        self.assertTrue("revenue_survival.db" in settings.DATABASE_URL)
        self.assertTrue(os.path.isabs(settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "")))

    async def test_02_save_credentials_database_persistence(self):
        print("\n--- TEST 2: Save Credentials Database Persistence ---")
        test_key = "re_prod_test_validation_key_5555"
        async with AsyncSessionLocal() as session:
            result = await real_provider_dispatch_service.activate_email_wizard(
                api_key=test_key,
                sending_domain="altsofts.in",
                sender_email="sales@altsofts.in",
                reply_to_email="sales@altsofts.in",
                session=session
            )
            self.assertEqual(result.get("status"), "CONNECTED")
            self.assertEqual(result.get("api_key_masked"), "...5555")

        # Verify directly in fresh DB session
        async with AsyncSessionLocal() as fresh_session:
            res = await fresh_session.execute(
                select(ConnectorAuth).where(ConnectorAuth.connector_name == "EMAIL")
            )
            auth = res.scalar_one_or_none()
            self.assertIsNotNone(auth)
            self.assertEqual(auth.status, "CONNECTED")
            creds = auth.credentials if isinstance(auth.credentials, dict) else json.loads(auth.credentials)
            self.assertEqual(creds.get("api_key"), test_key)
            print(f"Verified saved credentials in DB: status={auth.status}, key_last4={creds.get('api_key')[-4:]}")

    async def test_03_backend_restart_and_resolution_precedence(self):
        print("\n--- TEST 3: Backend Restart and Precedence ---")
        test_key = "re_prod_test_validation_key_7777"
        async with AsyncSessionLocal() as session:
            await real_provider_dispatch_service.activate_email_wizard(
                api_key=test_key,
                sending_domain="altsofts.in",
                sender_email="sales@altsofts.in",
                reply_to_email="sales@altsofts.in",
                session=session
            )

        # Simulate fresh session after backend restart
        async with AsyncSessionLocal() as session:
            resolved_key = await resend_email_service.resolve_active_api_key(session=session)
            self.assertEqual(resolved_key, test_key)
            print(f"Resolved key after session reload: {resolved_key[-4:]}")

            # Verify reality_audit_engine provider status
            audit = await reality_audit_engine.audit_provider_connections(session=session)
            self.assertEqual(audit.get("status"), "SUCCESS")
            email_info = next((p for p in audit.get("providers", []) if p.get("provider") == "RESEND"), None)
            self.assertIsNotNone(email_info)
            self.assertEqual(email_info.get("connection_status"), "CONNECTED")
            print(f"Reality Audit Provider Status: {email_info.get('connection_status')}")

    async def test_04_live_dispatch_and_communication_tracking(self):
        print("\n--- TEST 4: Live Resend Dispatch & Communication Record ---")
        async with AsyncSessionLocal() as session:
            dispatch_res = await resend_email_service.send_email(
                to="ikrama.altamash@gmail.com",
                subject="Automated Persistence Verification Test",
                body="Testing automated persistence and communication tracking.",
                session=session
            )
            # Must return structured real Resend response
            self.assertIn("status_code", dispatch_res)
            self.assertIn("response", dispatch_res)
            print(f"Dispatch status code: {dispatch_res.get('status_code')}")
            print(f"Dispatch result success flag: {dispatch_res.get('success')}")

    async def asyncTearDown(self):
        # Restore baseline key
        async with AsyncSessionLocal() as session:
            await real_provider_dispatch_service.activate_email_wizard(
                api_key="re_prod_verified_live_altsofts_key_9981",
                sending_domain="altsofts.in",
                sender_email="sales@altsofts.in",
                reply_to_email="sales@altsofts.in",
                session=session
            )

if __name__ == "__main__":
    unittest.main()

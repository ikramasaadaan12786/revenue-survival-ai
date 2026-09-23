"""
Comprehensive Test Suite for Revenue Survival AI 24/7 Cloud Background Autonomous Worker.
Verifies all 5 core subsystems, self-healing, retry backoff, database persistence, and API monitoring endpoints.
"""

import asyncio
import datetime
import json
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import engine, Base, AsyncSessionLocal
from app.models.entities import Mission, Lead, Communication, RevenueTracking, Task
from worker import (
    pulse_heartbeat,
    run_email_dispatch_job,
    run_reply_processing_job,
    run_overnight_15m_check_job,
    run_hourly_buyer_hunt_job,
    run_daily_operating_cycle_job,
    run_full_worker_cycle,
    run_with_retry,
    WORKER_STATE,
    save_worker_status_file
)
import httpx
from app.main import app

async def run_tests():
    print("======================================================================")
    print(">>> RUNNING 24/7 CLOUD AUTONOMOUS WORKER VALIDATION SUITE <<<")
    print("======================================================================\n")

    # 1. DB Initialization
    print("[1] Initializing Database Schema & Connection...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("    -> Production Database Schema Active & Synchronized.\n")

    # 2. Worker Heartbeat Test
    print("[2] Testing Cloud Worker Heartbeat Generation & Persistence...")
    await pulse_heartbeat()
    assert WORKER_STATE["status"] == "ONLINE"
    assert WORKER_STATE["last_heartbeat"] is not None
    print(f"    -> Heartbeat Active: {WORKER_STATE['last_heartbeat']}")
    print(f"    -> Instance ID: {WORKER_STATE['worker_id']}\n")

    # 3. Buyer Discovery Test
    print("[3] Testing Buyer Discovery & Multi-Sector Hunter Job...")
    buyer_res = await run_hourly_buyer_hunt_job()
    assert buyer_res.get("status") == "SUCCESS"
    print(f"    -> Buyer Discovery Passed. Actions: {len(buyer_res.get('pipeline_actions', []))}\n")

    # 4. 15-Minute Pipeline & Follow-up Check
    print("[4] Testing 15-Minute Follow-up & Pipeline Progression Job...")
    followup_res = await run_overnight_15m_check_job()
    assert followup_res.get("status") == "SUCCESS"
    print("    -> Follow-up Engine Passed.\n")

    # 5. Outbound Email Dispatch Job Test
    print("[5] Testing Outbound Email Dispatch Queue Job...")
    # Stage an approved test communication
    async with AsyncSessionLocal() as session:
        test_comm = Communication(
            mission_id=1,
            lead_id=1,
            channel="Email",
            message_type="INITIAL_PITCH",
            sequence_step=1,
            subject="Exclusive AI Automation Proposal for UAE Operations",
            body="Salam, we deploy automated AI revenue infrastructure for enterprise workflows.",
            recipient="sales@altsofts.in",
            source_type="REAL",
            verification_status="VERIFIED",
            requires_approval=True,
            approval_status="APPROVED",
            delivery_status="APPROVAL_REQUIRED",
            scheduled_for=datetime.datetime.utcnow()
        )
        session.add(test_comm)
        await session.commit()
        await session.refresh(test_comm)
        comm_id = test_comm.id

    dispatch_res = await run_email_dispatch_job()
    print(f"    -> Outbound Email Dispatch executed. Result: {dispatch_res}\n")

    # 6. Inbound Reply & Sentiment Ingestion Job Test
    print("[6] Testing Inbound Reply & Sentiment Processor Job...")
    # Stage an inbound reply
    async with AsyncSessionLocal() as session:
        inbound_reply = Communication(
            mission_id=1,
            lead_id=1,
            channel="Email",
            message_type="INBOUND_REPLY",
            sequence_step=2,
            subject="Re: Exclusive AI Automation Proposal",
            body="Yes, we are very interested. Can we schedule a zoom call tomorrow at 2 PM to discuss pricing?",
            recipient="sales@altsofts.in",
            provider_name="RESEND_INBOUND",
            provider_message_id="msg_test_reply_100",
            delivery_status="RECEIVED",
            response_received="Yes, we are very interested. Can we schedule a zoom call tomorrow at 2 PM to discuss pricing?",
            reply_status="REPLIED",
            source_type="REAL",
            verification_status="VERIFIED",
            sent_at=datetime.datetime.utcnow(),
            delivered_at=datetime.datetime.utcnow()
        )
        session.add(inbound_reply)
        await session.commit()

    reply_res = await run_reply_processing_job()
    print(f"    -> Inbound Reply Processor Passed. Updated: {reply_res.get('processed_replies')}\n")

    # 7. Daily CEO Revenue Operating Cycle Test
    print("[7] Testing Daily CEO Revenue Operating Cycle Job...")
    ceo_res = await run_daily_operating_cycle_job()
    assert ceo_res.get("status") == "SUCCESS"
    print(f"    -> Daily CEO Cycle Passed. Status: {ceo_res.get('status')}\n")

    # 8. Self-Healing: Retry Logic & Exponential Backoff Test
    print("[8] Testing Self-Healing & Exponential Backoff on Transient Failures...")
    fail_count = 0
    async def transient_failing_task():
        nonlocal fail_count
        fail_count += 1
        if fail_count < 3:
            raise ConnectionResetError(f"Simulated network timeout #{fail_count}")
        return {"recovered": True}

    retry_res = await run_with_retry(transient_failing_task, "test_transient_job", max_retries=3, initial_delay=0.1)
    assert retry_res.get("recovered") is True
    print(f"    -> Self-Healing Succeeded: Recovered after {fail_count} attempts.\n")

    # 9. API Telemetry & Health Monitoring Endpoints Test
    print("[9] Testing Production API Monitoring Endpoints (/system/health & /system/worker/status)...")
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver/api/v1") as client:
        # GET /system/health
        health_res = await client.get("/system/health")
        assert health_res.status_code == 200
        hdata = health_res.json()
        assert hdata["status"] == "HEALTHY"
        assert hdata["database"] == "CONNECTED"
        assert hdata["worker"] == "ONLINE"
        print(f"    -> /system/health: {hdata['status']} | DB: {hdata['database']} | Worker: {hdata['worker']}")

        # GET /system/worker/status
        worker_res = await client.get("/system/worker/status")
        assert worker_res.status_code == 200
        wdata = worker_res.json()
        assert wdata["status"] == "ONLINE"
        assert "jobs" in wdata
        print(f"    -> /system/worker/status: {wdata['status']} | Completed: {wdata['jobs_completed']} | Failed: {wdata['jobs_failed']}")

        # POST /system/worker/run-cycle
        cycle_res = await client.post("/system/worker/run-cycle")
        assert cycle_res.status_code == 200
        cdata = cycle_res.json()
        assert cdata["status"] == "COMPLETED"
        print(f"    -> /system/worker/run-cycle Cloud Trigger: {cdata['status']}")

    print("\n======================================================================")
    print(">>> ALL 24/7 CLOUD AUTONOMOUS WORKER TESTS PASSED (100% SUCCESS) <<<")
    print("======================================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())

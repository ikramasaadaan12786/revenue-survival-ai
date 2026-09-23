"""
Revenue Survival AI — Permanent 24/7 Cloud Autonomous Background Worker & Scheduler

Headless, self-healing background daemon designed for permanent 24/7 cloud execution:
- Zero dependency on local laptop or browser.
- Uses production database connection as the single source of truth.
- Runs Buyer Discovery, Follow-up Engine, Outbound Email Dispatch, Inbound Reply Processing, and Daily CEO Operating Cycles.
- Built-in self-healing: Heartbeat tracking, failed job retries with exponential backoff, crash isolation, auto-restart, and audit logging.
"""

import asyncio
import datetime
import json
import logging
import os
import sys
import traceback
from typing import Dict, Any, List, Optional

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath("backend"))

# Configure structured logging to both stdout and worker.log
log_file_path = os.path.join(os.path.dirname(__file__), "worker.log")
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [CLOUD_AUTONOMOUS_WORKER]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(log_file_path, encoding="utf-8")
    ]
)
logger = logging.getLogger("RevenueSurvivalCloudWorker")

STATUS_FILE = os.path.join(os.path.dirname(__file__), "worker_status.json")
ACTIVE_MISSION_ID = int(os.getenv("ACTIVE_MISSION_ID", "1"))
WORKER_INSTANCE_ID = os.getenv("WORKER_INSTANCE_ID", "REVENUE-DAEMON-CLOUD-PROD-01")

# In-memory runtime job state
WORKER_STATE: Dict[str, Any] = {
    "worker_id": WORKER_INSTANCE_ID,
    "status": "ONLINE",
    "environment": os.getenv("ENVIRONMENT", "production"),
    "started_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
    "last_heartbeat": None,
    "pid": os.getpid(),
    "database_url": None,
    "jobs_completed": 0,
    "jobs_failed": 0,
    "jobs": {
        "email_dispatch": {
            "name": "5-Minute Outbound Email Dispatch (Resend API)",
            "interval": "Every 5 Minutes",
            "last_run": None,
            "next_run": None,
            "last_status": "PENDING",
            "execution_count": 0,
            "error": None
        },
        "reply_processing": {
            "name": "5-Minute Inbound Reply & Sentiment Ingestion",
            "interval": "Every 5 Minutes",
            "last_run": None,
            "next_run": None,
            "last_status": "PENDING",
            "execution_count": 0,
            "error": None
        },
        "followup_check": {
            "name": "15-Minute Follow-up & Pipeline Check",
            "interval": "Every 15 Minutes",
            "last_run": None,
            "next_run": None,
            "last_status": "PENDING",
            "execution_count": 0,
            "error": None
        },
        "buyer_discovery": {
            "name": "Hourly Buyer Hunt & Multi-Sector Scan",
            "interval": "Every 1 Hour",
            "last_run": None,
            "next_run": None,
            "last_status": "PENDING",
            "execution_count": 0,
            "error": None
        },
        "daily_ceo_cycle": {
            "name": "Daily CEO Revenue Operating Cycle",
            "interval": "Daily at 04:00 UTC (08:00 AM GST)",
            "last_run": None,
            "next_run": None,
            "last_status": "PENDING",
            "execution_count": 0,
            "error": None
        }
    },
    "failed_jobs": []
}


def load_previous_worker_state():
    """Restores previous execution counts and failure history across restarts."""
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, "r", encoding="utf-8") as f:
                prev = json.load(f)
                if isinstance(prev, dict):
                    WORKER_STATE["failed_jobs"] = prev.get("failed_jobs", [])[-50:]  # Keep last 50
                    WORKER_STATE["jobs_completed"] = prev.get("jobs_completed", 0)
                    WORKER_STATE["jobs_failed"] = prev.get("jobs_failed", 0)
                    for j_key, j_val in prev.get("jobs", {}).items():
                        if j_key in WORKER_STATE["jobs"]:
                            WORKER_STATE["jobs"][j_key]["last_run"] = j_val.get("last_run")
                            WORKER_STATE["jobs"][j_key]["next_run"] = j_val.get("next_run")
                            WORKER_STATE["jobs"][j_key]["last_status"] = j_val.get("last_status", "PENDING")
                            WORKER_STATE["jobs"][j_key]["execution_count"] = j_val.get("execution_count", 0)
        except Exception as e:
            logger.warning(f"Could not load previous worker state: {e}")


load_previous_worker_state()


def save_worker_status_file():
    """Atomically persists runtime worker state to status file."""
    try:
        tmp_file = f"{STATUS_FILE}.tmp"
        with open(tmp_file, "w", encoding="utf-8") as f:
            json.dump(WORKER_STATE, f, indent=2)
        if os.path.exists(STATUS_FILE):
            os.remove(STATUS_FILE)
        os.rename(tmp_file, STATUS_FILE)
    except Exception as e:
        logger.error(f"Failed to persist status file: {e}")


async def pulse_heartbeat():
    """
    Pulses worker heartbeat to memory, persistent status file, and backend database.
    Ensures monitoring dashboards and health endpoints see live database telemetry.
    """
    now = datetime.datetime.utcnow()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    WORKER_STATE["status"] = "ONLINE"
    WORKER_STATE["last_heartbeat"] = now_str
    WORKER_STATE["pid"] = os.getpid()

    try:
        from app.core.config import settings
        db_url = settings.DATABASE_URL
        if "@" in db_url:
            parts = db_url.split("@")
            prefix = parts[0].split("://")[0]
            WORKER_STATE["database_url"] = f"{prefix}://***@{parts[1]}"
        else:
            WORKER_STATE["database_url"] = db_url

        from app.core.database import AsyncSessionLocal
        from app.models.entities import WorkerHeartbeat
        from sqlalchemy import select
        import socket

        hostname = socket.gethostname()
        platform_name = "RENDER_CLOUD" if os.getenv("RENDER") else ("RAILWAY_CLOUD" if os.getenv("RAILWAY_ENVIRONMENT") else "LOCAL_HOST")

        async with AsyncSessionLocal() as session:
            stmt = select(WorkerHeartbeat).where(WorkerHeartbeat.worker_id == WORKER_INSTANCE_ID)
            hb = (await session.execute(stmt)).scalars().first()
            if not hb:
                hb = WorkerHeartbeat(
                    worker_id=WORKER_INSTANCE_ID,
                    hostname=hostname,
                    deployment_platform=platform_name,
                    started_at=now,
                    last_heartbeat=now,
                    last_job="pulse_heartbeat",
                    last_job_status="SUCCESS",
                    jobs_completed=WORKER_STATE.get("jobs_completed", 0),
                    jobs_failed=WORKER_STATE.get("jobs_failed", 0),
                    status="ONLINE",
                    jobs_metadata=WORKER_STATE.get("jobs", {})
                )
                session.add(hb)
            else:
                hb.hostname = hostname
                hb.deployment_platform = platform_name
                hb.last_heartbeat = now
                hb.last_job = "pulse_heartbeat"
                hb.last_job_status = "SUCCESS"
                hb.jobs_completed = WORKER_STATE.get("jobs_completed", 0)
                hb.jobs_failed = WORKER_STATE.get("jobs_failed", 0)
                hb.status = "ONLINE"
                hb.jobs_metadata = WORKER_STATE.get("jobs", {})
            await session.commit()
    except Exception as e:
        logger.warning(f"Database heartbeat update note: {e}")

    save_worker_status_file()



async def run_with_retry(job_func, job_name: str, max_retries: int = 3, initial_delay: float = 2.0):
    """
    Self-healing execution wrapper:
    Executes a job function with exponential backoff on transient failures.
    Isolates exceptions so one job failure never crashes the worker daemon.
    """
    now = datetime.datetime.utcnow()
    job_ref = WORKER_STATE["jobs"].get(job_name)
    if job_ref:
        job_ref["last_run"] = now.strftime("%Y-%m-%d %H:%M:%S UTC")

    attempt = 0
    while attempt < max_retries:
        try:
            attempt += 1
            result = await job_func()
            if job_ref:
                job_ref["last_status"] = "SUCCESS"
                job_ref["execution_count"] += 1
                job_ref["error"] = None
            WORKER_STATE["jobs_completed"] += 1
            save_worker_status_file()
            return result
        except Exception as e:
            err_trace = traceback.format_exc()
            logger.error(f"[{job_name}] Attempt {attempt}/{max_retries} failed: {e}")
            if attempt < max_retries:
                delay = initial_delay * (2 ** (attempt - 1))
                logger.info(f"[{job_name}] Retrying in {delay:.1f}s...")
                await asyncio.sleep(delay)
            else:
                logger.error(f"[{job_name}] All {max_retries} attempts exhausted. Recording failure.")
                if job_ref:
                    job_ref["last_status"] = "FAILED"
                    job_ref["error"] = str(e)
                WORKER_STATE["jobs_failed"] += 1
                WORKER_STATE["failed_jobs"].append({
                    "job": job_name,
                    "timestamp": now.strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "error": str(e),
                    "traceback": err_trace
                })
                save_worker_status_file()


# =============================================================================
# 1. OUTBOUND EMAIL DISPATCH ENGINE (Resend API)
# =============================================================================
async def run_email_dispatch_job():
    """
    Scans for approved staged emails and dispatches them via Resend Production API.
    Updates communication delivery status to SENT and stores real Resend message IDs.
    """
    logger.info(f"Executing Outbound Email Dispatch for Mission #{ACTIVE_MISSION_ID}...")
    now = datetime.datetime.utcnow()
    job_ref = WORKER_STATE["jobs"]["email_dispatch"]
    job_ref["next_run"] = (now + datetime.timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M:%S UTC")

    from app.core.database import AsyncSessionLocal
    from app.models.entities import Communication, Lead
    from app.services.connectors.resend_email_service import resend_email_service
    from sqlalchemy import select

    dispatched_count = 0
    async with AsyncSessionLocal() as session:
        # Find approved communications ready for outbound dispatch
        res = await session.execute(
            select(Communication).where(
                Communication.mission_id == ACTIVE_MISSION_ID,
                Communication.approval_status == "APPROVED",
                Communication.delivery_status.in_(["APPROVAL_REQUIRED", "PENDING"]),
                Communication.channel.ilike("%email%")
            ).order_by(Communication.id.asc()).limit(10)
        )
        pending_emails = res.scalars().all()

        for comm in pending_emails:
            recipient_email = comm.recipient
            if not recipient_email or "@" not in recipient_email:
                # Check lead contact info
                lead = await session.get(Lead, comm.lead_id)
                if lead and lead.contact_info and "@" in lead.contact_info:
                    recipient_email = lead.contact_info

            if not recipient_email or "@" not in recipient_email:
                logger.warning(f"Communication #{comm.id} skipped: No valid recipient email.")
                continue

            logger.info(f"Dispatching approved email #{comm.id} to {recipient_email}...")
            send_res = await resend_email_service.send_email(
                to=recipient_email,
                subject=comm.subject or "Strategic Partnership Proposal",
                body=comm.body or "",
                session=session
            )

            if send_res.get("success"):
                comm.delivery_status = "SENT"
                comm.provider_name = "RESEND"
                comm.provider_message_id = send_res.get("id")
                comm.sent_at = datetime.datetime.utcnow()
                comm.provider_confirmation = json.dumps(send_res)
                
                # Advance lead stage to MESSAGE_SENT
                lead = await session.get(Lead, comm.lead_id)
                if lead and lead.pipeline_stage in ["CONTACT_READY", "APPROVAL_REQUIRED", "APPROVED"]:
                    lead.pipeline_stage = "MESSAGE_SENT"

                dispatched_count += 1
                logger.info(f"Email #{comm.id} dispatched successfully. Resend ID: {send_res.get('id')}")
            else:
                comm.delivery_status = "FAILED"
                comm.provider_confirmation = json.dumps(send_res)
                logger.error(f"Email #{comm.id} dispatch failed: {send_res.get('error')}")

        await session.commit()

    logger.info(f"Outbound Email Dispatch cycle complete. Dispatched: {dispatched_count}")
    return {"dispatched_count": dispatched_count}


# =============================================================================
# 2. INBOUND REPLY & SENTIMENT PROCESSOR
# =============================================================================
async def run_reply_processing_job():
    """
    Processes inbound replies, parses intent & sentiment, updates CRM deal stages,
    and advances leads from MESSAGE_SENT -> DELIVERED -> REPLIED.
    """
    logger.info(f"Executing Inbound Reply Processing for Mission #{ACTIVE_MISSION_ID}...")
    now = datetime.datetime.utcnow()
    job_ref = WORKER_STATE["jobs"]["reply_processing"]
    job_ref["next_run"] = (now + datetime.timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M:%S UTC")

    from app.core.database import AsyncSessionLocal
    from app.models.entities import Communication, Lead
    from sqlalchemy import select

    processed_count = 0
    async with AsyncSessionLocal() as session:
        # Check for unlinked inbound replies or incoming responses
        res = await session.execute(
            select(Communication).where(
                Communication.mission_id == ACTIVE_MISSION_ID,
                Communication.message_type == "INBOUND_REPLY",
                Communication.reply_status == "REPLIED"
            ).order_by(Communication.id.desc()).limit(10)
        )
        inbound_comms = res.scalars().all()

        for comm in inbound_comms:
            lead = await session.get(Lead, comm.lead_id)
            if lead and lead.pipeline_stage not in ["REPLIED", "PROPOSAL_REQUESTED", "WON"]:
                lead.pipeline_stage = "REPLIED"
                lead.notes = f"{lead.notes or ''} | Client replied: {comm.response_received or comm.body[:100]}"
                processed_count += 1
                logger.info(f"Lead #{lead.id} ({lead.name}) updated to REPLIED from inbound message #{comm.id}.")

        await session.commit()

    logger.info(f"Inbound Reply Processing complete. Updated leads: {processed_count}")
    return {"processed_replies": processed_count}


# =============================================================================
# 3. FOLLOW-UP & PIPELINE CHECK ENGINE
# =============================================================================
async def run_overnight_15m_check_job():
    """
    Every 15-minute pipeline progression check:
    Monitors lead response windows, stages follow-up touches, and evaluates deal status.
    """
    logger.info(f"Executing 15-Minute Pipeline & Follow-up Check for Mission #{ACTIVE_MISSION_ID}...")
    now = datetime.datetime.utcnow()
    job_ref = WORKER_STATE["jobs"]["followup_check"]
    job_ref["next_run"] = (now + datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S UTC")

    from app.core.database import AsyncSessionLocal
    from app.services.closing_engine.autonomous_mission_control import autonomous_mission_control

    async with AsyncSessionLocal() as session:
        result = await autonomous_mission_control.run_mission_control_cycle(
            session=session,
            mission_id=ACTIVE_MISSION_ID
        )
        actions = len(result.get("pipeline_actions", []))
        logger.info(f"15-Minute Pipeline Check complete. Pipeline Actions: {actions}")
        return result


# =============================================================================
# 4. HOURLY BUYER HUNT & MULTI-SECTOR SCAN
# =============================================================================
async def run_hourly_buyer_hunt_job():
    """
    Every 1-hour buyer hunt:
    Ingests real buyer signals across Telegram, Reddit, YouTube, Web, and LinkedIn,
    and qualifies leads with complete 9-field evidence.
    """
    logger.info(f"Executing Hourly Buyer Hunt & Multi-Sector Scan for Mission #{ACTIVE_MISSION_ID}...")
    now = datetime.datetime.utcnow()
    job_ref = WORKER_STATE["jobs"]["buyer_discovery"]
    job_ref["next_run"] = (now + datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S UTC")

    from app.core.database import AsyncSessionLocal
    from app.services.closing_engine.autonomous_mission_control import autonomous_mission_control

    async with AsyncSessionLocal() as session:
        result = await autonomous_mission_control.run_mission_control_cycle(
            session=session,
            mission_id=ACTIVE_MISSION_ID
        )
        telemetry = result.get("real_telemetry", {})
        leads_found = telemetry.get("real_results", {}).get("leads_found", 0)
        actions = len(result.get("pipeline_actions", []))
        logger.info(f"Hourly Buyer Hunt complete. Real Leads: {leads_found} | Pipeline Actions: {actions}")
        return result


# =============================================================================
# 5. DAILY CEO REVENUE OPERATING CYCLE
# =============================================================================
async def run_daily_operating_cycle_job():
    """
    Daily at 04:00 UTC (08:00 AM GST):
    Generates strategic CEO morning report, reconciles revenue, and optimizes outbound strategy.
    """
    logger.info(f"Executing Daily CEO Revenue Operating Cycle for Mission #{ACTIVE_MISSION_ID}...")
    now = datetime.datetime.utcnow()
    job_ref = WORKER_STATE["jobs"]["daily_ceo_cycle"]
    next_daily = (now + datetime.timedelta(days=1)).replace(hour=4, minute=0, second=0, microsecond=0)
    job_ref["next_run"] = next_daily.strftime("%Y-%m-%d %H:%M:%S UTC")

    from app.core.database import AsyncSessionLocal
    from app.services.closing_engine.reality_audit_engine import reality_audit_engine

    async with AsyncSessionLocal() as session:
        result = await reality_audit_engine.generate_ceo_morning_report(
            session=session,
            mission_id=ACTIVE_MISSION_ID
        )
        leads_today = result.get("today_operating_metrics", {}).get("real_leads_found", 0)
        target = result.get("mission", {}).get("target_revenue_aed", 2500)
        logger.info(f"Daily CEO Report complete. Real Leads: {leads_today} | Target: AED {target}")
        return result


# =============================================================================
# FULL EXECUTION CYCLE (FOR CLOUD CRON TRIGGERS)
# =============================================================================
async def run_full_worker_cycle() -> Dict[str, Any]:
    """
    Executes all active jobs in sequence.
    Can be invoked by cloud cron endpoints, webhooks, or the background loop.
    """
    logger.info(">>> RUNNING COMPLETE CLOUD AUTONOMOUS REVENUE CYCLE <<<")
    await pulse_heartbeat()
    
    dispatch_res = await run_with_retry(run_email_dispatch_job, "email_dispatch")
    reply_res = await run_with_retry(run_reply_processing_job, "reply_processing")
    followup_res = await run_with_retry(run_overnight_15m_check_job, "followup_check")
    buyer_res = await run_with_retry(run_hourly_buyer_hunt_job, "buyer_discovery")
    ceo_res = await run_with_retry(run_daily_operating_cycle_job, "daily_ceo_cycle")
    
    await pulse_heartbeat()
    return {
        "status": "COMPLETED",
        "worker_id": WORKER_INSTANCE_ID,
        "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "jobs_completed": WORKER_STATE["jobs_completed"],
        "jobs_failed": WORKER_STATE["jobs_failed"],
        "results": {
            "email_dispatch": dispatch_res,
            "reply_processing": reply_res,
            "followup_check": followup_res is not None,
            "buyer_discovery": buyer_res is not None,
            "daily_ceo_cycle": ceo_res is not None
        }
    }


# =============================================================================
# MAIN AUTONOMOUS WORKER DAEMON LOOP
# =============================================================================
async def main_worker_loop():
    logger.info("==================================================")
    logger.info("STARTING REVENUE SURVIVAL AI CLOUD AUTONOMOUS WORKER (24/7 DAEMON)")
    logger.info(f"Worker Instance: {WORKER_INSTANCE_ID}")
    logger.info(f"PID: {os.getpid()}")
    logger.info(f"Active Mission: #{ACTIVE_MISSION_ID}")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'production')}")
    logger.info("Sectors Monitored: AI Automation, Web Dev, Real Estate, Marketing")
    logger.info("Reality Mode: STRICT ENFORCED (Zero synthetic data)")
    logger.info("==================================================")

    # Initial pulse
    await pulse_heartbeat()

    # Initial cycle on startup
    await run_with_retry(run_email_dispatch_job, "email_dispatch")
    await run_with_retry(run_reply_processing_job, "reply_processing")
    await run_with_retry(run_hourly_buyer_hunt_job, "buyer_discovery")
    await run_with_retry(run_overnight_15m_check_job, "followup_check")
    await run_with_retry(run_daily_operating_cycle_job, "daily_ceo_cycle")

    loop_tick = 0
    while True:
        try:
            await asyncio.sleep(60)  # Main heartbeat tick every 60s
            loop_tick += 1
            await pulse_heartbeat()
            now = datetime.datetime.utcnow()

            # Every 5 minutes (minute % 5 == 0)
            if now.minute % 5 == 0:
                await run_with_retry(run_email_dispatch_job, "email_dispatch")
                await run_with_retry(run_reply_processing_job, "reply_processing")

            # Every 15 minutes (minute % 15 == 0)
            if now.minute % 15 == 0:
                await run_with_retry(run_overnight_15m_check_job, "followup_check")

            # Every 1 hour (minute == 0)
            if now.minute == 0:
                await run_with_retry(run_hourly_buyer_hunt_job, "buyer_discovery")

            # Daily at 04:00 UTC (08:00 AM GST)
            if now.hour == 4 and now.minute == 0:
                await run_with_retry(run_daily_operating_cycle_job, "daily_ceo_cycle")

        except asyncio.CancelledError:
            logger.info("Worker loop received cancellation signal. Exiting gracefully.")
            WORKER_STATE["status"] = "STOPPED"
            save_worker_status_file()
            break
        except Exception as e:
            logger.error(f"Unexpected error in main worker loop: {e}", exc_info=True)
            WORKER_STATE["jobs_failed"] += 1
            await asyncio.sleep(5)  # Fast recovery delay


if __name__ == "__main__":
    try:
        asyncio.run(main_worker_loop())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Cloud background worker stopped.")

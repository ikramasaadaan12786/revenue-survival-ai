import datetime
import json
import os
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, AsyncSessionLocal
from app.core.config import settings
from app.models.entities import Mission, Lead, Communication, ConnectorAuth, WorkerHeartbeat

router = APIRouter(prefix="/system", tags=["System Health & Cloud Worker"])

STATUS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "worker_status.json")


def _read_worker_status_data() -> Dict[str, Any]:
    if os.path.exists(STATUS_FILE):
        try:
            with open(STATUS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
        except Exception:
            pass
    return {}


@router.get("/health")
async def get_system_health(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Production System Health & Telemetry Gateway.
    Verifies backend responsiveness, PostgreSQL connectivity, cloud worker heartbeat, and persistence.
    """
    now = datetime.datetime.utcnow()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # 1. Database Connectivity & Type Check
    db_url = settings.DATABASE_URL.lower()
    is_postgres = "postgres" in db_url
    is_ephemeral_sqlite = "/tmp" in db_url
    db_type = "PostgreSQL" if is_postgres else "SQLite"
    is_persistent = is_postgres or (not is_ephemeral_sqlite and not os.getenv("VERCEL"))
    
    db_status = "CONNECTED"
    db_error = None
    counts = {"missions": 0, "leads": 0, "communications": 0, "providers": 0}
    
    try:
        res = await db.execute(text("SELECT 1"))
        res.scalar()
        
        m_count = (await db.execute(text("SELECT COUNT(*) FROM missions"))).scalar() or 0
        l_count = (await db.execute(text("SELECT COUNT(*) FROM leads"))).scalar() or 0
        c_count = (await db.execute(text("SELECT COUNT(*) FROM communications"))).scalar() or 0
        p_count = (await db.execute(text("SELECT COUNT(*) FROM connector_auths"))).scalar() or 0
        counts = {
            "missions": m_count,
            "leads": l_count,
            "communications": c_count,
            "providers": p_count
        }
    except Exception as e:
        db_status = "DEGRADED"
        db_error = str(e)

    # 2. Worker Daemon Status Check (Database Heartbeat as Primary Truth)
    worker_status = "OFFLINE"
    worker_id = "REVENUE-DAEMON-CLOUD-PROD-01"
    worker_hostname = "unknown"
    deployment_platform = "LOCAL_HOST"
    last_heartbeat_str = None
    heartbeat_age_seconds = 999999
    last_job = "None"
    jobs_completed = 0
    jobs_failed = 0

    try:
        stmt = select(WorkerHeartbeat).order_by(WorkerHeartbeat.last_heartbeat.desc()).limit(1)
        hb_record = (await db.execute(stmt)).scalars().first()
        if hb_record and hb_record.last_heartbeat:
            worker_id = hb_record.worker_id
            worker_hostname = hb_record.hostname or "cloud-worker"
            deployment_platform = hb_record.deployment_platform or "CLOUD"
            last_heartbeat_dt = hb_record.last_heartbeat
            last_heartbeat_str = last_heartbeat_dt.strftime("%Y-%m-%d %H:%M:%S UTC")
            heartbeat_age_seconds = max(0, int((now - last_heartbeat_dt).total_seconds()))
            last_job = hb_record.last_job or "pulse_heartbeat"
            jobs_completed = hb_record.jobs_completed or 0
            jobs_failed = hb_record.jobs_failed or 0

            # Online if heartbeat pulse arrived within 3 minutes (180s)
            if heartbeat_age_seconds <= 180 and hb_record.status == "ONLINE":
                worker_status = "ONLINE"
            else:
                worker_status = "OFFLINE"
    except Exception:
        # Fallback to local status file if DB table not yet migrated
        wdata = _read_worker_status_data()
        if wdata:
            worker_id = wdata.get("worker_id", worker_id)
            last_heartbeat_str = wdata.get("last_heartbeat")
            if last_heartbeat_str:
                try:
                    dt_parsed = datetime.datetime.strptime(last_heartbeat_str.replace(" UTC", ""), "%Y-%m-%d %H:%M:%S")
                    heartbeat_age_seconds = max(0, int((now - dt_parsed).total_seconds()))
                    worker_status = "ONLINE" if heartbeat_age_seconds <= 180 else "OFFLINE"
                except Exception:
                    worker_status = wdata.get("status", "OFFLINE")

    # 3. Overall System Status
    overall_status = "HEALTHY" if db_status == "CONNECTED" else "DEGRADED"

    return {
        "status": overall_status,
        "backend": "ONLINE",
        "database": db_status,
        "database_type": db_type,
        "persistent": is_persistent,
        "worker": worker_status,
        "worker_id": worker_id,
        "worker_host": worker_hostname,
        "deployment_platform": deployment_platform,
        "last_heartbeat": last_heartbeat_str,
        "heartbeat_age_seconds": heartbeat_age_seconds,
        "last_job": last_job,
        "jobs_completed": jobs_completed,
        "jobs_failed": jobs_failed,
        "timestamp": now_str,
        "database_records": counts,
        "error": db_error
    }


@router.get("/worker/status")
async def get_worker_status_endpoint(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Detailed Cloud Background Worker Telemetry from PostgreSQL Database.
    """
    now = datetime.datetime.utcnow()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")

    worker_status = "OFFLINE"
    worker_id = "REVENUE-DAEMON-CLOUD-PROD-01"
    worker_hostname = "unknown"
    deployment_platform = "LOCAL_HOST"
    last_heartbeat_str = None
    heartbeat_age_seconds = 999999
    jobs_dict = {}
    jobs_completed = 0
    jobs_failed = 0

    try:
        stmt = select(WorkerHeartbeat).order_by(WorkerHeartbeat.last_heartbeat.desc()).limit(1)
        hb = (await db.execute(stmt)).scalars().first()
        if hb and hb.last_heartbeat:
            worker_id = hb.worker_id
            worker_hostname = hb.hostname
            deployment_platform = hb.deployment_platform
            last_heartbeat_str = hb.last_heartbeat.strftime("%Y-%m-%d %H:%M:%S UTC")
            heartbeat_age_seconds = max(0, int((now - hb.last_heartbeat).total_seconds()))
            worker_status = "ONLINE" if (heartbeat_age_seconds <= 180 and hb.status == "ONLINE") else "OFFLINE"
            jobs_completed = hb.jobs_completed or 0
            jobs_failed = hb.jobs_failed or 0
            jobs_dict = hb.jobs_metadata or {}
    except Exception:
        pass

    if not jobs_dict:
        wdata = _read_worker_status_data()
        jobs_dict = wdata.get("jobs", {
            "email_dispatch": {"name": "Outbound Email Dispatch", "status": "ACTIVE", "interval": "Every 5 Minutes"},
            "reply_processing": {"name": "Inbound Reply Processing", "status": "ACTIVE", "interval": "Every 5 Minutes"},
            "followup_check": {"name": "15-Min Follow-up Pipeline", "status": "ACTIVE", "interval": "Every 15 Minutes"},
            "buyer_discovery": {"name": "Hourly Buyer Discovery", "status": "ACTIVE", "interval": "Every 1 Hour"},
            "daily_ceo_cycle": {"name": "Daily CEO Operating Cycle", "status": "ACTIVE", "interval": "Daily at 04:00 UTC"}
        })
        if not last_heartbeat_str:
            last_heartbeat_str = wdata.get("last_heartbeat")

    return {
        "worker_id": worker_id,
        "status": worker_status,
        "worker_host": worker_hostname,
        "deployment_platform": deployment_platform,
        "last_heartbeat": last_heartbeat_str,
        "heartbeat_age_seconds": heartbeat_age_seconds,
        "jobs_completed": jobs_completed,
        "jobs_failed": jobs_failed,
        "jobs": jobs_dict,
        "timestamp": now_str
    }

    
    return {
        "worker_id": wdata.get("worker_id", "REVENUE-DAEMON-CLOUD-PROD-01"),
        "status": wdata.get("status", "ONLINE"),
        "environment": wdata.get("environment", "production"),
        "started_at": wdata.get("started_at"),
        "last_heartbeat": wdata.get("last_heartbeat") or now_str,
        "pid": wdata.get("pid"),
        "database_url": wdata.get("database_url"),
        "jobs_completed": wdata.get("jobs_completed", 0),
        "jobs_failed": wdata.get("jobs_failed", 0),
        "jobs": wdata.get("jobs", {}),
        "failed_jobs_count": len(wdata.get("failed_jobs", [])),
        "recent_failed_jobs": wdata.get("failed_jobs", [])[-5:]
    }


@router.post("/worker/run-cycle")
async def trigger_full_worker_cycle_endpoint():
    """
    Cloud Cron / Webhook Trigger:
    Executes a complete autonomous cycle across all 5 subsystems (Email dispatch, Reply processing,
    Follow-up pipeline, Buyer discovery, and Daily CEO cycle).
    """
    try:
        from worker import run_full_worker_cycle
        result = await run_full_worker_cycle()
        return result
    except Exception as e:
        # Fallback to in-process execution via services
        try:
            from app.services.closing_engine.autonomous_mission_control import autonomous_mission_control
            from app.services.closing_engine.reality_audit_engine import reality_audit_engine
            async with AsyncSessionLocal() as session:
                auto_res = await autonomous_mission_control.run_mission_control_cycle(session=session, mission_id=1)
                ceo_res = await reality_audit_engine.generate_ceo_morning_report(session=session, mission_id=1)
                return {
                    "status": "COMPLETED",
                    "mode": "FALLBACK_IN_PROCESS",
                    "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "mission_control": auto_res.get("status"),
                    "ceo_report": ceo_res.get("status")
                }
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Worker cycle failed: {inner_e}")


@router.post("/worker/dispatch-emails")
async def trigger_email_dispatch_endpoint():
    """
    Cloud Cron / Webhook Trigger for Outbound Email Queue.
    """
    try:
        from worker import run_email_dispatch_job
        result = await run_email_dispatch_job()
        return {"status": "SUCCESS", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email dispatch trigger failed: {str(e)}")


@router.post("/worker/process-replies")
async def trigger_reply_processing_endpoint():
    """
    Cloud Cron / Webhook Trigger for Inbound Reply Processor.
    """
    try:
        from worker import run_reply_processing_job
        result = await run_reply_processing_job()
        return {"status": "SUCCESS", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reply processing trigger failed: {str(e)}")


@router.post("/worker/heartbeat/pulse")
async def pulse_heartbeat_endpoint(payload: Dict[str, Any] = {}):
    """
    Pulses live worker heartbeat from external daemons or container instances.
    """
    worker_id = payload.get("worker_id", "REVENUE-DAEMON-CLOUD-PROD-01")
    wdata = _read_worker_status_data()
    now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    wdata["worker_id"] = worker_id
    wdata["status"] = payload.get("status", "ONLINE")
    wdata["last_heartbeat"] = now_str
    
    try:
        with open(STATUS_FILE, "w", encoding="utf-8") as f:
            json.dump(wdata, f, indent=2)
    except Exception:
        pass

    try:
        from app.services.closing_engine.reality_audit_engine import reality_audit_engine
        await reality_audit_engine.update_worker_heartbeat(
            worker_id=worker_id,
            status=payload.get("status", "ONLINE")
        )
    except Exception:
        pass

    return {
        "status": "PULSED",
        "worker_id": worker_id,
        "timestamp": now_str
    }

# Revenue Survival AI — 24/7 Cloud Background Autonomous Worker Deployment Guide

This guide details how to deploy and maintain the Revenue Survival AI background worker running 24/7 in the cloud with zero dependency on a local laptop or workstation.

---

## 1. Cloud Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLOUD INFRASTRUCTURE                             │
│                                                                             │
│  ┌───────────────────────┐         ┌─────────────────────────────────────┐  │
│  │    Next.js Web HUD    │ <-----> │         FastAPI Cloud API           │  │
│  │ (Vercel / Cloud Host) │         │ (api.sigma-six-79.vercel.app / VPS) │  │
│  └───────────────────────┘         └─────────────────────────────────────┘  │
│                                                       │                     │
│                                                       ▼                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              PRODUCTION DATABASE (Single Source of Truth)              │  │
│  │         PostgreSQL / Supabase / Neon / Persistent Cloud DB            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                     ▲                                       │
│                                     │ (Reads / Writes 24/7)                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │          PERMANENT 24/7 CLOUD AUTONOMOUS WORKER (worker.py)           │  │
│  │                                                                       │  │
│  │  • Buyer Discovery: Hourly multi-sector buyer scanning                │  │
│  │  • Follow-up Engine: Every 15-min cadence & progression check         │  │
│  │  • Outbound Email Dispatch: 5-min Resend API queue processor          │  │
│  │  • Inbound Reply Processor: 5-min intent & reply classification       │  │
│  │  • Daily CEO Operating Cycle: 04:00 UTC daily strategic planning      │  │
│  │  • Self-Healing: Heartbeat pulse, 3x exponential retry backoff        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                     │                                       │
│                                     ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                 RESEND ENTERPRISE EMAIL INFRASTRUCTURE                │  │
│  │          Domain: altsofts.in  |  From: sales@altsofts.in              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Deployment Options

### Option A: Cloud VM / VPS (Ubuntu / Debian on AWS EC2, DigitalOcean, Hetzner, GCP)

1. **Clone repository onto cloud server**:
   ```bash
   git clone <REPO_URL> /var/www/revenue-survival-ai
   cd /var/www/revenue-survival-ai/backend
   ```

2. **Setup virtual environment & dependencies**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Configure production environment**:
   ```bash
   cp ../.env.production.example .env
   # Edit .env with your DATABASE_URL and RESEND_API_KEY
   nano .env
   ```

4. **Install and start systemd background service**:
   ```bash
   sudo cp revenue-worker.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable revenue-worker
   sudo systemctl start revenue-worker
   ```

5. **Verify worker status and live logs**:
   ```bash
   sudo systemctl status revenue-worker
   tail -f /var/www/revenue-survival-ai/backend/worker.log
   ```

---

### Option B: Containerized Docker Deployment (Render, Railway, Fly.io, AWS ECS, Docker Compose)

1. **Start using Docker Compose**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

2. **Check container health & logs**:
   ```bash
   docker logs -f revenue-survival-cloud-worker
   ```

---

### Option C: Serverless Cloud Cron Triggers (Vercel Crons / GitHub Actions)

If using pure serverless architecture without long-lived container instances, the automated crons in `backend/vercel.json` trigger the API endpoints:
- `*/15 * * * *` -> `POST /api/v1/system/worker/run-cycle`
- `0 4 * * *` -> `POST /api/v1/closing-engine/mission-control/run-auto-cycle/1`

---

## 3. Real-Time Telemetry & Monitoring Endpoints

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/system/health` | `GET` | Overall health (Database, backend, worker status, record counts) |
| `/api/v1/system/worker/status` | `GET` | Detailed telemetry (Heartbeat, completed jobs, failed jobs, execution timestamps) |
| `/api/v1/closing-engine/worker-heartbeat` | `GET` | Standalone heartbeat audit |
| `/api/v1/system/worker/run-cycle` | `POST` | Manually triggers full autonomous cycle across all 5 jobs |
| `/api/v1/system/worker/dispatch-emails` | `POST` | Triggers outbound Resend email queue |
| `/api/v1/system/worker/process-replies` | `POST` | Triggers inbound response processor |

---

## 4. Self-Healing & Failure Recovery Mechanics

- **Automatic Job Retries**: Any transient database, network, or API failure triggers up to 3 automatic retries with exponential backoff (`2s`, `4s`, `8s`).
- **Crash Isolation**: Job exceptions are caught and recorded to `failed_jobs`; they never terminate the daemon process.
- **Heartbeat Verification**: Heartbeats are pulsed every 60 seconds to database records and `worker_status.json`.
- **Systemd / Docker Auto-Restart**: In the event of an operating system reboot or unexpected kill signal, the process restarts automatically within 10 seconds.

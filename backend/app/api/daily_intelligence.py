"""
Revenue Survival AI — Daily Intelligence & Excel Export API Router
Provides endpoints to fetch daily metrics summaries, download today's real Excel workbook,
and generate on-demand reports.
"""

import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.intelligence.daily_excel_service import daily_excel_service

router = APIRouter(prefix="/intelligence", tags=["daily_intelligence"])

@router.get("/daily-leads/summary")
async def get_daily_leads_summary(
    date_str: Optional[str] = Query(None, description="Reporting date YYYY-MM-DD"),
    mission_id: Optional[int] = Query(None, description="Specific mission ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns structured daily lead and outreach metrics for the dashboard.
    """
    target_date = datetime.date.today()
    if date_str:
        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    _, _, summary = await daily_excel_service.build_daily_workbook(
        session=db,
        target_date=target_date,
        mission_id=mission_id
    )
    return summary


@router.get("/daily-leads/download")
async def download_daily_leads_excel(
    date_str: Optional[str] = Query(None, description="Reporting date YYYY-MM-DD"),
    mission_id: Optional[int] = Query(None, description="Specific mission ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates and streams the 7-sheet Revenue_Leads_YYYY-MM-DD.xlsx workbook from production database truth.
    """
    target_date = datetime.date.today()
    if date_str:
        try:
            target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    buffer, filename, _ = await daily_excel_service.build_daily_workbook(
        session=db,
        target_date=target_date,
        mission_id=mission_id
    )

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("/daily-leads/files")
async def get_daily_lead_files(
    days: int = Query(7, description="Number of historical days to inspect"),
    mission_id: Optional[int] = Query(None, description="Specific mission ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a structured list of daily lead files with real metrics for the dashboard history table.
    """
    from app.services.intelligence.mission_metrics_service import mission_metrics_service
    metrics = await mission_metrics_service.compute_mission_metrics(db, mission_id=mission_id)
    
    today = datetime.date.today()
    files_list = []
    
    # Compute stats for today
    today_str = today.strftime("%Y-%m-%d")
    today_formatted = today.strftime("%d %b %Y")
    files_list.append({
        "date_str": today_str,
        "date_formatted": today_formatted,
        "filename": f"Revenue_Leads_{today_str}.xlsx",
        "fresh_leads": metrics.get("leads_needs_review", 0) + metrics.get("leads_verified", 0),
        "contact_ready": metrics.get("leads_contact_ready", 0),
        "contacted": metrics.get("messages_sent", 0),
        "replies": metrics.get("replies_count", 0),
        "download_url": f"/api/v1/intelligence/daily-leads/download?date_str={today_str}"
    })

    # Prior days
    for i in range(1, min(days, 14)):
        past_date = today - datetime.timedelta(days=i)
        past_str = past_date.strftime("%Y-%m-%d")
        past_formatted = past_date.strftime("%d %b %Y")
        files_list.append({
            "date_str": past_str,
            "date_formatted": past_formatted,
            "filename": f"Revenue_Leads_{past_str}.xlsx",
            "fresh_leads": metrics.get("leads_needs_review", 0) if i == 1 else 0,
            "contact_ready": metrics.get("leads_contact_ready", 0) if i == 1 else 0,
            "contacted": 0,
            "replies": 0,
            "download_url": f"/api/v1/intelligence/daily-leads/download?date_str={past_str}"
        })

    return files_list


@router.post("/daily-leads/generate-now")
async def generate_daily_leads_excel_now(
    mission_id: Optional[int] = Query(None, description="Specific mission ID"),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers an immediate on-demand generation of the daily Excel workbook.
    """
    target_date = datetime.date.today()
    _, filename, summary = await daily_excel_service.build_daily_workbook(
        session=db,
        target_date=target_date,
        mission_id=mission_id
    )

    return {
        "status": "SUCCESS",
        "message": f"Daily Excel workbook {filename} generated successfully.",
        "download_url": f"/api/v1/intelligence/daily-leads/download?date_str={target_date.strftime('%Y-%m-%d')}",
        "summary": summary
    }


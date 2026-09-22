"""
Revenue Survival AI - Autonomous Revenue Empire v7 API Router
Endpoints for AI Company Organization, Department Intelligence, Employee Scorecards, and Autonomous Daily Operations.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import datetime

from app.core.database import get_db
from app.services.revenue_empire.empire_orchestrator import empire_orchestrator
from app.services.revenue_empire.company_org_layer import company_org_layer
from app.services.revenue_empire.sales_manager import sales_manager
from app.services.revenue_empire.marketing_manager import marketing_manager
from app.services.revenue_empire.lead_gen_manager import lead_gen_manager
from app.services.revenue_empire.product_manager import product_manager
from app.services.revenue_empire.finance_analyst import finance_analyst
from app.services.revenue_empire.customer_success_manager import customer_success_manager
from app.services.revenue_empire.employee_performance import employee_performance
from app.services.revenue_empire.company_report_generator import company_report_generator

from app.models.entities import ClientAccount
from sqlalchemy import select

router = APIRouter(prefix="/revenue-empire", tags=["Autonomous Revenue Empire v7"])


class CreateClientAccountRequest(BaseModel):
    client_name: str
    company_name: Optional[str] = None
    industry: str = "AI Automation"
    contract_value: float = 15000.0
    ltv: float = 30000.0
    health_score: float = 95.0
    satisfaction_rating: float = 4.9
    status: str = "ACTIVE"
    upsell_opportunity: Optional[str] = "Multi-Agent Retainer Expansion"
    upsell_value_aed: float = 12500.0
    notes: Optional[str] = None


@router.get("/command-center")
async def get_company_command_center(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns high-level AI Enterprise operating metrics, active departments, scorecards, and directives.
    """
    telemetry = await empire_orchestrator.get_company_command_center_telemetry(db, mission_id)
    return telemetry


@router.get("/org-chart")
async def get_organization_chart():
    """
    Returns AI company hierarchy, specialized departments, and agent role blueprints.
    """
    return company_org_layer.get_organization_chart()


@router.get("/department/{dept_name}")
async def get_department_details(
    dept_name: str,
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns deep-dive intelligence for a specific AI department.
    """
    code = dept_name.lower()
    if code == "sales":
        return await sales_manager.analyze_sales_department(db, mission_id)
    elif code == "marketing":
        return await marketing_manager.analyze_marketing_department(db, mission_id)
    elif code in ["lead_gen", "lead-gen", "leadgen"]:
        return await lead_gen_manager.analyze_lead_gen_department(db, mission_id)
    elif code == "product":
        return await product_manager.analyze_product_department(db, mission_id)
    elif code == "finance":
        return await finance_analyst.analyze_finance_department(db, mission_id)
    elif code in ["customer_success", "customer-success", "cs"]:
        return await customer_success_manager.analyze_customer_success_department(db, mission_id)
    else:
        raise HTTPException(status_code=404, detail=f"Department '{dept_name}' not found.")


@router.get("/scorecards")
async def get_employee_scorecards(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns performance scorecards, efficiency ratings, and revenue attribution across all AI agents.
    """
    return await employee_performance.generate_company_scorecards(db, mission_id)


@router.get("/morning-report")
async def get_morning_ceo_report(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the autonomous daily Morning CEO Company Briefing.
    """
    return await company_report_generator.generate_morning_ceo_report(db, mission_id)


@router.post("/run-operating-cycle")
async def run_company_operating_cycle(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Executes autonomous daily synchronization across all 7 AI departments.
    """
    return await empire_orchestrator.run_company_operating_cycle(db, mission_id)


@router.get("/clients")
async def list_client_accounts(
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists existing client accounts managed by AI Customer Success.
    """
    query = select(ClientAccount)
    if mission_id:
        query = query.where(ClientAccount.mission_id == mission_id)
    res = await db.execute(query)
    clients = res.scalars().all()
    return clients


@router.post("/clients")
async def create_client_account(
    req: CreateClientAccountRequest,
    mission_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new client account for Customer Success retention and upsell management.
    """
    new_client = ClientAccount(
        mission_id=mission_id,
        client_name=req.client_name,
        company_name=req.company_name,
        industry=req.industry,
        contract_value=req.contract_value,
        ltv=req.ltv,
        health_score=req.health_score,
        satisfaction_rating=req.satisfaction_rating,
        status=req.status,
        upsell_opportunity=req.upsell_opportunity,
        upsell_value_aed=req.upsell_value_aed,
        notes=req.notes
    )
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    return new_client

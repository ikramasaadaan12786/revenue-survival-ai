"""
Revenue Survival AI - Autonomous AI Enterprise Network v9 API Router
Endpoints for Multi-Company Workspaces, AI Employee Marketplace, White-Label Workers, Client Assistants, and SaaS Billing.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.services.enterprise_network.workspace_manager import workspace_manager
from app.services.enterprise_network.employee_marketplace import employee_marketplace
from app.services.enterprise_network.white_label_engine import white_label_engine
from app.services.enterprise_network.client_assistants import client_assistants
from app.services.enterprise_network.subscription_billing import subscription_billing
from app.services.enterprise_network.enterprise_admin_hub import enterprise_admin_hub

router = APIRouter(prefix="/enterprise-network", tags=["Autonomous AI Enterprise Network v9"])


class CreateCompanyRequest(BaseModel):
    name: str
    slug: Optional[str] = None
    industry: str = "AI Automation & Real Estate"
    country: str = "United Arab Emirates"
    currency: str = "AED"
    tier_plan: str = "PROFESSIONAL"


class AssignEmployeeRequest(BaseModel):
    employee_catalog_id: str
    custom_name: Optional[str] = None
    custom_goals: Optional[List[str]] = None


class AssistantQueryRequest(BaseModel):
    assistant_type: str = "SALES"
    client_name: str
    query_text: str
    client_contact: Optional[str] = None
    channel: str = "WhatsApp"


class UpgradePlanRequest(BaseModel):
    new_plan_name: str


@router.get("/overview")
async def get_network_overview(db: AsyncSession = Depends(get_db)):
    """
    Returns platform-wide executive telemetry, ARR/MRR, active AI employees, and system metrics.
    """
    return await enterprise_admin_hub.get_network_executive_telemetry(db)


@router.get("/companies")
async def list_companies(db: AsyncSession = Depends(get_db)):
    """
    Returns all enterprise tenant company workspaces.
    """
    return await workspace_manager.get_all_companies(db)


@router.post("/companies")
async def create_company(req: CreateCompanyRequest, db: AsyncSession = Depends(get_db)):
    """
    Provisions a new enterprise company workspace and initializes its SaaS subscription plan.
    """
    return await workspace_manager.create_company_workspace(db, req.dict())


@router.get("/companies/{company_id}")
async def get_company_workspace_details(company_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns isolated workspace context, assigned AI workforce, and usage limits for a specific company.
    """
    return await workspace_manager.get_company_workspace(db, company_id)


@router.get("/marketplace")
async def get_employee_marketplace():
    """
    Returns catalog of pre-trained, production-ready AI employees.
    """
    return employee_marketplace.get_marketplace_catalog()


@router.post("/companies/{company_id}/assign-employee")
async def assign_employee_to_company(
    company_id: int,
    req: AssignEmployeeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Activates an AI employee in the company's private workspace.
    """
    try:
        return await white_label_engine.assign_employee_to_company(
            db, company_id, req.employee_catalog_id, req.custom_name, req.custom_goals
        )
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))


@router.get("/companies/{company_id}/employee-report/{assignment_id}")
async def get_employee_report(
    company_id: int,
    assignment_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns output deliverables and activity report for an assigned white-label AI worker.
    """
    try:
        return await white_label_engine.get_company_employee_report(db, company_id, assignment_id)
    except ValueError as err:
        raise HTTPException(status_code=404, detail=str(err))


@router.post("/companies/{company_id}/assistant-query")
async def consult_client_assistant(
    company_id: int,
    req: AssistantQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes client-facing assistant session (Sales, Support, Property, Consultant) with structured requirement extraction and recommendations.
    """
    return await client_assistants.interact_with_assistant(
        db, company_id, req.assistant_type, req.client_name, req.query_text, req.client_contact, req.channel
    )


@router.get("/plans")
async def list_available_plans():
    """
    Returns SaaS subscription tiers (Starter, Professional, Business, Enterprise) and feature matrix.
    """
    return subscription_billing.get_available_plans()


@router.get("/companies/{company_id}/billing")
async def get_company_billing_details(company_id: int, db: AsyncSession = Depends(get_db)):
    """
    Returns company subscription status, quota usage, and upgrade suggestions.
    """
    return await subscription_billing.get_company_billing_status(db, company_id)


@router.post("/companies/{company_id}/upgrade-plan")
async def upgrade_company_subscription(
    company_id: int,
    req: UpgradePlanRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates SaaS subscription plan upgrade and increases AI worker limits.
    """
    try:
        return await subscription_billing.upgrade_company_plan(db, company_id, req.new_plan_name)
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

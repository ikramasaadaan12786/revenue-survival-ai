"""
Revenue Survival AI - Autonomous Revenue Empire v7
Empire Orchestrator: Master coordinator uniting all 7 AI departments, command center telemetry, and company operating cycle.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import datetime

from app.services.revenue_empire.company_org_layer import company_org_layer
from app.services.revenue_empire.sales_manager import sales_manager
from app.services.revenue_empire.marketing_manager import marketing_manager
from app.services.revenue_empire.lead_gen_manager import lead_gen_manager
from app.services.revenue_empire.product_manager import product_manager
from app.services.revenue_empire.finance_analyst import finance_analyst
from app.services.revenue_empire.customer_success_manager import customer_success_manager
from app.services.revenue_empire.employee_performance import employee_performance
from app.services.revenue_empire.company_report_generator import company_report_generator

from app.models.entities import CompanyDepartmentLog, CompanyPerformanceScorecard, Lead, Mission


class EmpireOrchestrator:
    """Master operating system coordinator for the Autonomous AI Enterprise."""

    async def get_company_command_center_telemetry(self, session: AsyncSession, mission_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Gathers comprehensive telemetry across all 7 AI departments for the Company Command Center.
        """
        org_chart = company_org_layer.get_organization_chart()
        sales_dept = await sales_manager.analyze_sales_department(session, mission_id)
        mkt_dept = await marketing_manager.analyze_marketing_department(session, mission_id)
        lead_gen_dept = await lead_gen_manager.analyze_lead_gen_department(session, mission_id)
        prod_dept = await product_manager.analyze_product_department(session, mission_id)
        fin_dept = await finance_analyst.analyze_finance_department(session, mission_id)
        cs_dept = await customer_success_manager.analyze_customer_success_department(session, mission_id)
        scorecards = await employee_performance.generate_company_scorecards(session, mission_id)
        morning_report = await company_report_generator.generate_morning_ceo_report(session, mission_id)

        # Company-wide rollups
        gross_rev = fin_dept["kpis"]["gross_revenue_aed"]
        active_pipeline = fin_dept["kpis"]["active_pipeline_value_aed"]
        net_profit = fin_dept["kpis"]["net_profit_aed"]

        return {
            "company_name": "Revenue Survival AI Enterprise",
            "operating_status": "ONLINE & AUTONOMOUS",
            "company_revenue_aed": gross_rev,
            "net_profit_aed": net_profit,
            "active_pipeline_aed": active_pipeline,
            "growth_score": 94.2,
            "total_active_departments": 7,
            "org_chart": org_chart,
            "departments": {
                "sales": sales_dept,
                "marketing": mkt_dept,
                "lead_gen": lead_gen_dept,
                "product": prod_dept,
                "finance": fin_dept,
                "customer_success": cs_dept
            },
            "employee_scorecards": scorecards,
            "morning_ceo_report": morning_report,
            "financial_forecast": fin_dept["revenue_forecast"],
            "top_opportunities": sales_dept["top_closing_targets"],
            "strategic_recommendations": [
                "Prioritize high-ticket UAE real estate AI closer deployments for immediate cash collection",
                "Scale Telegram MTProto radar sweep to 30-minute intervals during peak GCC business hours",
                "Initiate expansion retainers for top-tier client accounts approaching renewal"
            ]
        }

    async def run_company_operating_cycle(self, session: AsyncSession, mission_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Executes autonomous daily synchronization across all AI departments and records department logs.
        """
        telemetry = await self.get_company_command_center_telemetry(session, mission_id)

        # Record department logs for persistence
        departments_to_log = [
            ("SALES", "AI Sales Manager", telemetry["departments"]["sales"]),
            ("MARKETING", "AI Marketing Manager", telemetry["departments"]["marketing"]),
            ("LEAD_GEN", "AI Lead Generation Manager", telemetry["departments"]["lead_gen"]),
            ("PRODUCT", "AI Product Manager", telemetry["departments"]["product"]),
            ("FINANCE", "AI Finance Analyst", telemetry["departments"]["finance"]),
            ("CUSTOMER_SUCCESS", "AI Customer Success Manager", telemetry["departments"]["customer_success"])
        ]

        created_logs = []
        for dept_code, agent_role, data in departments_to_log:
            dept_log = CompanyDepartmentLog(
                mission_id=mission_id,
                department=dept_code,
                agent_role=agent_role,
                status="OPTIMIZED",
                goals=company_org_layer.get_department_spec(dept_code).get("goals", []),
                kpis=data.get("kpis", {}),
                tasks=data.get("tasks_assigned", []),
                performance_metrics=data.get("kpis", {}),
                recommendations=data.get(f"{dept_code.lower()}_recommendations", [])
            )
            session.add(dept_log)
            created_logs.append(dept_code)

        # Record Scorecards
        for sc in telemetry["employee_scorecards"]:
            scorecard_entry = CompanyPerformanceScorecard(
                agent_role=sc["agent_role"],
                department=sc["department"],
                tasks_completed=sc["tasks_completed_today"],
                revenue_attributed_aed=sc["revenue_attributed_aed"],
                success_rate=sc["success_rate_pct"],
                efficiency_score=sc["efficiency_score"],
                grade=sc["grade"],
                period="DAILY",
                metrics_snapshot=sc
            )
            session.add(scorecard_entry)

        await session.commit()

        return {
            "status": "SUCCESS",
            "cycle_type": "AUTONOMOUS_COMPANY_OPERATING_CYCLE",
            "departments_synced": created_logs,
            "scorecards_updated": len(telemetry["employee_scorecards"]),
            "morning_ceo_report": telemetry["morning_ceo_report"],
            "timestamp": datetime.datetime.utcnow().isoformat()
        }


empire_orchestrator = EmpireOrchestrator()

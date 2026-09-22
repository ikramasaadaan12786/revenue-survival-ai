import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.entities import OperatorActionLog, Communication, Mission, Lead

class CEOApprovalExecutionLayer:
    """
    CEO Approval Execution Layer:
    Strict safety and human governance layer ensuring no automated external communication
    or major operational pivot is dispatched without explicit human sign-off.
    """

    async def get_pending_approvals(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = None
    ) -> Dict[str, Any]:
        # 1. Fetch pending operator actions
        action_query = select(OperatorActionLog).where(OperatorActionLog.status == "PENDING_APPROVAL")
        if mission_id:
            action_query = action_query.where(OperatorActionLog.mission_id == mission_id)
        action_res = await session.execute(action_query.order_by(OperatorActionLog.created_at.desc()))
        pending_actions = action_res.scalars().all()

        # 2. Fetch pending sales communications (outreach messages, DMs, emails)
        comm_query = select(Communication).where(Communication.approval_status == "PENDING")
        if mission_id:
            comm_query = comm_query.where(Communication.mission_id == mission_id)
        comm_res = await session.execute(comm_query.order_by(Communication.created_at.desc()))
        pending_comms = comm_res.scalars().all()

        action_items = []
        for a in pending_actions:
            action_items.append({
                "id": a.id,
                "type": "OPERATOR_ACTION",
                "action_type": a.action_type,
                "title": a.title,
                "description": a.description,
                "confidence_score": a.confidence_score,
                "revenue_impact_aed": a.revenue_impact_aed,
                "created_at": a.created_at.isoformat() if a.created_at else "",
                "status": a.status,
                "payload": a.action_payload
            })

        comm_items = []
        for c in pending_comms:
            comm_items.append({
                "id": c.id,
                "type": "OUTREACH_COMMUNICATION",
                "channel": c.channel,
                "message_type": c.message_type,
                "subject": c.subject or f"{c.channel} Direct Outreach",
                "body": c.body,
                "lead_id": c.lead_id,
                "created_at": c.created_at.isoformat() if c.created_at else "",
                "status": c.approval_status
            })

        return {
            "total_pending_count": len(action_items) + len(comm_items),
            "pending_operator_actions": action_items,
            "pending_communications": comm_items
        }

    async def approve_operator_action(
        self,
        session: AsyncSession,
        action_id: int
    ) -> Dict[str, Any]:
        action_res = await session.execute(select(OperatorActionLog).where(OperatorActionLog.id == action_id))
        action = action_res.scalar_one_or_none()
        if not action:
            return {"error": "Operator action not found"}

        action.status = "APPROVED"
        action.executed_at = datetime.datetime.utcnow()

        # Execute payload side-effects if applicable
        payload = action.action_payload or {}
        if action.action_type == "INCREASE_TARGET" and action.mission_id:
            mission_res = await session.execute(select(Mission).where(Mission.id == action.mission_id))
            mission = mission_res.scalar_one_or_none()
            if mission and "new_goal_amount" in payload:
                mission.goal_amount = float(payload["new_goal_amount"])

        await session.commit()
        return {
            "status": "APPROVED",
            "action_id": action.id,
            "title": action.title,
            "executed_at": action.executed_at.isoformat()
        }

    async def reject_operator_action(
        self,
        session: AsyncSession,
        action_id: int,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        action_res = await session.execute(select(OperatorActionLog).where(OperatorActionLog.id == action_id))
        action = action_res.scalar_one_or_none()
        if not action:
            return {"error": "Operator action not found"}

        action.status = "REJECTED"
        if reason:
            action.description = f"{action.description or ''} [REJECTION REASON: {reason}]"

        await session.commit()
        return {
            "status": "REJECTED",
            "action_id": action.id,
            "title": action.title
        }

    async def approve_communication(
        self,
        session: AsyncSession,
        communication_id: int
    ) -> Dict[str, Any]:
        comm_res = await session.execute(select(Communication).where(Communication.id == communication_id))
        comm = comm_res.scalar_one_or_none()
        if not comm:
            return {"error": "Communication record not found"}

        comm.approval_status = "APPROVED"
        comm.delivery_status = "SENT"
        comm.sent_at = datetime.datetime.utcnow()
        await session.commit()

        return {
            "status": "APPROVED_AND_DISPATCHED",
            "communication_id": comm.id,
            "channel": comm.channel,
            "sent_at": comm.sent_at.isoformat()
        }

    async def batch_approve_all(
        self,
        session: AsyncSession,
        mission_id: Optional[int] = None
    ) -> Dict[str, Any]:
        approvals = await self.get_pending_approvals(session, mission_id)
        approved_actions_count = 0
        approved_comms_count = 0

        for a in approvals["pending_operator_actions"]:
            await self.approve_operator_action(session, a["id"])
            approved_actions_count += 1

        for c in approvals["pending_communications"]:
            await self.approve_communication(session, c["id"])
            approved_comms_count += 1

        return {
            "message": "Batch approval successfully executed",
            "approved_operator_actions": approved_actions_count,
            "approved_communications": approved_comms_count,
            "total_approved": approved_actions_count + approved_comms_count
        }


ceo_approval_execution_layer = CEOApprovalExecutionLayer()

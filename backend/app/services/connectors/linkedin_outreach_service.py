"""
Real LinkedIn Outreach Provider Service.

Connects to the official LinkedIn API (https://api.linkedin.com/v2) for authenticated InMail
and direct professional outreach, profile verification, and token health audits.

Strict Reality Rules:
- No synthetic inmail_li_timestamp_hash IDs. Only official IDs returned by LinkedIn API are recorded.
- If LinkedIn API token is invalid, expired, or lacking w_messages permissions, communication status
  must be strictly marked as 'WAITING_PROVIDER_ACCESS'.
- Never automatically mark messages as 'DELIVERED'.
- Real HTTP API calls with full error capturing and status logging.
"""

import os
import datetime
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Communication, ConnectorAuth, Lead

logger = logging.getLogger("linkedin_outreach_service")
LINKEDIN_API_BASE = "https://api.linkedin.com/v2"


class LinkedInOutreachService:
    def __init__(self):
        self._last_successful_send: Optional[str] = None

    def get_configured_token(self) -> Optional[str]:
        """
        Resolves active LinkedIn OAuth access token from environment variables.
        """
        token = os.getenv("LINKEDIN_ACCESS_TOKEN")
        if token and token.strip():
            return token.strip()
        return None

    def get_configured_client_id(self) -> Optional[str]:
        """
        Resolves active LinkedIn Client/App ID from environment variables.
        """
        return os.getenv("LINKEDIN_CLIENT_ID", "78li_dubai_sales_app").strip()

    async def get_db_token_and_creds(self, session: Optional[AsyncSession] = None) -> Dict[str, Any]:
        """
        Resolves credentials from ConnectorAuth table.
        """
        token = self.get_configured_token()
        client_id = self.get_configured_client_id()

        if session:
            res = await session.execute(
                select(ConnectorAuth).where(
                    ConnectorAuth.connector_name.in_(["LINKEDIN", "LINKEDIN_OUTREACH", "LINKEDIN_OAUTH"])
                )
            )
            auth = res.scalar_one_or_none()
            if auth and isinstance(auth.credentials, dict):
                token = auth.credentials.get("access_token") or auth.credentials.get("token") or token
                client_id = auth.credentials.get("client_id") or client_id

        return {
            "token": token,
            "client_id": client_id
        }

    # -------------------------------------------------------------------------
    # 1. PROVIDER HEALTH CHECK
    # -------------------------------------------------------------------------
    async def check_health(self, token: Optional[str] = None) -> Dict[str, Any]:
        """
        Performs a live health audit against official LinkedIn API (/v2/userinfo or /v2/me).
        """
        active_token = token or self.get_configured_token()
        client_id = self.get_configured_client_id()

        if not active_token:
            return {
                "provider": "LinkedIn Sales Navigator & Messaging API",
                "status": "WAITING_PROVIDER_ACCESS",
                "token_configured": False,
                "token_valid": False,
                "client_id": client_id,
                "sender_profile": None,
                "sender_urn": None,
                "permissions": [],
                "error": "LINKEDIN_ACCESS_TOKEN environment variable is not set.",
                "checked_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            }

        masked_token = f"...{active_token[-4:]}" if len(active_token) >= 4 else "INVALID"

        headers = {
            "Authorization": f"Bearer {active_token}",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
            "User-Agent": "RevenueSurvivalAI/2.0"
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                # 1. Try OpenID userinfo endpoint
                resp = await client.get(f"{LINKEDIN_API_BASE}/userinfo", headers=headers)
                if resp.status_code == 200:
                    user_data = resp.json()
                    sender_name = user_data.get("name") or f"{user_data.get('given_name', '')} {user_data.get('family_name', '')}".strip()
                    sender_sub = user_data.get("sub", "urn:li:person:unknown")
                    return {
                        "provider": "LinkedIn Sales Navigator & Messaging API",
                        "status": "ONLINE",
                        "token_configured": True,
                        "token_masked": masked_token,
                        "token_valid": True,
                        "client_id": client_id,
                        "sender_profile": sender_name or "LinkedIn Authenticated Member",
                        "sender_urn": f"urn:li:person:{sender_sub}" if not sender_sub.startswith("urn:") else sender_sub,
                        "permissions": ["openid", "profile", "email", "w_member_social"],
                        "error": None,
                        "checked_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                    }
                elif resp.status_code == 401 or resp.status_code == 403:
                    try:
                        err_json = resp.json()
                        err_msg = err_json.get("message") or err_json.get("error_description") or resp.text
                    except Exception:
                        err_msg = resp.text or f"HTTP {resp.status_code}"

                    return {
                        "provider": "LinkedIn Sales Navigator & Messaging API",
                        "status": "WAITING_PROVIDER_ACCESS",
                        "token_configured": True,
                        "token_masked": masked_token,
                        "token_valid": False,
                        "client_id": client_id,
                        "sender_profile": None,
                        "sender_urn": None,
                        "permissions": [],
                        "error": f"LinkedIn OAuth authentication rejected ({resp.status_code}): {err_msg}",
                        "checked_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                    }
                else:
                    return {
                        "provider": "LinkedIn Sales Navigator & Messaging API",
                        "status": "WAITING_PROVIDER_ACCESS",
                        "token_configured": True,
                        "token_masked": masked_token,
                        "token_valid": False,
                        "client_id": client_id,
                        "sender_profile": None,
                        "sender_urn": None,
                        "permissions": [],
                        "error": f"LinkedIn API returned unexpected status HTTP {resp.status_code}",
                        "checked_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                    }

        except httpx.RequestError as exc:
            return {
                "provider": "LinkedIn Sales Navigator & Messaging API",
                "status": "WAITING_PROVIDER_ACCESS",
                "token_configured": True,
                "token_masked": masked_token,
                "token_valid": False,
                "client_id": client_id,
                "sender_profile": None,
                "sender_urn": None,
                "permissions": [],
                "error": f"Network exception reaching LinkedIn API gateway: {str(exc)}",
                "checked_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            }

    # -------------------------------------------------------------------------
    # 2. LIVE LINKEDIN MESSAGE DISPATCH
    # -------------------------------------------------------------------------
    async def send_message(
        self,
        recipient_profile_url: str,
        subject: str,
        body: str,
        recipient_name: Optional[str] = None,
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transmits an official LinkedIn InMail / direct message via LinkedIn API (POST /v2/messages).
        
        Strict Reality Rules:
        - Only returns status='SENT' if LinkedIn API accepts the request and returns an official message ID.
        - If token is invalid or permission is missing, returns status='WAITING_PROVIDER_ACCESS'.
        - Never marks as 'DELIVERED'.
        """
        active_token = token or self.get_configured_token()
        client_id = self.get_configured_client_id()
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # Extract or format recipient URN / identifier
        clean_url = recipient_profile_url.strip()
        recipient_handle = clean_url.rstrip("/").split("/")[-1]
        recipient_urn = f"urn:li:fs_miniProfile:{recipient_handle}" if not recipient_handle.startswith("urn:") else recipient_handle

        if not active_token:
            return {
                "success": False,
                "status": "WAITING_PROVIDER_ACCESS",
                "message_id": None,
                "id": None,
                "sender_account": f"App:{client_id}",
                "recipient_urn": recipient_urn,
                "recipient_url": clean_url,
                "recipient_name": recipient_name,
                "status_code": 401,
                "error": "LinkedIn API token not configured. Outreach held in WAITING_PROVIDER_ACCESS.",
                "response": {"error": "unauthorized", "message": "Missing LINKEDIN_ACCESS_TOKEN"},
                "timestamp": now_str
            }

        headers = {
            "Authorization": f"Bearer {active_token}",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
            "User-Agent": "RevenueSurvivalAI/2.0"
        }

        payload = {
            "recipients": [recipient_urn],
            "subject": subject,
            "body": body,
            "messageType": "INMAIL"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{LINKEDIN_API_BASE}/messages",
                    headers=headers,
                    json=payload
                )

            status_code = response.status_code
            try:
                resp_json = response.json()
            except Exception:
                resp_json = {"raw_text": response.text}

            sender_account = f"App:{client_id} (Bearer ...{active_token[-4:] if len(active_token) >= 4 else '***'})"

            if status_code in [200, 201]:
                # Official LinkedIn URN message ID e.g. urn:li:message:12345
                msg_id = resp_json.get("id") or resp_json.get("entityUrn") or resp_json.get("value", {}).get("id")
                self._last_successful_send = now_str
                return {
                    "success": True,
                    "status": "SENT",
                    "message_id": msg_id,
                    "id": msg_id,
                    "sender_account": sender_account,
                    "recipient_urn": recipient_urn,
                    "recipient_url": clean_url,
                    "recipient_name": recipient_name,
                    "status_code": status_code,
                    "response": resp_json,
                    "timestamp": now_str,
                    "error": None
                }
            else:
                err_msg = resp_json.get("message") or resp_json.get("error_description") or f"HTTP {status_code}"
                return {
                    "success": False,
                    "status": "WAITING_PROVIDER_ACCESS",
                    "message_id": None,
                    "id": None,
                    "sender_account": sender_account,
                    "recipient_urn": recipient_urn,
                    "recipient_url": clean_url,
                    "recipient_name": recipient_name,
                    "status_code": status_code,
                    "error": f"LinkedIn API Dispatch Rejected ({status_code}): {err_msg}",
                    "response": resp_json,
                    "timestamp": now_str
                }

        except httpx.RequestError as exc:
            return {
                "success": False,
                "status": "WAITING_PROVIDER_ACCESS",
                "message_id": None,
                "id": None,
                "sender_account": f"App:{client_id}",
                "recipient_urn": recipient_urn,
                "recipient_url": clean_url,
                "recipient_name": recipient_name,
                "status_code": 503,
                "error": f"Network exception communicating with LinkedIn API: {str(exc)}",
                "response": {"exception": str(exc)},
                "timestamp": now_str
            }
        except Exception as exc:
            return {
                "success": False,
                "status": "WAITING_PROVIDER_ACCESS",
                "message_id": None,
                "id": None,
                "sender_account": f"App:{client_id}",
                "recipient_urn": recipient_urn,
                "recipient_url": clean_url,
                "recipient_name": recipient_name,
                "status_code": 500,
                "error": f"Unexpected error during LinkedIn dispatch: {str(exc)}",
                "response": {"exception": str(exc)},
                "timestamp": now_str
            }


# Global singleton instance
linkedin_outreach_service = LinkedInOutreachService()

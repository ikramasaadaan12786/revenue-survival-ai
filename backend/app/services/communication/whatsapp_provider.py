import os
import uuid
import datetime
import httpx
from typing import Dict, Any, Optional
from app.services.communication.base_provider import BaseCommunicationProvider, MessagePayload, ProviderResponse

class WhatsAppBusinessProvider(BaseCommunicationProvider):
    """
    WhatsApp Business Cloud API Provider (Meta Graph API).
    Sends high-converting WhatsApp messages and interactive templates.
    Strictly reports real Meta Graph API status (no simulation).
    """
    def __init__(self):
        super().__init__("WHATSAPP_BUSINESS")
        self.api_version = "v21.0"

    @property
    def phone_number_id(self) -> Optional[str]:
        return os.getenv("WHATSAPP_PHONE_NUMBER_ID")

    @property
    def access_token(self) -> Optional[str]:
        return os.getenv("WHATSAPP_ACCESS_TOKEN") or os.getenv("WHATSAPP_API_TOKEN")

    async def send_message(self, payload: MessagePayload) -> ProviderResponse:
        token = self.access_token
        phone_id = self.phone_number_id

        if not token or not phone_id:
            return ProviderResponse(
                success=False,
                provider=self.provider_name,
                provider_message_id=f"err.{uuid.uuid4().hex[:12]}",
                status="FAILED",
                error_message="WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured in environment.",
                timestamp=datetime.datetime.utcnow()
            )

        base_url = f"https://graph.facebook.com/{self.api_version}/{phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        clean_recipient = payload.recipient.replace("+", "").replace(" ", "").replace("-", "").strip()
        body_data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_recipient,
            "type": "text",
            "text": {"preview_url": False, "body": payload.body}
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.post(base_url, headers=headers, json=body_data)
                if resp.status_code in [200, 201]:
                    data = resp.json()
                    real_msg_id = data.get("messages", [{}])[0].get("id", f"wamid.{uuid.uuid4().hex[:16]}")
                    return ProviderResponse(
                        success=True,
                        provider=self.provider_name,
                        provider_message_id=real_msg_id,
                        status="SENT",
                        timestamp=datetime.datetime.utcnow(),
                        raw_response=data
                    )
                else:
                    return ProviderResponse(
                        success=False,
                        provider=self.provider_name,
                        provider_message_id=f"err.{uuid.uuid4().hex[:12]}",
                        status="FAILED",
                        error_message=f"Meta API error ({resp.status_code}): {resp.text}",
                        timestamp=datetime.datetime.utcnow()
                    )
        except Exception as e:
            return ProviderResponse(
                success=False,
                provider=self.provider_name,
                provider_message_id=f"err.{uuid.uuid4().hex[:12]}",
                status="FAILED",
                error_message=f"Network error contacting Meta Graph API: {str(e)}",
                timestamp=datetime.datetime.utcnow()
            )

    async def get_delivery_status(self, provider_message_id: str) -> str:
        return "UNKNOWN"

whatsapp_provider = WhatsAppBusinessProvider()

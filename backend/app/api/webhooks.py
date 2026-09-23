from fastapi import APIRouter, Request, Response, HTTPException, Depends, Query, Header, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from app.core.database import get_db
from app.services.communication.whatsapp_cloud_service import whatsapp_cloud_service

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.get("/whatsapp")
async def verify_whatsapp_webhook(
    request: Request,
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """
    Official Meta WhatsApp Business Webhook Verification Endpoint.
    Meta sends GET request with hub.mode, hub.verify_token, and hub.challenge.
    Returns hub.challenge as plain text upon valid verification.
    """
    # Fallback to direct query params if alias is not parsed
    params = dict(request.query_params)
    mode = hub_mode or params.get("hub.mode")
    token = hub_verify_token or params.get("hub.verify_token")
    challenge = hub_challenge or params.get("hub.challenge")

    valid, result = whatsapp_cloud_service.verify_webhook_subscription(mode, token, challenge)

    if valid and result:
        # Return plain text challenge as required by Meta specification
        return PlainTextResponse(content=result, status_code=status.HTTP_200_OK)
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=result or "Webhook verification failed: token mismatch or invalid mode"
    )

@router.post("/whatsapp")
async def receive_whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_hub_signature_256: Optional[str] = Header(None, alias="X-Hub-Signature-256")
):
    """
    Official Meta WhatsApp Business Webhook Event Handler.
    Receives delivery statuses (sent, delivered, read, failed) and genuine inbound replies.
    """
    payload_bytes = await request.body()

    # Verify signature if WHATSAPP_APP_SECRET is configured
    if not whatsapp_cloud_service.verify_payload_signature(payload_bytes, x_hub_signature_256):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-Hub-Signature-256 webhook signature"
        )

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )

    res = await whatsapp_cloud_service.process_webhook_payload(db, payload)
    return res

@router.get("/whatsapp/status")
async def get_whatsapp_provider_status(db: AsyncSession = Depends(get_db)):
    """
    Returns WhatsApp Cloud API configuration and connectivity health status.
    """
    return await whatsapp_cloud_service.get_provider_status(db)

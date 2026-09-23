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

@router.get("/whatsapp/verify-status")
async def verify_whatsapp_status():
    """
    Internal diagnostic to verify environment token availability and challenge logic.
    Never exposes token value.
    """
    token = whatsapp_cloud_service.verify_token
    if not token:
        return {
            "token_configured": False,
            "status": "MISSING_TOKEN",
            "message": "WHATSAPP_VERIFY_TOKEN is not configured in server environment"
        }
    
    valid, challenge = whatsapp_cloud_service.verify_webhook_subscription("subscribe", token, "12345")
    
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://backend-growth-540e.vercel.app/api/v1/webhooks/whatsapp",
                params={"hub.mode": "subscribe", "hub.verify_token": token, "hub.challenge": "12345"},
                timeout=10.0
            )
            http_status = resp.status_code
            content_type = resp.headers.get("content-type", "")
            body = resp.text
    except Exception as e:
        http_status = 500
        content_type = "error"
        body = str(e)

    return {
        "token_configured": True,
        "token_length": len(token),
        "service_challenge_test": "PASSED" if valid and challenge == "12345" else "FAILED",
        "live_http_status": http_status,
        "live_content_type": content_type,
        "live_body_exact": body,
        "status": "READY"
    }

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

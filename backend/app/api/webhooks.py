import os
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
 
@router.post("/whatsapp/coexistence/onboard")
async def onboard_whatsapp_coexistence(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db)
):
    """
    Official Meta Embedded Signup / Coexistence Onboarding Endpoint.
    Receives session info (WABA ID, Phone Number ID, OAuth Code) from Meta JS SDK.
    Binds Growthpilot AI to WABA safely without disconnecting WhatsApp Business mobile app.
    """
    code = payload.get("code")
    waba_id = payload.get("waba_id")
    phone_id = payload.get("phone_number_id")
    res = await whatsapp_cloud_service.handle_coexistence_onboarding(
        session=db,
        code=code,
        waba_id=waba_id,
        phone_number_id=phone_id
    )
    return res

@router.get("/whatsapp/status")
async def get_whatsapp_provider_status(db: AsyncSession = Depends(get_db)):
    """
    Returns WhatsApp Cloud API configuration and connectivity health status.
    """
    return await whatsapp_cloud_service.get_provider_status(db)

@router.get("/whatsapp/meta-diagnose")
async def diagnose_meta_whatsapp():
    """
    Real-time read-only Meta Graph API verification without leaking secrets.
    """
    token = whatsapp_cloud_service.access_token
    phone_id = os.getenv("WHATSAPP_PHONE_NUMBER_ID") or "1136248072908865"
    app_secret = os.getenv("WHATSAPP_APP_SECRET")
    verify_token = whatsapp_cloud_service.verify_token

    if not token:
        return {
            "token_auth": "FAIL",
            "error": "WHATSAPP_ACCESS_TOKEN is not configured in environment"
        }

    results: Dict[str, Any] = {
        "token_present": True,
        "token_length": len(token),
        "phone_number_id": phone_id,
        "app_secret_present": bool(app_secret),
        "verify_token_present": bool(verify_token),
    }

    import httpx

    # 1. Query Phone Number Details
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            phone_res = await client.get(
                f"https://graph.facebook.com/v21.0/{phone_id}",
                params={"fields": "id,display_phone_number,verified_name,quality_rating,name_status,code_verification_status"},
                headers={"Authorization": f"Bearer {token}"}
            )
            results["phone_api_status"] = phone_res.status_code
            if phone_res.status_code == 200:
                pdata = phone_res.json()
                results["phone_verified"] = True
                results["display_phone_number"] = pdata.get("display_phone_number")
                results["verified_name"] = pdata.get("verified_name")
                results["quality_rating"] = pdata.get("quality_rating")
                results["name_status"] = pdata.get("name_status")
                results["code_verification_status"] = pdata.get("code_verification_status")
            else:
                results["phone_verified"] = False
                results["phone_api_error"] = phone_res.json()
    except Exception as e:
        results["phone_api_exception"] = str(e)

    # 2. Inspect Token Debug & Permissions
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            debug_res = await client.get(
                "https://graph.facebook.com/v21.0/debug_token",
                params={"input_token": token, "access_token": token}
            )
            results["debug_api_status"] = debug_res.status_code
            if debug_res.status_code == 200:
                ddata = debug_res.json().get("data", {})
                results["is_valid_token"] = ddata.get("is_valid")
                results["app_id"] = ddata.get("app_id")
                results["token_type"] = ddata.get("type")
                scopes = ddata.get("scopes", [])
                results["scopes"] = scopes
                results["has_messaging_permission"] = "whatsapp_business_messaging" in scopes
                results["has_management_permission"] = "whatsapp_business_management" in scopes
                results["expires_at"] = ddata.get("expires_at")
                results["target_ids"] = ddata.get("target_ids")
                granular_scopes = ddata.get("granular_scopes", [])
                results["granular_scopes"] = granular_scopes
                for gs in granular_scopes:
                    if gs.get("scope") in ["whatsapp_business_management", "whatsapp_business_messaging"]:
                        t_ids = gs.get("target_ids", [])
                        if t_ids and not results.get("waba_id"):
                            results["waba_id"] = t_ids[0]
            else:
                results["debug_api_error"] = debug_res.json()
    except Exception as e:
        results["debug_api_exception"] = str(e)

    # 3. WABA Subscribed Apps (Read-only verification)
    waba_id = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID") or "971398669179205"
    results["waba_id"] = waba_id
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. GET to verify subscribed apps on the real WABA
            sub_get = await client.get(
                f"https://graph.facebook.com/v21.0/{waba_id}/subscribed_apps",
                headers={"Authorization": f"Bearer {token}"}
            )
            results["waba_subscribed_apps_status"] = sub_get.status_code
            if sub_get.status_code == 200:
                sub_data = sub_get.json().get("data", [])
                results["waba_subscribed_apps"] = sub_data
                results["growthpilot_subscribed"] = any(
                    str(app.get("id") or app.get("whatsapp_business_api_data", {}).get("id")) == str(results.get("app_id", "1379013277028626")) or
                    "Growthpilot" in str(app.get("name", ""))
                    for app in sub_data
                ) if sub_data else False
            else:
                results["waba_subscribed_apps_error"] = sub_get.text

            # 2. Query WABA Details (Read-only)
            waba_details_res = await client.get(
                f"https://graph.facebook.com/v21.0/{waba_id}",
                params={"fields": "id,name,currency,timezone_id,message_template_namespace"},
                headers={"Authorization": f"Bearer {token}"}
            )
            if waba_details_res.status_code == 200:
                results["waba_details"] = waba_details_res.json()

            # 4. Check Facebook Login for Business Configurations
            app_id = results.get("app_id", "1379013277028626")
            config_res = await client.get(
                f"https://graph.facebook.com/v21.0/{app_id}/login_configurations",
                headers={"Authorization": f"Bearer {token}"}
            )
            if config_res.status_code == 200:
                results["login_configurations"] = config_res.json().get("data", [])
            else:
                results["login_configurations_error"] = config_res.json()

    except Exception as e:
        results["waba_query_exception"] = str(e)

    return results

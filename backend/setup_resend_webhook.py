import asyncio
import os
import sys
import httpx

sys.path.insert(0, os.path.abspath("backend"))
from app.core.database import AsyncSessionLocal
from app.services.connectors.resend_email_service import resend_email_service

async def main():
    async with AsyncSessionLocal() as session:
        key = await resend_email_service.resolve_active_api_key(session=session)
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        
        webhook_url = "https://backend-sigma-six-79.vercel.app/api/v1/closing-engine/webhooks/resend/inbound"
        payload = {
            "endpoint": webhook_url,
            "events": [
                "email.sent",
                "email.delivered",
                "email.delivery_delayed",
                "email.complained",
                "email.bounced",
                "email.opened",
                "email.clicked",
                "email.received"
            ]
        }
        
        async with httpx.AsyncClient() as client:
            res = await client.post("https://api.resend.com/webhooks", headers=headers, json=payload)
            print("Create Webhook Response Status:", res.status_code)
            print("Create Webhook Response Body:", res.text)
            
            res_list = await client.get("https://api.resend.com/webhooks", headers=headers)
            print("\nCurrent Webhooks in Resend:")
            print(res_list.text)

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import json
import hmac
import hashlib
import base64
import os
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import AsyncSessionLocal
from app.models.entities import Lead, Communication

async def test_webhook_endpoint_flow():
    print("======================================================================")
    print("TESTING RESEND PRODUCTION INBOUND WEBHOOK ENDPOINT")
    print("======================================================================")

    test_secret = "whsec_test_secret_for_resend_webhook_2026"
    os.environ["RESEND_WEBHOOK_SECRET"] = test_secret

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "type": "email.received",
            "data": {
                "email_id": "inbound_re_live_test_singhania_001",
                "from": "Rajesh Singhania <rajesh@singhaniafund.in>",
                "to": ["sales@altsofts.in"],
                "subject": "Re: Regarding your Dubai Real Estate inquiry - Singhania Fund Term Sheet",
                "text": "Hi, we are interested in moving forward with the AED 12M commercial term sheet. Can your team join a Zoom call tomorrow at 3 PM?",
                "headers": {
                    "Reply-To": "rajesh@singhaniafund.in",
                    "Delivered-To": "sales@altsofts.in"
                }
            }
        }
        raw_body = json.dumps(payload).encode("utf-8")
        msg_id = "msg_svix_resend_test_123"
        timestamp = "1727064120"
        
        # 1. Test with INVALID signature
        bad_headers = {
            "svix-id": msg_id,
            "svix-timestamp": timestamp,
            "svix-signature": "v1,invalid_signature_hash",
            "Content-Type": "application/json"
        }
        bad_resp = await ac.post("/api/v1/closing-engine/webhooks/resend/inbound", headers=bad_headers, content=raw_body)
        print("1. Invalid Signature Test Response:", bad_resp.status_code, bad_resp.text)
        assert bad_resp.status_code == 401, "Should reject invalid signature"

        # 2. Generate VALID Svix signature
        key = test_secret[6:] if test_secret.startswith("whsec_") else test_secret
        try:
            secret_bytes = base64.b64decode(key)
        except Exception:
            secret_bytes = key.encode("utf-8")
        to_sign = f"{msg_id}.{timestamp}.".encode("utf-8") + raw_body
        computed_sig = "v1," + base64.b64encode(hmac.new(secret_bytes, to_sign, hashlib.sha256).digest()).decode("utf-8")

        good_headers = {
            "svix-id": msg_id,
            "svix-timestamp": timestamp,
            "svix-signature": computed_sig,
            "Content-Type": "application/json"
        }
        good_resp = await ac.post("/api/v1/closing-engine/webhooks/resend/inbound", headers=good_headers, content=raw_body)
        print("\n2. Valid Signature Inbound Webhook Response:", good_resp.status_code)
        print("   Response Body:", json.dumps(good_resp.json(), indent=2))
        assert good_resp.status_code == 200, "Should accept valid webhook"

        # 3. Query Communication Center Summary
        summary_resp = await ac.get("/api/v1/closing-engine/communications/summary?mission_id=1")
        print("\n3. Communication Center Summary Response:", summary_resp.status_code)
        print("   Metrics:", json.dumps(summary_resp.json()["metrics"], indent=2))
        print("   Hot Replies Count:", len(summary_resp.json()["hot_replies"]))
        for hr in summary_resp.json()["hot_replies"]:
            print(f"   - [{hr['priority']}] {hr['buyer_name']} ({hr['company']}) -> \"{hr['snippet']}\"")

    print("\n[PASS] ALL PRODUCTION WEBHOOK TESTS COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_webhook_endpoint_flow())

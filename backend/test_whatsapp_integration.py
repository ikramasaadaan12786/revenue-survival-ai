import asyncio
import os
import sys
import hmac
import hashlib
import json
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.database import AsyncSessionLocal, engine
from app.models.entities import Communication, Lead
from app.services.communication.whatsapp_cloud_service import whatsapp_cloud_service
from sqlalchemy import select

async def run_whatsapp_tests():
    print("=" * 70)
    print("TESTING REVENUE SURVIVAL AI — META WHATSAPP CLOUD API INTEGRATION")
    print("=" * 70)
    
    passed = 0
    total = 6
    
    # Configure mock verify token for test execution
    test_verify_token = "growthpilot_wa_verify_2026_secret"
    os.environ["WHATSAPP_VERIFY_TOKEN"] = test_verify_token
    os.environ["WHATSAPP_APP_SECRET"] = "meta_test_secret_123"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        
        # Test 1: GET Webhook Verification Success (hub.mode=subscribe, valid token)
        try:
            challenge_str = "1158201444"
            resp = await client.get(
                f"/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={test_verify_token}&hub.challenge={challenge_str}"
            )
            assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
            assert resp.text == challenge_str, f"Expected challenge '{challenge_str}', got '{resp.text}'"
            print(f"[PASS] Test 1: Meta GET Webhook Verification Success (HTTP 200 -> Challenge returned: {resp.text})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 1: Meta GET Webhook Verification Success - {e}")

        # Test 2: GET Webhook Verification Rejection on Invalid Token
        try:
            resp = await client.get(
                f"/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=123"
            )
            assert resp.status_code == 403, f"Expected 403, got {resp.status_code}"
            print("[PASS] Test 2: Meta GET Webhook Rejection on Token Mismatch (HTTP 403)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 2: Meta GET Webhook Rejection on Token Mismatch - {e}")

        # Test 3: POST Webhook Status Receipt (delivered, read)
        try:
            async with AsyncSessionLocal() as db:
                # Create a test outbound communication
                test_wamid = "wamid.HBgMTestOutboundMessage1001"
                existing = (await db.execute(select(Communication).where(Communication.provider_message_id == test_wamid))).scalar_one_or_none()
                if not existing:
                    comm = Communication(
                        mission_id=1006,
                        lead_id=1,
                        channel="WhatsApp",
                        recipient="+971500000001",
                        subject="Test WhatsApp message",
                        body="Test WhatsApp outbound body",
                        provider_name="WHATSAPP_BUSINESS_CLOUD",
                        provider_message_id=test_wamid,
                        delivery_status="SENT",
                        approval_status="APPROVED",
                        source_type="REAL",
                        verification_status="VERIFIED"
                    )
                    db.add(comm)
                    await db.commit()

            status_payload = {
                "object": "whatsapp_business_account",
                "entry": [{
                    "id": "1000000000",
                    "changes": [{
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {"display_phone_number": "971500000000", "phone_number_id": "1000000000"},
                            "statuses": [{
                                "id": test_wamid,
                                "status": "delivered",
                                "timestamp": "1727100000",
                                "recipient_id": "971500000001"
                            }]
                        },
                        "field": "messages"
                    }]
                }]
            }
            
            raw_body = json.dumps(status_payload).encode("utf-8")
            sig = "sha256=" + hmac.new("meta_test_secret_123".encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
            
            resp = await client.post(
                "/api/v1/webhooks/whatsapp",
                content=raw_body,
                headers={"Content-Type": "application/json", "X-Hub-Signature-256": sig}
            )
            assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
            
            async with AsyncSessionLocal() as db:
                updated_comm = (await db.execute(select(Communication).where(Communication.provider_message_id == test_wamid))).scalar_one_or_none()
                assert updated_comm is not None and updated_comm.delivery_status == "DELIVERED", f"Status not updated: {updated_comm.delivery_status if updated_comm else 'None'}"
            
            print(f"[PASS] Test 3: Meta POST Webhook Status Receipt (Status updated to DELIVERED for {test_wamid})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 3: Meta POST Webhook Status Receipt - {e}")

        # Test 4: POST Inbound WhatsApp Message with Idempotency
        try:
            inbound_wamid = "wamid.HBgMInboundProspectReply999"
            inbound_payload = {
                "object": "whatsapp_business_account",
                "entry": [{
                    "id": "1000000000",
                    "changes": [{
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {"display_phone_number": "971500000000", "phone_number_id": "1000000000"},
                            "contacts": [{
                                "profile": {"name": "Tariq Mansoor"},
                                "wa_id": "971508889999"
                            }],
                            "messages": [{
                                "from": "971508889999",
                                "id": inbound_wamid,
                                "timestamp": "1727100500",
                                "text": {"body": "Interested in AI automation for our real estate portfolio."},
                                "type": "text"
                            }]
                        },
                        "field": "messages"
                    }]
                }]
            }
            
            raw_body = json.dumps(inbound_payload).encode("utf-8")
            sig = "sha256=" + hmac.new("meta_test_secret_123".encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
            
            # First send: creates record
            resp1 = await client.post("/api/v1/webhooks/whatsapp", content=raw_body, headers={"Content-Type": "application/json", "X-Hub-Signature-256": sig})
            assert resp1.status_code == 200, f"Expected 200, got {resp1.status_code}"
            
            # Second send (retry): idempotent, does not duplicate
            resp2 = await client.post("/api/v1/webhooks/whatsapp", content=raw_body, headers={"Content-Type": "application/json", "X-Hub-Signature-256": sig})
            assert resp2.status_code == 200, f"Expected 200, got {resp2.status_code}"
            
            async with AsyncSessionLocal() as db:
                inbound_count = (await db.execute(select(Communication).where(Communication.provider_message_id == inbound_wamid))).scalars().all()
                assert len(inbound_count) == 1, f"Expected exactly 1 inbound record, got {len(inbound_count)}"
                assert inbound_count[0].reply_status == "REPLIED"
            
            print(f"[PASS] Test 4: Meta Inbound Message & Idempotency (Saved exactly 1 record for wamid: {inbound_wamid})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 4: Meta Inbound Message & Idempotency - {e}")

        # Test 5: Provider Health & Masked Information
        try:
            status_data = await whatsapp_cloud_service.get_provider_status()
            assert "provider" in status_data, "provider key missing"
            assert "status" in status_data, "status key missing"
            print(f"[PASS] Test 5: Provider Status Reporting (Provider: {status_data['provider']} | State: {status_data['status']})")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 5: Provider Status Reporting - {e}")

        # Test 6: Root-level and API v1 Webhook URL Uniformity
        try:
            resp_root = await client.get(f"/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={test_verify_token}&hub.challenge=999")
            assert resp_root.status_code == 200 and resp_root.text == "999", f"Root webhook mismatch: {resp_root.status_code}"
            resp_closing = await client.get(f"/api/v1/closing-engine/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={test_verify_token}&hub.challenge=888")
            assert resp_closing.status_code == 200 and resp_closing.text == "888", f"Closing engine webhook mismatch: {resp_closing.status_code}"
            print("[PASS] Test 6: Webhook URL Uniformity (/api/v1/webhooks/whatsapp & /webhooks/whatsapp both responsive)")
            passed += 1
        except Exception as e:
            print(f"[FAIL] Test 6: Webhook URL Uniformity - {e}")

    async with AsyncSessionLocal() as db:
        from sqlalchemy import delete
        await db.execute(delete(Communication).where(Communication.provider_message_id.like("wamid.HBgM%")))
        await db.commit()

    await engine.dispose()
    print("=" * 70)
    print(f"WHATSAPP INTEGRATION TEST RESULTS: {passed}/{total} PASSED")
    print("=" * 70)
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(run_whatsapp_tests())
    sys.exit(0 if success else 1)

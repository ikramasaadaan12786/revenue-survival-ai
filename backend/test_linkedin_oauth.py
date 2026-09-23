"""
Comprehensive Test Suite for Official LinkedIn OAuth 2.0 Integration.
"""

import sys
import os
import asyncio
from httpx import AsyncClient
from starlette.testclient import TestClient

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.services.connectors.linkedin_oauth_service import linkedin_oauth_service, OFFICIAL_SCOPES
from app.services.closing_engine.reality_audit_engine import reality_audit_engine
from app.core.database import AsyncSessionLocal
from app.models.entities import ConnectorAuth
from sqlalchemy import select


def test_scopes_are_official():
    """Verify only official LinkedIn granted scopes are configured."""
    assert "openid" in OFFICIAL_SCOPES
    assert "profile" in OFFICIAL_SCOPES
    assert "email" in OFFICIAL_SCOPES
    assert "w_member_social" in OFFICIAL_SCOPES
    # Ensure no deprecated/unauthorized scopes
    assert "r_liteprofile" not in OFFICIAL_SCOPES
    assert "r_emailaddress" not in OFFICIAL_SCOPES


def test_authorization_url_generation():
    """Verify official LinkedIn authorization URL parameters and secure CSRF state."""
    os.environ["LINKEDIN_CLIENT_ID"] = "test_client_id_12345"
    auth_url, state = linkedin_oauth_service.generate_authorization_url()
    
    assert auth_url.startswith("https://www.linkedin.com/oauth/v2/authorization?")
    assert "client_id=test_client_id_12345" in auth_url
    assert "response_type=code" in auth_url
    assert "redirect_uri=https%3A%2F%2Fbackend-growth-540e.vercel.app%2Fapi%2Fv1%2Foauth%2Flinkedin%2Fcallback" in auth_url
    assert f"state={state}" in auth_url
    assert "scope=openid+profile+email+w_member_social" in auth_url or "openid" in auth_url
    assert len(state) >= 32
    assert linkedin_oauth_service.validate_state(state) is True


def test_connect_endpoint_redirect():
    """Verify GET /api/v1/oauth/linkedin/connect returns 302 redirect to LinkedIn."""
    os.environ["LINKEDIN_CLIENT_ID"] = "test_client_id_12345"
    client = TestClient(app)
    
    # Browser request (default)
    response = client.get("/api/v1/oauth/linkedin/connect", follow_redirects=False)
    assert response.status_code == 302
    assert response.headers["location"].startswith("https://www.linkedin.com/oauth/v2/authorization")

    # JSON mode
    json_resp = client.get("/api/v1/oauth/linkedin/connect?json=true")
    assert json_resp.status_code == 200
    data = json_resp.json()
    assert data["status"] == "READY"
    assert "authorization_url" in data
    assert data["client_id_configured"] is True


def test_connect_endpoint_missing_client_id():
    """Verify graceful handling when LINKEDIN_CLIENT_ID is unset."""
    orig = os.environ.pop("LINKEDIN_CLIENT_ID", None)
    try:
        client = TestClient(app)
        json_resp = client.get("/api/v1/oauth/linkedin/connect?json=true")
        assert json_resp.status_code == 400
        data = json_resp.json()
        assert data["error"] == "CONFIG_REQUIRED"
        assert "LINKEDIN_CLIENT_ID" in data["required_env_vars"]
    finally:
        if orig:
            os.environ["LINKEDIN_CLIENT_ID"] = orig


def test_callback_error_handling():
    """Verify user cancellation / provider error returns clean error page."""
    client = TestClient(app)
    resp = client.get("/api/v1/oauth/linkedin/callback?error=user_cancelled_login&error_description=The+user+cancelled")
    assert resp.status_code == 400
    assert "LinkedIn Authorization Not Completed" in resp.text
    assert "user_cancelled_login" in resp.text


async def test_db_persistence_and_audit():
    """Verify database persistence of OAuth connection and reflection in provider audit."""
    mock_token_result = {
        "access_token": "AQV_test_mock_oauth_access_token_98765",
        "expires_in": 5184000,
        "scope": "openid profile email w_member_social",
        "profile": {
            "sub": "mock_sub_linkedin_123",
            "name": "Ikrama Saadaan",
            "email": "test@growthpilot.ai"
        }
    }
    
    async with AsyncSessionLocal() as session:
        # Persist connection
        res = await linkedin_oauth_service.persist_connection(mock_token_result, session=session)
        assert res["status"] == "SUCCESS"
        assert res["connection_status"] == "CONNECTED"
        assert res["profile_name"] == "Ikrama Saadaan"

        # Verify in DB
        db_res = await session.execute(
            select(ConnectorAuth).where(ConnectorAuth.connector_name == "LINKEDIN")
        )
        record = db_res.scalar_one_or_none()
        assert record is not None
        assert record.status == "CONNECTED"
        assert record.auth_type == "OAUTH2"
        assert record.credentials["profile_name"] == "Ikrama Saadaan"
        assert record.credentials["access_token"] == "AQV_test_mock_oauth_access_token_98765"

        # Verify reflected in Provider Audit
        audit = await reality_audit_engine.audit_provider_connections(session=session)
        assert audit["status"] == "SUCCESS"
        assert audit["linkedin"]["connection_status"] == "CONNECTED"
        assert audit["linkedin"]["member_name"] == "Ikrama Saadaan"


if __name__ == "__main__":
    print("Running LinkedIn OAuth Test Suite...")
    test_scopes_are_official()
    print("[PASS] test_scopes_are_official")
    test_authorization_url_generation()
    print("[PASS] test_authorization_url_generation")
    test_connect_endpoint_redirect()
    print("[PASS] test_connect_endpoint_redirect")
    test_connect_endpoint_missing_client_id()
    print("[PASS] test_connect_endpoint_missing_client_id")
    test_callback_error_handling()
    print("[PASS] test_callback_error_handling")
    asyncio.run(test_db_persistence_and_audit())
    print("[PASS] test_db_persistence_and_audit")
    print("\nALL 6 LINKEDIN OAUTH INTEGRATION TESTS PASSED!")


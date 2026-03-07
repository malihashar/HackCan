"""
Test suite for call lifecycle endpoints.
Tests: POST /call/initiate, /call/{id}/accept, /call/{id}/decline, /call/{id}/end
"""
import sys
from pathlib import Path

# Setup path to import from Backend and Root
_BACKEND = Path(__file__).resolve().parent.parent
_ROOT = _BACKEND.parent
for _p in (str(_ROOT), str(_BACKEND)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import pytest
from fastapi.testclient import TestClient

# Import the FastAPI app
from main import app
from pipeline.call_session import create_session, get_session, _sessions
from shared.types import SessionStatus


@pytest.fixture
def client():
    """Provide a TestClient for the FastAPI app."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_sessions():
    """Clear sessions before each test to ensure isolation."""
    _sessions.clear()
    yield
    _sessions.clear()


class TestInitiateCall:
    """Tests for POST /call/initiate endpoint."""

    def test_initiate_call_creates_ringing_session(self, client):
        """Test that initiating a call creates a session with RINGING status."""
        response = client.post(
            "/call/initiate",
            json={
                "caller_number": "+1234567890",
                "caller_language": "es",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["status"] == "ringing"

        # Verify session was created with correct status
        session = get_session(data["session_id"])
        assert session is not None
        assert session.status == SessionStatus.RINGING
        assert session.caller_number == "+1234567890"
        assert session.caller_language == "es"

    def test_initiate_call_with_defaults(self, client):
        """Test that initiate_call works with default values."""
        response = client.post(
            "/call/initiate",
            json={},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ringing"

        session = get_session(data["session_id"])
        assert session.caller_number == "Unknown"
        assert session.caller_language is None

    def test_initiate_call_response_structure(self, client):
        """Test that initiate_call returns correct response structure."""
        response = client.post(
            "/call/initiate",
            json={
                "caller_number": "+9876543210",
                "caller_language": "fr",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "status" in data
        assert data["status"] == "ringing"

        # Verify session_id has correct prefix
        assert data["session_id"].startswith("cs_")


class TestAcceptCall:
    """Tests for POST /call/{session_id}/accept endpoint."""

    def test_accept_ringing_call_changes_status_to_active(self, client):
        """Test that accepting a RINGING call changes status to ACTIVE."""
        # Create a ringing session
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+1111111111", "caller_language": "en"},
        )
        session_id = response.json()["session_id"]

        # Accept the call
        response = client.post(f"/call/{session_id}/accept")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"

        # Verify session status was changed
        session = get_session(session_id)
        assert session.status == SessionStatus.ACTIVE

    def test_accept_call_response_structure(self, client):
        """Test that accepting a call returns correct response structure."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+2222222222"},
        )
        session_id = response.json()["session_id"]

        response = client.post(f"/call/{session_id}/accept")
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["status"] == "active"

    def test_accept_non_existent_session_returns_404(self, client):
        """Test that accepting a non-existent session returns 404."""
        response = client.post("/call/cs_nonexistent/accept")
        assert response.status_code == 404
        data = response.json()
        assert "Session not found" in data["detail"]

    def test_accept_non_ringing_session_returns_400(self, client):
        """Test that accepting a non-RINGING session returns 400."""
        # Create a session with ACTIVE status
        from pipeline.call_session import create_session
        session = create_session(status=SessionStatus.ACTIVE)

        response = client.post(f"/call/{session.id}/accept")
        assert response.status_code == 400
        data = response.json()
        assert "not ringing" in data["detail"]

    def test_accept_ended_session_returns_400(self, client):
        """Test that accepting an ENDED session returns 400."""
        from pipeline.call_session import create_session
        session = create_session(status=SessionStatus.ENDED)

        response = client.post(f"/call/{session.id}/accept")
        assert response.status_code == 400
        data = response.json()
        assert "not ringing" in data["detail"]


class TestDeclineCall:
    """Tests for POST /call/{session_id}/decline endpoint."""

    def test_decline_ringing_call_changes_status_to_ended(self, client):
        """Test that declining a RINGING call changes status to ENDED."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+3333333333"},
        )
        session_id = response.json()["session_id"]

        response = client.post(f"/call/{session_id}/decline")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ended"

        session = get_session(session_id)
        assert session.status == SessionStatus.ENDED

    def test_decline_call_response_structure(self, client):
        """Test that declining a call returns correct response structure."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+4444444444"},
        )
        session_id = response.json()["session_id"]

        response = client.post(f"/call/{session_id}/decline")
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["status"] == "ended"

    def test_decline_non_existent_session_returns_404(self, client):
        """Test that declining a non-existent session returns 404."""
        response = client.post("/call/cs_nonexistent/decline")
        assert response.status_code == 404
        data = response.json()
        assert "Session not found" in data["detail"]

    def test_decline_non_ringing_session_returns_400(self, client):
        """Test that declining a non-RINGING session returns 400."""
        from pipeline.call_session import create_session
        session = create_session(status=SessionStatus.ACTIVE)

        response = client.post(f"/call/{session.id}/decline")
        assert response.status_code == 400
        data = response.json()
        assert "not ringing" in data["detail"]

    def test_decline_already_ended_session_returns_400(self, client):
        """Test that declining an already ENDED session returns 400."""
        from pipeline.call_session import create_session
        session = create_session(status=SessionStatus.ENDED)

        response = client.post(f"/call/{session.id}/decline")
        assert response.status_code == 400
        data = response.json()
        assert "not ringing" in data["detail"]


class TestEndCall:
    """Tests for POST /call/{session_id}/end endpoint."""

    def test_end_active_call_changes_status_to_ended(self, client):
        """Test that ending an ACTIVE call changes status to ENDED."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+5555555555"},
        )
        session_id = response.json()["session_id"]

        # First accept the call to make it ACTIVE
        client.post(f"/call/{session_id}/accept")

        # Now end the call
        response = client.post(f"/call/{session_id}/end")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ended"

        session = get_session(session_id)
        assert session.status == SessionStatus.ENDED

    def test_end_ringing_call_changes_status_to_ended(self, client):
        """Test that ending a RINGING call (before accept) also changes to ENDED."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+6666666666"},
        )
        session_id = response.json()["session_id"]

        # End the ringing call without accepting
        response = client.post(f"/call/{session_id}/end")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ended"

        session = get_session(session_id)
        assert session.status == SessionStatus.ENDED

    def test_end_call_response_structure(self, client):
        """Test that ending a call returns correct response structure."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+7777777777"},
        )
        session_id = response.json()["session_id"]

        response = client.post(f"/call/{session_id}/end")
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        assert data["status"] == "ended"

    def test_end_non_existent_session_returns_404(self, client):
        """Test that ending a non-existent session returns 404."""
        response = client.post("/call/cs_nonexistent/end")
        assert response.status_code == 404
        data = response.json()
        assert "Session not found" in data["detail"]

    def test_end_already_ended_session_returns_400(self, client):
        """Test that ending an already ENDED session returns 400."""
        from pipeline.call_session import create_session
        session = create_session(status=SessionStatus.ENDED)

        response = client.post(f"/call/{session.id}/end")
        assert response.status_code == 400
        data = response.json()
        assert "already ended" in data["detail"]

    def test_end_idle_session_changes_status_to_ended(self, client):
        """Test that ending an IDLE session also changes to ENDED."""
        from pipeline.call_session import create_session
        session = create_session(status=SessionStatus.IDLE)

        response = client.post(f"/call/{session.id}/end")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ended"


class TestSessionIntegration:
    """Integration tests for complete call lifecycle."""

    def test_complete_call_flow_accept(self, client):
        """Test complete flow: initiate -> accept -> end."""
        # Step 1: Initiate
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+1111111111", "caller_language": "es"},
        )
        assert response.status_code == 200
        session_id = response.json()["session_id"]
        session = get_session(session_id)
        assert session.status == SessionStatus.RINGING

        # Step 2: Accept
        response = client.post(f"/call/{session_id}/accept")
        assert response.status_code == 200
        session = get_session(session_id)
        assert session.status == SessionStatus.ACTIVE

        # Step 3: End
        response = client.post(f"/call/{session_id}/end")
        assert response.status_code == 200
        session = get_session(session_id)
        assert session.status == SessionStatus.ENDED

    def test_complete_call_flow_decline(self, client):
        """Test complete flow: initiate -> decline."""
        # Step 1: Initiate
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+2222222222", "caller_language": "fr"},
        )
        session_id = response.json()["session_id"]
        assert get_session(session_id).status == SessionStatus.RINGING

        # Step 2: Decline (instead of accept)
        response = client.post(f"/call/{session_id}/decline")
        assert response.status_code == 200
        assert get_session(session_id).status == SessionStatus.ENDED

    def test_multiple_concurrent_sessions(self, client):
        """Test that multiple sessions can exist independently."""
        # Create three sessions
        session_ids = []
        for i in range(3):
            response = client.post(
                "/call/initiate",
                json={"caller_number": f"+{i}000000000"},
            )
            session_ids.append(response.json()["session_id"])

        # Accept first and third
        client.post(f"/call/{session_ids[0]}/accept")
        client.post(f"/call/{session_ids[2]}/accept")

        # Decline second
        client.post(f"/call/{session_ids[1]}/decline")

        # Verify statuses
        assert get_session(session_ids[0]).status == SessionStatus.ACTIVE
        assert get_session(session_ids[1]).status == SessionStatus.ENDED
        assert get_session(session_ids[2]).status == SessionStatus.ACTIVE

        # End first
        client.post(f"/call/{session_ids[0]}/end")
        assert get_session(session_ids[0]).status == SessionStatus.ENDED

    def test_cannot_accept_after_decline(self, client):
        """Test that you cannot accept a call that was already declined."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+9999999999"},
        )
        session_id = response.json()["session_id"]

        # Decline the call
        response = client.post(f"/call/{session_id}/decline")
        assert response.status_code == 200

        # Try to accept declined call (should fail)
        response = client.post(f"/call/{session_id}/accept")
        assert response.status_code == 400
        assert "not ringing" in response.json()["detail"]

    def test_cannot_decline_after_accept(self, client):
        """Test that you cannot decline a call that was already accepted."""
        response = client.post(
            "/call/initiate",
            json={"caller_number": "+8888888888"},
        )
        session_id = response.json()["session_id"]

        # Accept the call
        response = client.post(f"/call/{session_id}/accept")
        assert response.status_code == 200

        # Try to decline accepted call (should fail)
        response = client.post(f"/call/{session_id}/decline")
        assert response.status_code == 400
        assert "not ringing" in response.json()["detail"]

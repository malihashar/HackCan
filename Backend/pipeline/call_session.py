"""
Call session management: create and manage active call sessions.
Owned by: Call Logic & Session Manager.
"""
import uuid
from typing import Optional
import sys
from pathlib import Path
_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
from shared.types import CallSession, TranscriptMessage, SessionStatus, MessageSender  # noqa: E402
from shared.constants import SESSION_ID_PREFIX  # noqa: E402

# In-memory store for hackathon; can be replaced with DB-backed store
_sessions: dict[str, CallSession] = {}


def create_session(
    receiver_language: str = "en",
    status: SessionStatus = SessionStatus.ACTIVE,
    caller_language: str | None = None,
    caller_number: str | None = None,
) -> CallSession:
    """Create a new call session and return it."""
    session_id = f"{SESSION_ID_PREFIX}{uuid.uuid4().hex[:12]}"
    session = CallSession(
        id=session_id,
        status=status,
        caller_language=caller_language,
        caller_number=caller_number,
        receiver_language=receiver_language,
        messages=[],
    )
    _sessions[session_id] = session
    return session


def get_session(session_id: str) -> Optional[CallSession]:
    """Return session by id or None."""
    return _sessions.get(session_id)


def get_session_state(session_id: str) -> Optional[dict]:
    """Return session state as dict for API/WebSocket."""
    s = get_session(session_id)
    if not s:
        return None
    return {
        "id": s.id,
        "status": s.status.value,
        "caller_language": s.caller_language,
        "receiver_language": s.receiver_language,
        "messages": [
            {
                "id": m.id,
                "sender": m.sender.value,
                "original_text": m.original_text,
                "translated_text": m.translated_text,
                "language_code": m.language_code,
                "timestamp": m.timestamp,
            }
            for m in s.messages
        ],
        "created_at": s.created_at,
        "ended_at": s.ended_at,
    }


def end_session(session_id: str) -> bool:
    """Mark session as ended. Returns True if session existed."""
    s = get_session(session_id)
    if not s:
        return False
    s.status = SessionStatus.ENDED
    return True

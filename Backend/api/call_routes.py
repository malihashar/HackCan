"""
Call lifecycle endpoints: initiate, accept, decline, end.
Broadcasts WS events for real-time frontend updates.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import sys
from pathlib import Path
_BACKEND = Path(__file__).resolve().parent.parent
_ROOT = _BACKEND.parent
for _p in (str(_ROOT), str(_BACKEND)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from pipeline.call_session import create_session, get_session  # noqa: E402
from shared.types import SessionStatus  # noqa: E402
from shared.constants import (  # noqa: E402
    WS_MSG_INCOMING_CALL,
    WS_MSG_CALL_ACCEPTED,
    WS_MSG_CALL_DECLINED,
    WS_MSG_CALL_ENDED,
)
from api.websocket import broadcast_all, broadcast_to_session  # noqa: E402

call_router = APIRouter(prefix="/call", tags=["call"])


class InitiateCallBody(BaseModel):
    caller_number: str = "Unknown"
    caller_language: Optional[str] = None


@call_router.post("/initiate")
async def initiate_call(body: InitiateCallBody):
    """Create a RINGING session and broadcast incoming_call to all WS clients."""
    session = create_session(
        status=SessionStatus.RINGING,
        caller_language=body.caller_language,
        caller_number=body.caller_number,
    )
    # Auto-subscribe all clients to this session so accept/decline/end events reach them
    await broadcast_all(
        {
            "type": WS_MSG_INCOMING_CALL,
            "session_id": session.id,
            "caller_number": body.caller_number,
            "caller_language": body.caller_language,
        },
        auto_subscribe_session=session.id,
    )
    return {"session_id": session.id, "status": session.status.value}


@call_router.post("/{session_id}/accept")
async def accept_call(session_id: str):
    """Accept a ringing call: set status to ACTIVE, broadcast call_accepted."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != SessionStatus.RINGING:
        raise HTTPException(status_code=400, detail="Session is not ringing")
    session.status = SessionStatus.ACTIVE
    await broadcast_to_session(session_id, {
        "type": WS_MSG_CALL_ACCEPTED,
        "session_id": session_id,
    })
    return {"session_id": session_id, "status": session.status.value}


@call_router.post("/{session_id}/decline")
async def decline_call(session_id: str):
    """Decline a ringing call: set status to ENDED, broadcast call_declined."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != SessionStatus.RINGING:
        raise HTTPException(status_code=400, detail="Session is not ringing")
    session.status = SessionStatus.ENDED
    await broadcast_to_session(session_id, {
        "type": WS_MSG_CALL_DECLINED,
        "session_id": session_id,
    })
    return {"session_id": session_id, "status": session.status.value}


@call_router.post("/{session_id}/end")
async def end_call(session_id: str):
    """End an active call: set status to ENDED, broadcast call_ended."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status == SessionStatus.ENDED:
        raise HTTPException(status_code=400, detail="Session already ended")
    session.status = SessionStatus.ENDED
    await broadcast_to_session(session_id, {
        "type": WS_MSG_CALL_ENDED,
        "session_id": session_id,
    })
    # Reset agent invite flag so next call can invite the AI agent again
    import main as _main_mod
    _main_mod._agent_invited = False
    return {"session_id": session_id, "status": session.status.value}

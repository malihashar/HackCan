"""
WebSocket handler for real-time transcript updates.
Owned by: Backend API Lead.
"""
import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket

import sys
from pathlib import Path
_BACKEND = Path(__file__).resolve().parent.parent
_ROOT = _BACKEND.parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from pipeline.message_router import register_transcript_listener, unregister_transcript_listener  # noqa: E402
from shared.constants import WS_MSG_TRANSCRIPT_UPDATE, WS_MSG_SESSION_STATUS, WS_MSG_ERROR  # noqa: E402

# All connected WebSocket clients (for global broadcasts like incoming_call)
_connections: Set[WebSocket] = set()

# Session id -> set of WebSocket connections subscribed to that session
_subscriptions: Dict[str, Set[WebSocket]] = {}


def _broadcast(session_id: str, payload: dict) -> None:
    """Send payload to all clients subscribed to session_id (called from sync context)."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(broadcast_to_session(session_id, payload))
        else:
            loop.run_until_complete(broadcast_to_session(session_id, payload))
    except RuntimeError:
        pass


async def broadcast_all(payload: dict, auto_subscribe_session: str | None = None) -> None:
    """Send payload to every connected WebSocket client.
    If auto_subscribe_session is set, subscribe all clients to that session
    so they receive subsequent session-scoped broadcasts (accept/decline/end).
    """
    for ws in _connections.copy():
        try:
            await ws.send_json(payload)
            if auto_subscribe_session:
                _subscriptions.setdefault(auto_subscribe_session, set()).add(ws)
        except Exception:
            pass


async def broadcast_to_session(session_id: str, payload: dict) -> None:
    """Send payload to all clients subscribed to a specific session."""
    for ws in _subscriptions.get(session_id, set()).copy():
        try:
            await ws.send_json(payload)
        except Exception:
            pass


def _on_transcript(session_id: str, message_payload: dict) -> None:
    _broadcast(session_id, {"type": WS_MSG_TRANSCRIPT_UPDATE, "session_id": session_id, "message": message_payload})


# Register with message_router so new messages trigger WebSocket broadcast
register_transcript_listener(_on_transcript)


async def websocket_endpoint(websocket: WebSocket) -> None:
    """Handle WebSocket connection. Client sends { 'action': 'subscribe', 'session_id': '...' }."""
    await websocket.accept()
    _connections.add(websocket)
    current_session: str | None = None

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_json({"type": WS_MSG_ERROR, "error": "Invalid JSON"})
                continue
            action = msg.get("action")
            session_id = msg.get("session_id")
            if action == "subscribe" and session_id:
                if current_session:
                    _subscriptions.get(current_session, set()).discard(websocket)
                _subscriptions.setdefault(session_id, set()).add(websocket)
                current_session = session_id
                await websocket.send_json({"type": WS_MSG_SESSION_STATUS, "status": "subscribed", "session_id": session_id})
            elif action == "unsubscribe" and current_session:
                _subscriptions.get(current_session, set()).discard(websocket)
                current_session = None
    except Exception:
        pass
    finally:
        _connections.discard(websocket)
        if current_session:
            _subscriptions.get(current_session, set()).discard(websocket)

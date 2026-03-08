"""
FastAPI application: REST API + WebSocket for Multilingual Call Relay.
Owned by: Backend API Lead.
Run from repo root: python -m Backend.main  or from Backend: python main.py (with PYTHONPATH=..)
"""
import os
import sys
from pathlib import Path

# Ensure Backend and repo root are on path
_BACKEND = Path(__file__).resolve().parent
_ROOT = _BACKEND.parent
for p in (str(_BACKEND), str(_ROOT)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(_BACKEND / ".env")
    load_dotenv(_ROOT / ".env")
except ImportError:
    pass

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from api.routes import router as api_router
from api.websocket import websocket_endpoint, broadcast_all
from twilio.twiml.voice_response import VoiceResponse, Dial
from api.call_routes import call_router

app = FastAPI(
    title="Multilingual Call Relay API",
    description="AI-assisted translation and human relay for non-English callers.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, tags=["api"])
app.include_router(call_router)
app.websocket("/ws")(websocket_endpoint)


@app.get("/health")
def health():
    return {"status": "ok"}
class TranslationPayload(BaseModel):
    original_text: str
    translated_text: str
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    response = await call_next(request)
    # This header bypasses the ngrok warning screen
    response.headers["ngrok-skip-browser-warning"] = "true"
    return response
from twilio.twiml.voice_response import VoiceResponse, Dial
from twilio.rest import Client
import os

_TWILIO_SID = os.getenv("TWILIO_SID")
_TWILIO_AUTH = os.getenv("TWILIO_AUTH")
TWILIO_API_KEY = os.getenv("TWILIO_API_KEY")
TWILIO_API_SECRET = os.getenv("TWILIO_API_SECRET")
TWIML_APP_SID = os.getenv("TWILIO_TWIML_APP_SID")
NGROK_BASE_URL = os.getenv("NGROK_BASE_URL", "")

if _TWILIO_SID and _TWILIO_AUTH:
    client = Client(_TWILIO_SID, _TWILIO_AUTH)
else:
    client = None
    print("WARNING: TWILIO_SID or TWILIO_AUTH not found. Twilio Call placement will fail.")

# YOUR PHONE NUMBERS
TORONTO_BIZ_NUMBER = "+14314469290"  # The one clients call
AI_AGENT_ID_NUMBER = "+12494446915"  # The non-Toronto one you bought for the agent
ELEVENLABS_PHONE_GATEWAY = "+12494446915" # The number ElevenLabs gave your agent

from pipeline.call_session import create_session
from shared.types import SessionStatus
from shared.constants import WS_MSG_INCOMING_CALL

# Track whether AI agent has already been invited to the conference
_agent_invited = False


@app.get("/token")
async def get_twilio_token(identity: str = "agent_browser"):
    """Generate a Twilio Access Token for the browser Voice SDK."""
    if not all([TWILIO_API_KEY, TWILIO_API_SECRET, TWIML_APP_SID, _TWILIO_SID]):
        raise HTTPException(status_code=500, detail="Twilio API Key/Secret/TwiML App SID not configured")
    token = AccessToken(
        _TWILIO_SID, TWILIO_API_KEY, TWILIO_API_SECRET, identity=identity
    )
    voice_grant = VoiceGrant(
        outgoing_application_sid=TWIML_APP_SID,
        incoming_allow=True,
    )
    token.add_grant(voice_grant)
    return {"token": token.to_jwt()}


@app.get("/voice")
async def handle_incoming_call(request: Request):
    caller_number = request.query_params.get("From", "Unknown")

    # Create RINGING session and broadcast to frontend
    session = create_session(
        status=SessionStatus.RINGING,
        caller_number=caller_number,
    )
    await broadcast_all(
        {
            "type": WS_MSG_INCOMING_CALL,
            "session_id": session.id,
            "caller_number": caller_number,
        },
        auto_subscribe_session=session.id,
    )

    # Put the human caller into the conference
    response = VoiceResponse()
    dial = Dial()
    dial.conference('LinguisticLifeLine', start_conference_on_enter=True)
    response.append(dial)

    # Trigger AI agent to join conference (only once per server lifetime)
    global _agent_invited
    if client and NGROK_BASE_URL and not _agent_invited:
        _agent_invited = True
        client.calls.create(
            from_=TORONTO_BIZ_NUMBER,
            to=AI_AGENT_ID_NUMBER,
            url=f"{NGROK_BASE_URL}/agent-join",
        )

    return Response(content=str(response), media_type="application/xml")

@app.post("/agent-join")
async def agent_join_logic():
    response = VoiceResponse()
    dial = Dial()
    # Must match the name used in /voice exactly!
    dial.conference('LinguisticLifeLine', start_conference_on_enter=True)
    response.append(dial)
    return Response(content=str(response), media_type="application/xml")
@app.post("/broadcast")
async def handle_webhook(data: TranslationPayload):
    try:
        print(f"--- New Translation Received ---")
        print(f"Caller said: {data.original_text}")
        print(f"AI Translated: {data.translated_text}")

        # Broadcast translation to all connected WS clients
        await broadcast_all({
            "type": "translation_update",
            "original_text": data.original_text,
            "translated_text": data.translated_text,
        })

        return {"status": "success"}

    except Exception as e:
        print(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

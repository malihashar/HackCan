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

from api.routes import router as api_router
from api.websocket import websocket_endpoint
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

if _TWILIO_SID and _TWILIO_AUTH:
    client = Client(_TWILIO_SID, _TWILIO_AUTH)
else:
    client = None
    print("WARNING: TWILIO_SID or TWILIO_AUTH not found. Twilio Call placement will fail.")

# YOUR PHONE NUMBERS
TORONTO_BIZ_NUMBER = "+14375253147"  # The one clients call
AI_AGENT_ID_NUMBER = "+18677960919"  # The non-Toronto one you bought for the agent
ELEVENLABS_PHONE_GATEWAY = "+18677960919" # The number ElevenLabs gave your ag  ent

@app.get("/voice")
async def handle_incoming_call(request: Request):
    # 1. Put the human caller into the conference IMMEDIATELY
    response = VoiceResponse()
    dial = Dial()
    # Use a unique but consistent name
    dial.conference('LinguisticLifeLine', start_conference_on_enter=True)
    response.append(dial)

    # 2. TRIGGER THE AGENT: Tell Twilio to call the AI Agent
    # We use your SECOND Twilio number as the 'From' so we know it's the AI
    client.calls.create(
        from_=TORONTO_BIZ_NUMBER, 
        to=AI_AGENT_ID_NUMBER,
        # IMPORTANT: This URL must be your PUBLIC ngrok URL
        url="https://unchopped-kristian-unflattened.ngrok-free.dev/agent-join" 
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
        # 1. Print to console for immediate debugging
        print(f"--- New Translation Received ---")
        print(f"Caller said: {data.original_text}")
        print(f"AI Translated: {data.translated_text}")

        # 2. Logic to send to React (e.g., via WebSockets or a simple global state)
        # broadcast_to_frontend(data.translated_text)

        return {"status": "success" }
    
    except Exception as e:
        print(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

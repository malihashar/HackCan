"""
FastAPI application: REST API + WebSocket for Multilingual Call Relay.
Architecture: Ghost Operator (Operator is muted to Caller, but audible to AI via Coaching).
"""
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from twilio.twiml.voice_response import VoiceResponse, Dial
from twilio.rest import Client
from dotenv import load_dotenv

# --- SETUP & ENVIRONMENT ---
app = FastAPI(title="Linguistic Life-Line API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bypass ngrok warning screens
@app.middleware("http")
async def add_ngrok_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["ngrok-skip-browser-warning"] = "true"
    return response

# --- CONFIGURATION ---
load_dotenv() 
load_dotenv(Path(__file__).resolve().parent / ".env")
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH")
# The public URL provided by your ngrok instance
BASE_URL = "https://unchopped-kristian-unflattened.ngrok-free.dev"

# Phone Numbers
TORONTO_BIZ_NUMBER = "+14375253147"   # Incoming line for foreign callers
AI_AGENT_ID_NUMBER = "+18677960919"   # The number ElevenLabs uses/dials from
OPERATOR_CLIENT_ID = "support_agent_1" # The Device ID in the React frontend

if TWILIO_SID and TWILIO_AUTH:
    client = Client(TWILIO_SID, TWILIO_AUTH)
else:
    client = None
    print("WARNING: Twilio credentials missing.")

# --- IN-MEMORY STATE ---

class TranslationPayload(BaseModel):
    original_text: str
    translated_text: str
class HandoffPayload(BaseModel):
    foreign: bool
    language: str

class BroadcastPayload(BaseModel):
    original_text: str
    translated_text: str

class DisconnectPayload(BaseModel):
    reason: Optional[str] = None

class LanguageDetectionPayload(BaseModel):
    foreign: bool
    language: Optional[str] = None

# --- CORE VOICE LOGIC ---

CONFERENCE_NAME = "LinguisticLifeLine"
_ai_agent_dialed = False  # Only dial AI agent once per conference

# --- 1. INBOUND CALL → ALL PARTIES JOIN CONFERENCE ---
@app.api_route("/voice", methods=["GET", "POST"])
async def handle_voice_routing(request: Request):
    """
    Foreign caller dials in → put them in the conference immediately.
    Then dial the AI agent and operator into the same conference.
    All 3 hear each other. AI translates between the two humans.
    """
    params = await request.form()
    from_number = params.get("From", "")
    print(f"--- INCOMING CALL from {from_number} ---")

    response = VoiceResponse()

    # Put the caller into the conference
    dial = Dial()
    dial.conference(CONFERENCE_NAME, start_conference_on_enter=True, beep=False)
    response.append(dial)

    # Only dial the AI agent once for the first caller — subsequent callers just join
    global _ai_agent_dialed
    if client and not _ai_agent_dialed and from_number != AI_AGENT_ID_NUMBER:
        _ai_agent_dialed = True
        print("--- DIALING AI AGENT into conference (first caller) ---")
        client.calls.create(
            from_=TORONTO_BIZ_NUMBER,
            to=AI_AGENT_ID_NUMBER,
            url=f"{BASE_URL}/ai-join"
        )
    else:
        print(f"--- {from_number} joined existing conference ---")

    return Response(content=str(response), media_type="application/xml")

@app.api_route("/ai-join", methods=["GET", "POST"])
async def ai_join():
    """TwiML for the AI agent to join the conference."""
    print("--- AI AGENT JOINING CONFERENCE ---")
    response = VoiceResponse()
    dial = Dial()
    dial.conference(CONFERENCE_NAME, start_conference_on_enter=True, beep=False)
    response.append(dial)
    return Response(content=str(response), media_type="application/xml")

@app.api_route("/operator-join", methods=["GET", "POST"])
async def operator_join():
    """TwiML for the operator to join the conference."""
    print("--- OPERATOR JOINING CONFERENCE ---")
    response = VoiceResponse()
    dial = Dial()
    dial.conference(CONFERENCE_NAME, start_conference_on_enter=True, beep=False)
    response.append(dial)
    return Response(content=str(response), media_type="application/xml")
# --- WEBHOOKS & DATA ---

@app.post("/language-detected")
async def handle_language_detection(data: LanguageDetectionPayload):
    """Called by AI agent when it detects whether the caller speaks a foreign language."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n[{timestamp}] --- LANGUAGE DETECTION ---")
    print(f"Foreign language detected: {data.foreign}")
    if data.foreign and data.language:
        print(f"Language: {data.language}")
    else:
        print("Language: English (no translation needed)")
    print("-" * 35)
    return {"status": "received"}

@app.post("/broadcast")
async def handle_elevenlabs_webhook(data: TranslationPayload):
    """
    Receives live text from ElevenLabs and prints it to terminal (Terminal Dashboard).
    """
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n[{timestamp}] --- LIVE TRANSCRIPT ---")
    print(f"CALLER (Foreign): {data.original_text}")
    print(f"OPERATOR (English): {data.translated_text}")
    print("-" * 35)
    
    # NEXT STEP: Add WebSocket broadcast here to update React
    return {"status": "dispatched"}
@app.post("/disconnect")
async def handle_disconnect():
    print("--- SESSION TERMINATED: Cleaning up resources ---")

    # Hang up active Twilio conference if it exists
    if client:
        try:
            conferences = client.conferences.list(
                friendly_name=CONFERENCE_NAME,
                status="in-progress"
            )
            for conf in conferences:
                conf.update(status="completed")
            print("Successfully closed the active Twilio conference.")
        except Exception as e:
            print(f"Failed to close conference: {e}")
            
    global _ai_agent_dialed
    _ai_agent_dialed = False
    print("Cleanup complete.")
    
    return {"status": "cleared"}
@app.get("/health")
def health():
    return {"status": "online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

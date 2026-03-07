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

# --- IN-MEMORY SESSION STORE ---
# In a 9.0 GPA project, you'd use Redis or Supabase. 
# For now, we store the Operator's SID so the AI knows who to 'Coach'.
active_sessions = {
    "operator_call_sid": None,
    "conference_name": "LinguisticLifeLine"
}

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
    reason: str

# --- CORE VOICE LOGIC ---

# --- IN-MEMORY SESSION STORE ---
# We need to track the Caller's CallSid to move them later
active_sessions = {
    "caller_call_sid": None,
    "conference_name": "Emergency_Relay_Room"
}

# --- 1. INITIAL INBOUND ROUTER ---
@app.api_route("/voice", methods=["GET", "POST"])
async def handle_voice_routing(request: Request):
    params = await request.form()
    from_number = params.get("From", "")
    call_sid = params.get("CallSid")

    response = VoiceResponse()

    # IF THIS IS THE FOREIGN CALLER (First time dialing in)
    if from_number != AI_AGENT_ID_NUMBER:
        print(f"--- INTAKE STARTED: Caller {from_number} ---")
        active_sessions["caller_call_sid"] = call_sid
        
        # Connect them DIRECTLY to the AI Agent for the intake interview
        dial = Dial(direct_connect=True)
        dial.number(AI_AGENT_ID_NUMBER)
        response.append(dial)
        return Response(content=str(response), media_type="application/xml")

    # If the AI Agent ever dials back in directly for some reason
    print("--- AI AGENT RE-JOINED ---")
    dial = Dial()
    dial.conference(active_sessions["conference_name"], beep=False)
    response.append(dial)
    return Response(content=str(response), media_type="application/xml")

@app.api_route("/operator-join", methods=["GET", "POST"])
async def operator_join():
    """
    Dedicated endpoint for the Operator to join the conference.
    """
    print("--- OPERATOR JOINING CONFERENCE ---")
    response = VoiceResponse()
    dial = Dial()
    # The operator joins unmuted so they can speak to the caller
    dial.conference(active_sessions["conference_name"], muted=False, beep=True)
    response.append(dial)
    return Response(content=str(response), media_type="application/xml")

# --- 2. THE HANDOFF WEBHOOK (Triggered by ElevenLabs Tool) ---
@app.post("/handoff")
async def handle_ai_handoff(request: Request):
    """
    Called by ElevenLabs Tool: 'connect_to_operator'
    """
    print("--- AI TOOL TRIGGERED: Initiating Handoff ---")
    
    if client and active_sessions["caller_call_sid"]:
        # A. Move the Foreign Caller from the 1-on-1 call into the Conference
        # We redirect their existing CallSid to a new TwiML instruction
        client.calls(active_sessions["caller_call_sid"]).update(
            twiml=f'<Response><Dial><Conference>{active_sessions["conference_name"]}</Conference></Dial></Response>'
        )

        # B. Summon the Operator (Web Client)
        # Twilio rings the React frontend. When the operator accepts, 
        # Twilio requests f"{BASE_URL}/operator-join" to get instructions.
        client.calls.create(
            from_=TORONTO_BIZ_NUMBER,
            to=f"client:{OPERATOR_CLIENT_ID}", 
            url=f"{BASE_URL}/operator-join"
        )

    return {"status": "bridging_complete"}
# --- WEBHOOKS & DATA ---

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
                friendly_name=active_sessions["conference_name"],
                status="in-progress"
            )
            for conf in conferences:
                conf.update(status="completed")
            print("Successfully closed the active Twilio conference.")
        except Exception as e:
            print(f"Failed to close conference: {e}")
            
    active_sessions["caller_call_sid"] = None
    
    return {"status": "cleared"}
@app.get("/health")
def health():
    return {"status": "online", "operator_active": active_sessions["operator_call_sid"] is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
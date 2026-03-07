"""
Shared types for the Multilingual Call Relay System.
Single source of truth — all teams import from here.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class SessionStatus(str, Enum):
    IDLE = "idle"
    RINGING = "ringing"
    ACTIVE = "active"
    ENDED = "ended"


class MessageSender(str, Enum):
    CALLER = "caller"
    AGENT = "agent"
    RECEIVER = "receiver"


@dataclass
class TranscriptMessage:
    """A single message in the conversation transcript."""
    id: str
    session_id: str
    sender: MessageSender
    original_text: str
    translated_text: Optional[str] = None
    language_code: Optional[str] = None
    timestamp: Optional[str] = None


@dataclass
class CallSession:
    """Active or stored call session."""
    id: str
    status: SessionStatus
    caller_language: Optional[str] = None
    caller_number: Optional[str] = None
    receiver_language: str = "en"
    messages: list[TranscriptMessage] = field(default_factory=list)
    created_at: Optional[str] = None
    ended_at: Optional[str] = None


# --- API request/response types ---

@dataclass
class ProcessAudioRequest:
    """Payload for POST /process-audio."""
    session_id: str
    # Audio as base64 or stream reference; backend defines exact format
    audio_data: Optional[bytes] = None
    audio_base64: Optional[str] = None


@dataclass
class ProcessAudioResponse:
    """Response from speech-to-text + translation pipeline."""
    session_id: str
    original_text: str
    translated_text: str
    detected_language: str
    message_id: Optional[str] = None


@dataclass
class TranslateResponseRequest:
    """Payload for POST /translate-response (receiver reply → caller language)."""
    session_id: str
    english_text: str


@dataclass
class TranslateResponsePayload:
    """Response from translate-response (for TTS)."""
    session_id: str
    translated_text: str
    target_language: str
    # Optional: backend may return audio_bytes for TTS
    audio_base64: Optional[str] = None


@dataclass
class SessionResponse:
    """GET /session/{id} response."""
    id: str
    status: SessionStatus
    caller_language: Optional[str]
    messages: list[dict]
    created_at: Optional[str] = None

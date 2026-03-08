"""
Shared constants for the Multilingual Call Relay System.
"""
# Default languages
DEFAULT_RECEIVER_LANGUAGE = "en"
SUPPORTED_CALLER_LANGUAGES = ["es", "fr", "zh", "ar", "hi", "pt", "de", "ja", "ko"]

# Session
SESSION_ID_PREFIX = "cs_"

# WebSocket message types
WS_MSG_TRANSCRIPT_UPDATE = "transcript_update"
WS_MSG_SESSION_STATUS = "session_status"
WS_MSG_ERROR = "error"
WS_MSG_INCOMING_CALL = "incoming_call"
WS_MSG_CALL_ACCEPTED = "call_accepted"
WS_MSG_CALL_DECLINED = "call_declined"
WS_MSG_CALL_ENDED = "call_ended"
WS_MSG_TRANSLATION_UPDATE = "translation_update"

# API paths (for reference; actual routes in backend)
API_PROCESS_AUDIO = "/process-audio"
API_TRANSLATE_RESPONSE = "/translate-response"
API_SESSION = "/session"

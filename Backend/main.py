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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router
from api.websocket import websocket_endpoint
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

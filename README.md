# Multilingual Call Relay System

Communication platform that helps non-English speakers communicate with English-speaking recipients through **AI-assisted translation** and a **human relay agent**.

- **Caller** speaks in their language → Speech-to-text → **Translated to English** → Agent reads to receiver.
- **Receiver** replies in English → **Translated to caller language** → Text-to-speech → Caller hears response.

No login; single demo path focused on core relay functionality.

## Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Backend:** Python, FastAPI, WebSocket
- **Database:** Supabase (call sessions, messages)

## Repo structure

```
HackCan/
  README.md
  frontend/          # Next.js app (agent dashboard, transcript UI)
  Backend/           # FastAPI (speech, translation, sessions, WebSocket)
  shared/            # Shared types and constants
```

## Quick start

### 1. Backend

```bash
cd Backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

Create `Backend/.env` (or project root `.env`):

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

Run the API (from repo root):

```bash
cd Backend && python main.py
```

Or: `uvicorn Backend.main:app --reload --app-dir .` from repo root (adjust so `Backend` is on PYTHONPATH). Easiest: from `Backend` folder run `python main.py`. Server runs at **http://localhost:8000**.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**. Optional env (create `frontend/.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### 3. Demo path

1. Click **Start call session** on the dashboard.
2. Agent dashboard shows session ID and transcript area.
3. Caller speech (POST `/process-audio` with base64 audio) → STT → translate to English → transcript updated (and over WebSocket).
4. Agent reads the English text to the receiver.
5. Agent types receiver’s English reply in **Receiver reply** and clicks **Send translated to caller** (POST `/translate-response`).
6. Backend translates to caller language and can return TTS audio for the caller.

## API (minimal)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/session` | Create session. Body: `{ "receiver_language": "en" }` |
| GET | `/session/{id}` | Get session state and messages |
| POST | `/process-audio` | Body: `{ "session_id", "audio_base64" }` → transcript + English |
| POST | `/translate-response` | Body: `{ "session_id", "english_text" }` → translated text (+ optional TTS) |
| WebSocket | `/ws` | Send `{ "action": "subscribe", "session_id": "..." }` for live transcript updates |

## Supabase (optional)

For persistence, create tables (e.g. in SQL editor):

- **call_sessions:** `id`, `status`, `caller_language`, `receiver_language`, `created_at`, `ended_at`
- **messages:** `id`, `session_id`, `sender`, `original_text`, `translated_text`, `language_code`, `created_at`

Backend currently keeps sessions in memory; wire `backend/db/supabase_client` into pipeline if you want DB persistence.

## Integration rules (from PRD)

- **Shared contract:** All shared types live in `shared/types.py`; everyone imports from there.
- **Service interfaces:** Voice services expose `transcribe_audio`, `detect_language`, `translate_text`, `generate_speech`; routes rely on these.
- **No cross-folder edits:** Frontend does not modify backend services; backend does not modify UI components.

## License

MIT (or your choice).

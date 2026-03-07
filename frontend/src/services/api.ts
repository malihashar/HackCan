/**
 * REST API client for the backend. Frontend never performs translation.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type SessionStatus = "waiting" | "active" | "ended";

export type SessionState = {
  id: string;
  status: SessionStatus;
  caller_language: string | null;
  receiver_language: string;
  messages: Array<{
    id: string;
    sender: "caller" | "agent" | "receiver";
    original_text: string;
    translated_text: string | null;
    language_code: string | null;
    timestamp?: string | null;
  }>;
  created_at?: string | null;
  ended_at?: string | null;
};

export async function createSession(receiverLanguage: string = "en"): Promise<SessionState> {
  const res = await fetch(`${API_BASE}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiver_language: receiverLanguage }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getSession(sessionId: string): Promise<SessionState> {
  const res = await fetch(`${API_BASE}/session/${sessionId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function processAudio(sessionId: string, audioBase64: string): Promise<{
  session_id: string;
  original_text: string;
  translated_text: string;
  detected_language: string;
  message_id?: string;
}> {
  const res = await fetch(`${API_BASE}/process-audio`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, audio_base64: audioBase64 }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function translateResponse(sessionId: string, englishText: string): Promise<{
  session_id: string;
  translated_text: string;
  target_language: string;
  audio_base64?: string | null;
}> {
  const res = await fetch(`${API_BASE}/translate-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, english_text: englishText }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

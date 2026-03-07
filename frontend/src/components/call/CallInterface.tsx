"use client";

import { useEffect, useRef, useState } from "react";
import { callStore } from "@/state/callStore";
import { selectCurrentTranscript, selectCallerLanguage } from "@/state/selectors";
import { TranscriptPanel } from "./TranscriptPanel";
import { LanguageIndicator } from "./LanguageIndicator";
import { AgentControls } from "./AgentControls";
import { createSessionWebSocket } from "@/services/websocket";
import type { WsMessage } from "@/services/websocket";

export function CallInterface() {
  const { getState, setSession, appendMessage, setCallerLanguage, setWsConnected } = callStore;
  const [state, setState] = useState(getState());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const unsub = callStore.subscribe(() => setState(getState()));
    return () => { unsub(); };
  }, []);

  const view = state.view;
  const session = state.session;
  const sessionId = view.view === "active" ? view.sessionId : null;

  // Subscribe to WebSocket for this session
  useEffect(() => {
    if (!sessionId) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
      return;
    }
    const ws = createSessionWebSocket(
      sessionId,
      (msg: WsMessage) => {
        if (msg.type === "transcript_update" && msg.message) {
          appendMessage({
            id: msg.message.id,
            sender: msg.message.sender as "caller" | "agent" | "receiver",
            original_text: msg.message.original_text,
            translated_text: msg.message.translated_text,
            language_code: msg.message.language_code,
          });
        }
      },
      () => setWsConnected(true),
      () => {
        setWsConnected(false);
        wsRef.current = null;
      }
    );
    wsRef.current = ws;
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId, appendMessage, setWsConnected]);

  const messages = selectCurrentTranscript(session?.messages);
  const callerLanguage = selectCallerLanguage(session);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-primary)",
      }}
    >
      {session && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid var(--bg-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Session: <code style={{ color: "var(--accent)" }}>{session.id}</code>
          </span>
          <LanguageIndicator callerLanguage={callerLanguage} receiverLanguage={session.receiver_language} />
        </div>
      )}
      <TranscriptPanel messages={messages} />
      {sessionId && (
        <AgentControls
          sessionId={sessionId}
          disabled={session?.status !== "active"}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useCallback, useRef } from "react";
import {
  initiateCall as apiInitiateCall,
  acceptCall as apiAcceptCall,
  declineCall as apiDeclineCall,
  endCall as apiEndCall,
} from "@/services/api";
import {
  WS_MSG_INCOMING_CALL,
  WS_MSG_CALL_ACCEPTED,
  WS_MSG_CALL_DECLINED,
  WS_MSG_CALL_ENDED,
  WS_MSG_TRANSCRIPT_UPDATE,
  WS_MSG_TRANSLATION_UPDATE,
} from "@/services/ws-message-types";
import { useCallStore } from "@/stores/call-store";
import type { TranscriptMessage } from "@/stores/call-store";

type WsMessage = {
  type: string;
  session_id?: string;
  caller_number?: string;
  caller_language?: string;
  message?: TranscriptMessage;
  original_text?: string;
  translated_text?: string;
};

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";
const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

/**
 * Manages the WebSocket connection and syncs events to the global call store.
 * Multiple components can call this hook — the store state is shared across pages.
 */
export function useCallWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  const {
    callState, sessionId, callerNumber, callerLanguage, messages, translations, isConnected,
    setCallState, setSessionId, setCallerNumber, setCallerLanguage,
    addMessage, addTranslation, setIsConnected, resetCall,
  } = useCallStore();

  // Keep sessionId in ref so WS handlers always have latest value
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const handleWsMessage = useCallback((event: MessageEvent) => {
    let msg: WsMessage;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case WS_MSG_INCOMING_CALL:
        setCallState("ringing");
        setSessionId(msg.session_id ?? null);
        setCallerNumber(msg.caller_number ?? null);
        setCallerLanguage(msg.caller_language ?? null);
        break;

      case WS_MSG_CALL_ACCEPTED:
        setCallState("connecting");
        setTimeout(() => {
          if (mountedRef.current) setCallState("connected");
        }, 1500);
        break;

      case WS_MSG_CALL_DECLINED:
        resetCall();
        break;

      case WS_MSG_CALL_ENDED:
        setCallState("ended");
        setTimeout(() => {
          if (mountedRef.current) resetCall();
        }, 2000);
        break;

      case WS_MSG_TRANSCRIPT_UPDATE:
        if (msg.message) {
          addMessage(msg.message);
        }
        break;

      case WS_MSG_TRANSLATION_UPDATE:
        if (msg.original_text && msg.translated_text) {
          addTranslation({
            original_text: msg.original_text,
            translated_text: msg.translated_text,
            timestamp: new Date().toISOString(),
          });
        }
        break;
    }
  }, [setCallState, setSessionId, setCallerNumber, setCallerLanguage, addMessage, addTranslation, resetCall]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    // Don't open a second connection if one is already open
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        retryCountRef.current = 0;
        setIsConnected(true);
      };

      ws.onmessage = handleWsMessage;

      ws.onclose = () => {
        setIsConnected(false);
        if (mountedRef.current && retryCountRef.current < MAX_RETRIES) {
          const delay = BACKOFF_MS[retryCountRef.current] ?? 4000;
          retryCountRef.current += 1;
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        // onclose will fire after onerror, triggering reconnect
      };
    } catch {
      // connection failed, onclose handles retry
    }
  }, [handleWsMessage, setIsConnected]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
    };
  }, [connect]);

  // Subscribe to session transcript via WS
  const subscribeToSession = useCallback((sid: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "subscribe", session_id: sid }));
    }
  }, []);

  const simulateIncomingCall = useCallback(async (number?: string, language?: string) => {
    // Update local state immediately so UI responds even without backend
    setCallState("ringing");
    setCallerNumber(number ?? "Unknown");
    setCallerLanguage(language ?? null);
    try {
      const result = await apiInitiateCall(number ?? "Unknown", language);
      setSessionId(result.session_id ?? null);
    } catch (err) {
      console.error("Failed to initiate call:", err);
      // Generate a local session ID so accept/end still work offline
      setSessionId(`local-${Date.now()}`);
    }
  }, [setCallState, setCallerNumber, setCallerLanguage, setSessionId]);

  const acceptCall = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    // Update local state immediately so UI responds
    setCallState("connecting");
    setTimeout(() => {
      if (mountedRef.current) setCallState("connected");
    }, 1500);
    try {
      await apiAcceptCall(sid);
      subscribeToSession(sid);
    } catch (err) {
      console.error("Failed to accept call:", err);
    }
  }, [setCallState, subscribeToSession]);

  const declineCall = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    // Reset local state immediately
    resetCall();
    try {
      await apiDeclineCall(sid);
    } catch (err) {
      console.error("Failed to decline call:", err);
    }
  }, [resetCall]);

  const endCall = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    // Update local state immediately
    setCallState("ended");
    setTimeout(() => {
      if (mountedRef.current) resetCall();
    }, 2000);
    try {
      await apiEndCall(sid);
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  }, [setCallState, resetCall]);

  return {
    callState,
    sessionId,
    callerNumber,
    callerLanguage,
    messages,
    translations,
    isConnected,
    simulateIncomingCall,
    acceptCall,
    declineCall,
    endCall,
  };
}

"use client";

import { useState, useEffect } from "react";
import { createSession } from "@/services/api";
import { callStore } from "@/state/callStore";
import { Header } from "@/components/layout/Header";
import { SidePanel } from "@/components/layout/SidePanel";
import { StatusIndicator } from "@/components/layout/StatusIndicator";
import { CallInterface } from "@/components/call/CallInterface";
import { LoadingState } from "@/components/layout/LoadingState";

export function DashboardPage() {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState(callStore.getState());
  const { setView, setSession, setWsConnected } = callStore;
  const isActive = state.view.view === "active";

  useEffect(() => {
    const unsub = callStore.subscribe(() => setState(callStore.getState()));
    return () => { unsub(); };
  }, []);

  async function startCall() {
    setStarting(true);
    setError(null);
    try {
      const session = await createSession("en");
      setSession(session);
      setView({ view: "active", sessionId: session.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      setStarting(false);
    }
  }

  function endCall() {
    setView({ view: "idle" });
    setSession(null);
    setWsConnected(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
      }}
    >
      <Header />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SidePanel>
          <StatusIndicator
            status={isActive ? "active" : "idle"}
            wsConnected={state.wsConnected}
          />
          {!isActive ? (
            <>
              <button
                onClick={startCall}
                disabled={starting}
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem 1rem",
                  width: "100%",
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontWeight: 600,
                }}
              >
                {starting ? "Starting…" : "Start call session"}
              </button>
              {error && (
                <p style={{ fontSize: "0.875rem", color: "var(--error)", marginTop: "0.5rem" }}>
                  {error}
                </p>
              )}
            </>
          ) : (
            <button
              onClick={endCall}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                width: "100%",
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--text-muted)",
                borderRadius: "var(--radius)",
              }}
            >
              End session
            </button>
          )}
        </SidePanel>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {starting && !isActive ? (
            <LoadingState message="Creating session…" />
          ) : isActive ? (
            <CallInterface />
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                padding: "2rem",
              }}
            >
              <p>Start a call session to see the transcript and relay controls.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

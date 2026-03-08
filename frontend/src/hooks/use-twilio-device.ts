"use client";

import { useState, useRef, useCallback } from "react";
import { Device, Call } from "@twilio/voice-sdk";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type TwilioDeviceStatus = "idle" | "initializing" | "ready" | "connecting" | "on-call" | "error";

/**
 * Manages a Twilio Voice Device for browser-based audio.
 * Lazy-initializes on first connectToCall() — does NOT fetch token on mount.
 */
export function useTwilioDevice() {
  const [status, setStatus] = useState<TwilioDeviceStatus>("idle");
  const [isMuted, setIsMuted] = useState(true);
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);

  const ensureDevice = useCallback(async (): Promise<Device | null> => {
    if (deviceRef.current) return deviceRef.current;

    setStatus("initializing");
    try {
      const res = await fetch(`${API_BASE}/token?identity=agent_browser`);
      if (!res.ok) {
        setStatus("error");
        return null;
      }
      const { token } = await res.json();
      const twilioDevice = new Device(token, { edge: "ashburn" });

      twilioDevice.on("registered", () => setStatus("ready"));
      twilioDevice.on("error", () => setStatus("error"));

      await twilioDevice.register();
      deviceRef.current = twilioDevice;
      return twilioDevice;
    } catch {
      setStatus("error");
      return null;
    }
  }, []);

  const connectToCall = useCallback(async () => {
    const device = await ensureDevice();
    if (!device) return;

    setStatus("connecting");
    try {
      const call = await device.connect({
        params: { To: "conference:LinguisticLifeLine" },
      });
      callRef.current = call;
      call.on("accept", () => {
        // Start muted by default (push-to-talk)
        call.mute(true);
        setIsMuted(true);
        setStatus("on-call");
      });
      call.on("disconnect", () => {
        setStatus("ready");
        setIsMuted(true);
        callRef.current = null;
      });
    } catch {
      setStatus("error");
    }
  }, [ensureDevice]);

  const toggleMute = useCallback(() => {
    const call = callRef.current;
    if (!call) return;
    const newMuted = !isMuted;
    call.mute(newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const disconnect = useCallback(() => {
    callRef.current?.disconnect();
    callRef.current = null;
    deviceRef.current?.destroy();
    deviceRef.current = null;
    setStatus("idle");
    setIsMuted(true);
  }, []);

  return { deviceStatus: status, isMuted, connectToCall, disconnect, toggleMute };
}

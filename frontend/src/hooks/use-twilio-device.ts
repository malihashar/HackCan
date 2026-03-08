"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Device, Call } from "@twilio/voice-sdk";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type TwilioDeviceStatus = "idle" | "initializing" | "ready" | "connecting" | "on-call" | "error";

/**
 * Manages a Twilio Voice Device for browser-based audio.
 * Pre-fetches token on mount so the device is ready before the agent accepts a call.
 */
export function useTwilioDevice() {
  const [status, setStatus] = useState<TwilioDeviceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);

  // Pre-initialize device on mount so it's ready when a call comes in
  useEffect(() => {
    const init = async () => {
      if (deviceRef.current) return;
      setStatus("initializing");
      try {
        const res = await fetch(`${API_BASE}/token?identity=agent_browser`);
        if (!res.ok) { setStatus("error"); return; }
        const { token } = await res.json();
        const twilioDevice = new Device(token, { edge: "ashburn" });

        twilioDevice.on("registered", () => setStatus("ready"));
        twilioDevice.on("error", () => setStatus("error"));

        await twilioDevice.register();
        deviceRef.current = twilioDevice;
      } catch {
        setStatus("error");
      }
    };
    init();

    return () => {
      deviceRef.current?.destroy();
      deviceRef.current = null;
    };
  }, []);

  const connectToCall = useCallback(async () => {
    const device = deviceRef.current;
    if (!device) return;

    setStatus("connecting");
    try {
      const call = await device.connect({
        params: { To: "conference:LinguisticLifeLine" },
      });
      callRef.current = call;
      call.on("accept", () => {
        // Unmuted by default — voice goes through immediately
        call.mute(false);
        setIsMuted(false);
        setStatus("on-call");
      });
      call.on("disconnect", () => {
        setStatus("ready");
        setIsMuted(false);
        callRef.current = null;
      });
    } catch {
      setStatus("error");
    }
  }, []);

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
    // Destroy and re-create device for clean state on next call
    deviceRef.current?.destroy();
    deviceRef.current = null;
    setStatus("idle");
    setIsMuted(false);
    // Re-init device so it's ready for the next call
    const reinit = async () => {
      setStatus("initializing");
      try {
        const res = await fetch(`${API_BASE}/token?identity=agent_browser`);
        if (!res.ok) { setStatus("error"); return; }
        const { token } = await res.json();
        const newDevice = new Device(token, { edge: "ashburn" });
        newDevice.on("registered", () => setStatus("ready"));
        newDevice.on("error", () => setStatus("error"));
        await newDevice.register();
        deviceRef.current = newDevice;
      } catch {
        setStatus("error");
      }
    };
    reinit();
  }, []);

  return { deviceStatus: status, isMuted, connectToCall, disconnect, toggleMute };
}

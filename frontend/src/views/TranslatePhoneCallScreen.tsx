"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Mic, Languages, PhoneOff, PhoneIncoming } from "lucide-react";
import Link from "next/link";
import { EmptyCallState } from "@/components/call/EmptyCallState";
import { IncomingCallState } from "@/components/call/IncomingCallState";
import { VoiceWaveAnimation } from "@/components/call/voice-wave-animation";
import { CallDurationDisplay } from "@/components/call/CallDurationDisplay";
import { TranslationTextDisplay } from "@/components/call/translation-text-display";
import { useCallWebSocket } from "@/hooks/use-call-websocket";
import { useTwilioDevice } from "@/hooks/use-twilio-device";

/**
 * PhoneCallScreen - Translate phone call screen with idle/ringing/active states.
 * Blue gradient, language detection badge, voice response button.
 */
export function PhoneCallScreen() {
  const {
    callState, callerNumber, callerLanguage, translations,
    simulateIncomingCall, acceptCall, declineCall, endCall,
  } = useCallWebSocket();
  const { deviceStatus, isMuted, connectToCall, disconnect, toggleMute } = useTwilioDevice();
  const [durationSeconds, setDurationSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayNumber = callerNumber ?? "Unknown";
  const displayLanguage = callerLanguage ?? "Unknown";

  // Duration timer: runs while call is connected
  useEffect(() => {
    if (callState === "connected") {
      setDurationSeconds(0);
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callState]);

  const handleAccept = async () => {
    await acceptCall();
    await connectToCall();
  };

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    disconnect();
    endCall();
  };

  const handleVoiceResponse = () => {
    toggleMute();
  };

  // Idle state
  if (callState === "idle") {
    return (
      <EmptyCallState>
        <button
          onClick={() => simulateIncomingCall("+1 (555) 123-4567", "es")}
          className="mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors cursor-pointer"
        >
          <PhoneIncoming className="size-5" />
          <span>Simulate Incoming Call</span>
        </button>
      </EmptyCallState>
    );
  }

  // Ringing state
  if (callState === "ringing") {
    return (
      <IncomingCallState
        phoneNumber={displayNumber}
        onAccept={handleAccept}
        onDecline={declineCall}
        detectedLanguage={displayLanguage}
      />
    );
  }

  // Active call states (connecting / connected / ended)
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Call Status */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-blue-100 dark:bg-blue-900 mb-6 relative">
            <Phone className="size-10 text-blue-600 dark:text-blue-400" />
            {callState === "connected" && (
              <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-blue-600 animate-ping opacity-20" />
            )}
          </div>
          <h1 className="text-2xl mb-2 text-gray-900 dark:text-gray-100">
            {callState === "connecting" ? "Connecting..." : callState === "ended" ? "Call Ended" : "Call in Progress"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {callState === "connecting" ? "Please wait" : callState === "ended" ? "Disconnected" : "Translation active"}
          </p>
        </div>

        {/* Incoming Number */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Connected with</p>
            <p className="text-3xl tracking-wide text-gray-900 dark:text-gray-100">{displayNumber}</p>
          </div>
        </div>

        {/* Language Detection */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-amber-100 dark:bg-amber-900">
              <Languages className="size-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-900 dark:text-amber-200">Foreign Language Detected</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{displayLanguage} identified</p>
            </div>
          </div>
        </div>

        {/* Audio Status Badge */}
        {callState === "connected" && deviceStatus !== "idle" && (
          <div className="flex items-center justify-center mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              deviceStatus === "on-call"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : deviceStatus === "connecting"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                : deviceStatus === "error"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}>
              <span className={`size-1.5 rounded-full ${
                deviceStatus === "on-call" ? "bg-green-500" : deviceStatus === "connecting" ? "bg-yellow-500 animate-pulse" : deviceStatus === "error" ? "bg-red-500" : "bg-gray-400"
              }`} />
              Audio: {deviceStatus === "on-call" ? "Connected" : deviceStatus === "connecting" ? "Connecting" : deviceStatus === "error" ? "Error" : "Ready"}
            </span>
          </div>
        )}

        {/* Live Translation */}
        <TranslationTextDisplay translations={translations} />

        {/* Voice Response + End Call */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleVoiceResponse}
            disabled={callState !== "connected"}
            className={`flex items-center justify-center gap-3 py-6 rounded-2xl transition-all ${
              !isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {!isMuted ? (
              <VoiceWaveAnimation />
            ) : (
              <Mic className="size-6" />
            )}
            <span className="text-lg">
              {!isMuted ? "Speaking..." : "Push to Talk"}
            </span>
          </button>

          <button
            onClick={handleEndCall}
            disabled={callState === "ended"}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500 hover:bg-red-600 transition-colors text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PhoneOff className="size-5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Navigation to NormalCall */}
        <div className="text-center mt-6">
          <Link
            href="/NormalCall?active=true"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View active call without translation
          </Link>
        </div>

        {/* Call Timer */}
        <div className="text-center mt-8">
          <CallDurationDisplay durationSeconds={durationSeconds} />
        </div>
      </div>
    </div>
  );
}

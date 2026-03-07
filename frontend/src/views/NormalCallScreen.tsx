"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mic, MicOff, Volume2, VolumeX, PhoneIncoming } from "lucide-react";
import { CallStatusIndicator } from "@/components/call/CallStatusIndicator";
import { PhoneNumberCard } from "@/components/call/PhoneNumberCard";
import { EndCallButton } from "@/components/call/EndCallButton";
import { CallDurationDisplay } from "@/components/call/CallDurationDisplay";
import { EmptyCallState } from "@/components/call/EmptyCallState";
import { IncomingCallState } from "@/components/call/IncomingCallState";
import { useCallWebSocket } from "@/hooks/use-call-websocket";

/**
 * NormalCallScreen - Active call screen with idle/ringing/active states.
 * Green gradient, 2-col mute/speaker grid, lucide-react icons.
 */
export function NormalCallScreen() {
  const {
    callState, callerNumber,
    simulateIncomingCall, acceptCall, declineCall, endCall,
  } = useCallWebSocket();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayNumber = callerNumber ?? "Unknown";

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

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    endCall();
  };

  // Idle state
  if (callState === "idle") {
    return (
      <EmptyCallState>
        <button
          onClick={() => simulateIncomingCall("+1 (555) 987-6543")}
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
        onAccept={acceptCall}
        onDecline={declineCall}
      />
    );
  }

  // Active call states (connecting / connected / ended)
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 py-12">
      <div className="w-full max-w-md">
        <CallStatusIndicator status={callState} />
        <PhoneNumberCard phoneNumber={displayNumber} />

        {/* Control buttons: Mute + Speaker */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-6 rounded-2xl transition-all shadow-lg ${
              isMuted
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {isMuted ? <MicOff className="size-8 mb-2" /> : <Mic className="size-8 mb-2" />}
            <span className="text-sm">{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button
            onClick={() => setIsSpeakerOn((prev) => !prev)}
            className={`flex flex-col items-center justify-center py-6 rounded-2xl transition-all shadow-lg ${
              isSpeakerOn
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {isSpeakerOn ? <Volume2 className="size-8 mb-2" /> : <VolumeX className="size-8 mb-2" />}
            <span className="text-sm">{isSpeakerOn ? "Speaker On" : "Speaker Off"}</span>
          </button>
        </div>

        <EndCallButton onClick={handleEndCall} disabled={callState === "ended"} />


        {/* Navigation link */}
        <div className="text-center mt-6">
          <Link
            href="/TranslatePhoneCall?active=true"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
          >
            View call with translation
          </Link>
        </div>

        <div className="text-center mt-8">
          <CallDurationDisplay durationSeconds={durationSeconds} />
        </div>
      </div>
    </div>
  );
}

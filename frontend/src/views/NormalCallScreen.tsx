"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { CallStatusIndicator } from "@/components/call/CallStatusIndicator";
import { PhoneNumberCard } from "@/components/call/PhoneNumberCard";
import { EndCallButton } from "@/components/call/EndCallButton";
import { CallDurationDisplay } from "@/components/call/CallDurationDisplay";

type CallState = "connecting" | "connected" | "ended";

/**
 * NormalCallScreen - Active call screen matching the Figma ActiveCall design.
 * Green gradient, 2-col mute/speaker grid, lucide-react icons, no header.
 */
export function NormalCallScreen() {
  const router = useRouter();

  const [callState, setCallState] = useState<CallState>("connected");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phoneNumber = "+1 (555) 987-6543";

  // Duration timer: runs while call is connected
  useEffect(() => {
    if (callState === "connected") {
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

  const handleEndCall = useCallback(() => {
    setCallState("ended");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Call status icon + text */}
        <CallStatusIndicator status={callState} />

        {/* Connected phone number card */}
        <PhoneNumberCard phoneNumber={phoneNumber} />

        {/* Control buttons: Mute + Speaker in 2-col grid */}
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

        {/* End call button */}
        <EndCallButton onClick={handleEndCall} disabled={callState === "ended"} />

        {/* Navigation link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-colors duration-200"
          >
            View incoming call with translation
          </button>
        </div>

        {/* Duration display */}
        <div className="text-center mt-8">
          <CallDurationDisplay durationSeconds={durationSeconds} />
        </div>
      </div>
    </div>
  );
}

"use client"
import { Phone, Mic, Languages, PhoneOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function PhoneCallScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const incomingNumber = "+1 (555) 123-4567";
  const detectedLanguage = "Spanish";
  const isForeignLanguage = true;

  const handleVoiceResponse = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop voice recording
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Call Status */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-blue-100 dark:bg-blue-900 mb-6 animate-pulse">
            <Phone className="size-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl mb-2 text-gray-900 dark:text-gray-100">Incoming Call</h1>
          <p className="text-gray-500 dark:text-gray-400">Call in progress...</p>
        </div>

        {/* Incoming Number */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Calling from</p>
            <p className="text-3xl tracking-wide text-gray-900 dark:text-gray-100">{incomingNumber}</p>
          </div>
        </div>

        {/* Language Detection */}
        {isForeignLanguage && (
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-full bg-amber-100 dark:bg-amber-900">
                <Languages className="size-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-900 dark:text-amber-200">Foreign Language Detected</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{detectedLanguage} identified</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Response Button */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleVoiceResponse}
            className={`flex items-center justify-center gap-3 py-6 rounded-2xl transition-all ${isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-green-500 hover:bg-green-600"
              } text-white shadow-lg`}
          >
            <Mic className="size-6" />
            <span className="text-lg">
              {isRecording ? "Recording..." : "Respond with Voice"}
            </span>
          </button>

          {/* End Call Button */}
          <button className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500 hover:bg-red-600 transition-colors text-white shadow-lg">
            <PhoneOff className="size-5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Navigation to Active Call */}
        <div className="text-center mt-6">
          <Link
            href="/active-call"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View active call without translation
          </Link>
        </div>

        {/* Call Timer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">Duration: 00:45</p>
        </div>
      </div>
    </div>
  );
}
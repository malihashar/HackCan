"use client";

import { Phone } from "lucide-react";

type CallStatus = "connecting" | "connected" | "ended";

type CallStatusIndicatorProps = {
  status: CallStatus;
};

const statusConfig: Record<CallStatus, { title: string; subtitle: string; ping: boolean }> = {
  connecting: { title: "Connecting...", subtitle: "Please wait", ping: true },
  connected: { title: "Call in Progress", subtitle: "Connected", ping: true },
  ended: { title: "Call Ended", subtitle: "Disconnected", ping: false },
};

/**
 * Displays the call status with a phone icon, title, and subtitle.
 * Green icon circle with ping animation overlay matching Figma reference.
 */
export function CallStatusIndicator({ status }: CallStatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="text-center mb-8">
      {/* Phone icon circle with ping overlay */}
      <div className="inline-flex items-center justify-center size-24 rounded-full bg-green-100 dark:bg-green-900 mb-6 relative">
        <Phone className="size-12 text-green-600 dark:text-green-400" />
        {config.ping && (
          <div className="absolute inset-0 rounded-full bg-green-400 dark:bg-green-600 animate-ping opacity-20" />
        )}
      </div>

      <h1 className="text-2xl mb-2 text-gray-900 dark:text-gray-100">{config.title}</h1>
      <p className="text-gray-500 dark:text-gray-400">{config.subtitle}</p>
    </div>
  );
}

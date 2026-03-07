"use client";

import { PhoneOff } from "lucide-react";

type EndCallButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

/**
 * Red end call button with PhoneOff lucide icon.
 * Full width, py-6, text-lg matching Figma reference.
 */
export function EndCallButton({ onClick, disabled = false }: EndCallButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        flex items-center justify-center gap-3
        w-full py-6 rounded-2xl
        bg-red-500 hover:bg-red-600
        text-white shadow-lg
        transition-colors duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <PhoneOff className="size-6" />
      <span className="text-lg">End Call</span>
    </button>
  );
}

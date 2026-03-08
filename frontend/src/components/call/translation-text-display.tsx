"use client";

import { useEffect, useRef } from "react";
import { Languages } from "lucide-react";
import type { TranslationEntry } from "@/stores/call-store";

type TranslationTextDisplayProps = {
  translations: TranslationEntry[];
};

/**
 * Scrollable container showing live translation entries from the /broadcast webhook.
 * Each entry shows original text (dimmed) and translated text (prominent).
 */
export function TranslationTextDisplay({ translations }: TranslationTextDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [translations]);

  if (translations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 justify-center">
          <Languages className="size-4" />
          <span className="text-sm">Waiting for translation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Languages className="size-4 text-blue-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Translation</span>
      </div>
      <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-3 pr-1">
        {translations.map((entry, i) => (
          <div key={i} className="border-l-2 border-blue-400 pl-3">
            <p className="text-xs text-gray-400 dark:text-gray-500">{entry.original_text}</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{entry.translated_text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

type CallDurationDisplayProps = {
  /** Duration in seconds */
  durationSeconds: number;
};

/** Formats seconds into MM:SS string */
function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Displays call duration in MM:SS format.
 */
export function CallDurationDisplay({ durationSeconds }: CallDurationDisplayProps) {
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Duration: {formatDuration(durationSeconds)}
    </p>
  );
}

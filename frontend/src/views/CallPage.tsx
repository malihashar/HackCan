"use client";

/**
 * Call page: redirects to dashboard which handles both idle and active call.
 * PRD: No extra pages; single demo path from dashboard.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CallPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}

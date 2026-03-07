"use client";

import { Home, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import Link from "next/link";

interface TopbarProps {
  /** Server-rendered slot for auth controls (e.g. AuthButton) */
  actions?: React.ReactNode;
}

export function Topbar({ actions }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Home className="size-5" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="size-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="size-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {actions}
        </div>
      </div>
    </div>
  );
}

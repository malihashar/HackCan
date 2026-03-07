import Link from "next/link";
import { Phone, Globe } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { AuthButton } from "@/components/auth/auth-button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Topbar actions={<AuthButton />} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Multilingual Call Relay
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            AI-assisted translation and human relay for non-English callers.
            Bridge language barriers in real-time phone conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/NormalCall"
            className="group block p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <Phone className="size-10 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors">
              Normal Call
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Standard phone call relay without translation.
            </p>
          </Link>

          <Link
            href="/TranslatePhoneCall"
            className="group block p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            <Globe className="size-10 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 transition-colors">
              Translate Phone Call
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time translated call relay for non-English speakers.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

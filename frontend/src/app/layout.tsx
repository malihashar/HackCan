import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/context/theme-context";

export const metadata: Metadata = {
  title: "Multilingual Call Relay — Agent Dashboard",
  description: "AI-assisted translation and human relay for non-English callers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

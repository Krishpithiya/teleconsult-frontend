"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console (swap for an error reporting service like Sentry)
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F7F9FC" }}
    >
      <div className="text-center max-w-md">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "#FEE2E2" }}
        >
          <AlertTriangle size={36} style={{ color: "#DC2626" }} />
        </div>

        {/* Heading */}
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "#0D1B2A", fontFamily: "'Sora',sans-serif" }}
        >
          Something went wrong
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "#7A90A4" }}>
          An unexpected error occurred. You can try refreshing the page or go back to the home page.
          {error?.digest && (
            <span className="block mt-2 font-mono text-xs text-slate-400">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#1D6FA4,#0F4C75)" }}
          >
            <RefreshCw size={15} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white border"
            style={{ color: "#3D5166", borderColor: "#D9E4EE" }}
          >
            <Home size={15} />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Route-level boundary for /dashboard — catches crashes anywhere inside the
// dashboard tree (e.g. a tool tab like the resume builder) without taking
// down the rest of the site, and without losing the user's session.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] Dashboard crash:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center bg-white border border-gray-100 rounded-2xl p-10 shadow-sm">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#3B5BDB]/10">
          <AlertTriangle className="size-7 text-[#3B5BDB]" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">This section hit a snag</h1>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          Your account and data are safe. Reload this section and pick up right where you left
          off.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3B5BDB] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2f49b2] transition-colors"
        >
          <RotateCcw className="size-4" />
          Reload
        </button>
      </div>
    </main>
  );
}

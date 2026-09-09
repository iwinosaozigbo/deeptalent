"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { FluidCTA } from "@/components/site/fluid-cta";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] Unhandled error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-[#3B5BDB]/10">
          <AlertTriangle className="size-7 text-[#3B5BDB]" />
        </div>
        <p className="text-sm font-semibold tracking-widest text-[#3B5BDB] uppercase mb-3">
          Something went wrong
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-balance">
          That didn&apos;t work as expected.
        </h1>
        <p className="mt-3 text-gray-500 leading-relaxed">
          No changes were lost — just try again, or head back to your dashboard. If this keeps
          happening, let us know and we&apos;ll fix it.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <FluidCTA onClick={() => reset()} size="md" showArrow={false}>
            <RotateCcw className="size-4" />
            Try again
          </FluidCTA>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-300">Reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}

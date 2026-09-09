"use client";

import { useEffect } from "react";

// Catches crashes in the root layout itself (fonts, providers, etc.), where
// the normal app/error.tsx boundary can't run because the layout around it
// is what broke. Must render its own <html>/<body> — no shared components.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] Root layout crash:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#ffffff",
          color: "#111827",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#3B5BDB",
              marginBottom: 12,
            }}
          >
            Something went wrong
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            DeepTalent hit a snag.
          </h1>
          <p style={{ marginTop: 12, color: "#6B7280", lineHeight: 1.6 }}>
            Nothing was lost. Reloading usually fixes this right away.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 24,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              padding: "10px 24px",
              background: "#3B5BDB",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

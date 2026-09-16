"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, ClipboardList, Loader2 } from "lucide-react";

type Submission = {
  id: string;
  user_id: string;
  lesson_code: string;
  lesson_title: string;
  content: string;
  link_url: string | null;
  status: "submitted" | "reviewed";
  admin_note: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string | null; nysc_state_code: string | null } | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AssignmentsTab() {
  const { data, mutate, isLoading } = useSWR<{ rows: Submission[] }>("/api/admin/assignments", fetcher, {
    refreshInterval: 60_000,
  });
  const [filter, setFilter] = useState<"all" | "submitted" | "reviewed">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const rows = data?.rows ?? [];
  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const pendingCount = rows.filter((r) => r.status === "submitted").length;

  async function markReviewed(row: Submission) {
    setSavingId(row.id);
    try {
      await fetch("/api/admin/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          status: row.status === "reviewed" ? "submitted" : "reviewed",
          adminNote: notes[row.id] ?? row.admin_note ?? "",
        }),
      });
      await mutate();
    } finally {
      setSavingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Assignment submissions</h2>
          <p className="text-sm text-gray-500">
            {pendingCount > 0 ? `${pendingCount} awaiting review` : "All caught up"}
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-gray-100 p-1">
          {(["all", "submitted", "reviewed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-white text-[#3B5BDB] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-16 text-center text-gray-400">
          <ClipboardList className="mx-auto mb-3 size-8 text-gray-300" />
          No submissions{filter !== "all" ? ` marked ${filter}` : ""} yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => (
            <div key={row.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    {row.profiles?.full_name || row.profiles?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {row.profiles?.email}
                    {row.profiles?.nysc_state_code ? ` · ${row.profiles.nysc_state_code}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#3B5BDB]/10 px-2.5 py-1 text-xs font-semibold text-[#3B5BDB]">
                    {row.lesson_code} · {row.lesson_title}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      row.status === "reviewed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {row.status === "reviewed" && <CheckCircle2 className="size-3" />}
                    {row.status}
                  </span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{row.content}</p>
              {row.link_url && (
                <a
                  href={row.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block text-sm font-medium text-[#3B5BDB] underline underline-offset-2"
                >
                  {row.link_url}
                </a>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={notes[row.id] ?? row.admin_note ?? ""}
                  onChange={(e) => setNotes((n) => ({ ...n, [row.id]: e.target.value }))}
                  placeholder="Add a note for the corps member (optional)…"
                  className="form-input min-w-[240px] flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-[#3B5BDB] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]/15"
                />
                <button
                  onClick={() => markReviewed(row)}
                  disabled={savingId === row.id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    row.status === "reviewed"
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-[#3B5BDB] text-white hover:bg-[#2f4bc0]"
                  }`}
                >
                  {savingId === row.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : row.status === "reviewed" ? (
                    "Mark unreviewed"
                  ) : (
                    "Mark reviewed"
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-400">Submitted {new Date(row.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

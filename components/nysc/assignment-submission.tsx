"use client";

import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, ClipboardList, Loader2, Send } from "lucide-react";

type Submission = {
  id: string;
  lesson_code: string;
  content: string;
  link_url: string | null;
  status: "submitted" | "reviewed";
  admin_note: string | null;
  created_at: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function AssignmentSubmission({ lessonCode, prompt }: { lessonCode: string; prompt: string }) {
  const { data, mutate } = useSWR<{ rows: Submission[] }>("/api/nysc/assignments", fetcher);
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mine = (data?.rows ?? []).filter((r) => r.lesson_code === lessonCode);
  const latest = mine[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/nysc/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonCode, content, linkUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Couldn't submit. Try again.");
      setContent("");
      setLinkUrl("");
      await mutate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-[#0F7A3D]/10 text-[#0F7A3D]">
          <ClipboardList className="size-4" />
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-[#0F7A3D]">Assignment</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 text-pretty">{prompt}</p>

      {mine.length > 0 && (
        <div className="mt-4 space-y-2">
          {mine.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-100 bg-[#F4FBF6] p-4">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    s.status === "reviewed"
                      ? "bg-[#0F7A3D]/10 text-[#0F7A3D]"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {s.status === "reviewed" && <CheckCircle2 className="size-3" />}
                  {s.status === "reviewed" ? "Reviewed" : "Submitted — awaiting review"}
                </span>
                <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{s.content}</p>
              {s.link_url && (
                <a
                  href={s.link_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-block text-sm font-medium text-[#0F7A3D] underline underline-offset-2"
                >
                  {s.link_url}
                </a>
              )}
              {s.admin_note && (
                <p className="mt-2 rounded-lg bg-white p-2.5 text-xs leading-relaxed text-gray-500">
                  <span className="font-semibold text-gray-700">Facilitator note: </span>
                  {s.admin_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={latest ? "Submit a revision…" : "Write your submission here…"}
          rows={4}
          required
          className="form-input w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#0F7A3D] focus:outline-none focus:ring-2 focus:ring-[#0F7A3D]/15"
        />
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Optional link (LinkedIn, portfolio, doc)…"
          className="form-input w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#0F7A3D] focus:outline-none focus:ring-2 focus:ring-[#0F7A3D]/15"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[#0F7A3D] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6633] disabled:opacity-50"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          {latest ? "Submit revision" : "Submit assignment"}
        </button>
      </form>
    </div>
  );
}

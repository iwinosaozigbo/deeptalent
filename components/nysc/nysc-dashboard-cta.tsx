import Link from "next/link";
import { FileText, Sparkles, ArrowRight } from "lucide-react";

/**
 * Bridges the green NYSC experience into the main talent dashboard, where the
 * AI tools live. Corps members are already `talent` role, so /dashboard works
 * for them directly — this just makes the CV builder and AI tools discoverable.
 */
export function NyscDashboardCta() {
  return (
    <Link
      href="/dashboard?tab=resumeBuilder"
      className="group mb-8 flex flex-col gap-4 rounded-2xl border border-[#0F7A3D]/15 bg-white p-5 shadow-sm transition-all hover:border-[#0F7A3D]/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#0F7A3D]/10 text-[#0F7A3D]">
          <FileText className="size-5" />
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
            Build a world-class CV
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0F7A3D]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0F7A3D]">
              <Sparkles className="size-3" /> New
            </span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-500 text-pretty">
            Open your dashboard to use the AI CV builder, cover letter writer and more — five global-standard templates included.
          </p>
        </div>
      </div>

      <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#0F7A3D] px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[#0b5e2f] sm:self-center">
        Open dashboard
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

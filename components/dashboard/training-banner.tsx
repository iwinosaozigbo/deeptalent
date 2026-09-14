import Link from "next/link";
import { ArrowRight, Award, Globe, Rocket, Sparkles } from "lucide-react";

/**
 * Promotes the "Get Global Workforce Ready" course from the talent dashboard.
 * Enrolment lives under the NYSC/post-NYSC pathway, so the CTA routes there.
 */
export function TrainingBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0b1b4d] p-6 text-white sm:p-7">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#3B5BDB]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-24 size-48 rounded-full bg-[#5c7cfa]/30 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            <Sparkles className="size-3.5" /> Get Global Workforce Ready
          </span>
          <h3 className="mt-3 text-xl font-bold leading-tight text-balance sm:text-2xl">
            Work global. Stay in Nigeria.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/75 text-pretty">
            A 3-day course to land — and keep — a remote role with a UK, US, Canadian or Australian
            employer. 13 modules, 7 hours, plus a live practical on Google Meet.
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="size-4 text-[#8ea9ff]" /> Global work culture
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Rocket className="size-4 text-[#8ea9ff]" /> AI tools &amp; more
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Award className="size-4 text-[#8ea9ff]" /> Certificate of completion
            </span>
          </div>
        </div>

        <Link
          href="/nysc/training"
          className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4d] transition-colors hover:bg-white/90 lg:self-center"
        >
          Enroll now
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

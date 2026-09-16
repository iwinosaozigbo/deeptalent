"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, Award, Globe, PlayCircle, Rocket, Sparkles } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * Promotes the "Get Global Workforce Ready" course from the talent dashboard.
 * Enrolment lives under the NYSC/post-NYSC pathway, so the CTA routes there.
 * Once the learner has paid, the banner flips to a "your training is live"
 * state that sends them straight in to watch the recorded lessons.
 */
export function TrainingBanner() {
  const { data } = useSWR<{ enrolled: boolean; registered: boolean }>("/api/nysc/certificate", fetcher);
  const enrolled = Boolean(data?.enrolled);
  const registered = Boolean(data?.registered);
  // Anyone who has signed up for the course sees the "live" treatment; only
  // paid learners get the "watch now" jump straight into the lessons.
  const live = enrolled || registered;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0b1b4d] p-6 text-white sm:p-7">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#3B5BDB]/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-24 size-48 rounded-full bg-[#5c7cfa]/30 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                <span className="relative inline-flex size-2 rounded-full bg-white" />
              </span>
              Training is live now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              <Sparkles className="size-3.5" /> Get Global Workforce Ready
            </span>
          )}
          <h3 className="mt-3 text-xl font-bold leading-tight text-balance sm:text-2xl">
            {enrolled
              ? "Lesson 1 is live — start watching now."
              : registered
                ? "Your training is live — finish enrolling to watch."
                : "Work global. Stay in Nigeria."}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/75 text-pretty">
            {enrolled
              ? "You're enrolled. The recorded sessions are unlocked — pick up where you left off and work through all 13 modules at your own pace."
              : registered
                ? "You're registered for the Global Workforce Ready course and it's now live. Complete your enrolment (NGN 5,000) to unlock Lesson 1 and all 13 modules."
                : "A 3-day course to land — and keep — a remote role with a UK, US, Canadian or Australian employer. 13 modules, 7 hours, plus a live practical on Google Meet."}
          </p>

          {!enrolled && (
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
          )}
        </div>

        <Link
          href="/nysc/training"
          className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b1b4d] transition-colors hover:bg-white/90 lg:self-center"
        >
          {enrolled ? (
            <>
              <PlayCircle className="size-4" />
              Watch now
            </>
          ) : registered ? (
            <>
              Finish enrolling
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          ) : (
            <>
              Enroll now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}

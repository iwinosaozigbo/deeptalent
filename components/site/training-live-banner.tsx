"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";

/**
 * Slim, dismissible announcement bar shown at the very top of the home page
 * signalling that the "Get Global Workforce Ready" training is live. Clicking
 * it routes into the post-NYSC signup flow (sign in / create account), which
 * lands on the training page where the learner is prompted to enrol.
 *
 * Open state is controlled by the parent so the floating navbar can offset
 * itself while the banner is visible.
 */
export function TrainingLiveBanner({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="relative z-40 w-full bg-[#0B1220] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2.5 sm:px-12">
        <button
          type="button"
          onClick={() => router.push("/auth/nysc?track=training")}
          aria-label="The Global Workforce Ready training is live. Sign in or create an account to enrol."
          className="group flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-xs font-medium sm:text-sm"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            Live now
          </span>
          <span className="text-white/90">
            Global Workforce Ready training is live — enrol for{" "}
            <span className="font-semibold text-white">NGN 5,000</span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#8690FD] transition-colors group-hover:text-white">
            Enrol now
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss training announcement"
        className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

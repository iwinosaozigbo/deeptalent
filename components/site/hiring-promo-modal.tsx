"use client";

import { useEffect } from "react";
import { Briefcase, ArrowRight, X } from "lucide-react";

/**
 * "We're hiring" popup for the Sales Development Representative role.
 * Controlled by the parent (PromoModals) so it can be sequenced after the
 * NYSC course promo instead of stacking on top of it.
 */
export function HiringPromoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const mailtoHref =
    "mailto:Mail@deeptalentplatform.com?subject=Application%3A%20Sales%20Development%20Representative";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="DeepTalent is hiring a Sales Development Representative"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white text-gray-900 shadow-lg transition-transform hover:scale-105"
        >
          <X className="size-5" />
        </button>

        <div className="bg-[#3B5BDB] px-6 pb-8 pt-10 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Briefcase className="size-3.5" />
            We&apos;re hiring
          </span>
          <h2 className="mt-4 text-2xl font-semibold leading-tight">
            Sales Development Representative
          </h2>
          <p className="mt-2 text-sm text-white/85">
            Help DeepTalent connect credentialled African talent with global employers. Remote-friendly, full-time.
          </p>
        </div>

        <div className="px-6 py-6">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#3B5BDB]" />
              Prospect and qualify new employer partners across the UK, US, Canada and Australia.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#3B5BDB]" />
              Run outbound outreach and book discovery calls for the founding team.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#3B5BDB]" />
              Own your pipeline in the CRM and hand off qualified leads to close.
            </li>
          </ul>

          <a
            href={mailtoHref}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#3B5BDB] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01]"
          >
            Apply now
            <ArrowRight className="size-4" />
          </a>
          <p className="mt-3 text-center text-xs text-gray-500">
            Opens an email to Mail@deeptalentplatform.com
          </p>
        </div>
      </div>
    </div>
  );
}

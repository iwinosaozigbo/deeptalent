"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const SESSION_KEY = "deeptalent_nysc_promo_seen";

/**
 * Full-screen promo popup for the "Get Global Workforce Ready" post-NYSC
 * course. Shows once per browser session on app load. Clicking the flyer
 * routes into the post-NYSC signup flow (which lands on the NyscShell
 * training page after verification); the X closes without navigating.
 */
export function NyscPromoModal({ onDismissed }: { onDismissed?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    onDismissed?.();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const goToNysc = () => {
    close();
    router.push("/auth/nysc?track=training");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Get Global Workforce Ready — post-NYSC course"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={close}
    >
      <div
        className="relative w-full max-w-sm animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute -top-3 -right-3 z-10 grid size-9 place-items-center rounded-full bg-white text-gray-900 shadow-lg transition-transform hover:scale-105"
        >
          <X className="size-5" />
        </button>

        <button
          type="button"
          onClick={goToNysc}
          aria-label="Register for the October 28–30, 2026 Get Global Workforce Ready cohort."
          className="block w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 transition-transform hover:scale-[1.01]"
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-09-19%20at%2022.45.32-at7NZN0A2usXcf49NdHBo3fcW4XhSw.jpeg"
            alt="DeepTalent Get Global Workforce Ready: virtual cohort October 28–30, 2026, 11am–1pm. Early bird NGN 3,500; late registration NGN 7,000 from October 25, 2026."
            className="block max-h-[85vh] w-full object-contain"
          />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { NyscPromoModal } from "@/components/site/nysc-promo-modal";
import { HiringPromoModal } from "@/components/site/hiring-promo-modal";

const SESSION_KEY = "deeptalent_hiring_promo_seen";

/**
 * Sequences the site's popups so they never stack on top of each other:
 * the NYSC course promo shows first, and once it's dismissed (closed or
 * clicked through), the "we're hiring" popup shows once per session.
 */
export function PromoModals() {
  const [hiringOpen, setHiringOpen] = useState(false);

  const showHiring = () => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setHiringOpen(true);
  };

  return (
    <>
      <NyscPromoModal onDismissed={showHiring} />
      <HiringPromoModal open={hiringOpen} onClose={() => setHiringOpen(false)} />
    </>
  );
}

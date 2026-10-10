"use client";

import { useEffect, useState } from "react";
import { COURSE, getCoursePriceNgn } from "@/lib/nysc/course-content";

export function useCoursePriceNgn() {
  const [priceNgn, setPriceNgn] = useState<number>(COURSE.earlyBirdPriceNgn);

  useEffect(() => {
    const refreshPrice = () => setPriceNgn(getCoursePriceNgn());
    refreshPrice();
    const interval = window.setInterval(refreshPrice, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return priceNgn;
}

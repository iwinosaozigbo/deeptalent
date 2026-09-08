export interface CreditPackage {
  id: string;
  label: string;
  credits: number;
  /** Price in cents (USD) — kept for reference/analytics only */
  priceInCents: number;
  /** Price in Naira (NGN) — server is the source of truth for Flutterwave checkout */
  priceNgn: number;
  popular?: boolean;
  /** Bonus credits included for larger packs, shown for marketing */
  bonus?: number;
}

// Source of truth for all credit packages. IDs are passed to checkout;
// the server always looks up price + credits from here (never trusts the client).
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: "starter", label: "Starter", credits: 20, priceInCents: 500, priceNgn: 1500 },
  { id: "pro", label: "Pro", credits: 60, priceInCents: 1200, priceNgn: 3500, popular: true, bonus: 5 },
  { id: "power", label: "Power", credits: 150, priceInCents: 2500, priceNgn: 7500, bonus: 20 },
  { id: "ultra", label: "Ultra", credits: 400, priceInCents: 6000, priceNgn: 18000, bonus: 75 },
];

export function getPackage(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

/** Total credits granted for a package (base + bonus). */
export function packageTotalCredits(pkg: CreditPackage): number {
  return pkg.credits + (pkg.bonus ?? 0);
}

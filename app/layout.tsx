import type { Metadata } from "next";
import "./globals.css";
import { Geist, Instrument_Serif } from "next/font/google";
import { cn } from "@/lib/utils";
import { NyscPromoModal } from "@/components/site/nysc-promo-modal";
import { HOME_FAQS } from "@/lib/seo/faqs";
import {
  graph,
  organizationSchema,
  websiteSchema,
  professionalServiceSchema,
  faqSchema,
} from "@/lib/seo/schema";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif' });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://deeptalent.app";

export const metadata: Metadata = {
  title: {
    default: "DeepTalent — Finance, Compliance & Technology Talent Partner",
    template: "%s | DeepTalent",
  },
  description:
    "A fully managed talent partner — not a marketplace. Credentialled finance, compliance, and technology professionals from Africa placed into global roles in 14–21 days. <8% acceptance rate. 60-day free replacement guarantee.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    siteName: "DeepTalent",
    title: "DeepTalent — Finance, Compliance & Technology Talent Partner",
    description:
      "Credentialled professionals from Africa's deepest talent pools placed into demanding global roles in 14–21 days.",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepTalent — Finance, Compliance & Technology Talent Partner",
    description:
      "Credentialled professionals from Africa's deepest talent pools placed into demanding global roles in 14–21 days.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#FFFFFF",
};

// One connected schema.org graph: Organization + WebSite (with sitelinks
// search) + ProfessionalService + FAQPage. This is what feeds Google's
// entity understanding, rich results, and AI Overview citations.
const structuredData = graph(
  organizationSchema(),
  websiteSchema(),
  professionalServiceSchema(),
  faqSchema(HOME_FAQS),
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("relative", "bg-white", "font-sans", geist.variable, instrumentSerif.variable)}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <NyscPromoModal />
      </body>
    </html>
  );
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://deeptalent.app";

const ORG_ID = `${APP_URL}/#organization`;
const WEBSITE_ID = `${APP_URL}/#website`;

/**
 * A single connected graph is what Google's Knowledge Graph / AI Overview
 * prefers: the WebSite points at the Organization as its publisher, and the
 * Organization carries the descriptive facts (services, regions, expertise)
 * that get surfaced in AI Overviews and entity panels.
 */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "DeepTalent",
    alternateName: "DeepTalent Platform",
    url: APP_URL,
    logo: {
      "@type": "ImageObject",
      url: `${APP_URL}/images/logo-wordmark.png`,
    },
    image: `${APP_URL}/opengraph-image`,
    description:
      "DeepTalent is a fully managed talent partner — not a marketplace — that places credentialled finance, compliance, and technology professionals from Africa into demanding global roles in 14–21 days, with an under-8% acceptance rate and a 60-day free replacement guarantee.",
    slogan: "Africa's deepest talent, placed globally.",
    knowsAbout: [
      "Finance talent recruitment",
      "Compliance and risk hiring",
      "Software engineering recruitment",
      "Remote team building in Africa",
      "Global employer of record placement",
      "Fractional and full-time talent placement",
    ],
    areaServed: [
      { "@type": "Place", name: "United Kingdom" },
      { "@type": "Place", name: "United States" },
      { "@type": "Place", name: "European Union" },
      { "@type": "Place", name: "Africa" },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "GB",
    },
    sameAs: ["https://www.linkedin.com/company/deeptalentplatform/"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hello@deeptalent.app",
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: APP_URL,
    name: "DeepTalent",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/roles?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * The service catalog helps AI Overviews answer "what does DeepTalent do".
 */
export function professionalServiceSchema() {
  return {
    "@type": "ProfessionalService",
    "@id": `${APP_URL}/#service`,
    name: "DeepTalent",
    url: APP_URL,
    parentOrganization: { "@id": ORG_ID },
    serviceType: "Talent placement and managed recruitment",
    areaServed: "Worldwide",
    description:
      "Managed placement of vetted finance, compliance, and technology professionals from Africa into global companies.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Talent placement services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Finance & accounting talent placement" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Compliance & risk talent placement" },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Technology & engineering talent placement" },
        },
      ],
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${APP_URL}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

/** Wraps any set of entities into a single @graph document. */
export function graph(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

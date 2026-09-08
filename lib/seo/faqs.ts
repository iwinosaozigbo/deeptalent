export interface Faq {
  question: string;
  answer: string;
}

// Single source of truth for the homepage FAQ. The visible <FaqSection> and the
// FAQPage JSON-LD both read from here so structured data always matches the page
// (a hard requirement for Google's FAQ rich results and AI Overview citations).
export const HOME_FAQS: Faq[] = [
  {
    question: "What is DeepTalent?",
    answer:
      "DeepTalent is a global Human Capital Infrastructure company — not a recruitment agency, freelance marketplace, outsourcing firm or job board. We help enterprises, institutions and governments discover, verify, deploy and manage exceptional talent across borders, combining human expertise, technology, workforce intelligence and managed services in one connected platform.",
  },
  {
    question: "How does the vetting process work?",
    answer:
      "We use a proprietary mix of AI analysis and human expert review. Every candidate undergoes technical assessments, communication screening, and a past-performance audit before entering our network.",
  },
  {
    question: "What are the fees for hiring?",
    answer:
      "We believe in transparency. Hirers pay a flat platform fee or a percentage markup depending on the engagement model. There are no hidden onboarding costs.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption (SOC2 compliant standards) for all data, payments, and contract details. Your intellectual property and financial data are protected at all times.",
  },
  {
    question: "Can specialists use our internal tools?",
    answer:
      "Yes. Our specialists are senior-level professionals accustomed to integrating into existing workflows. They work within your Slack, Jira, GitHub, or Linear environments from day one.",
  },
  {
    question: "How are payments handled?",
    answer:
      "We act as the merchant of record. You receive one consolidated monthly invoice for all your talent in your preferred currency — USD, GBP, EUR, AUD, CAD, and more.",
  },
  {
    question: "What if a match isn't the right fit?",
    answer:
      "We offer a 60-day free replacement guarantee. If a specialist is not the right fit within the first 60 days, we replace them at no additional cost — no questions asked.",
  },
  {
    question: "Do you support full-time hiring?",
    answer:
      "Yes. While many engagements start as contracts, we offer a simple 'buy-out' clause if you wish to bring a DeepTalent specialist onto your internal payroll permanently.",
  },
];

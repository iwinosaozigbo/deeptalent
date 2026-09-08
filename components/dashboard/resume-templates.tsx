import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Shared types                                                         */
/* ------------------------------------------------------------------ */
export interface WorkEntry {
  id: string;
  title: string;
  company: string;
  period: string;
  bullets: string;
}

export interface EduEntry {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: WorkEntry[];
  education: EduEntry[];
  skills: string;
}

export type TemplateId = "modern" | "classic" | "executive" | "minimal" | "creative";

export interface TemplateMeta {
  id: TemplateId;
  label: string;
  description: string;
  /** Accent colour shown in the picker swatch */
  accent: string;
}

/** Global-standard template set. Order is the order shown in the picker. */
export const RESUME_TEMPLATES: TemplateMeta[] = [
  { id: "modern", label: "Modern", description: "Blue accent, clean structure", accent: "#3B5BDB" },
  { id: "classic", label: "Classic (ATS)", description: "Plain, ATS-safe, no colour", accent: "#111827" },
  { id: "executive", label: "Executive", description: "Serif, two-tone, senior roles", accent: "#1f2937" },
  { id: "minimal", label: "Minimal", description: "Spacious, understated", accent: "#6b7280" },
  { id: "creative", label: "Creative", description: "Sidebar with accent column", accent: "#312e81" },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
function contactItems(resume: ResumeData): string[] {
  return [resume.email, resume.phone, resume.location, resume.linkedin, resume.website].filter(
    Boolean
  ) as string[];
}

function hasExperience(resume: ResumeData) {
  return resume.experience.some((e) => e.title || e.company);
}
function hasEducation(resume: ResumeData) {
  return resume.education.some((e) => e.degree || e.school);
}

/* ------------------------------------------------------------------ */
/* Template 1 — Modern (brand blue)                                    */
/* ------------------------------------------------------------------ */
function ModernTemplate({ resume, compact }: { resume: ResumeData; compact?: boolean }) {
  const heading = compact ? "text-[9px]" : "text-xs";
  return (
    <div className={`bg-white ${compact ? "p-6" : "p-10"} font-sans text-gray-900 ${compact ? "text-[11px]" : "text-sm"} leading-relaxed`}>
      <div className="border-b-2 border-[#3B5BDB] pb-4 mb-5">
        <h1 className={`font-extrabold text-gray-900 ${compact ? "text-xl" : "text-3xl"} leading-tight`}>
          {resume.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-gray-500">
          {contactItems(resume).map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>

      {resume.summary && (
        <Section title="Professional Summary" className={`text-[#3B5BDB] ${heading}`}>
          <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
        </Section>
      )}

      {hasExperience(resume) && (
        <Section title="Work Experience" className={`text-[#3B5BDB] ${heading}`}>
          <div className="space-y-4">
            {resume.experience
              .filter((e) => e.title || e.company)
              .map((entry) => (
                <div key={entry.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold">{entry.title}</p>
                      <p className="text-gray-500">{entry.company}</p>
                    </div>
                    {entry.period && <p className="text-gray-400 shrink-0">{entry.period}</p>}
                  </div>
                  {entry.bullets && (
                    <div className="mt-2 text-gray-600 whitespace-pre-line pl-1">{entry.bullets}</div>
                  )}
                </div>
              ))}
          </div>
        </Section>
      )}

      {hasEducation(resume) && (
        <Section title="Education" className={`text-[#3B5BDB] ${heading}`}>
          <div className="space-y-2">
            {resume.education
              .filter((e) => e.degree || e.school)
              .map((entry) => (
                <div key={entry.id} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{entry.degree}</p>
                    <p className="text-gray-500">{entry.school}</p>
                  </div>
                  {entry.year && <p className="text-gray-400 shrink-0">{entry.year}</p>}
                </div>
              ))}
          </div>
        </Section>
      )}

      {resume.skills && (
        <Section title="Skills" className={`text-[#3B5BDB] ${heading}`} last>
          <p className="text-gray-700 whitespace-pre-line">{resume.skills}</p>
        </Section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Template 2 — Classic / ATS (plain, no colour)                       */
/* ------------------------------------------------------------------ */
function ClassicTemplate({ resume, compact }: { resume: ResumeData; compact?: boolean }) {
  const heading = compact ? "text-[10px]" : "text-[13px]";
  return (
    <div className={`bg-white ${compact ? "p-6" : "p-10"} font-serif text-black ${compact ? "text-[11px]" : "text-sm"} leading-relaxed`}>
      <div className="text-center border-b border-black pb-3 mb-5">
        <h1 className={`font-bold tracking-wide ${compact ? "text-lg" : "text-2xl"}`}>
          {(resume.fullName || "Your Name").toUpperCase()}
        </h1>
        <p className="mt-1.5 text-gray-800">{contactItems(resume).join("  •  ")}</p>
      </div>

      {resume.summary && (
        <ClassicSection title="Summary" heading={heading}>
          <p className="leading-relaxed">{resume.summary}</p>
        </ClassicSection>
      )}

      {hasExperience(resume) && (
        <ClassicSection title="Professional Experience" heading={heading}>
          <div className="space-y-3">
            {resume.experience
              .filter((e) => e.title || e.company)
              .map((entry) => (
                <div key={entry.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-bold">
                      {entry.title}
                      {entry.company ? `, ${entry.company}` : ""}
                    </p>
                    {entry.period && <p className="shrink-0 italic text-gray-700">{entry.period}</p>}
                  </div>
                  {entry.bullets && <div className="mt-1 whitespace-pre-line pl-1">{entry.bullets}</div>}
                </div>
              ))}
          </div>
        </ClassicSection>
      )}

      {hasEducation(resume) && (
        <ClassicSection title="Education" heading={heading}>
          <div className="space-y-1.5">
            {resume.education
              .filter((e) => e.degree || e.school)
              .map((entry) => (
                <div key={entry.id} className="flex items-baseline justify-between gap-4">
                  <p>
                    <span className="font-semibold">{entry.degree}</span>
                    {entry.school ? `, ${entry.school}` : ""}
                  </p>
                  {entry.year && <p className="shrink-0 italic text-gray-700">{entry.year}</p>}
                </div>
              ))}
          </div>
        </ClassicSection>
      )}

      {resume.skills && (
        <ClassicSection title="Skills" heading={heading} last>
          <p className="whitespace-pre-line">{resume.skills}</p>
        </ClassicSection>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Template 3 — Executive (serif, two-tone slate)                      */
/* ------------------------------------------------------------------ */
function ExecutiveTemplate({ resume, compact }: { resume: ResumeData; compact?: boolean }) {
  const heading = compact ? "text-[10px]" : "text-[13px]";
  return (
    <div className={`bg-white ${compact ? "p-6" : "p-10"} text-slate-800 ${compact ? "text-[11px]" : "text-sm"} leading-relaxed`}>
      <div className="mb-6">
        <h1 className={`font-serif font-bold text-slate-900 ${compact ? "text-2xl" : "text-4xl"} leading-none tracking-tight`}>
          {resume.fullName || "Your Name"}
        </h1>
        <div className="mt-3 h-1 w-16 bg-slate-800" />
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-slate-500">
          {contactItems(resume).map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>

      {resume.summary && (
        <ExecSection title="Profile" heading={heading}>
          <p className="leading-relaxed text-slate-700">{resume.summary}</p>
        </ExecSection>
      )}

      {hasExperience(resume) && (
        <ExecSection title="Experience" heading={heading}>
          <div className="space-y-4">
            {resume.experience
              .filter((e) => e.title || e.company)
              .map((entry) => (
                <div key={entry.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-serif font-bold text-slate-900">{entry.title}</p>
                    {entry.period && <p className="shrink-0 text-slate-400">{entry.period}</p>}
                  </div>
                  <p className="text-slate-500 italic">{entry.company}</p>
                  {entry.bullets && (
                    <div className="mt-2 text-slate-700 whitespace-pre-line pl-1">{entry.bullets}</div>
                  )}
                </div>
              ))}
          </div>
        </ExecSection>
      )}

      {hasEducation(resume) && (
        <ExecSection title="Education" heading={heading}>
          <div className="space-y-2">
            {resume.education
              .filter((e) => e.degree || e.school)
              .map((entry) => (
                <div key={entry.id} className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-serif font-semibold text-slate-900">{entry.degree}</p>
                    <p className="text-slate-500 italic">{entry.school}</p>
                  </div>
                  {entry.year && <p className="shrink-0 text-slate-400">{entry.year}</p>}
                </div>
              ))}
          </div>
        </ExecSection>
      )}

      {resume.skills && (
        <ExecSection title="Areas of Expertise" heading={heading} last>
          <p className="text-slate-700 whitespace-pre-line">{resume.skills}</p>
        </ExecSection>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Template 4 — Minimal (spacious, understated)                        */
/* ------------------------------------------------------------------ */
function MinimalTemplate({ resume, compact }: { resume: ResumeData; compact?: boolean }) {
  const heading = compact ? "text-[8px]" : "text-[10px]";
  return (
    <div className={`bg-white ${compact ? "p-6" : "p-12"} font-sans text-gray-800 ${compact ? "text-[11px]" : "text-sm"} leading-relaxed`}>
      <div className="mb-8">
        <h1 className={`font-light tracking-tight text-gray-900 ${compact ? "text-xl" : "text-3xl"}`}>
          {resume.fullName || "Your Name"}
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-gray-400">
          {contactItems(resume).map((c, i) => (
            <span key={c} className="flex items-center gap-3">
              {i > 0 && <span className="text-gray-300">/</span>}
              {c}
            </span>
          ))}
        </div>
      </div>

      {resume.summary && (
        <MinimalSection title="About" heading={heading}>
          <p className="leading-relaxed text-gray-600">{resume.summary}</p>
        </MinimalSection>
      )}

      {hasExperience(resume) && (
        <MinimalSection title="Experience" heading={heading}>
          <div className="space-y-5">
            {resume.experience
              .filter((e) => e.title || e.company)
              .map((entry) => (
                <div key={entry.id}>
                  <p className="font-medium text-gray-900">{entry.title}</p>
                  <div className="flex flex-wrap items-baseline gap-x-2 text-gray-400">
                    <span>{entry.company}</span>
                    {entry.period && <span className="text-gray-300">·</span>}
                    {entry.period && <span>{entry.period}</span>}
                  </div>
                  {entry.bullets && (
                    <div className="mt-2 text-gray-600 whitespace-pre-line">{entry.bullets}</div>
                  )}
                </div>
              ))}
          </div>
        </MinimalSection>
      )}

      {hasEducation(resume) && (
        <MinimalSection title="Education" heading={heading}>
          <div className="space-y-2">
            {resume.education
              .filter((e) => e.degree || e.school)
              .map((entry) => (
                <div key={entry.id}>
                  <p className="font-medium text-gray-900">{entry.degree}</p>
                  <p className="text-gray-400">
                    {entry.school}
                    {entry.year ? ` · ${entry.year}` : ""}
                  </p>
                </div>
              ))}
          </div>
        </MinimalSection>
      )}

      {resume.skills && (
        <MinimalSection title="Skills" heading={heading} last>
          <p className="text-gray-600 whitespace-pre-line">{resume.skills}</p>
        </MinimalSection>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Template 5 — Creative (accent sidebar)                              */
/* ------------------------------------------------------------------ */
function CreativeTemplate({ resume, compact }: { resume: ResumeData; compact?: boolean }) {
  const accent = "#312e81";
  const sideHeading = compact ? "text-[8px]" : "text-[10px]";
  const mainHeading = compact ? "text-[9px]" : "text-xs";
  return (
    <div className={`bg-white font-sans text-gray-900 ${compact ? "text-[11px]" : "text-sm"} leading-relaxed flex`}>
      {/* Sidebar */}
      <aside
        className={`${compact ? "p-5 w-[34%]" : "p-7 w-[32%]"} text-white shrink-0`}
        style={{ backgroundColor: accent }}
      >
        <h1 className={`font-extrabold leading-tight ${compact ? "text-lg" : "text-2xl"}`}>
          {resume.fullName || "Your Name"}
        </h1>

        <div className="mt-6 space-y-4">
          <div>
            <p className={`font-bold uppercase tracking-widest text-white/60 mb-2 ${sideHeading}`}>Contact</p>
            <div className="space-y-1 text-white/90 break-words">
              {contactItems(resume).map((c) => (
                <p key={c}>{c}</p>
              ))}
            </div>
          </div>

          {resume.skills && (
            <div>
              <p className={`font-bold uppercase tracking-widest text-white/60 mb-2 ${sideHeading}`}>Skills</p>
              <p className="text-white/90 whitespace-pre-line">{resume.skills}</p>
            </div>
          )}

          {hasEducation(resume) && (
            <div>
              <p className={`font-bold uppercase tracking-widest text-white/60 mb-2 ${sideHeading}`}>Education</p>
              <div className="space-y-2">
                {resume.education
                  .filter((e) => e.degree || e.school)
                  .map((entry) => (
                    <div key={entry.id}>
                      <p className="font-semibold text-white">{entry.degree}</p>
                      <p className="text-white/80">{entry.school}</p>
                      {entry.year && <p className="text-white/60">{entry.year}</p>}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className={`${compact ? "p-5" : "p-8"} flex-1`}>
        {resume.summary && (
          <section className="mb-5">
            <h2 className={`font-bold uppercase tracking-wider mb-2 ${mainHeading}`} style={{ color: accent }}>
              Profile
            </h2>
            <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
          </section>
        )}

        {hasExperience(resume) && (
          <section>
            <h2 className={`font-bold uppercase tracking-wider mb-3 ${mainHeading}`} style={{ color: accent }}>
              Experience
            </h2>
            <div className="space-y-4">
              {resume.experience
                .filter((e) => e.title || e.company)
                .map((entry) => (
                  <div key={entry.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold">{entry.title}</p>
                        <p className="text-gray-500">{entry.company}</p>
                      </div>
                      {entry.period && <p className="text-gray-400 shrink-0">{entry.period}</p>}
                    </div>
                    {entry.bullets && (
                      <div className="mt-2 text-gray-600 whitespace-pre-line pl-1">{entry.bullets}</div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small section primitives                                             */
/* ------------------------------------------------------------------ */
function Section({
  title,
  className,
  children,
  last,
}: {
  title: string;
  className?: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section className={last ? "" : "mb-5"}>
      <h2 className={`font-bold uppercase tracking-wider mb-2 ${className ?? ""}`}>{title}</h2>
      {children}
    </section>
  );
}

function ClassicSection({ title, heading, children, last }: { title: string; heading: string; children: ReactNode; last?: boolean }) {
  return (
    <section className={last ? "" : "mb-4"}>
      <h2 className={`font-bold uppercase tracking-wide border-b border-gray-400 pb-1 mb-2 ${heading}`}>{title}</h2>
      {children}
    </section>
  );
}

function ExecSection({ title, heading, children, last }: { title: string; heading: string; children: ReactNode; last?: boolean }) {
  return (
    <section className={last ? "" : "mb-5"}>
      <h2 className={`font-serif font-bold uppercase tracking-[0.2em] text-slate-900 mb-3 ${heading}`}>{title}</h2>
      {children}
    </section>
  );
}

function MinimalSection({ title, heading, children, last }: { title: string; heading: string; children: ReactNode; last?: boolean }) {
  return (
    <section className={last ? "" : "mb-7"}>
      <h2 className={`font-semibold uppercase tracking-[0.25em] text-gray-400 mb-3 ${heading}`}>{title}</h2>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Dispatcher                                                           */
/* ------------------------------------------------------------------ */
export function ResumePreview({
  resume,
  template = "modern",
  compact,
}: {
  resume: ResumeData;
  template?: TemplateId;
  compact?: boolean;
}) {
  switch (template) {
    case "classic":
      return <ClassicTemplate resume={resume} compact={compact} />;
    case "executive":
      return <ExecutiveTemplate resume={resume} compact={compact} />;
    case "minimal":
      return <MinimalTemplate resume={resume} compact={compact} />;
    case "creative":
      return <CreativeTemplate resume={resume} compact={compact} />;
    case "modern":
    default:
      return <ModernTemplate resume={resume} compact={compact} />;
  }
}

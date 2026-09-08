"use client";

import { ResumeBuilder } from "@/components/dashboard/resume-builder";

// TEMP debug route to reproduce the resume wizard crash. Remove after fixing.
export default function DebugCvPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ResumeBuilder profile={{ full_name: "Test User", email: "test@example.com" }} />
    </div>
  );
}

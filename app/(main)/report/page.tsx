"use client";

import { ReportViewer } from "@/components/report/report-viewer";

export default function ReportPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="max-w-2xl mx-auto w-full">
        <ReportViewer />
      </div>
    </div>
  );
}

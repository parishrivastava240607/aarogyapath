"use client";

import dynamic from "next/dynamic";

export const DynamicResultsMap = dynamic(
  () => import("@/components/results-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-card border border-border bg-surfaceGrey">
        <span className="text-xs font-semibold text-muted">Loading map...</span>
      </div>
    ),
  }
);

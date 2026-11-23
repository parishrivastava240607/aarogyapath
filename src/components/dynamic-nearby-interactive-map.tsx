"use client";

import dynamic from "next/dynamic";

export const DynamicNearbyInteractiveMap = dynamic(
  () => import("@/components/nearby-interactive-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[450px] w-full items-center justify-center rounded-card border border-border bg-surfaceGrey">
        <span className="text-xs font-semibold text-muted">Loading map...</span>
      </div>
    ),
  }
);

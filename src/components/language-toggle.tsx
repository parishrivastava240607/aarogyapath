"use client";

import React from "react";
import { useLocaleSwitcher } from "./locale-provider";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export function LanguageToggle({ className, size = "md" }: LanguageToggleProps) {
  const { locale, toggleLocale, isPending } = useLocaleSwitcher();

  const isHindi = locale === "hi";

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      aria-label="Switch Language / भाषा बदलें"
      title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full border border-border bg-white text-text transition-all duration-200 hover:border-primary hover:text-primary active:scale-95 disabled:opacity-50",
        size === "md" ? "h-10 min-w-10 px-3 text-sm font-semibold" : "h-9 min-w-9 px-2.5 text-xs font-semibold",
        className
      )}
    >
      <span className={cn("transition-colors", isHindi ? "text-primary font-bold" : "text-muted")}>
        हि
      </span>
      <span className="mx-1 text-border">/</span>
      <span className={cn("transition-colors", !isHindi ? "text-primary font-bold" : "text-muted")}>
        EN
      </span>
    </button>
  );
}

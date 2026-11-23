"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { PhoneCall, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SosButton() {
  const t = useTranslations("common");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Floating SOS button bottom-right on all layouts, above mobile nav */}
      <div className="fixed bottom-20 right-4 z-40 md:bottom-8 md:right-8">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label={t("sos")}
          className={cn(
            "group flex h-14 w-14 md:h-16 md:w-16 flex-col items-center justify-center rounded-full bg-sos text-white shadow-sos transition-all duration-300",
            "hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sos/30"
          )}
        >
          <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 transition-transform group-hover:rotate-6" />
          <span className="text-[10px] md:text-xs font-black tracking-wider uppercase">
            {t("sos")}
          </span>
        </button>
      </div>

      {/* Emergency Quick Modal preview for Phase 1 verification */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-card border border-border bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-sos">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-lg font-bold">{t("sos")} {t("sosSubtext")}</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full p-1 text-muted hover:bg-surfaceGrey"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm text-muted">
              Immediate emergency assistance helpline:
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              <a
                href="tel:108"
                className="flex items-center justify-center gap-2 rounded-xl bg-sos py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call Ambulance (108)</span>
              </a>
              <a
                href="tel:112"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-semibold text-text hover:bg-surfaceGrey"
              >
                <PhoneCall className="h-4 w-4 text-primary" />
                <span>Call Emergency Police (112)</span>
              </a>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 w-full text-center text-xs text-muted hover:underline"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

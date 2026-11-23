"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Building2,
  Phone,
  Navigation,
  Shield,
  Activity,
  HeartPulse,
} from "lucide-react";
import { Hospital } from "@/types/hospital";

interface HospitalCardProps {
  hospital: Hospital & { distance?: number };
  isSelectedForCompare?: boolean;
  onToggleCompare?: () => void;
}

export function HospitalCard({
  hospital,
  isSelectedForCompare,
  onToggleCompare,
}: HospitalCardProps) {
  const t = useTranslations("home");
  const tSearch = useTranslations("search");

  // Determine pastel background based on hospital id/specialty
  const pastelBgs = [
    "bg-pastel-pink",
    "bg-pastel-blue",
    "bg-pastel-mint",
    "bg-pastel-purple",
    "bg-pastel-peach",
  ];
  const charCode = hospital.name.charCodeAt(0) || 0;
  const bgClass = pastelBgs[charCode % pastelBgs.length];

  return (
    <div className="group flex flex-col justify-between rounded-card border border-border bg-white p-4 shadow-card transition-all hover:border-primary/50 hover:shadow-md">
      <div>
        {/* Top Illustration Area with Rounded Rectangle + Type & Ayushman Badges */}
        <div
          className={`relative flex h-32 w-full items-center justify-center rounded-xl ${bgClass} mb-3.5 transition-transform group-hover:scale-[1.01]`}
        >
          <Building2 className="h-12 w-12 text-text/30" />

          {/* Badges in top corners */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                hospital.type === "govt"
                  ? "bg-success text-white"
                  : "bg-white/95 text-text-heading shadow-xs"
              }`}
            >
              {hospital.type === "govt"
                ? t("hospitalBadgeGovt")
                : t("hospitalBadgePrivate")}
            </span>

            {hospital.ayushman && (
              <span className="flex items-center gap-0.5 rounded-full bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                <Shield className="h-2.5 w-2.5" />
                <span>Ayushman</span>
              </span>
            )}
          </div>

          {/* Compare checkbox top-right if onToggleCompare provided */}
          {onToggleCompare && (
            <button
              type="button"
              onClick={onToggleCompare}
              className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
                isSelectedForCompare
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white/95 text-text hover:border-primary"
              }`}
            >
              {isSelectedForCompare ? "✓ Compared" : "+ Compare"}
            </button>
          )}
        </div>

        {/* Bold Hospital Name & Link to detail */}
        <Link href={`/hospital/${hospital.id}`}>
          <h3 className="text-base font-bold leading-tight text-text-heading group-hover:text-primary transition-colors">
            {hospital.name}
          </h3>
        </Link>

        {/* Specialties muted line */}
        <p className="mt-1 text-xs text-muted line-clamp-1">
          {hospital.specialties.join(", ")}
        </p>

        {/* Compact info row: distance, Emergency, ICU indicators */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-text">
          <span className="font-bold text-text-heading">
            {hospital.distance !== undefined ? `${hospital.distance} km` : "Indore"}
          </span>
          <span className="text-border">•</span>

          {hospital.emergency_247 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-pastel-mint px-2 py-0.5 text-[10px] font-bold text-[#1F5C40]">
              <HeartPulse className="h-3 w-3" />
              <span>{t("emergency247")}</span>
            </span>
          )}

          {hospital.icu_beds > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-pastel-blue px-2 py-0.5 text-[10px] font-bold text-[#1E4E8C]">
              <Activity className="h-3 w-3" />
              <span>ICU ({hospital.icu_beds})</span>
            </span>
          )}
        </div>

        {/* Bold Total Beds figure + approximate label */}
        <div className="mt-2 text-xs">
          <span className="text-base font-extrabold text-text-heading">
            {hospital.total_beds}
          </span>{" "}
          <span className="text-muted">{t("bedsApprox")}</span>
        </div>
      </div>

      {/* Action Buttons: Call & Directions + View Detail */}
      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <a
          href={`tel:${hospital.phone}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-white py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-pastel-peach/30"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>{t("call")}</span>
        </a>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(hospital.name + " " + hospital.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-white py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-pastel-peach/30"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>{t("directions")}</span>
        </a>
        <Link
          href={`/hospital/${hospital.id}`}
          className="rounded-xl border border-border bg-surfaceGrey/70 px-3 py-2 text-xs font-semibold text-text hover:bg-surfaceGrey"
        >
          {tSearch("viewDetails")}
        </Link>
      </div>
    </div>
  );
}

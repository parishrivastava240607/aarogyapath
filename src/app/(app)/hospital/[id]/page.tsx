import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  Building2,
  Phone,
  Navigation,
  Shield,
  MapPin,
  Clock,
  Check,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { Hospital } from "@/types/hospital";
import hospitalsData from "@/data/hospitals.json";
import { DynamicResultsMap } from "@/components/dynamic-results-map";

export default async function HospitalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations("hospital");
  const tHome = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const hospitals = hospitalsData as Hospital[];
  const hospital = hospitals.find((h) => h.id === params.id);

  if (!hospital) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 sm:py-6">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{t("backToSearch")}</span>
        </Link>
      </div>

      {/* Responsive Two Columns Layout: Info and beds on left, map on right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Hospital Info, Beds Breakdown, Facilities */}
        <div className="space-y-6 lg:col-span-7">
          {/* Hero Card */}
          <div className="rounded-card border border-border bg-white p-6 shadow-card">
            {/* Top Tag & Illustration Bar */}
            <div className="relative mb-5 flex h-40 w-full items-center justify-center rounded-2xl bg-pastel-blue">
              <Building2 className="h-16 w-16 text-text/25" />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    hospital.type === "govt"
                      ? "bg-success text-white"
                      : "bg-white/95 text-text-heading shadow-xs"
                  }`}
                >
                  {hospital.type === "govt"
                    ? tHome("hospitalBadgeGovt")
                    : tHome("hospitalBadgePrivate")}
                </span>
                {hospital.ayushman && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                    <Shield className="h-3 w-3" />
                    <span>Ayushman Bharat Accepted</span>
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-xl font-bold text-text-heading sm:text-2xl">
              {hospital.name}
            </h1>

            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
              <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{hospital.address}</span>
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {t("lastUpdated")}: {hospital.updated_at}
              </span>
            </div>

            {/* Quick Action CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <a
                href={`tel:${hospital.phone}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-card hover:opacity-95"
              >
                <Phone className="h-4 w-4" />
                <span>
                  {tHome("call")} ({hospital.phone})
                </span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  hospital.name + " " + hospital.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-semibold text-primary hover:border-primary hover:bg-pastel-peach/30"
              >
                <Navigation className="h-4 w-4" />
                <span>{tHome("directions")}</span>
              </a>
            </div>
          </div>

          {/* Bed Breakdown Card (PRD F4: general, ICU, oxygen) */}
          <div className="rounded-card border border-border bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-text-heading">
                {t("bedBreakdown")}
              </h2>
              <span className="rounded-full bg-surfaceGrey px-2.5 py-0.5 text-[11px] font-medium text-muted">
                {t("approximateNotice")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/80 bg-surfaceGrey/40 p-3.5 text-center">
                <span className="text-2xl font-black text-text-heading">
                  {hospital.total_beds}
                </span>
                <p className="mt-1 text-[11px] font-semibold text-muted">
                  {t("totalBeds")}
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-pastel-blue/30 p-3.5 text-center">
                <span className="text-2xl font-black text-[#1E4E8C]">
                  {hospital.icu_beds}
                </span>
                <p className="mt-1 text-[11px] font-semibold text-muted">
                  {t("icuBeds")}
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-pastel-mint/40 p-3.5 text-center">
                <span className="text-2xl font-black text-[#1F5C40]">
                  {hospital.oxygen_beds}
                </span>
                <p className="mt-1 text-[11px] font-semibold text-muted">
                  {t("oxygenBeds")}
                </p>
              </div>
            </div>
          </div>

          {/* Specialties List */}
          <div className="rounded-card border border-border bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-text-heading mb-3">
              {t("specialtiesDepartments")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {hospital.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="rounded-pill bg-pastel-peach/60 px-3 py-1.5 text-xs font-semibold text-text-heading"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Facilities Grid */}
          <div className="rounded-card border border-border bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-text-heading mb-4">
              {t("facilitiesServices")}
            </h2>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {hospital.facilities.map((fac, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl bg-surfaceGrey/40 px-3.5 py-2.5 text-xs font-semibold text-text"
                >
                  <Check className="h-4 w-4 text-success shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Leaflet Map */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-card border border-border bg-white p-4 shadow-card">
              <h3 className="text-sm font-bold text-text-heading mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Hospital Location & Map</span>
              </h3>
              <DynamicResultsMap
                hospitals={[hospital]}
                userLat={hospital.lat}
                userLng={hospital.lng}
                className="h-[420px] w-full rounded-xl overflow-hidden"
              />
            </div>

            {/* Helpline Notice */}
            <div className="rounded-card border border-border/80 bg-pastel-peach/40 p-4 text-xs text-muted">
              <p className="font-medium text-text leading-relaxed">
                Emergency tip: In case of acute heart attack, trauma, or stroke, call{" "}
                <span className="font-bold text-sos">108</span> or use the floating{" "}
                <span className="font-bold text-sos">{tCommon("sos")}</span> button.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

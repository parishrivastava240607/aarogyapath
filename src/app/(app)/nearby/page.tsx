"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Building2,
  Pill,
  MapPin,
  Phone,
  Navigation,
  Clock,
  Compass,
  Map,
  List,
} from "lucide-react";
import { DynamicNearbyInteractiveMap } from "@/components/dynamic-nearby-interactive-map";
import { NearbyMapItem } from "@/components/nearby-interactive-map";
import Link from "next/link";

export default function NearbyPage() {
  const t = useTranslations("nearby");
  const tHome = useTranslations("home");
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") === "pharmacy" ? "pharmacy" : "hospital";
  const [activeTab, setActiveTab] = useState<"hospital" | "pharmacy">(initialTab);
  const [radius, setRadius] = useState<number>(5); // default 5 km
  const [showMapMobile, setShowMapMobile] = useState<boolean>(false);

  const [items, setItems] = useState<NearbyMapItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // User location defaults (Indore central)
  const userLat = 22.7196;
  const userLng = 75.8577;

  const fetchNearby = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/nearby?type=${activeTab}&lat=${userLat}&lng=${userLng}&radius=${radius}`
      );
      const json = await res.json();
      if (json.success && json.items) {
        const formatted: NearbyMapItem[] = json.items.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (it: any) => ({
            id: it.id,
            name: it.name,
            address: it.address,
            lat: it.lat,
            lng: it.lng,
            phone: it.phone,
            distance: it.distance,
            type: it.type,
            open_24x7: it.open_24x7,
            total_beds: it.total_beds,
            itemType: activeTab,
          })
        );
        setItems(formatted);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, radius]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 sm:py-6">
      {/* Title & Subtitle */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-heading sm:text-2xl">
            {t("title")}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-muted">
            {t("subtitle")}
          </p>
        </div>

        {/* Mobile Map / List Toggle (<768px only) */}
        <button
          type="button"
          onClick={() => setShowMapMobile(!showMapMobile)}
          className="flex items-center gap-1.5 self-start rounded-pill border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-text md:hidden"
        >
          {showMapMobile ? <List className="h-4 w-4 text-primary" /> : <Map className="h-4 w-4 text-primary" />}
          <span>{showMapMobile ? t("showList") : t("showMap")}</span>
        </button>
      </div>

      {/* Controls Bar: Segmented Pill Selector (Hospitals / Medical Shops) + Radius Chips (1, 3, 5, 10 km) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-white p-3 shadow-card">
        {/* Segmented Pill Selector */}
        <div className="inline-flex rounded-pill border border-border bg-surfaceGrey/80 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("hospital")}
            className={`flex items-center gap-1.5 rounded-pill px-4 py-2 transition-all ${
              activeTab === "hospital"
                ? "bg-white text-primary shadow-xs font-extrabold"
                : "text-muted hover:text-text"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{t("tabHospitals")}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pharmacy")}
            className={`flex items-center gap-1.5 rounded-pill px-4 py-2 transition-all ${
              activeTab === "pharmacy"
                ? "bg-white text-primary shadow-xs font-extrabold"
                : "text-muted hover:text-text"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            <span>{t("tabPharmacies")}</span>
          </button>
        </div>

        {/* Radius Chips: 1, 3, 5, 10 km */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Compass className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">{t("radiusLabel")}:</span>
          {[1, 3, 5, 10].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadius(r)}
              className={`rounded-pill border px-3 py-1 text-xs transition-all ${
                radius === r
                  ? "border-primary bg-pastel-peach text-primary font-bold shadow-xs"
                  : "border-border bg-white text-text hover:border-primary/40"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Two-Column Layout:
          - Desktop (>=768px): Cards on the left (scrollable), Sticky Map on the right with marker-to-card highlighting.
          - Mobile (<768px): Single column, toggles between Cards and Full Map.
      */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column: Place Cards */}
        <div
          className={`space-y-4 md:col-span-7 lg:col-span-6 ${
            showMapMobile ? "hidden md:block" : "block"
          }`}
        >
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-36 animate-pulse rounded-card border border-border bg-surfaceGrey" />
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border p-12 text-center">
              <Pill className="h-10 w-10 text-muted" />
              <h3 className="mt-3 text-sm font-bold text-text-heading">{t("noPlaces")}</h3>
              <p className="mt-1 text-xs text-muted">{t("noPlacesDesc")}</p>
            </div>
          )}

          {!loading &&
            items.map((it) => {
              const isSelected = selectedId === it.id;
              return (
                <div
                  key={it.id}
                  onClick={() => setSelectedId(it.id)}
                  className={`group rounded-card border p-4 shadow-card transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-pastel-peach/30 ring-2 ring-primary/20"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            it.itemType === "hospital"
                              ? it.type === "govt"
                                ? "bg-success text-white"
                                : "bg-surfaceGrey text-text-heading"
                              : it.open_24x7
                              ? "bg-pastel-mint text-[#1F5C40]"
                              : "bg-surfaceGrey text-muted"
                          }`}
                        >
                          {it.itemType === "hospital"
                            ? it.type === "govt"
                              ? tHome("hospitalBadgeGovt")
                              : tHome("hospitalBadgePrivate")
                            : it.open_24x7
                            ? t("open247")
                            : t("openNow")}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {it.distance !== undefined ? `${it.distance} km away` : ""}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-sm font-bold text-text-heading group-hover:text-primary transition-colors">
                        {it.name}
                      </h3>
                      <p className="mt-0.5 flex items-start gap-1 text-xs text-muted">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{it.address}</span>
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pastel-blue text-primary">
                      {it.itemType === "hospital" ? (
                        <Building2 className="h-5 w-5" />
                      ) : (
                        <Pill className="h-5 w-5 text-[#226F54]" />
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{it.open_24x7 ? "24x7 Open" : "Standard Hours"}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${it.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-primary hover:border-primary hover:bg-pastel-peach/30"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{t("call")}</span>
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          it.name + " " + it.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:border-primary hover:bg-pastel-peach/30"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>{t("directions")}</span>
                      </a>
                      {it.itemType === "hospital" && (
                        <Link
                          href={`/hospital/${it.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-xl bg-surfaceGrey px-3 py-1.5 text-xs font-semibold text-text hover:bg-border"
                        >
                          Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Right Column: Sticky Interactive Leaflet Map (Desktop) / Full Map (Mobile) */}
        <div
          className={`md:col-span-5 lg:col-span-6 ${
            showMapMobile ? "block" : "hidden md:block"
          }`}
        >
          <div className="md:sticky md:top-24">
            <DynamicNearbyInteractiveMap
              items={items}
              userLat={userLat}
              userLng={userLng}
              selectedId={selectedId}
              onSelectItem={(id) => setSelectedId(id)}
              className="h-[520px] w-full rounded-card overflow-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

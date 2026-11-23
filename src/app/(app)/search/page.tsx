"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  SlidersHorizontal,
  Map,
  List,
  Sparkles,
  RefreshCw,
  Building2,
  X,
} from "lucide-react";
import { Hospital, DiseaseSpecialty } from "@/types/hospital";
import { HospitalCard } from "@/components/hospital-card";
import { DynamicResultsMap } from "@/components/dynamic-results-map";
import diseaseSpecialtyMap from "@/data/disease-specialty-map.json";

export default function SearchPage() {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeSpecialty, setActiveSpecialty] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "govt" | "private">("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [icuOnly, setIcuOnly] = useState(false);
  const [ayushmanOnly, setAyushmanOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "beds" | "rating">("distance");
  const [showMapMobile, setShowMapMobile] = useState(false);

  // Results state
  const [hospitals, setHospitals] = useState<(Hospital & { distance: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospId, setSelectedHospId] = useState<string | null>(null);

  // Compare selection (up to 3)
  const [compareList, setCompareList] = useState<string[]>([]);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<DiseaseSpecialty[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle typing & suggestions
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      const lower = val.toLowerCase();
      const filtered = (diseaseSpecialtyMap as DiseaseSpecialty[]).filter(
        (d) =>
          d.name_en.toLowerCase().includes(lower) ||
          d.name_hi.includes(lower) ||
          d.aliases.some((a) => a.toLowerCase().includes(lower))
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (s: DiseaseSpecialty) => {
    setQuery(s.name_en);
    setShowSuggestions(false);
    fetchResults(s.name_en);
  };

  const fetchResults = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (emergencyOnly) params.set("emergencyOnly", "true");
      if (icuOnly) params.set("icuOnly", "true");
      if (ayushmanOnly) params.set("ayushmanOnly", "true");
      params.set("sortBy", sortBy);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch hospitals");
      }

      setHospitals(data.hospitals || []);
      setActiveSpecialty(data.matchedSpecialty || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching results";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, emergencyOnly, icuOnly, ayushmanOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    });
    fetchResults(query);
  };

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter((item) => item !== id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 hospitals at a time.");
        return;
      }
      setCompareList([...compareList, id]);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 sm:py-6">
      {/* Prominent Pill-shaped Search Bar with Live Suggestions */}
      <div className="relative mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => query.length > 1 && setShowSuggestions(true)}
              placeholder={tCommon("searchPlaceholder")}
              className="w-full rounded-search border border-border bg-white py-3.5 pl-5 pr-12 text-sm text-text placeholder:text-muted shadow-card focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-3 rounded-full bg-primary p-2 text-white shadow-xs transition-transform hover:scale-105 active:scale-95"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Suggestion Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-card border border-border bg-white shadow-xl">
            <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-muted">
              Suggested conditions & specialties
            </div>
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSuggestion(s)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-surfaceGrey transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-text-heading">{s.name_en}</span>
                  <span className="text-muted">({s.name_hi})</span>
                </div>
                <span className="rounded-full bg-pastel-peach px-2 py-0.5 text-[10px] font-bold text-primary">
                  {s.specialty}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Row & Chips */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Govt / Private Pill Segmented Selector */}
          <div className="inline-flex rounded-pill border border-border bg-surfaceGrey/70 p-0.5 text-xs font-semibold">
            {(["all", "govt", "private"] as const).map((tVal) => (
              <button
                key={tVal}
                type="button"
                onClick={() => setTypeFilter(tVal)}
                className={`rounded-pill px-3 py-1.5 transition-all ${
                  typeFilter === tVal
                    ? "bg-white text-primary shadow-xs font-bold"
                    : "text-muted hover:text-text"
                }`}
              >
                {tVal === "all" ? t("filterAll") : tVal === "govt" ? t("filterGovt") : t("filterPrivate")}
              </button>
            ))}
          </div>

          {/* Quick Filter Chips */}
          <button
            type="button"
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`rounded-pill border px-3 py-1.5 text-xs font-semibold transition-all ${
              emergencyOnly
                ? "border-primary bg-pastel-mint text-[#1F5C40] font-bold"
                : "border-border bg-white text-text hover:border-primary/50"
            }`}
          >
            {t("filterEmergency")}
          </button>

          <button
            type="button"
            onClick={() => setIcuOnly(!icuOnly)}
            className={`rounded-pill border px-3 py-1.5 text-xs font-semibold transition-all ${
              icuOnly
                ? "border-primary bg-pastel-blue text-[#1E4E8C] font-bold"
                : "border-border bg-white text-text hover:border-primary/50"
            }`}
          >
            {t("filterIcu")}
          </button>

          <button
            type="button"
            onClick={() => setAyushmanOnly(!ayushmanOnly)}
            className={`rounded-pill border px-3 py-1.5 text-xs font-semibold transition-all ${
              ayushmanOnly
                ? "border-primary bg-pastel-peach text-primary font-bold"
                : "border-border bg-white text-text hover:border-primary/50"
            }`}
          >
            {t("filterAyushman")}
          </button>
        </div>

        {/* Right Controls: Sort selector & Mobile Map/List toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "distance" | "beds" | "rating")}
              className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold text-text focus:outline-none"
            >
              <option value="distance">{t("sortDistance")}</option>
              <option value="beds">{t("sortBeds")}</option>
              <option value="rating">{t("sortRating")}</option>
            </select>
          </div>

          {/* Mobile List/Map toggle (<768px only) */}
          <button
            type="button"
            onClick={() => setShowMapMobile(!showMapMobile)}
            className="flex items-center gap-1 rounded-pill border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text md:hidden"
          >
            {showMapMobile ? <List className="h-3.5 w-3.5 text-primary" /> : <Map className="h-3.5 w-3.5 text-primary" />}
            <span>{showMapMobile ? t("showList") : t("showMap")}</span>
          </button>
        </div>
      </div>

      {/* Matched Specialty Banner if any */}
      {activeSpecialty && (
        <div className="mb-5 flex items-center justify-between rounded-card border border-primary/20 bg-pastel-peach/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted">{t("treatmentFound")}:</span>
            <span className="text-xs font-bold text-primary">{activeSpecialty}</span>
          </div>
          <span className="text-xs font-medium text-muted">
            {hospitals.length} {t("hospitalsFound")}
          </span>
        </div>
      )}

      {/* Main Responsive Layout:
          - Desktop (>=768px): Two-column split. Cards on left (scrollable/grid), Sticky Leaflet map on right.
          - Mobile (<768px): Single column, toggles between Cards and Map.
      */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column: Hospital Cards */}
        <div className={`md:col-span-7 lg:col-span-7 ${showMapMobile ? "hidden md:block" : "block"}`}>
          {/* Skeleton loading state */}
          {loading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-72 animate-pulse rounded-card border border-border bg-surfaceGrey" />
              ))}
            </div>
          )}

          {/* Error State with Retry */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center rounded-card border border-red-200 bg-red-50/50 p-8 text-center">
              <p className="text-sm font-semibold text-sos">{error}</p>
              <button
                type="button"
                onClick={() => fetchResults(query)}
                className="mt-3 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t("retry")}</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && hospitals.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border p-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-pink text-primary">
                <Building2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-base font-bold text-text-heading">{t("noHospitalsFound")}</h3>
              <p className="mt-1 text-xs text-muted max-w-sm">
                {t("noHospitalsDesc")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                  setEmergencyOnly(false);
                  setIcuOnly(false);
                  setAyushmanOnly(false);
                  fetchResults("");
                }}
                className="mt-4 rounded-xl border border-border bg-white px-4 py-2 text-xs font-semibold text-primary hover:border-primary"
              >
                {t("clearFilters")}
              </button>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && hospitals.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hospitals.map((hosp) => (
                <HospitalCard
                  key={hosp.id}
                  hospital={hosp}
                  isSelectedForCompare={compareList.includes(hosp.id)}
                  onToggleCompare={() => toggleCompare(hosp.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Leaflet Map (Desktop) / Full Map (Mobile when toggled) */}
        <div
          className={`md:col-span-5 lg:col-span-5 ${
            showMapMobile ? "block" : "hidden md:block"
          }`}
        >
          <div className="md:sticky md:top-24">
            <DynamicResultsMap
              hospitals={hospitals}
              selectedHospitalId={selectedHospId}
              onSelectHospital={(id) => setSelectedHospId(id)}
              className="h-[520px] w-full rounded-card overflow-hidden"
            />
          </div>
        </div>
      </div>

      {/* Compare Tray Floating Bar (PRD F9) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-xl rounded-2xl border border-border bg-white p-3.5 shadow-2xl animate-in slide-in-from-bottom md:bottom-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pastel-peach text-xs font-bold text-primary">
                {compareList.length}
              </span>
              <span className="text-xs font-bold text-text-heading">
                Hospitals selected to compare (max 3)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompareList([])}
                className="p-1 text-muted hover:text-text"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/compare?ids=${compareList.join(",")}`);
                }}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
              >
                Compare now →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  Stethoscope,
  Building2,
  Pill,
  Sparkles,
  ArrowRight,
  Phone,
  Navigation,
  HeartPulse,
} from "lucide-react";
import { WeatherBanner } from "@/components/weather-banner";
import { LocationRow, SUPPORTED_CITIES } from "@/components/location-row";
import hospitalsData from "@/data/hospitals.json";
import { Hospital } from "@/types/hospital";

export default function HomePage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [currentCity, setCurrentCity] = useState("Indore");
  const [coords, setCoords] = useState({ lat: 22.7196, lng: 75.8577 });
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSpecialty, setUserSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Determine greeting by time of day
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    // 1. Check user profile — redirect to onboarding if missing
    const cachedUser = localStorage.getItem("aarogyapath_demo_user");
    if (!cachedUser) {
      router.replace("/onboarding");
      return;
    }
    try {
      const u = JSON.parse(cachedUser);
      if (!u.name || !u.onboarded) {
        router.replace("/onboarding");
        return;
      }
      // Skip honorific prefixes (Dr., Prof., Mr., Mrs., Ms., Smt., Shri.)
      const HONORIFICS = new Set(["dr.", "prof.", "mr.", "mrs.", "ms.", "smt.", "shri.", "er."]);
      const parts = u.name.trim().split(/\s+/);
      const firstName = HONORIFICS.has(parts[0]?.toLowerCase()) ? (parts[1] || parts[0]) : parts[0];
      setUserName(firstName);
      setUserRole(u.role || null);
      setUserSpecialty(u.specialty || null);
      if (u.city) {
        setCurrentCity(u.city);
        const found = SUPPORTED_CITIES.find(
          (c) => c.name.toLowerCase() === u.city.toLowerCase()
        );
        if (found) setCoords({ lat: found.lat, lng: found.lng });
      }
    } catch {
      router.replace("/onboarding");
      return;
    }
    setIsLoading(false);

    // 2. Greeting by current hour
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(t("greeting"));
    } else if (hour < 17) {
      setGreeting(t("greetingAfternoon"));
    } else {
      setGreeting(t("greetingEvening"));
    }
  }, [t, router]);

  const handleCityChange = (c: { name: string; lat: number; lng: number }) => {
    setCurrentCity(c.name);
    setCoords({ lat: c.lat, lng: c.lng });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const categories = [
    {
      title: t("categories.searchDisease"),
      sub: t("categories.searchDiseaseSub"),
      icon: Stethoscope,
      bg: "bg-pastel-pink",
      textCol: "text-[#B33951]",
      href: "/search",
    },
    {
      title: t("categories.nearbyHospitals"),
      sub: t("categories.nearbyHospitalsSub"),
      icon: Building2,
      bg: "bg-pastel-blue",
      textCol: "text-[#2B6CB0]",
      href: "/nearby",
    },
    {
      title: t("categories.medicalShops"),
      sub: t("categories.medicalShopsSub"),
      icon: Pill,
      bg: "bg-pastel-mint",
      textCol: "text-[#226F54]",
      href: "/nearby?tab=pharmacy",
    },
    {
      title: t("categories.askAi"),
      sub: t("categories.askAiSub"),
      icon: Sparkles,
      bg: "bg-pastel-purple",
      textCol: "text-[#6B46C1]",
      href: "/chat",
    },
  ];

  const featuredHospitals = (hospitalsData as Hospital[]).slice(0, 3);

  // Don't render until we've checked for user profile (avoids flash before redirect)
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted">
          <HeartPulse className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-sm font-medium">Loading your health dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 sm:py-6">
      {/* Mobile Location Row and Large Pill Search Bar (<1024px) */}
      <div className="mb-5 lg:hidden">
        <div className="mb-3">
          <LocationRow currentCity={currentCity} onCityChange={handleCityChange} />
        </div>

        {/* Pill Search Bar on Mobile */}
        <form onSubmit={handleSearchSubmit}>
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tCommon("searchPlaceholder")}
              className="w-full rounded-search border border-border bg-surfaceGrey/70 py-3.5 pl-5 pr-12 text-sm text-text placeholder:text-muted shadow-card focus:border-primary focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary p-2 text-white shadow-xs"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Greeting and Welcome */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-text-heading sm:text-2xl">
              {greeting}, {isLoading ? "…" : userName} 👋
            </h1>
            {!isLoading && userRole && userRole !== "citizen" && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                userRole === "doctor"
                  ? "bg-pastel-pink text-[#B33951]"
                  : userRole === "nurse"
                  ? "bg-pastel-mint text-[#226F54]"
                  : "bg-pastel-purple text-[#6B46C1]"
              }`}>
                {userRole === "doctor" ? "Doctor" : userRole === "nurse" ? "Nurse" : "Med. Student"}
                {userSpecialty ? ` · ${userSpecialty}` : ""}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs sm:text-sm text-muted">
            {tCommon("tagline")}
          </p>
        </div>
      </div>

      {/* Responsive Section: Weather Banner + 4 Pastel Category Tiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
        {/* Weather & AQI Banner (Left 5 cols on desktop / Full width) */}
        <div className="md:col-span-6 lg:col-span-5">
          <WeatherBanner
            lat={coords.lat}
            lng={coords.lng}
            cityName={currentCity}
          />
        </div>

        {/* 4 Pastel Category Tiles + AI Banner (Right 7 cols on desktop) */}
        <div className="flex flex-col justify-between md:col-span-6 lg:col-span-7 space-y-4">
          {/* Four Pastel Category Tiles */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={i}
                  href={cat.href}
                  className="group flex flex-col justify-between rounded-card border border-border/70 bg-white p-3.5 sm:p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${cat.bg} ${cat.textCol} transition-transform group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3">
                    <h2 className="text-xs sm:text-sm font-bold text-text-heading group-hover:text-primary transition-colors">
                      {cat.title}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-muted line-clamp-1">
                      {cat.sub}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Promotional-style Peach / Blush-pink Banner (PRD Section 8.4) */}
          <div className="rounded-card border border-border/70 bg-pastel-peach p-5 shadow-card flex items-center justify-between">
            <div className="pr-4">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t("bannerTitle")}</span>
              </span>
              <p className="mt-1 text-xs sm:text-sm font-bold text-text-heading leading-snug">
                {t("bannerSub")}
              </p>
            </div>
            <Link
              href="/chat"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-text-heading text-white shadow-card transition-transform hover:scale-105 active:scale-95"
              aria-label={t("bannerCta")}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Hospitals Section (3-column grid on desktop, single column on mobile) */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text-heading sm:text-lg">
              {t("nearbyTitle")}
            </h2>
            <p className="text-xs text-muted">
              Emergency-ready & verified hospitals in {currentCity}
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t("viewAll")} →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredHospitals.map((hosp, idx) => {
            const pastels = [
              "bg-pastel-blue",
              "bg-pastel-pink",
              "bg-pastel-mint",
            ];
            const bgClass = pastels[idx % pastels.length];

            return (
              <div
                key={hosp.id}
                className="group flex flex-col justify-between rounded-card border border-border bg-white p-4 shadow-card transition-all hover:border-primary/50"
              >
                <div>
                  <div
                    className={`relative flex h-28 w-full items-center justify-center rounded-xl ${bgClass} mb-3`}
                  >
                    <Building2 className="h-10 w-10 text-text/30 transition-transform group-hover:scale-105" />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        hosp.type === "govt"
                          ? "bg-success text-white"
                          : "bg-white/95 text-text-heading shadow-xs"
                      }`}
                    >
                      {hosp.type === "govt"
                        ? t("hospitalBadgeGovt")
                        : t("hospitalBadgePrivate")}
                    </span>
                  </div>

                  <Link href={`/hospital/${hosp.id}`}>
                    <h3 className="text-sm font-bold text-text-heading group-hover:text-primary transition-colors">
                      {hosp.name}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-muted line-clamp-1">
                    {hosp.specialties.slice(0, 3).join(", ")}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-xs text-text">
                    <span className="font-semibold text-text-heading">
                      1.8 km
                    </span>
                    {hosp.emergency_247 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pastel-mint px-2 py-0.5 text-[10px] font-bold text-[#1F5C40]">
                        <HeartPulse className="h-3 w-3" />
                        <span>{t("emergency247")}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-xs">
                    <span className="text-base font-black text-text-heading">
                      {hosp.total_beds}
                    </span>{" "}
                    <span className="text-muted">{t("bedsApprox")}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3">
                  <a
                    href={`tel:${hosp.phone}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-pastel-peach/30"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{t("call")}</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(
                      hosp.name + " " + hosp.address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white py-2 text-xs font-semibold text-primary transition-colors hover:border-primary hover:bg-pastel-peach/30"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{t("directions")}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

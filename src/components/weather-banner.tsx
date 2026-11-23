"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, RefreshCw, Thermometer, Droplets, Wind } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  aqi: number;
  careMessageKey: string;
  severity: "normal" | "warning" | "danger";
  isFallback: boolean;
}

export function WeatherBanner({
  lat = 22.7196,
  lng = 75.8577,
  cityName = "Indore",
}: {
  lat?: number;
  lng?: number;
  cityName?: string;
}) {
  const t = useTranslations("home");
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      // Fallback state will take over
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const temp = data ? `${data.temperature}°C` : "31°C";
  const humidity = data ? `${data.humidity}%` : "54%";
  const aqiVal = data ? data.aqi : 68;

  // Retrieve caring message from translation files
  const messageKey = data?.careMessageKey || "aqiFresh";
  const careMessage = t(`careMessages.${messageKey}`);

  const aqiLabel =
    aqiVal <= 100
      ? t("careMessages.aqiTagFresh")
      : aqiVal <= 200
      ? t("careMessages.aqiTagModerate")
      : t("careMessages.aqiTagPoor");

  const aqiColor =
    aqiVal <= 100 ? "text-success" : aqiVal <= 200 ? "text-warning" : "text-sos";

  return (
    <div className="flex h-full flex-col justify-between rounded-card border border-border/80 bg-pastel-peach p-5 sm:p-6 shadow-card transition-all">
      <div>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-text-heading shadow-xs">
              <Wind className={`h-3.5 w-3.5 ${aqiColor}`} />
              <span>
                AQI {aqiVal} · {aqiLabel}
              </span>
            </span>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-text-heading sm:text-4xl">
                {temp}
              </span>
              <span className="text-xs font-semibold text-muted">
                {cityName}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1 text-xs font-medium text-muted">
              <span className="flex items-center gap-1">
                <Thermometer className="h-3.5 w-3.5 text-primary" />
                <span>{temp}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5 text-blue-500" />
                <span>{humidity} {t("humidity")}</span>
              </span>
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-primary shadow-xs">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Caring message generated from PRD rules */}
        <div className="mt-6 rounded-xl bg-white/60 p-3.5 backdrop-blur-xs">
          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-text">
            &ldquo;{careMessage}&rdquo;
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-[11px] text-muted">
        <span>Open-Meteo Live Data</span>
        <button
          type="button"
          onClick={fetchWeather}
          disabled={loading}
          className="flex items-center gap-1 hover:text-text disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Updating..." : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, ChevronDown, Check } from "lucide-react";

export const SUPPORTED_CITIES = [
  { name: "Indore", lat: 22.7196, lng: 75.8577 },
  { name: "Bhopal", lat: 23.2599, lng: 77.4126 },
  { name: "Ujjain", lat: 23.1765, lng: 75.7885 },
  { name: "Jabalpur", lat: 23.1815, lng: 79.9864 },
  { name: "Gwalior", lat: 26.2183, lng: 78.1828 },
];

interface LocationRowProps {
  currentCity: string;
  onCityChange: (city: { name: string; lat: number; lng: number }) => void;
}

export function LocationRow({ currentCity, onCityChange }: LocationRowProps) {
  const tCommon = useTranslations("common");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-bold text-text-heading shadow-xs transition-colors hover:border-primary active:scale-95"
        >
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{currentCity}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </button>
      </div>

      {/* City Picker Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-card border border-border bg-white p-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-sm font-bold text-text-heading">
              Select City / स्थान चुनें
            </h3>
            <p className="mt-1 text-xs text-muted">
              Choose your city to update nearby hospitals & live AQI
            </p>

            <div className="mt-4 space-y-1.5">
              {SUPPORTED_CITIES.map((c) => {
                const isSelected = c.name.toLowerCase() === currentCity.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      onCityChange(c);
                      setModalOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-pastel-peach text-primary font-bold"
                        : "hover:bg-surfaceGrey text-text"
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="mt-4 w-full rounded-xl border border-border py-2 text-xs font-semibold text-muted hover:bg-surfaceGrey"
            >
              {tCommon("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

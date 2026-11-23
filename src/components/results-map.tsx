"use client";

import React, { useEffect, useState } from "react";
import { Hospital } from "@/types/hospital";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ResultsMapProps {
  hospitals: (Hospital & { distance?: number })[];
  userLat?: number;
  userLng?: number;
  selectedHospitalId?: string | null;
  onSelectHospital?: (id: string) => void;
  className?: string;
}

export default function ResultsMap({
  hospitals,
  userLat = 22.7196,
  userLng = 75.8577,
  selectedHospitalId,
  onSelectHospital,
  className = "h-[450px] w-full rounded-card overflow-hidden",
}: ResultsMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center bg-surfaceGrey ${className}`}>
        <span className="text-xs text-muted">Loading map...</span>
      </div>
    );
  }

  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className={`relative border border-border shadow-card ${className}`}>
      <MapContainer
        center={[userLat, userLng]}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hospitals.map((hosp) => {
          const isSelected = selectedHospitalId === hosp.id;
          return (
            <Marker
              key={hosp.id}
              position={[hosp.lat, hosp.lng]}
              icon={customIcon}
              opacity={isSelected ? 1.0 : 0.85}
              eventHandlers={{
                click: () => onSelectHospital && onSelectHospital(hosp.id),
              }}
            >
              <Popup>
                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase text-primary">
                    {hosp.type === "govt" ? "Govt Hospital" : "Private Hospital"}
                  </span>
                  <h4 className="text-xs font-bold text-text-heading">{hosp.name}</h4>
                  <p className="text-[10px] text-muted">{hosp.address}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-semibold">
                    <span>{hosp.total_beds} beds approx</span>
                    <a href={`/hospital/${hosp.id}`} className="text-primary hover:underline">
                      View
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

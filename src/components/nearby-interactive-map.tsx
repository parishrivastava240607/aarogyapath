"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface NearbyMapItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  phone: string;
  type?: "govt" | "private";
  open_24x7?: boolean;
  total_beds?: number;
  itemType: "hospital" | "pharmacy";
}

interface NearbyInteractiveMapProps {
  items: NearbyMapItem[];
  userLat?: number;
  userLng?: number;
  selectedId?: string | null;
  onSelectItem?: (id: string) => void;
  className?: string;
}

export default function NearbyInteractiveMap({
  items,
  userLat = 22.7196,
  userLng = 75.8577,
  selectedId,
  onSelectItem,
  className = "h-[500px] w-full rounded-card overflow-hidden",
}: NearbyInteractiveMapProps) {
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

  // Hospital Icon (Red/Blue marker)
  const hospitalIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // User Location icon (Pulsing circular style)
  const userIcon = new L.DivIcon({
    html: `<div style="background-color: #E85B50; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(232, 91, 80, 0.7);"></div>`,
    className: "user-loc-pin",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  return (
    <div className={`relative border border-border shadow-card ${className}`}>
      <MapContainer
        center={[userLat, userLng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User position marker */}
        <Marker position={[userLat, userLng]} icon={userIcon}>
          <Popup>
            <div className="p-1 text-xs font-bold text-primary">
              Your Location
            </div>
          </Popup>
        </Marker>

        {/* Place Markers */}
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={hospitalIcon}
              opacity={isSelected ? 1.0 : 0.85}
              eventHandlers={{
                click: () => onSelectItem && onSelectItem(item.id),
              }}
            >
              <Popup>
                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase text-primary">
                    {item.itemType === "hospital"
                      ? item.type === "govt"
                        ? "Govt Hospital"
                        : "Private Hospital"
                      : item.open_24x7
                      ? "24x7 Pharmacy"
                      : "Medical Store"}
                  </span>
                  <h4 className="text-xs font-bold text-text-heading">{item.name}</h4>
                  <p className="text-[10px] text-muted">{item.address}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-semibold">
                    <span>{item.distance ? `${item.distance} km` : ""}</span>
                    <a
                      href={`tel:${item.phone}`}
                      className="text-primary hover:underline"
                    >
                      Call: {item.phone}
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

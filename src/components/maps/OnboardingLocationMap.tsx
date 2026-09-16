"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";

interface OnboardingLocationMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export const OnboardingLocationMap: React.FC<OnboardingLocationMapProps> = ({
  latitude,
  longitude,
  locationName,
  onCoordinatesChange,
}) => {
  const [mapId] = useState(`onboard-map-${Math.random().toString(36).substring(2, 9)}`);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = L.DomUtil.get(mapId);
    if (container != null) {
      (container as unknown as { _leaflet_id?: unknown })._leaflet_id = null;
    }

    // Initialize Map with clean muted view
    const map = L.map(mapId, {
      center: [latitude, longitude],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;

    // Free OpenStreetMap standard tile layer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom restrained terracotta pin
    const pinHtml = `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 28px; height: 28px; background: rgba(199,93,62,0.25); border-radius: 50%; animation: pulse 2s infinite;"></div>
        <div style="position: relative; width: 18px; height: 18px; background: #c75d3e; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: pinHtml,
      className: "custom-map-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([latitude, longitude], {
      icon: customIcon,
      draggable: true,
      title: locationName,
    }).addTo(map);

    markerRef.current = marker;

    // Draggable pin event
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onCoordinatesChange(+pos.lat.toFixed(5), +pos.lng.toFixed(5));
    });

    // Map click event: moves pin to clicked point
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onCoordinatesChange(+lat.toFixed(5), +lng.toFixed(5));
      map.panTo([lat, lng], { animate: true, duration: 0.6 });
    });

    return () => {
      map.remove();
    };
  }, [mapId]);

  // Sync marker and fly smoothly when coordinates change from outside (GPS, Search, Autocomplete)
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentPos.lat - latitude) > 0.0001 ||
        Math.abs(currentPos.lng - longitude) > 0.0001
      ) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.flyTo([latitude, longitude], 15, {
          animate: true,
          duration: 1.0,
        });
        mapRef.current.invalidateSize();
      }
    }
  }, [latitude, longitude]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([latitude, longitude], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[460px] rounded-2xl overflow-hidden border border-[#ede3d8] shadow-2xs bg-[#faf4ee]">
      <div id={mapId} className="w-full h-full z-0" />

      {/* Recenter button */}
      <button
        type="button"
        onClick={handleRecenter}
        className="absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-lg bg-white/95 border border-[#ede3d8] text-xs font-semibold text-[#786d65] hover:text-[#1d1b18] hover:bg-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
        title="Recenter map on selected coordinates"
      >
        <span>Recenter pin</span>
      </button>

      {/* Map Hint banner */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 px-3 py-1.5 rounded-xl bg-white/95 border border-[#ede3d8] shadow-2xs text-[11px] text-[#786d65] backdrop-blur-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#c75d3e]"></span>
        <span>Click anywhere or drag the pin to adjust your business site</span>
      </div>
    </div>
  );
};

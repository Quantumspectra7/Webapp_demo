"use client";

import React, { useEffect, useState } from "react";
import { Competitor, VentureLocation } from "@/domain";
import L from "leaflet";

interface CompetitorLeafletMapProps {
  location: VentureLocation;
  competitors: Competitor[];
  radiusKm: 5 | 10;
  selectedCompetitorId?: string;
  onSelectCompetitor?: (competitor: Competitor) => void;
}

export const CompetitorLeafletMap: React.FC<CompetitorLeafletMapProps> = ({
  location,
  competitors,
  radiusKm,
  selectedCompetitorId,
  onSelectCompetitor,
}) => {
  const [mapId] = useState(`leaflet-map-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Center coordinates
    const centerLat = location.latitude || 30.7853;
    const centerLng = location.longitude || 75.4731;

    // Initialize Map container
    const container = L.DomUtil.get(mapId);
    if (container != null) {
      (container as unknown as { _leaflet_id?: unknown })._leaflet_id = null;
    }

    const map = L.map(mapId, {
      center: [centerLat, centerLng],
      zoom: radiusKm === 5 ? 13 : 11,
      zoomControl: true,
      attributionControl: false,
    });

    // Clean CartoDB Positron / OSM tiles for warm, calm paper aesthetics
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    // Add Catchment Radius Circle
    const radiusMeters = radiusKm * 1000;
    L.circle([centerLat, centerLng], {
      radius: radiusMeters,
      color: "#9d3e21",
      weight: 1.5,
      dashArray: "6, 6",
      fillColor: "#9d3e21",
      fillOpacity: 0.04,
    }).addTo(map);

    // User Site Marker (Terracotta pulsing dot)
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; background: rgba(157,62,33,0.25); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; background: #9d3e21; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([centerLat, centerLng], { icon: userIcon }).addTo(map);
    userMarker.bindTooltip(
      `<strong>Your Site: ${location.villageOrTown}</strong><br/>Proposed 1,000L Chilling Unit`,
      { permanent: false, direction: "top" }
    );

    // Competitor Markers (Golden/Mustard Pins)
    competitors.forEach((comp) => {
      const isSelected = comp.id === selectedCompetitorId;
      const compIcon = L.divIcon({
        className: "custom-comp-marker",
        html: `
          <div style="
            width: ${isSelected ? "26px" : "20px"};
            height: ${isSelected ? "26px" : "20px"};
            background: ${isSelected ? "#9d3e21" : "#caa739"};
            border: 2px solid #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.2s;
          ">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([comp.latitude, comp.longitude], { icon: compIcon }).addTo(map);

      marker.bindTooltip(
        `<strong>${comp.name}</strong><br/>${comp.dailyCapacityLiters} L/day · ${comp.distanceKm} km`,
        { direction: "top" }
      );

      marker.on("click", () => {
        if (onSelectCompetitor) {
          onSelectCompetitor(comp);
        }
      });
    });

    return () => {
      map.remove();
    };
  }, [location, competitors, radiusKm, selectedCompetitorId, mapId, onSelectCompetitor]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-[#ddd6c9]">
      <div id={mapId} className="w-full h-full min-h-[420px]" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#ddd6c9] shadow-sm text-[11px] flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#9d3e21] border border-white"></span>
          <span className="font-bold text-[#1d1b18]">Your Site</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#caa739] border border-white"></span>
          <span className="text-[#56423d]">Competitor Center</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0 border-t-2 border-dashed border-[#9d3e21]"></span>
          <span className="text-[#706c63]">{radiusKm} km Catchment</span>
        </div>
      </div>
    </div>
  );
};

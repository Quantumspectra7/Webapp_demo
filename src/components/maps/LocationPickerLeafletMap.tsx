"use client";

import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";

export interface LocationPickerCoords {
  latitude: number;
  longitude: number;
  villageName?: string;
  blockName?: string;
  districtName?: string;
  nearestMandi?: string;
  distanceToMandiKm?: number;
}

interface LocationPickerLeafletMapProps {
  latitude: number;
  longitude: number;
  villageName: string;
  blockName: string;
  districtName: string;
  radiusKm?: 5 | 10 | 15;
  onChangeLocation: (coords: LocationPickerCoords) => void;
  nearestMandiName?: string;
  distanceToMandiKm?: number;
}

export const LocationPickerLeafletMap: React.FC<LocationPickerLeafletMapProps> = ({
  latitude,
  longitude,
  villageName,
  blockName,
  districtName,
  radiusKm = 10,
  onChangeLocation,
  nearestMandiName = "Jagraon APMC Mandi",
  distanceToMandiKm = 8.4,
}) => {
  const [mapId] = useState(`picker-map-${Math.random().toString(36).substring(2, 9)}`);
  const [mapLayer, setMapLayer] = useState<"clean" | "satellite">("clean");
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const circlesRef = useRef<L.Circle[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize and mount Leaflet map
  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = L.DomUtil.get(mapId);
    if (container != null) {
      (container as unknown as { _leaflet_id?: unknown })._leaflet_id = null;
    }

    const map = L.map(mapId, {
      center: [latitude, longitude],
      zoom: radiusKm === 5 ? 13 : radiusKm === 15 ? 11 : 12,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    // Base Tile Layer (Default CartoDB Positron for warm, clear paper look)
    const tileUrl =
      mapLayer === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    // Primary 5km Collection Radius Circle
    const circle5 = L.circle([latitude, longitude], {
      radius: 5000,
      color: "#9d3e21",
      weight: 1.5,
      dashArray: "5, 5",
      fillColor: "#9d3e21",
      fillOpacity: 0.05,
    }).addTo(map);

    // Secondary 10km Catchment Circle
    const circle10 = L.circle([latitude, longitude], {
      radius: 10000,
      color: "#3a6b4c",
      weight: 1.2,
      dashArray: "6, 6",
      fillColor: "#3a6b4c",
      fillOpacity: 0.02,
    }).addTo(map);

    circlesRef.current = [circle5, circle10];

    // User Site Marker (Pulsing Terracotta Pin)
    const userPinHtml = `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 36px; height: 36px; background: rgba(199,93,62,0.3); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 22px; height: 22px; background: #c75d3e; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
        </div>
      </div>
    `;

    const userIcon = L.divIcon({
      className: "custom-site-picker-marker",
      html: userPinHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const userMarker = L.marker([latitude, longitude], {
      icon: userIcon,
      draggable: true,
      title: "Drag to refine enterprise site location",
    }).addTo(map);

    userMarker.bindTooltip(
      `<strong>Proposed Site: ${villageName}</strong><br/>Drag pin or click map to move`,
      { permanent: false, direction: "top" }
    );

    userMarker.on("dragend", () => {
      const pos = userMarker.getLatLng();
      const updatedLat = Number(pos.lat.toFixed(4));
      const updatedLng = Number(pos.lng.toFixed(4));
      onChangeLocation({
        latitude: updatedLat,
        longitude: updatedLng,
      });
    });

    userMarkerRef.current = userMarker;

    // Nearest APMC Mandi Landmark Marker
    const mandiOffsetLat = latitude - 0.045;
    const mandiOffsetLng = longitude + 0.052;
    const mandiIcon = L.divIcon({
      className: "custom-mandi-marker",
      html: `
        <div style="display: flex; align-items: center; gap: 4px; background: #ffffff; border: 1.5px solid #d97706; padding: 2px 6px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-size: 11px; font-weight: 700; color: #92400e; white-space: nowrap;">
          <span>🌾</span>
          <span>${nearestMandiName.split(" ")[0]} Mandi</span>
        </div>
      `,
      iconSize: [110, 26],
      iconAnchor: [55, 13],
    });

    L.marker([mandiOffsetLat, mandiOffsetLng], { icon: mandiIcon })
      .addTo(map)
      .bindTooltip(`<strong>${nearestMandiName}</strong><br/>${distanceToMandiKm} km via all-weather road`, {
        direction: "top",
      });

    // 66kV Agricultural Feeder Substation Landmark Marker
    const feederOffsetLat = latitude + 0.012;
    const feederOffsetLng = longitude - 0.018;
    const feederIcon = L.divIcon({
      className: "custom-feeder-marker",
      html: `
        <div style="display: flex; align-items: center; gap: 4px; background: #ffffff; border: 1.5px solid #2563eb; padding: 2px 6px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-size: 11px; font-weight: 700; color: #1e40af; white-space: nowrap;">
          <span>⚡</span>
          <span>66kV Feeder</span>
        </div>
      `,
      iconSize: [95, 26],
      iconAnchor: [47, 13],
    });

    L.marker([feederOffsetLat, feederOffsetLng], { icon: feederIcon })
      .addTo(map)
      .bindTooltip(`<strong>66kV Rural Agricultural Substation</strong><br/>3-Phase line ~180m from site`, {
        direction: "top",
      });

    // Map Click Handler: Click anywhere to move marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const clickedLat = Number(e.latlng.lat.toFixed(4));
      const clickedLng = Number(e.latlng.lng.toFixed(4));
      userMarker.setLatLng([clickedLat, clickedLng]);
      onChangeLocation({
        latitude: clickedLat,
        longitude: clickedLng,
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapId]);

  // Update center, circles, and marker when coordinates or mapLayer change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    map.panTo([latitude, longitude], { animate: true, duration: 0.8 });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude, longitude]);
      userMarkerRef.current.setTooltipContent(
        `<strong>Proposed Site: ${villageName}</strong><br/>Drag pin or click map to move`
      );
    }

    if (circlesRef.current.length === 2) {
      circlesRef.current[0].setLatLng([latitude, longitude]);
      circlesRef.current[1].setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, villageName]);

  // Switch Tile Layer between Clean & Satellite
  const toggleMapLayer = (layer: "clean" | "satellite") => {
    setMapLayer(layer);
    if (!mapRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.remove();
    const tileUrl =
      layer === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(mapRef.current);
  };

  // Locate Current GPS Location
  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          onChangeLocation({
            latitude: lat,
            longitude: lng,
            villageName: "GPS Local Pinpoint",
          });
        },
        () => {
          alert("Could not access device GPS. Defaulting to Punjab regional center coordinates.");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-[#ddd6c9] bg-[#f8f4ee] shadow-sm">
      {/* Map DOM node */}
      <div id={mapId} className="w-full h-full" />

      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Coordinates Chip */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#ddd6c9] shadow-sm flex items-center gap-2 text-[12px] font-mono font-semibold text-[#1d1b18]">
          <span className="w-2 h-2 rounded-full bg-[#c75d3e] animate-pulse"></span>
          <span>
            {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
          </span>
        </div>

        {/* Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#ddd6c9] shadow-sm">
          <button
            type="button"
            onClick={() => toggleMapLayer("clean")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              mapLayer === "clean"
                ? "bg-[#c75d3e] text-white shadow-xs"
                : "text-[#56423d] hover:bg-[#f5ece3]"
            }`}
          >
            Street Map
          </button>
          <button
            type="button"
            onClick={() => toggleMapLayer("satellite")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              mapLayer === "satellite"
                ? "bg-[#c75d3e] text-white shadow-xs"
                : "text-[#56423d] hover:bg-[#f5ece3]"
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={handleLocateMe}
            title="Use My Current GPS Position"
            className="p-1 px-2 rounded-lg text-[11px] font-bold text-[#3a6b4c] hover:bg-[#eef5e9] transition-all flex items-center gap-1"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="7" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#ddd6c9] shadow-md text-[11px] flex flex-wrap items-center gap-3.5 sm:gap-5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#c75d3e] border border-white shadow-xs"></span>
          <span className="font-bold text-[#1d1b18]">Proposed Site</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#d97706] border border-white shadow-xs"></span>
          <span className="text-[#56423d]">APMC Mandi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2563eb] border border-white shadow-xs"></span>
          <span className="text-[#56423d]">66kV Substation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0 border-t-2 border-dashed border-[#c75d3e]"></span>
          <span className="text-[#706c63]">5km Inner / 10km Outer Catchment</span>
        </div>
      </div>
    </div>
  );
};

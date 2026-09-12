"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Competitor, MarketLocation, VentureLocation } from "@/domain";
import { formatDistance } from "@/lib/formatters";

export interface MarketMapFilterState {
  showCompetitors: boolean;
  showMarkets: boolean;
  showRadius: boolean;
  categoryFilter: string;
  distanceFilter: string;
}

interface MarketIntelligenceLeafletMapProps {
  location: VentureLocation;
  competitors: Competitor[];
  markets: MarketLocation[];
  radiusKm: 5 | 10;
  selectedCompetitorId: string | null;
  hoveredCompetitorId: string | null;
  onSelectCompetitor: (competitor: Competitor | null) => void;
  filters: MarketMapFilterState;
  onFilterChange: (filters: MarketMapFilterState) => void;
  onResetView?: () => void;
}

export const MarketIntelligenceLeafletMap: React.FC<MarketIntelligenceLeafletMapProps> = ({
  location,
  competitors,
  markets,
  radiusKm,
  selectedCompetitorId,
  hoveredCompetitorId,
  onSelectCompetitor,
  filters,
  onFilterChange,
}) => {
  const [mapId] = useState(`market-map-${Math.random().toString(36).substring(2, 9)}`);
  const mapRef = useRef<L.Map | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const competitorMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const marketMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  const centerLat = location.latitude || 30.7853;
  const centerLng = location.longitude || 75.4731;

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = L.DomUtil.get(mapId);
    if (container != null) {
      (container as unknown as { _leaflet_id?: unknown })._leaflet_id = null;
    }

    const map = L.map(mapId, {
      center: [centerLat, centerLng],
      zoom: radiusKm === 5 ? 13 : 12,
      zoomControl: false, // We place zoom controls cleanly
      attributionControl: false,
    });

    // Clean, muted CartoDB Positron base tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // Add Entrepreneur Location Marker (● YOU)
    const userPinHtml = `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 40px; height: 40px; background: rgba(199,93,62,0.22); border-radius: 50%; animation: pulse 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
        <div style="position: relative; width: 22px; height: 22px; background: #c75d3e; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
        </div>
        <div style="position: absolute; bottom: -18px; background: #241b16; color: #ffffff; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px; letter-spacing: 0.5px; box-shadow: 0 1px 4px rgba(0,0,0,0.25); white-space: nowrap;">YOU</div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userPinHtml,
      className: "entrepreneur-user-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const userMarker = L.marker([centerLat, centerLng], {
      icon: userIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; color: #241b16; padding: 2px;">
        <div style="font-size: 10px; font-weight: 800; color: #c75d3e; text-transform: uppercase; letter-spacing: 0.5px;">Your Proposed Site</div>
        <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">${location.villageOrTown || "Jagraon"}</div>
        <div style="font-size: 11px; color: #786d65; margin-top: 2px;">${location.block || "Jagraon"} Block · ${location.district || "Ludhiana"}, Punjab</div>
        <div style="font-size: 10px; color: #3a6b4c; font-weight: 700; margin-top: 6px; background: #f0f6ec; padding: 3px 6px; border-radius: 4px; display: inline-block;">${radiusKm} km Primary Analysis Area</div>
      </div>
    `);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapId]);

  // Update center when location changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([centerLat, centerLng], radiusKm === 5 ? 13 : 12, {
        animate: true,
        duration: 0.6,
      });
    }
  }, [centerLat, centerLng, radiusKm]);

  // Update Analysis Radius Circle with smooth animation
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }

    if (filters.showRadius) {
      const radiusMeters = radiusKm * 1000;
      const circle = L.circle([centerLat, centerLng], {
        radius: radiusMeters,
        color: "#c75d3e",
        weight: 1.5,
        dashArray: "5, 6",
        fillColor: "#c75d3e",
        fillOpacity: 0.04,
      }).addTo(map);

      radiusCircleRef.current = circle;
    }
  }, [centerLat, centerLng, radiusKm, filters.showRadius]);

  // Render Competitor Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove existing competitor markers
    competitorMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    competitorMarkersRef.current.clear();

    if (!filters.showCompetitors) return;

    // Filter competitors by category & distance
    const filtered = competitors.filter((comp) => {
      // Category filter
      if (filters.categoryFilter !== "all") {
        if (
          comp.category?.toLowerCase() !== filters.categoryFilter.toLowerCase() &&
          comp.type !== filters.categoryFilter
        ) {
          return false;
        }
      }
      // Distance filter
      if (filters.distanceFilter === "<2km" && comp.distanceKm >= 2) return false;
      if (
        filters.distanceFilter === "2-5km" &&
        (comp.distanceKm < 2 || comp.distanceKm > 5)
      )
        return false;
      if (
        filters.distanceFilter === "5-10km" &&
        (comp.distanceKm < 5 || comp.distanceKm > 10)
      )
        return false;

      return true;
    });

    filtered.forEach((comp) => {
      const isSelected = comp.id === selectedCompetitorId;
      const isHovered = comp.id === hoveredCompetitorId;

      // Restrained color per category
      let badgeColor = "#786d65";
      if (comp.category === "Milk Processing" || comp.type === "chilling_hub") {
        badgeColor = "#3a6b4c"; // forest green
      } else if (comp.category === "Collection" || comp.type === "cooperative_center") {
        badgeColor = "#b87c24"; // warm ochre
      } else if (comp.type === "sweet_maker") {
        badgeColor = "#8e44ad"; // purple
      } else {
        badgeColor = "#c75d3e"; // terracotta
      }

      const markerHtml = `
        <div style="position: relative; width: ${isSelected || isHovered ? "32px" : "24px"}; height: ${
        isSelected || isHovered ? "32px" : "24px"
      }; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
          ${
            isSelected
              ? `<div style="position: absolute; width: 34px; height: 34px; border: 2.5px solid #c75d3e; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ""
          }
          <div style="
            width: ${isSelected || isHovered ? "22px" : "16px"};
            height: ${isSelected || isHovered ? "22px" : "16px"};
            background: ${isSelected ? "#c75d3e" : badgeColor};
            border: ${isSelected ? "3px solid #ffffff" : "2px solid #ffffff"};
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%;"></div>
          </div>
          ${
            isSelected || isHovered
              ? `<div style="position: absolute; top: -20px; background: #241b16; color: #ffffff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.25); z-index: 100;">${comp.name}</div>`
              : ""
          }
        </div>
      `;

      const compIcon = L.divIcon({
        html: markerHtml,
        className: `competitor-marker-${comp.id}`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([comp.latitude, comp.longitude], {
        icon: compIcon,
        zIndexOffset: isSelected ? 800 : isHovered ? 700 : 300,
      }).addTo(map);

      // Popup detail card on click
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #241b16; min-width: 190px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
            <span style="font-size: 9px; font-weight: 800; color: #786d65; text-transform: uppercase;">${
              comp.category || "Competitor"
            }</span>
            <span style="font-size: 11px; font-weight: 700; color: #c75d3e; font-family: monospace;">${
              comp.distanceKm
            } km</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #241b16; margin-top: 1px;">${
            comp.name
          }</div>
          <div style="font-size: 11px; color: #786d65; margin-top: 2px;">${
            comp.businessType || comp.primaryArea
          }</div>
          <div style="font-size: 10px; color: #786d65; margin-top: 6px; padding-top: 6px; border-top: 1px solid #ede3d8; display: flex; justify-content: space-between;">
            <span>Source: ${comp.source || "Map data"}</span>
            <span style="color: #3a6b4c; font-weight: 600;">Verified</span>
          </div>
        </div>
      `);

      marker.on("click", () => {
        onSelectCompetitor(comp);
      });

      competitorMarkersRef.current.set(comp.id, marker);
    });
  }, [
    competitors,
    selectedCompetitorId,
    hoveredCompetitorId,
    filters,
    onSelectCompetitor,
  ]);

  // Render Market / Mandi Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    marketMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    marketMarkersRef.current.clear();

    if (!filters.showMarkets) return;

    markets.forEach((mkt) => {
      const marketPinHtml = `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="width: 20px; height: 20px; background: #241b16; border: 2px solid #ffffff; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 10px; font-weight: 900;">
            M
          </div>
        </div>
      `;

      const mktIcon = L.divIcon({
        html: marketPinHtml,
        className: `market-marker-${mkt.id}`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([mkt.latitude, mkt.longitude], {
        icon: mktIcon,
        zIndexOffset: 450,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #241b16; min-width: 180px; padding: 2px;">
          <div style="font-size: 9px; font-weight: 800; color: #3a6b4c; text-transform: uppercase;">APMC Market / Mandi</div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 1px;">${mkt.name}</div>
          <div style="font-size: 11px; color: #786d65; margin-top: 2px;">${formatDistance(
            mkt.distanceKm
          )} from your site</div>
          ${
            mkt.commodities
              ? `<div style="font-size: 10px; color: #241b16; margin-top: 4px;">Commodities: ${mkt.commodities.join(
                  ", "
                )}</div>`
              : ""
          }
          <div style="font-size: 9px; color: #786d65; margin-top: 6px; border-top: 1px solid #ede3d8; padding-top: 4px;">
            Source: ${mkt.source}
          </div>
        </div>
      `);

      marketMarkersRef.current.set(mkt.id, marker);
    });
  }, [markets, filters.showMarkets]);

  // FlyTo selected competitor smoothly when selected from outside (Section 17: Three-way synchronization)
  useEffect(() => {
    if (!mapRef.current || !selectedCompetitorId) return;
    const marker = competitorMarkersRef.current.get(selectedCompetitorId);
    if (marker) {
      const latlng = marker.getLatLng();
      mapRef.current.flyTo(latlng, 14, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
      marker.openPopup();
    }
  }, [selectedCompetitorId]);

  // Recenter button
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([centerLat, centerLng], radiusKm === 5 ? 13 : 12, {
        animate: true,
        duration: 0.6,
      });
      onSelectCompetitor(null);
    }
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[620px] rounded-3xl overflow-hidden border border-[#ede3d8] bg-[#faf4ee] shadow-sm">
      {/* Map Element */}
      <div id={mapId} className="w-full h-full z-0" />

      {/* Top Filter & Layer Controls Floating Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 border border-[#ede3d8] shadow-2xs backdrop-blur-xs pointer-events-auto">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-[#241b16] hover:bg-[#faf4ee] cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showCompetitors}
              onChange={(e) =>
                onFilterChange({ ...filters, showCompetitors: e.target.checked })
              }
              className="rounded text-[#c75d3e] focus:ring-[#c75d3e]"
            />
            <span>Competitors ({competitors.length})</span>
          </label>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-[#241b16] hover:bg-[#faf4ee] cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showMarkets}
              onChange={(e) =>
                onFilterChange({ ...filters, showMarkets: e.target.checked })
              }
              className="rounded text-[#241b16] focus:ring-[#241b16]"
            />
            <span>Mandis ({markets.length})</span>
          </label>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-[#241b16] hover:bg-[#faf4ee] cursor-pointer">
            <input
              type="checkbox"
              checked={filters.showRadius}
              onChange={(e) =>
                onFilterChange({ ...filters, showRadius: e.target.checked })
              }
              className="rounded text-[#c75d3e] focus:ring-[#c75d3e]"
            />
            <span>{radiusKm} km Circle</span>
          </label>
        </div>

        {/* Reset / Show All Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white border border-[#ede3d8] text-xs font-bold text-[#786d65] hover:text-[#241b16] shadow-2xs transition-all pointer-events-auto cursor-pointer flex items-center gap-1.5 backdrop-blur-xs"
        >
          <span>Show all on map</span>
        </button>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-white/95 border border-[#ede3d8] shadow-2xs text-[11px] text-[#786d65] backdrop-blur-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c75d3e]"></span>
          <span className="font-medium text-[#241b16]">Your Site</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3a6b4c]"></span>
          <span>Chilling / Processing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b87c24]"></span>
          <span>Collection Pool</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#241b16]"></span>
          <span>APMC Mandi</span>
        </div>
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { marketService } from "@/services";
import {
  Competitor,
  MarketAnalysis,
  MarketLocation,
  PriceSignalItem,
  VentureLocation,
} from "@/domain";
import { formatCurrency, formatNumber, formatDistance } from "@/lib/formatters";
import { DynamicMarketMapWrapper } from "@/components/maps/DynamicMarketMapWrapper";
import { MarketMapFilterState } from "@/components/maps/MarketIntelligenceLeafletMap";
import { MarketIntelligencePanel } from "@/components/market/MarketIntelligencePanel";
import { TopCompetitorsTable } from "@/components/market/TopCompetitorsTable";
import { PriceSignalsSection } from "@/components/market/PriceSignalsSection";
import { MarketSignalsSection } from "@/components/market/MarketSignalsSection";
import { LocalGapCard } from "@/components/market/LocalGapCard";
import { EvidencePopover } from "@/components/market/EvidencePopover";
import {
  Store,
  MapPin,
  TrendingUp,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Edit3,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function MarketPage() {
  const { location, business, profile, selectedRadius, setSelectedRadius } = useApp();

  const [radiusKm, setRadiusKm] = useState<5 | 10>(selectedRadius || 5);
  const [market, setMarket] = useState<MarketAnalysis | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [markets, setMarkets] = useState<MarketLocation[]>([]);
  const [priceSignals, setPriceSignals] = useState<PriceSignalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSwitchingRadius, setIsSwitchingRadius] = useState(false);

  // GPS / geolocation state
  const [gpsLocation, setGpsLocation] = useState<VentureLocation | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // 3-Way Synchronization States
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
  const [hoveredCompetitorId, setHoveredCompetitorId] = useState<string | null>(null);

  // Filter States
  const [mapFilters, setMapFilters] = useState<MarketMapFilterState>({
    showCompetitors: true,
    showMarkets: true,
    showRadius: true,
    categoryFilter: "all",
    distanceFilter: "all",
  });

  // Attempt GPS resolution when no saved location exists
  useEffect(() => {
    if (location) return; // Already have a saved profile location — skip GPS
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation not supported.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `/api/v1/location/resolve?lat=${latitude}&lng=${longitude}&radius=5`
          );
          if (res.ok) {
            const data = await res.json();
            setGpsLocation({
              id: data.id || "loc-gps",
              state: data.state || "Punjab",
              district: data.district || "Punjab",
              block: data.block || data.district || "Punjab",
              villageOrTown: data.village || data.block || "Your Location",
              pincode: data.pincode || "000000",
              latitude,
              longitude,
              marketCatchmentName:
                data.market_catchment_name || `${data.block} Agro Catchment`,
              nearestMandi:
                data.nearest_mandi || `${data.block} APMC Mandi`,
              distanceToMandiKm: data.distance_to_mandi_km || 5,
            });
          } else {
            setGpsLocation({
              id: "loc-gps-raw",
              state: "Punjab",
              district: "Punjab",
              block: "Punjab",
              villageOrTown: "Your Location",
              pincode: "000000",
              latitude,
              longitude,
              marketCatchmentName: "Local Catchment",
              nearestMandi: "Nearest APMC Mandi",
              distanceToMandiKm: 5,
            });
          }
        } catch {
          setGpsLocation({
            id: "loc-gps-raw",
            state: "Punjab",
            district: "Punjab",
            block: "Punjab",
            villageOrTown: "Your Location",
            pincode: "000000",
            latitude,
            longitude,
            marketCatchmentName: "Local Catchment",
            nearestMandi: "Nearest APMC Mandi",
            distanceToMandiKm: 5,
          });
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsError(err.message || "Location access denied.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [location]);

  // Derive activeLocation: profile location > GPS location > static fallback
  const activeLocation: VentureLocation = useMemo(() => {
    if (location) return location;
    if (gpsLocation) return gpsLocation;
    // Static fallback — only shown while GPS is loading or denied
    return {
      id: "loc-default",
      state: "Punjab",
      district: "Ludhiana",
      block: "Jagraon",
      villageOrTown: "Jagraon",
      pincode: "142026",
      latitude: 30.7853,
      longitude: 75.4731,
      marketCatchmentName: "Jagraon Commercial Catchment",
      nearestMandi: "Jagraon APMC Main Grain & Fodder Mandi",
      distanceToMandiKm: 1.8,
    };
  }, [location, gpsLocation]);

  // Load Market Analysis whenever radius or location changes.
  // Skip while GPS is still resolving to avoid loading at the static fallback
  // and immediately re-loading at the real GPS location.
  const loadMarketIntelligence = useCallback(async () => {
    if (!location && gpsLoading) return; // Wait for GPS before loading
    try {
      setLoading(true);
      const [mkt, rankedComps, mandiList, prices] = await Promise.all([
        marketService.getAnalysis(radiusKm, activeLocation),
        marketService.getRankedCompetitors(radiusKm, activeLocation),
        marketService.getMarkets(radiusKm, activeLocation),
        marketService.getPriceSignals(),
      ]);

      setMarket(mkt);
      setCompetitors(rankedComps);
      setMarkets(mandiList);
      setPriceSignals(prices);
    } catch (err) {
      console.error("Failed to load market intelligence", err);
    } finally {
      setLoading(false);
      setIsSwitchingRadius(false);
    }
  }, [radiusKm, activeLocation, location, gpsLoading]);

  useEffect(() => {
    loadMarketIntelligence();
  }, [loadMarketIntelligence]);

  // Handle Radius Toggle with subtle progressive transition per Section 26 & 27
  const handleRadiusSwitch = (newRadius: 5 | 10) => {
    if (newRadius === radiusKm) return;
    setIsSwitchingRadius(true);
    setRadiusKm(newRadius);
    setSelectedRadius(newRadius);
    setSelectedCompetitorId(null);
  };

  // Find currently selected competitor object
  const selectedCompetitor = useMemo(() => {
    if (!selectedCompetitorId) return null;
    return competitors.find((c) => c.id === selectedCompetitorId) || null;
  }, [selectedCompetitorId, competitors]);

  // Filtered competitor list for the Top 10 table
  const filteredCompetitors = useMemo(() => {
    return competitors.filter((comp) => {
      if (mapFilters.categoryFilter !== "all") {
        if (
          comp.category?.toLowerCase() !== mapFilters.categoryFilter.toLowerCase() &&
          comp.type !== mapFilters.categoryFilter
        ) {
          return false;
        }
      }
      if (mapFilters.distanceFilter === "<2km" && comp.distanceKm >= 2) return false;
      if (
        mapFilters.distanceFilter === "2-5km" &&
        (comp.distanceKm < 2 || comp.distanceKm > 5)
      )
        return false;
      if (
        mapFilters.distanceFilter === "5-10km" &&
        (comp.distanceKm < 5 || comp.distanceKm > 10)
      )
        return false;

      return true;
    });
  }, [competitors, mapFilters.categoryFilter, mapFilters.distanceFilter]);

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* ========================================================
            TOP CONTEXT BAR & RADIUS SWITCHER
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <Store size={16} />
              <span>Hyper-Local Market Intelligence</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241b16] tracking-tight">
              Local Market &amp; Competitor Radar
            </h1>
            <p className="text-xs sm:text-sm text-[#786d65] mt-1 max-w-2xl">
              Geospatial catchment analysis around {activeLocation.villageOrTown} ·{" "}
              {activeLocation.block}, {activeLocation.district}. Evaluating reachable households,
              commercial clusters, and prevailing price signals.
            </p>
          </div>

          {/* Radius Toggle 5 km vs 10 km */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#ede3d8] shadow-xs self-start sm:self-auto shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#786d65] px-2.5">
              Catchment:
            </span>
            <button
              type="button"
              onClick={() => handleRadiusSwitch(5)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                radiusKm === 5
                  ? "bg-[#c75d3e] text-white shadow-xs"
                  : "text-[#241b16] hover:bg-[#faf4ee]"
              }`}
            >
              5 km Catchment
            </button>
            <button
              type="button"
              onClick={() => handleRadiusSwitch(10)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                radiusKm === 10
                  ? "bg-[#c75d3e] text-white shadow-xs"
                  : "text-[#241b16] hover:bg-[#faf4ee]"
              }`}
            >
              10 km Regional
            </button>
          </div>
        </div>

        {/* Live Analysis Notification Banner per Section 27 */}
        {isSwitchingRadius && (
          <div className="p-3 rounded-2xl bg-[#faf4ee] border border-[#c75d3e]/30 flex items-center justify-between text-xs text-[#241b16] animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-medium">
              <Loader2 size={14} className="animate-spin text-[#c75d3e]" />
              <span>
                Analyzing {radiusKm} km market catchment... Updating population reach and
                competitor nodes
              </span>
            </div>
            <span className="text-[11px] text-[#786d65]">Geospatial Survey Sync</span>
          </div>
        )}

        {/* GPS Location Status Banner */}
        {!location && gpsLoading && (
          <div className="p-3 rounded-2xl bg-[#f0f7f4] border border-[#3a6b4c]/30 flex items-center gap-2 text-xs text-[#241b16] animate-in fade-in duration-200">
            <Loader2 size={14} className="animate-spin text-[#3a6b4c] shrink-0" />
            <span className="font-medium text-[#3a6b4c]">Detecting your location…</span>
            <span className="text-[#786d65]">Requesting GPS to center the map on your area</span>
          </div>
        )}
        {!location && gpsLocation && !gpsLoading && (
          <div className="p-3 rounded-2xl bg-[#f0f7f4] border border-[#3a6b4c]/30 flex items-center gap-2 text-xs text-[#241b16] animate-in fade-in duration-200">
            <MapPin size={14} className="text-[#3a6b4c] shrink-0" />
            <span className="font-medium text-[#3a6b4c]">Using your current location</span>
            <span className="text-[#786d65]">
              Map centered on {gpsLocation.villageOrTown}, {gpsLocation.district}
            </span>
          </div>
        )}
        {!location && gpsError && !gpsLoading && (
          <div className="p-3 rounded-2xl bg-[#faf4ee] border border-[#786d65]/30 flex items-center gap-2 text-xs text-[#241b16] animate-in fade-in duration-200">
            <Compass size={14} className="text-[#786d65] shrink-0" />
            <span className="text-[#786d65]">
              Location access denied — showing default Punjab area. Complete onboarding to set your
              location.
            </span>
          </div>
        )}

        {/* ========================================================
            MAIN GEOSPATIAL WORKSPACE (SPLIT LAYOUT)
            Left: Large Map (65-70%) | Right: Intelligence Panel (30-35%)
           ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left / Center: Large Interactive Map */}
          <div className="lg:col-span-8 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#786d65] flex items-center gap-1.5">
                <MapPin size={13} className="text-[#c75d3e]" />
                <span>Geospatial Radar Canvas ({radiusKm} km radius)</span>
              </span>
              <span className="text-xs text-[#3a6b4c] font-semibold flex items-center gap-1">
                <ShieldCheck size={13} />
                <span>Cadastral Survey Layer</span>
              </span>
            </div>

            <DynamicMarketMapWrapper
              location={activeLocation}
              competitors={competitors}
              markets={markets}
              radiusKm={radiusKm}
              selectedCompetitorId={selectedCompetitorId}
              hoveredCompetitorId={hoveredCompetitorId}
              onSelectCompetitor={(comp) => setSelectedCompetitorId(comp ? comp.id : null)}
              filters={mapFilters}
              onFilterChange={setMapFilters}
            />
          </div>

          {/* Right: Market Intelligence Panel */}
          <div className="lg:col-span-4">
            {market ? (
              <MarketIntelligencePanel
                market={market}
                radiusKm={radiusKm}
                selectedCompetitor={selectedCompetitor}
                onClearSelectedCompetitor={() => setSelectedCompetitorId(null)}
                onSelectCompetitorById={(id) => setSelectedCompetitorId(id)}
              />
            ) : (
              <div className="w-full h-80 bg-white rounded-3xl border border-[#ede3d8] flex items-center justify-center p-6 text-center text-xs text-[#786d65]">
                <Loader2 size={20} className="animate-spin text-[#c75d3e] mb-2" />
                <span>Synthesizing catchment intelligence...</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            BOTTOM SECTION: TOP 10 COMPETITORS RANKED TABLE
           ======================================================== */}
        <div id="top-competitors-section">
          <TopCompetitorsTable
            competitors={filteredCompetitors}
            selectedCompetitorId={selectedCompetitorId}
            hoveredCompetitorId={hoveredCompetitorId}
            onSelectCompetitor={(comp) => setSelectedCompetitorId(comp.id)}
            onHoverCompetitor={setHoveredCompetitorId}
            categoryFilter={mapFilters.categoryFilter}
            distanceFilter={mapFilters.distanceFilter}
            onCategoryFilterChange={(cat) =>
              setMapFilters({ ...mapFilters, categoryFilter: cat })
            }
            onDistanceFilterChange={(dist) =>
              setMapFilters({ ...mapFilters, distanceFilter: dist })
            }
          />
        </div>

        {/* ========================================================
            LOCAL PRICE SIGNALS SECTION
           ======================================================== */}
        <PriceSignalsSection priceSignals={priceSignals} />

        {/* ========================================================
            WHAT THE DATA SUGGESTS (STRUCTURED SIGNALS)
           ======================================================== */}
        {market && market.marketSignals && (
          <MarketSignalsSection
            positiveSignals={market.marketSignals.positive}
            watchouts={market.marketSignals.watchouts}
          />
        )}

        {/* ========================================================
            LOCAL GAP & OPPORTUNITY CARD
           ======================================================== */}
        {market && market.localGapInsight && (
          <LocalGapCard
            headline={market.localGapInsight.headline}
            observation={market.localGapInsight.observation}
            opportunity={market.localGapInsight.opportunity}
          />
        )}

        {/* ========================================================
            BOTTOM NAVIGATION BRIDGES
           ======================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#ede3d8]">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ede3d8] bg-white text-[#241b16] font-bold text-xs hover:bg-[#faf4ee] transition-colors"
          >
            <span>← Back to Dashboard</span>
          </Link>

          <Link
            href="/opportunity"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white font-bold text-xs shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <span>Proceed to Opportunity Analysis</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

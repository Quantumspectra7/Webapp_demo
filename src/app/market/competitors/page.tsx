"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { DynamicMapWrapper } from "@/components/maps/DynamicMapWrapper";
import { marketService, profileService } from "@/services";
import { Competitor, MarketAnalysis, VentureLocation } from "@/domain";
import { formatCurrency, formatDistance } from "@/lib/formatters";
import {
  Store,
  Filter,
  MapPin,
  Building2,
  TrendingUp,
  ArrowLeft,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function CompetitorsMapPage() {
  const [radiusKm, setRadiusKm] = useState<5 | 10>(5);
  const [market, setMarket] = useState<MarketAnalysis | null>(null);
  const [location, setLocation] = useState<VentureLocation | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [mkt, loc] = await Promise.all([
          marketService.getAnalysis(radiusKm),
          profileService.getLocation(),
        ]);
        setMarket(mkt);
        setLocation(loc);
        if (mkt.competitors.length > 0) {
          setSelectedCompetitor(mkt.competitors[0]);
        }
      } catch (err) {
        console.error("Failed to load competitor data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [radiusKm]);

  const demoLoc: VentureLocation = location || {
    id: "loc-1",
    state: "Punjab",
    district: "Ludhiana",
    block: "Jagraon",
    villageOrTown: "Sidhwan Bet",
    pincode: "142026",
    latitude: 30.7853,
    longitude: 75.4731,
    marketCatchmentName: "Jagraon Milk Shed",
    nearestMandi: "Jagraon Grain Mandi",
    distanceToMandiKm: 4.2,
  };

  const filteredCompetitors = (market?.competitors || []).filter((c) => {
    if (selectedType === "all") return true;
    return c.type === selectedType;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Breadcrumb & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ddd6c9] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/market"
                className="text-[13px] font-bold text-[#706c63] hover:text-[#9d3e21] flex items-center gap-1"
              >
                <ArrowLeft size={15} />
                <span>Market Intelligence</span>
              </Link>
              <span className="text-[#ddd6c9]">/</span>
              <span className="text-[13px] font-bold text-[#9d3e21]">
                Competitor Mapping
              </span>
            </div>
            <h1 className="font-serif-editorial text-[28px] sm:text-[32px] font-bold text-[#25231f]">
              Competitor Nodes & Market Catchment
            </h1>
          </div>

          {/* 5 km vs 10 km Radius Control */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#ddd6c9] shadow-2xs self-start sm:self-auto">
            <span className="text-[11px] uppercase font-bold text-[#706c63] px-2.5">
              Radius:
            </span>
            <button
              onClick={() => setRadiusKm(5)}
              className={`px-3 py-1 rounded-lg text-[13px] font-bold transition-all ${
                radiusKm === 5
                  ? "bg-[#9d3e21] text-white shadow-2xs"
                  : "text-[#56423d] hover:text-[#1d1b18]"
              }`}
            >
              5 km Catchment
            </button>
            <button
              onClick={() => setRadiusKm(10)}
              className={`px-3 py-1 rounded-lg text-[13px] font-bold transition-all ${
                radiusKm === 10
                  ? "bg-[#9d3e21] text-white shadow-2xs"
                  : "text-[#56423d] hover:text-[#1d1b18]"
              }`}
            >
              10 km Regional
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-bold text-[#706c63] flex items-center gap-1 mr-1">
            <Filter size={14} />
            <span>Filter Type:</span>
          </span>
          {[
            { id: "all", label: `All (${market?.competitors.length || 0})` },
            { id: "chilling_hub", label: "Chilling Hubs" },
            { id: "cooperative_center", label: "Cooperative Centers" },
            { id: "local_dairy", label: "Local Dairies" },
            { id: "sweet_maker", label: "Sweet Makers" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedType(item.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${
                selectedType === item.id
                  ? "bg-[#25231f] text-white border-[#25231f]"
                  : "bg-white text-[#56423d] border-[#ddd6c9] hover:border-[#b8aba0]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 2-Column Interactive Map + Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
          {/* Map Column (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#ddd6c9] p-3 shadow-xs flex flex-col h-[580px]">
            <DynamicMapWrapper
              location={demoLoc}
              competitors={filteredCompetitors}
              radiusKm={radiusKm}
              selectedCompetitorId={selectedCompetitor?.id}
              onSelectCompetitor={(comp) => setSelectedCompetitor(comp)}
            />
          </div>

          {/* Inspector Column (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {selectedCompetitor ? (
              <div className="bg-white rounded-2xl border border-[#ddd6c9] p-6 shadow-xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#ddd6c9] pb-3 mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#fbebe4] text-[#9d3e21] border border-[#ffb5a0]">
                      {selectedCompetitor.type.replace("_", " ")}
                    </span>
                    <span className="text-[13px] font-bold text-[#706c63]">
                      {formatDistance(selectedCompetitor.distanceKm)} from site
                    </span>
                  </div>

                  <h2 className="font-serif-editorial text-[22px] font-bold text-[#25231f] mb-1">
                    {selectedCompetitor.name}
                  </h2>
                  <p className="text-[12px] text-[#706c63] mb-5">
                    Location: {selectedCompetitor.primaryArea} · Active since {selectedCompetitor.operationalSinceYear}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 rounded-xl bg-[#f9f3ec] border border-[#e7ded5]">
                      <span className="text-[11px] text-[#706c63] uppercase font-bold">
                        Daily Capacity
                      </span>
                      <p className="text-[18px] font-bold text-[#1d1b18] mt-0.5">
                        {selectedCompetitor.dailyCapacityLiters} L/day
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f9f3ec] border border-[#e7ded5]">
                      <span className="text-[11px] text-[#706c63] uppercase font-bold">
                        Procurement Price
                      </span>
                      <p className="text-[18px] font-bold text-[#9d3e21] mt-0.5">
                        ₹{selectedCompetitor.procurementPricePerLiter} / L
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-[13px] text-[#56423d]">
                    <div>
                      <span className="font-bold text-[#1d1b18] block mb-0.5">
                        Primary Key Strength:
                      </span>
                      <p className="p-2.5 rounded-lg bg-[#f3ede6] border border-[#ddd6c9]">
                        {selectedCompetitor.keyStrength}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-[#536346] block mb-0.5">
                        GramVest Strategic Counter-Strategy:
                      </span>
                      <p className="p-2.5 rounded-lg bg-[#dde6da] border border-[#bbcca9] text-[#25231f]">
                        Install digital MilkoTester at reception to provide immediate fat & SNF slips. Farmers in Sidhwan Bet report dissatisfaction with manual lactometer deductions here.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#eee8df] mt-4">
                  <button
                    onClick={() => {
                      const nextIndex =
                        (filteredCompetitors.findIndex((c) => c.id === selectedCompetitor.id) + 1) %
                        filteredCompetitors.length;
                      setSelectedCompetitor(filteredCompetitors[nextIndex]);
                    }}
                    className="w-full py-2 bg-[#f9f3ec] hover:bg-[#e7ded5] text-[#25231f] text-[12px] font-bold rounded-xl border border-[#ddd6c9] transition-colors"
                  >
                    Inspect Next Competitor →
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#ddd6c9] p-6 shadow-xs flex flex-col items-center justify-center text-center text-[#706c63]">
                <Info size={32} className="text-[#8a726b] mb-2" />
                <p className="font-bold text-[14px]">Click a competitor marker</p>
                <p className="text-[12px]">Select any pin on the map to inspect capacity and pricing.</p>
              </div>
            )}
          </div>
        </div>

        {/* Coverage Note Disclaimer */}
        <div className="p-3.5 rounded-xl bg-[#f9f3ec] border border-[#ddd6c9] text-[12px] text-[#706c63] flex items-center gap-2">
          <Info size={16} className="text-[#8a726b] flex-shrink-0" />
          <span>
            <strong>Data Coverage Note: </strong>
            Competitor records are compiled from Punjab Mandi Board trade registrations, dairy cooperative milk routes, and field observations. Informal unorganized village milk vendors (dhodhis) may not be individually mapped.
          </span>
        </div>
      </div>
    </AppShell>
  );
}

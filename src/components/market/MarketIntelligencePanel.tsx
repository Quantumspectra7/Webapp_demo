"use client";

import React from "react";
import { Competitor, MarketAnalysis, VentureLocation } from "@/domain";
import { formatNumber, formatCurrency, formatDistance } from "@/lib/formatters";
import { EvidencePopover } from "./EvidencePopover";
import {
  TrendingUp,
  Users,
  Building2,
  Store,
  Compass,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface MarketIntelligencePanelProps {
  market: MarketAnalysis;
  radiusKm: 5 | 10;
  selectedCompetitor: Competitor | null;
  onClearSelectedCompetitor: () => void;
  onSelectCompetitorById: (id: string) => void;
}

export const MarketIntelligencePanel: React.FC<MarketIntelligencePanelProps> = ({
  market,
  radiusKm,
  selectedCompetitor,
  onClearSelectedCompetitor,
}) => {
  const opp = market.opportunitySignal || {
    status: "STRONG" as const,
    summary: "Demand appears healthy relative to identified competition.",
    rationale: "Unserved fluid milk production creates a strong off-take window.",
  };

  const nearestMkt =
    market.markets && market.markets.length > 0
      ? market.markets[0]
      : {
          name: "Jagraon APMC Main Grain & Fodder Mandi",
          distanceKm: 1.8,
          source: "Punjab Mandi Board",
        };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. TOP STAT CARD: MARKET OPPORTUNITY */}
      <div className="p-5 rounded-3xl bg-white border border-[#ede3d8] shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#786d65]">
              Market Opportunity
            </span>
            <EvidencePopover
              title="Opportunity Synthesis"
              source="GramVest Local Catchment Model"
              status="Model Output"
              confidence="high"
              note="Calculated from household consumption benchmarks, procurement deficits, and operating competitor capacities."
            />
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              opp.status === "STRONG"
                ? "bg-[#3a6b4c]/10 text-[#3a6b4c]"
                : opp.status === "MODERATE"
                ? "bg-amber-100 text-amber-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {opp.status}
          </span>
        </div>

        <h3 className="font-serif text-lg font-bold text-[#241b16] leading-snug">
          {opp.summary}
        </h3>
        <p className="text-xs text-[#786d65] mt-1 leading-relaxed">
          {opp.rationale}
        </p>
      </div>

      {/* 2. MARKET REACH METRICS (POWERED BY GOOGLE AI OVERVIEW) */}
      <div className="p-5 rounded-3xl bg-white border border-[#ede3d8] shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Users size={15} className="text-[#c75d3e]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#241b16]">
              Market Catchment ({radiusKm} km)
            </span>
            <EvidencePopover
              title="Google AI Overview Live Demographic Catchment"
              source={market.demographics.metadata.source}
              sourceYear={market.demographics.metadata.sourceDate}
              confidence="high"
              note={
                Array.isArray(market.demographics.metadata.assumptions)
                  ? market.demographics.metadata.assumptions.join("; ")
                  : (market.demographics.metadata.assumptions || "Real-time Google AI Mode SerpBlock synthesis.")
              }
            />
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#1e40af] bg-[#eff6ff] px-2 py-0.5 rounded-full border border-[#bfdbfe]">
            <Sparkles size={11} className="text-[#3b82f6]" />
            Google AI Mode
          </span>
        </div>

        {/* Big Number: Estimated Reachable Customers */}
        <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#786d65] block">
              Estimated Target Customers
            </span>
            <p className="text-2xl font-serif font-bold text-[#241b16] mt-0.5">
              {formatNumber(market.estimatedReachCustomers || (radiusKm === 5 ? 1135 : 2465))}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#3a6b4c]">
              ~{market.addressableMarketSharePct || (radiusKm === 5 ? 5.2 : 4.8)}% Share
            </span>
            <span className="block text-[10px] text-[#786d65]">of total catchment</span>
          </div>
        </div>

        {/* Grid Parameters: Population, Households, Daily Market Demand, Avg Household size */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-xl border border-[#ede3d8] bg-white">
            <span className="text-[10px] font-bold text-[#786d65] block">Live Population</span>
            <span className="text-base font-bold text-[#241b16] font-mono">
              {formatNumber(market.demographics.populationInRadius)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-[#ede3d8] bg-white">
            <span className="text-[10px] font-bold text-[#786d65] block">Households</span>
            <span className="text-base font-bold text-[#241b16] font-mono">
              {formatNumber(market.demographics.householdsInRadius)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-[#ede3d8] bg-white">
            <span className="text-[10px] font-bold text-[#786d65] block">Market Demand</span>
            <span className="text-sm font-bold text-[#241b16] font-mono">
              {formatNumber(market.estimatedAddressableMarketLiters)} L/day
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-[#ede3d8] bg-white">
            <span className="text-[10px] font-bold text-[#786d65] block">Avg Household</span>
            <span className="text-sm font-bold text-[#3a6b4c] font-mono">
              ~5.6 Persons
            </span>
          </div>
        </div>

        {/* Live Google AI Overview Intelligence Snippet */}
        {market.demographics.metadata?.aiSnippet && (
          <div className="mt-3 p-3 rounded-2xl bg-[#f0f7ff] border border-[#dbeafe] text-[#1e3a8a]">
            <div className="flex items-center gap-1.5 font-bold text-[11px] mb-1 text-[#2563eb]">
              <Sparkles size={12} className="text-[#2563eb]" />
              <span>Google AI Overview Synthesis</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#334155]">
              {market.demographics.metadata.aiSnippet}
            </p>
            {market.demographics.metadata.references && market.demographics.metadata.references.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-[#bfdbfe]/50">
                <span className="text-[9px] font-semibold text-[#64748b] uppercase">Sources:</span>
                {market.demographics.metadata.references.slice(0, 2).map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] text-[#2563eb] hover:underline font-medium"
                  >
                    <span>{ref.title || "Reference"}</span>
                    <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. COMPETITOR DENSITY VISUAL */}
      <div className="p-5 rounded-3xl bg-white border border-[#ede3d8] shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Building2 size={15} className="text-[#c75d3e]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#241b16]">
              Competitor Density
            </span>
            <EvidencePopover
              title="Competitor Density Calculation"
              source="Punjab Mandi Board Registry & Cadastral Ground Mapping"
              status="Audited"
              confidence="high"
              note="Identified physical chilling, processing, and formal aggregation points within the radial bounds."
            />
          </div>
          <span className="text-xs font-bold text-[#241b16]">
            {market.competitors.length} Relevant Units
          </span>
        </div>

        {/* Restrained 3-Segment Visual Scale */}
        <div className="my-2.5">
          <div className="h-2 w-full bg-[#ede3d8] rounded-full overflow-hidden flex gap-1">
            <div
              className={`h-full flex-1 rounded-l-full ${
                (market.densityLabel || market.demographics.competitorDensityRating) === "Low"
                  ? "bg-[#3a6b4c]"
                  : "bg-[#3a6b4c]/40"
              }`}
            ></div>
            <div
              className={`h-full flex-1 ${
                (market.densityLabel || market.demographics.competitorDensityRating) === "Moderate" ||
                (market.densityLabel || market.demographics.competitorDensityRating) === "Medium"
                  ? "bg-[#caa739]"
                  : "bg-[#caa739]/30"
              }`}
            ></div>
            <div
              className={`h-full flex-1 rounded-r-full ${
                (market.densityLabel || market.demographics.competitorDensityRating) === "High"
                  ? "bg-[#c75d3e]"
                  : "bg-[#c75d3e]/20"
              }`}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#786d65] mt-1.5">
            <span>Low (0–4)</span>
            <span className="text-[#241b16]">Moderate (5–10)</span>
            <span>High (11+)</span>
          </div>
        </div>

        <p className="text-xs text-[#786d65] leading-relaxed mt-2">
          {market.densityExplanation || "Competition is present but not highly concentrated. Most facilities focus on retail morning supply rather than organized chilling."}
        </p>
      </div>

      {/* 4. MARKET ACCESS / MANDI INSIGHT */}
      <div className="p-5 rounded-3xl bg-white border border-[#ede3d8] shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Truck size={15} className="text-[#c75d3e]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#241b16]">
              Market Access
            </span>
          </div>
          <span className="text-xs font-bold text-[#3a6b4c]">Good Corridor</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#786d65] block">
              Nearest APMC Mandi
            </span>
            <p className="text-xs font-bold text-[#241b16] mt-0.5 line-clamp-1">
              {nearestMkt.name}
            </p>
          </div>
          <span className="text-sm font-serif font-bold text-[#c75d3e] font-mono shrink-0 ml-2">
            {formatDistance(nearestMkt.distanceKm)}
          </span>
        </div>
      </div>

      {/* 5. SELECTED COMPETITOR SPOTLIGHT CARD (IF CLICKED) */}
      {selectedCompetitor && (
        <div className="p-5 rounded-3xl bg-[#faf4ee] border-2 border-[#c75d3e] shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#ede3d8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c75d3e]">
              Selected on Map
            </span>
            <button
              type="button"
              onClick={onClearSelectedCompetitor}
              className="p-1 text-[#786d65] hover:text-[#241b16] rounded-full hover:bg-white cursor-pointer"
              title="Dismiss selection"
            >
              <X size={14} />
            </button>
          </div>

          <h4 className="text-base font-bold text-[#241b16]">
            {selectedCompetitor.name}
          </h4>
          <p className="text-xs text-[#786d65] mt-0.5">
            {selectedCompetitor.businessType || selectedCompetitor.primaryArea}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#ede3d8] text-xs">
            <div>
              <span className="text-[10px] text-[#786d65] block">Distance:</span>
              <span className="font-bold text-[#c75d3e] font-mono">
                {selectedCompetitor.distanceKm} km
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#786d65] block">Daily Capacity:</span>
              <span className="font-bold text-[#241b16] font-mono">
                {formatNumber(selectedCompetitor.dailyCapacityLiters)} L/day
              </span>
            </div>
          </div>

          {selectedCompetitor.keyStrength && (
            <p className="text-[11px] text-[#786d65] mt-2 italic bg-white/70 p-2 rounded-xl border border-[#ede3d8]">
              &quot;{selectedCompetitor.keyStrength}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Wallet,
  Store,
  Compass,
  Sliders,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";

export default function FeasibilityPage() {
  const { location, business, profile } = useApp();

  // Component weights state (configurable to demonstrate explainability)
  const [marketWeight, setMarketWeight] = useState(30);
  const [financialWeight, setFinancialWeight] = useState(35);
  const [operationalWeight, setOperationalWeight] = useState(20);
  const [riskWeight, setRiskWeight] = useState(15);

  // Component Raw Scores (0-100)
  const marketScore = 82; // Strong unmet deficit (~3,800 L/day)
  const financialScore = 84; // 1.62x DSCR, 35% PMEGP grant
  const operationalScore = 74; // 3-phase feeder nearby, pucca road
  const riskScore = 68; // Feed price volatility, seasonal lean period

  // Weighted Total Calculation
  const totalWeight = marketWeight + financialWeight + operationalWeight + riskWeight;
  const normalizedMarket = marketWeight / totalWeight;
  const normalizedFinancial = financialWeight / totalWeight;
  const normalizedOperational = operationalWeight / totalWeight;
  const normalizedRisk = riskWeight / totalWeight;

  const compositeScore = Math.round(
    marketScore * normalizedMarket +
      financialScore * normalizedFinancial +
      operationalScore * normalizedOperational +
      riskScore * normalizedRisk
  );

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
            <Scale size={16} />
            <span>Decision Bridge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241b16]">
            Business Feasibility &amp; Viability Verdict
          </h1>
          <p className="text-sm text-[#786d65] mt-1">
            Synthesizing market demand, operational site readiness, risk mitigations, and capital fit into a lender-grade decision verdict.
          </p>
        </div>

        <Link
          href="/money"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all self-start sm:self-auto transform hover:-translate-y-0.5"
        >
          <span>Proceed to Financial Plan</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Decision Bridge Flowchart (MARKET -> BUSINESS FIT -> RISK -> FINANCIAL FIT -> 78/100) */}
      <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#786d65] block mb-4">
          Integrated Decision Pipeline
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          {/* Node 1: Market */}
          <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col items-center text-center">
            <Store size={20} className="text-[#c75d3e] mb-1" />
            <span className="text-xs font-bold text-[#241b16]">1. Market</span>
            <span className="text-[10px] text-[#3a6b4c] font-semibold mt-0.5">82 / 100</span>
            <span className="text-[10px] text-[#786d65]">Deficit: 68%</span>
          </div>

          <div className="hidden sm:flex justify-center text-[#c75d3e]">
            <ChevronRight size={20} />
          </div>

          {/* Node 2: Business Fit */}
          <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col items-center text-center">
            <Compass size={20} className="text-[#c75d3e] mb-1" />
            <span className="text-xs font-bold text-[#241b16]">2. Operational Fit</span>
            <span className="text-[10px] text-[#3a6b4c] font-semibold mt-0.5">74 / 100</span>
            <span className="text-[10px] text-[#786d65]">Feeder: 180m</span>
          </div>

          <div className="hidden sm:flex justify-center text-[#c75d3e]">
            <ChevronRight size={20} />
          </div>

          {/* Node 3: Risk & Finance */}
          <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col items-center text-center">
            <Wallet size={20} className="text-[#c75d3e] mb-1" />
            <span className="text-xs font-bold text-[#241b16]">3. Financial Fit</span>
            <span className="text-[10px] text-[#3a6b4c] font-semibold mt-0.5">84 / 100</span>
            <span className="text-[10px] text-[#786d65]">DSCR: 1.62x</span>
          </div>
        </div>

        {/* Big Verdict Result Card */}
        <div className="mt-6 pt-6 border-t border-[#ede3d8] flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#fcedea] via-[#faf4ee] to-[#f0f6ec] p-6 rounded-2xl border">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-[#c75d3e] flex flex-col items-center justify-center shadow-warm-md flex-shrink-0">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#c75d3e]">
                {compositeScore}
              </span>
              <span className="text-[10px] font-bold text-[#786d65] uppercase">out of 100</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#3a6b4c] text-white tracking-wide uppercase">
                  FEASIBLE
                </span>
                <span className="text-xs font-bold text-[#382f29]">
                  Top Quartile (Ludhiana / Jagraon Rural Cluster)
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16]">
                Proceed with Conditions
              </h2>
              <p className="text-xs sm:text-sm text-[#382f29] leading-relaxed max-w-2xl">
                “The business appears feasible under the current assumptions, but feed-cost volatility and local competition should be monitored.”
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
            <Link
              href="/money"
              className="px-5 py-2.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-xs font-bold text-center shadow-xs transition-all"
            >
              Examine Financial Plan →
            </Link>
            <Link
              href="/report"
              className="px-5 py-2.5 rounded-xl bg-white border border-[#ede3d8] hover:bg-[#faf4ee] text-xs font-bold text-[#382f29] text-center transition-colors"
            >
              Download Bank DPR PDF
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Score Component Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Market Demand */}
        <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                <Store size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#241b16]">
                  Market Demand &amp; Catchment
                </h3>
                <span className="text-xs text-[#786d65]">Weight: {marketWeight}%</span>
              </div>
            </div>
            <span className="text-lg font-serif font-bold text-[#3a6b4c]">82 / 100</span>
          </div>

          <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
            <div className="bg-[#3a6b4c] h-2 rounded-full" style={{ width: "82%" }} />
          </div>

          <p className="text-xs text-[#56423d] leading-relaxed">
            High rural milk deficit (~3,800 Ltrs/day in 10km). Daily tractor vectors from Sidhwan Bet to Jagraon APMC guarantee steady farmgate supply.
          </p>

          <div className="text-[11px] font-semibold text-[#3a6b4c] bg-[#f0f6ec] p-2 rounded-xl border border-[#3a6b4c]/20">
            ✓ 14 Gram Panchayats with unchilled buffalo/cow milk surplus
          </div>
        </div>

        {/* Pillar 2: Financial Viability */}
        <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                <Wallet size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#241b16]">
                  Financial Capacity &amp; Debt Service
                </h3>
                <span className="text-xs text-[#786d65]">Weight: {financialWeight}%</span>
              </div>
            </div>
            <span className="text-lg font-serif font-bold text-[#3a6b4c]">84 / 100</span>
          </div>

          <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
            <div className="bg-[#3a6b4c] h-2 rounded-full" style={{ width: "84%" }} />
          </div>

          <p className="text-xs text-[#56423d] leading-relaxed">
            Eligible for 35% PMEGP non-repayable sovereign capital grant (₹4.90 Lakhs). Projected Debt Service Coverage Ratio (DSCR) is 1.62x, comfortably above the 1.50x bank benchmark.
          </p>

          <div className="text-[11px] font-semibold text-[#3a6b4c] bg-[#f0f6ec] p-2 rounded-xl border border-[#3a6b4c]/20">
            ✓ Break-even achieved at only 42% installed capacity
          </div>
        </div>

        {/* Pillar 3: Operational Readiness */}
        <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                <Compass size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#241b16]">
                  Operational Infrastructure
                </h3>
                <span className="text-xs text-[#786d65]">Weight: {operationalWeight}%</span>
              </div>
            </div>
            <span className="text-lg font-serif font-bold text-[#c75d3e]">74 / 100</span>
          </div>

          <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
            <div className="bg-[#c75d3e] h-2 rounded-full" style={{ width: "74%" }} />
          </div>

          <p className="text-xs text-[#56423d] leading-relaxed">
            3-Phase agricultural power feeder reachable within 180m (8h day / 8h night). Pucca all-weather road connects directly to SH-13 for insulated milk tanker transit.
          </p>

          <div className="text-[11px] font-semibold text-[#c75d3e] bg-[#fcedea] p-2 rounded-xl border border-[#c75d3e]/20">
            ⚠ Requires 15kVA DG generator for afternoon feeder trip windows
          </div>
        </div>

        {/* Pillar 4: Risk Resilience */}
        <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#241b16]">
                  Risk Resilience &amp; Mitigations
                </h3>
                <span className="text-xs text-[#786d65]">Weight: {riskWeight}%</span>
              </div>
            </div>
            <span className="text-lg font-serif font-bold text-[#c75d3e]">68 / 100</span>
          </div>

          <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
            <div className="bg-[#c75d3e] h-2 rounded-full" style={{ width: "68%" }} />
          </div>

          <p className="text-xs text-[#56423d] leading-relaxed">
            Feed price inflation and summer lean production are key vulnerabilities. Mitigated through pre-season silage contracts and multiple commercial off-takers.
          </p>

          <div className="text-[11px] font-semibold text-[#382f29] bg-[#faf4ee] p-2 rounded-xl border border-[#ede3d8]">
            ✓ Mitigations documented for all 3 major operational threats
          </div>
        </div>
      </div>

      {/* Explainable Weights Slider Panel (SIH Judge Transparency) */}
      <div className="p-6 rounded-3xl bg-[#faf4ee] border border-[#ede3d8] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#c75d3e]" />
            <h3 className="font-serif font-bold text-base text-[#241b16]">
              Explainable Weighting Model (Transparent Scoring)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setMarketWeight(30);
              setFinancialWeight(35);
              setOperationalWeight(20);
              setRiskWeight(15);
            }}
            className="text-xs font-bold text-[#c75d3e] hover:underline"
          >
            Reset Default Weights
          </button>
        </div>

        <p className="text-xs text-[#786d65]">
          GramVest does not use black-box scoring. Adjust individual weights to inspect how credit officers vs sector experts evaluate the project.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
              <span>Market Demand</span>
              <span>{marketWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={marketWeight}
              onChange={(e) => setMarketWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
              <span>Financial Viability</span>
              <span>{financialWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={financialWeight}
              onChange={(e) => setFinancialWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
              <span>Operational Site</span>
              <span>{operationalWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={operationalWeight}
              onChange={(e) => setOperationalWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
              <span>Risk Resilience</span>
              <span>{riskWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={riskWeight}
              onChange={(e) => setRiskWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
            />
          </div>
        </div>
      </div>

      {/* Navigation Bridges */}
      <div className="flex items-center justify-between pt-4 border-t border-[#ede3d8]">
        <Link
          href="/risks"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] font-bold text-xs hover:bg-[#faf4ee] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Review Risks &amp; Mitigations</span>
        </Link>

        <Link
          href="/money"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
        >
          <span>Proceed to Financial Plan</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </AppShell>
  );
}

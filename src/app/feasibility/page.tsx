"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { marketService } from "@/services";
import { ViabilityScore } from "@/domain";
import { getFeasibilityRationale } from "@/data/real/feasibility_rationales";
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Wallet,
  Store,
  Compass,
  Sliders,
  ChevronRight,
  Info,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function FeasibilityPage() {
  const { location, business, profile, financialScenario } = useApp();

  const [viability, setViability] = useState<ViabilityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Component weights state (Current weights: Market Demand 25%, Competition 20%, Capital Fit 20%, Profit/Cash Flow 20%, Risk 15%)
  const [marketWeight, setMarketWeight] = useState(25);
  const [competitionWeight, setCompetitionWeight] = useState(20);
  const [capitalWeight, setCapitalWeight] = useState(20);
  const [profitWeight, setProfitWeight] = useState(20);
  const [riskWeight, setRiskWeight] = useState(15);

  useEffect(() => {
    async function loadViability() {
      try {
        setLoading(true);
        const data = await marketService.getViabilityScore();
        setViability(data);
      } catch (err) {
        console.error("Failed to load viability score", err);
      } finally {
        setLoading(false);
      }
    }
    loadViability();
  }, [business?.id]);

  // Extract component scores from service data or compute fallback
  const getComponent = (nameMatch: string) => {
    return viability?.components.find((c) =>
      c.category.toLowerCase().includes(nameMatch.toLowerCase())
    );
  };

  const compMarket = getComponent("market") || {
    score: 82,
    driver: `Robust local market off-take in ${location?.villageOrTown || "target area"}`,
    improvementAction: "Collect 2 signed buyer agreements before commissioning",
  };

  const compCompetition = getComponent("competition") || {
    score: 80,
    driver: `Nearby competitors in ${location?.district || "the district"} operate traditional units with unaddressed quality gaps`,
    improvementAction: "Offer branded, hygienic packaging with certified quality standards",
  };

  // Dynamic Capital Fit calculation based on actual ownCapital vs totalProjectCost
  const ownCapital = profile?.ownCapitalAvailable || 100000;
  const projectCost = financialScenario?.totalProjectCost || 1500000;
  const capitalRatio = projectCost > 0 ? ownCapital / projectCost : 0.1;

  let calculatedCapitalScore = 74;
  let capitalDriver = `Your available capital of ₹${ownCapital.toLocaleString("en-IN")} covers the standard 10-15% promoter margin requirement.`;

  if (capitalRatio >= 0.2) {
    calculatedCapitalScore = 88;
    capitalDriver = `Your available capital covers over 20% of the project cost, ensuring minimal debt leverage and prompt loan sanction.`;
  } else if (capitalRatio >= 0.1) {
    calculatedCapitalScore = 76;
    capitalDriver = `Your available capital covers the mandatory promoter equity threshold for an estimated ₹${(projectCost / 100000).toFixed(1)}L project cost.`;
  } else if (capitalRatio >= 0.06) {
    calculatedCapitalScore = 62;
    capitalDriver = `Your available capital covers part of the estimated project cost, leaving a moderate financing requirement.`;
  } else {
    calculatedCapitalScore = 50;
    capitalDriver = `Your available capital is below the 10% equity benchmark, requiring government capital subsidy or co-financing.`;
  }

  const compCapital = getComponent("capital")
    ? {
        ...getComponent("capital")!,
        score: calculatedCapitalScore,
        driver: capitalDriver,
      }
    : {
        score: calculatedCapitalScore,
        driver: capitalDriver,
        improvementAction: "Apply for 35-40% government subsidy to minimize borrowing burden",
      };

  const compProfit = getComponent("profit") || {
    score: 82,
    driver: `Value-addition margins generate healthy cash flow with DSCR > 1.55x`,
    improvementAction: "Lock in bulk raw materials at harvest time to defend peak margins",
  };

  const compRisk = getComponent("risk") || {
    score: 68,
    driver: `Operational threats are addressable through backup power and quality controls`,
    improvementAction: "Maintain adequate emergency working capital reserve",
  };

  // Weighted Total Calculation
  const totalWeight =
    marketWeight + competitionWeight + capitalWeight + profitWeight + riskWeight;

  const compositeScore = Math.round(
    (compMarket.score * marketWeight +
      compCompetition.score * competitionWeight +
      compCapital.score * capitalWeight +
      compProfit.score * profitWeight +
      compRisk.score * riskWeight) /
      (totalWeight || 100)
  );

  const verdictLabel =
    compositeScore >= 80 ? "PROCEED — HIGH FEASIBILITY" : compositeScore >= 65 ? "FEASIBLE WITH CONDITIONS" : "HIGH RISK — CAUTION";

  const rationale = getFeasibilityRationale(
    business?.id,
    location?.villageOrTown || "your target area",
    financialScenario?.projections?.monthlyNetProfit ? `${(financialScenario.projections.monthlyNetProfit / 100000).toFixed(1)}L/mo profit` : undefined
  );

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Top Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <Scale size={16} />
              <span>Decision Bridge · Viability Synthesis</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#241b16]">
              Business Feasibility &amp; Viability Verdict
            </h1>
            <p className="text-sm text-[#786d65] mt-1">
              Synthesizing market demand, competitor saturation, capital fit, cash flow, and risk resilience for{" "}
              <strong className="text-[#241b16]">{business?.title || "your selected venture"}</strong> in{" "}
              {location?.villageOrTown || "your target location"}.
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

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-[#c75d3e]" size={32} />
            <p className="text-xs text-[#786d65]">Synthesizing multi-factor viability verdict...</p>
          </div>
        ) : (
          <>
            {/* Integrated Decision Pipeline Flowchart */}
            <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#786d65]">
                  Integrated Decision Pipeline (Click card for data-driven explanation)
                </span>
                <span className="text-xs text-[#786d65]">
                  Active Venture: <strong className="text-[#241b16]">{business?.title}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                {/* Node 1: Market Demand */}
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === "market" ? null : "market")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeTooltip === "market"
                      ? "bg-[#fcedea] border-[#c75d3e] shadow-sm"
                      : "bg-[#faf4ee] border-[#ede3d8] hover:border-[#c75d3e]/40"
                  }`}
                >
                  <Store size={20} className="text-[#c75d3e] mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#241b16] block">1. Market Demand</span>
                  <span className="text-[11px] text-[#3a6b4c] font-bold mt-0.5 block">
                    {compMarket.score} / 100
                  </span>
                  <span className="text-[10px] text-[#786d65]">Weight: {marketWeight}%</span>
                </button>

                {/* Node 2: Competition */}
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === "comp" ? null : "comp")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeTooltip === "comp"
                      ? "bg-[#fcedea] border-[#c75d3e] shadow-sm"
                      : "bg-[#faf4ee] border-[#ede3d8] hover:border-[#c75d3e]/40"
                  }`}
                >
                  <Compass size={20} className="text-[#c75d3e] mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#241b16] block">2. Competition</span>
                  <span className="text-[11px] text-[#3a6b4c] font-bold mt-0.5 block">
                    {compCompetition.score} / 100
                  </span>
                  <span className="text-[10px] text-[#786d65]">Weight: {competitionWeight}%</span>
                </button>

                {/* Node 3: Capital Fit */}
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === "capital" ? null : "capital")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeTooltip === "capital"
                      ? "bg-[#fcedea] border-[#c75d3e] shadow-sm"
                      : "bg-[#faf4ee] border-[#ede3d8] hover:border-[#c75d3e]/40"
                  }`}
                >
                  <Wallet size={20} className="text-[#c75d3e] mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#241b16] block">3. Capital Fit</span>
                  <span className="text-[11px] text-[#3a6b4c] font-bold mt-0.5 block">
                    {compCapital.score} / 100
                  </span>
                  <span className="text-[10px] text-[#786d65]">Weight: {capitalWeight}%</span>
                </button>

                {/* Node 4: Cash Flow */}
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === "profit" ? null : "profit")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeTooltip === "profit"
                      ? "bg-[#fcedea] border-[#c75d3e] shadow-sm"
                      : "bg-[#faf4ee] border-[#ede3d8] hover:border-[#c75d3e]/40"
                  }`}
                >
                  <TrendingUp size={20} className="text-[#c75d3e] mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#241b16] block">4. Cash Flow</span>
                  <span className="text-[11px] text-[#3a6b4c] font-bold mt-0.5 block">
                    {compProfit.score} / 100
                  </span>
                  <span className="text-[10px] text-[#786d65]">Weight: {profitWeight}%</span>
                </button>

                {/* Node 5: Risk Resilience */}
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === "risk" ? null : "risk")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    activeTooltip === "risk"
                      ? "bg-[#fcedea] border-[#c75d3e] shadow-sm"
                      : "bg-[#faf4ee] border-[#ede3d8] hover:border-[#c75d3e]/40"
                  }`}
                >
                  <ShieldAlert size={20} className="text-[#c75d3e] mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#241b16] block">5. Risk Resilience</span>
                  <span className="text-[11px] text-[#c75d3e] font-bold mt-0.5 block">
                    {compRisk.score} / 100
                  </span>
                  <span className="text-[10px] text-[#786d65]">Weight: {riskWeight}%</span>
                </button>
              </div>

              {/* Data-Driven Explanation Drawer (Triggered by click) */}
              {activeTooltip && (
                <div className="mt-4 p-4 rounded-2xl bg-[#faf4ee] border border-[#c75d3e]/30 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#c75d3e] uppercase flex items-center gap-1.5">
                      <Info size={14} />
                      <span>
                        Data-Driven Explanation:{" "}
                        {activeTooltip === "market"
                          ? "Market Demand"
                          : activeTooltip === "comp"
                          ? "Competition Opportunity"
                          : activeTooltip === "capital"
                          ? "Capital Fit"
                          : activeTooltip === "profit"
                          ? "Profit / Cash Flow Potential"
                          : "Risk Resilience"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTooltip(null)}
                      className="text-xs text-[#786d65] hover:text-[#241b16]"
                    >
                      Close ×
                    </button>
                  </div>
                  <p className="text-xs text-[#241b16] font-medium leading-relaxed">
                    “
                    {activeTooltip === "market"
                      ? compMarket.driver
                      : activeTooltip === "comp"
                      ? compCompetition.driver
                      : activeTooltip === "capital"
                      ? compCapital.driver
                      : activeTooltip === "profit"
                      ? compProfit.driver
                      : compRisk.driver}
                    ”
                  </p>
                  <p className="text-[11px] text-[#786d65] mt-1">
                    <strong>Recommended Action:</strong>{" "}
                    {activeTooltip === "market"
                      ? compMarket.improvementAction
                      : activeTooltip === "comp"
                      ? compCompetition.improvementAction
                      : activeTooltip === "capital"
                      ? compCapital.improvementAction
                      : activeTooltip === "profit"
                      ? compProfit.improvementAction
                      : compRisk.improvementAction}
                  </p>
                </div>
              )}

              {/* Big Verdict Result Card */}
              <div className="mt-6 pt-6 border-t border-[#ede3d8] flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#fcedea] via-[#faf4ee] to-[#f0f6ec] p-6 rounded-2xl border">
                <div className="flex items-center gap-5">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-2xl bg-white border-2 border-[#c75d3e] flex flex-col items-center justify-center shadow-warm-md flex-shrink-0 transition-transform group-hover:scale-105 group-hover:border-[#3a6b4c]">
                      <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#c75d3e] group-hover:text-[#3a6b4c] transition-colors">
                        {compositeScore}
                      </span>
                      <span className="text-[10px] font-bold text-[#786d65] uppercase">out of 100</span>
                      <span className="text-[9px] font-bold text-[#c75d3e] mt-0.5 flex items-center gap-0.5">
                        <Info size={10} />
                        <span>Hover: Risks</span>
                      </span>
                    </div>

                    {/* Interactive Hover Popover */}
                    <div className="absolute left-0 sm:left-auto sm:-left-2 top-full mt-3 w-80 sm:w-96 p-4 rounded-2xl bg-white border-2 border-[#c75d3e] shadow-2xl z-50 text-left pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center justify-between pb-2 border-b border-[#ede3d8]">
                        <span className="text-xs font-bold text-[#241b16] flex items-center gap-1.5">
                          <Scale size={14} className="text-[#c75d3e]" />
                          <span>Feasibility Rationale &amp; Risk Insights</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fcedea] text-[#c75d3e]">
                          Score: {compositeScore}/100
                        </span>
                      </div>

                      <div className="space-y-2.5 mt-2.5 text-xs">
                        {/* Why Choose Section */}
                        <div className="p-2.5 rounded-xl bg-[#f0f6ec] border border-[#3a6b4c]/20">
                          <p className="font-bold text-[#3a6b4c] flex items-center gap-1 mb-1 text-[11px]">
                            <CheckCircle2 size={13} />
                            <span>Why Choose {business?.title?.split("&")[0].trim() || "This Venture"}?</span>
                          </p>
                          <p className="text-[11px] text-[#241b16] leading-relaxed">
                            {rationale.whyChoose}
                          </p>
                        </div>

                        {/* Top Risk Reasons Section */}
                        <div className="p-2.5 rounded-xl bg-[#fdf6f4] border border-[#c75d3e]/20 space-y-1.5">
                          <p className="font-bold text-[#c75d3e] flex items-center gap-1 text-[11px]">
                            <AlertTriangle size={13} />
                            <span>Key Risk Factors to Consider:</span>
                          </p>
                          <ul className="space-y-1.5 text-[11px] text-[#382f29]">
                            {rationale.keyRisks.map((r, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                <span className="text-[#c75d3e] font-bold mt-0.5">•</span>
                                <div>
                                  <strong className="text-[#241b16]">{r.title}:</strong>{" "}
                                  <span className="text-[#56423d]">{r.reason}</span>
                                  <span className="block text-[10px] text-[#3a6b4c] font-medium mt-0.5">
                                    ↳ <em>Safeguard:</em> {r.mitigation}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-[10px] text-[#786d65] pt-1 flex items-center justify-between border-t border-[#ede3d8]">
                          <span>💡 <strong>Safeguard:</strong> {rationale.safeguard}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#3a6b4c] text-white tracking-wide uppercase">
                        {compositeScore >= 80 ? "BANKABLE" : "FEASIBLE"}
                      </span>
                      <span className="text-xs font-bold text-[#382f29]">
                        {location?.district || "Punjab"} Rural Decision Cluster
                      </span>
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16]">
                      {verdictLabel}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#382f29] leading-relaxed max-w-2xl">
                      {compMarket.driver} {compCapital.driver}
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

            {/* 5 Score Component Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Pillar 1: Market Demand */}
              <div
                onClick={() => setActiveTooltip("market")}
                className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4 cursor-pointer hover:border-[#c75d3e]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                      <Store size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#241b16]">
                        Market Demand
                      </h3>
                      <span className="text-xs text-[#786d65]">Weight: {marketWeight}%</span>
                    </div>
                  </div>
                  <span className="text-lg font-serif font-bold text-[#3a6b4c]">
                    {compMarket.score} / 100
                  </span>
                </div>

                <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#3a6b4c] h-2 rounded-full"
                    style={{ width: `${compMarket.score}%` }}
                  />
                </div>

                <p className="text-xs text-[#56423d] leading-relaxed">
                  {compMarket.driver}
                </p>

                <div className="text-[11px] font-semibold text-[#3a6b4c] bg-[#f0f6ec] p-2 rounded-xl border border-[#3a6b4c]/20">
                  ✓ {compMarket.improvementAction}
                </div>
              </div>

              {/* Pillar 2: Competition Opportunity */}
              <div
                onClick={() => setActiveTooltip("comp")}
                className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4 cursor-pointer hover:border-[#c75d3e]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                      <Compass size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#241b16]">
                        Competition Opportunity
                      </h3>
                      <span className="text-xs text-[#786d65]">Weight: {competitionWeight}%</span>
                    </div>
                  </div>
                  <span className="text-lg font-serif font-bold text-[#3a6b4c]">
                    {compCompetition.score} / 100
                  </span>
                </div>

                <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#3a6b4c] h-2 rounded-full"
                    style={{ width: `${compCompetition.score}%` }}
                  />
                </div>

                <p className="text-xs text-[#56423d] leading-relaxed">
                  {compCompetition.driver}
                </p>

                <div className="text-[11px] font-semibold text-[#3a6b4c] bg-[#f0f6ec] p-2 rounded-xl border border-[#3a6b4c]/20">
                  ✓ {compCompetition.improvementAction}
                </div>
              </div>

              {/* Pillar 3: Capital Fit */}
              <div
                onClick={() => setActiveTooltip("capital")}
                className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4 cursor-pointer hover:border-[#c75d3e]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#241b16]">
                        Capital Fit
                      </h3>
                      <span className="text-xs text-[#786d65]">Weight: {capitalWeight}%</span>
                    </div>
                  </div>
                  <span className="text-lg font-serif font-bold text-[#3a6b4c]">
                    {compCapital.score} / 100
                  </span>
                </div>

                <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#3a6b4c] h-2 rounded-full"
                    style={{ width: `${compCapital.score}%` }}
                  />
                </div>

                <p className="text-xs text-[#56423d] leading-relaxed">
                  {compCapital.driver}
                </p>

                <div className="text-[11px] font-semibold text-[#3a6b4c] bg-[#f0f6ec] p-2 rounded-xl border border-[#3a6b4c]/20">
                  ✓ {compCapital.improvementAction}
                </div>
              </div>

              {/* Pillar 4: Profit & Cash Flow Potential */}
              <div
                onClick={() => setActiveTooltip("profit")}
                className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4 cursor-pointer hover:border-[#c75d3e]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#241b16]">
                        Profit &amp; Cash Flow
                      </h3>
                      <span className="text-xs text-[#786d65]">Weight: {profitWeight}%</span>
                    </div>
                  </div>
                  <span className="text-lg font-serif font-bold text-[#3a6b4c]">
                    {compProfit.score} / 100
                  </span>
                </div>

                <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#3a6b4c] h-2 rounded-full"
                    style={{ width: `${compProfit.score}%` }}
                  />
                </div>

                <p className="text-xs text-[#56423d] leading-relaxed">
                  {compProfit.driver}
                </p>

                <div className="text-[11px] font-semibold text-[#3a6b4c] bg-[#f0f6ec] p-2 rounded-xl border border-[#3a6b4c]/20">
                  ✓ {compProfit.improvementAction}
                </div>
              </div>

              {/* Pillar 5: Risk Resilience */}
              <div
                onClick={() => setActiveTooltip("risk")}
                className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4 cursor-pointer hover:border-[#c75d3e]/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                      <ShieldAlert size={18} />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#241b16]">
                        Risk Resilience
                      </h3>
                      <span className="text-xs text-[#786d65]">Weight: {riskWeight}%</span>
                    </div>
                  </div>
                  <span className="text-lg font-serif font-bold text-[#c75d3e]">
                    {compRisk.score} / 100
                  </span>
                </div>

                <div className="w-full bg-[#ede3d8] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#c75d3e] h-2 rounded-full"
                    style={{ width: `${compRisk.score}%` }}
                  />
                </div>

                <p className="text-xs text-[#56423d] leading-relaxed">
                  {compRisk.driver}
                </p>

                <div className="text-[11px] font-semibold text-[#382f29] bg-[#faf4ee] p-2 rounded-xl border border-[#ede3d8]">
                  ✓ {compRisk.improvementAction}
                </div>
              </div>
            </div>

            {/* Explainable Weights Slider Panel (5 Pillars) */}
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
                    setMarketWeight(25);
                    setCompetitionWeight(20);
                    setCapitalWeight(20);
                    setProfitWeight(20);
                    setRiskWeight(15);
                  }}
                  className="text-xs font-bold text-[#c75d3e] hover:underline cursor-pointer"
                >
                  Reset Default Weights (25 / 20 / 20 / 20 / 15)
                </button>
              </div>

              <p className="text-xs text-[#786d65]">
                GramVest uses transparent multi-attribute utility theory. Adjust individual weights to inspect how credit underwriters vs sector experts evaluate {business?.title}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
                    <span>Market Demand</span>
                    <span>{marketWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={marketWeight}
                    onChange={(e) => setMarketWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
                    <span>Competition</span>
                    <span>{competitionWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={competitionWeight}
                    onChange={(e) => setCompetitionWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
                    <span>Capital Fit</span>
                    <span>{capitalWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={capitalWeight}
                    onChange={(e) => setCapitalWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#382f29] mb-1">
                    <span>Profit &amp; Cash</span>
                    <span>{profitWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={profitWeight}
                    onChange={(e) => setProfitWeight(Number(e.target.value))}
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
                    max={40}
                    value={riskWeight}
                    onChange={(e) => setRiskWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
                  />
                </div>
              </div>
            </div>
          </>
        )}

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

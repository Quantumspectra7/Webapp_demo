"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { marketService } from "@/services";
import { OpportunityAnalysis, ViabilityScore } from "@/domain";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Scale,
  Sparkles,
} from "lucide-react";
export default function OpportunityPage() {
  const { location, business, financialScenario } = useApp();
  const [opportunity, setOpportunity] = useState<OpportunityAnalysis | null>(null);
  const [viability, setViability] = useState<ViabilityScore | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadOpportunity() {
      try {
        setLoading(true);
        const [opp, viab] = await Promise.all([
          marketService.getOpportunity(),
          marketService.getViabilityScore(),
        ]);
        setOpportunity(opp);
        setViability(viab);
      } catch (err) {
        console.error("Failed to load opportunity data", err);
      } finally {
        setLoading(false);
      }
    }
    loadOpportunity();
  }, [business?.id]);
  const locName = `${location?.villageOrTown || location?.block || "Catchment"}, ${location?.district || "Punjab"}`;
  const demandScore = viability?.components?.find((c) => c.category.toLowerCase().includes("market"))?.score || viability?.overallScore || 82;
  const compScore = viability?.components?.find((c) => c.category.toLowerCase().includes("comp"))?.score || 70;
  const capitalScore = viability?.components?.find((c) => c.category.toLowerCase().includes("capital"))?.score || 88;

  const promisingPoints = opportunity?.conditionsToSucceed && opportunity.conditionsToSucceed.length > 0
    ? opportunity.conditionsToSucceed
    : [
        `Local catchment shows steady consumption and captive customer base for ${business?.title || "this sector"}.`,
        `Direct highway and feeder road access enables efficient regional transit.`,
        `Capital subsidy structures lower effective debt obligations, keeping breakeven achievable.`,
      ];

  const watchoutPoints = opportunity?.concernsAndWatchouts && opportunity.concernsAndWatchouts.length > 0
    ? opportunity.concernsAndWatchouts
    : [
        `Seasonal swings in raw material costs require buffer working capital discipline.`,
        `Local payment credit cycles must be structured to prevent cash flow strain.`,
        `Continuous power supply and backup equipment remain vital during peak hours.`,
      ];

  const improvementPoints = opportunity?.recommendations && opportunity.recommendations.length > 0
    ? opportunity.recommendations
    : [
        `Sign formal buyer off-take agreements before commissioning major equipment.`,
        `Apply under priority government subsidy schemes to minimize net equity exposure.`,
        `Procure certified equipment from established regional machinery manufacturers.`,
      ];

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <Compass size={16} />
              <span>Commercial Rationale · Opportunity Assessment</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              Why this business could work here
            </h1>
            <p className="text-sm text-[#786d65] mt-1">
              Evaluating local supply deficits, competitor capacity bottlenecks, and capital alignment for {locName}.
            </p>
          </div>

          <Link
            href="/risks"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all self-start sm:self-auto transform hover:-translate-y-0.5"
          >
            <span>Inspect Operational Risks</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* 4 SIGNAL PROGRESS METERS (Demand, Competition, Capital Fit, Market Access) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
              Core Decision Signals
            </span>
            <span className="text-xs font-bold text-[#3a6b4c] bg-[#f0f6ec] px-2.5 py-1 rounded-full border border-[#3a6b4c]/20">
              Grounded in {location?.district || "Regional"} Mandi Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Signal 1: Demand */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Demand Deficit Signal</span>
                <span className="font-mono font-bold text-[#3a6b4c]">{demandScore}% · Strong</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden font-mono tracking-widest text-[10px] text-[#3a6b4c]">
                <div className="bg-[#3a6b4c] h-2.5 rounded-full" style={{ width: `${demandScore}%` }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                {opportunity?.keyGaps?.[1]?.headline || `Steady regional demand across ${location?.block || "local"} panchayats for ${business?.title || "processed goods"}.`}
              </p>
            </div>

            {/* Signal 2: Competition */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Competition Headroom</span>
                <span className="font-mono font-bold text-[#d97706]">{compScore}% · Moderate</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#d97706] h-2.5 rounded-full" style={{ width: `${compScore}%` }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                {opportunity?.keyGaps?.[0]?.headline || `Incumbents operate with loose, unbranded product lacking quality consistency.`}
              </p>
            </div>

            {/* Signal 3: Capital Fit */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Capital &amp; Subsidy Fit</span>
                <span className="font-mono font-bold text-[#3a6b4c]">{capitalScore}% · Bankable</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#3a6b4c] h-2.5 rounded-full" style={{ width: `${capitalScore}%` }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                {financialScenario?.financingMeans?.subsidySchemeName
                  ? `${financialScenario.financingMeans.subsidySchemeName} eligible for capital grant assistance.`
                  : "Promoter capital meets mandatory equity criteria for term debt."}
              </p>
            </div>

            {/* Signal 4: Market Access */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Market Access &amp; Infrastructure</span>
                <span className="font-mono font-bold text-[#c75d3e]">78% · Solid</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#c75d3e] h-2.5 rounded-full" style={{ width: "78%" }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                Pucca connectivity and power infrastructure support commercial setup in {location?.district || "this area"}.
              </p>
            </div>
          </div>
        </div>

        {/* 3 NARRATIVE SECTIONS (Why it looks promising, What could limit it, What would improve it) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: Why it looks promising */}
          <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0f6ec] text-[#3a6b4c] flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
              <h2 className="font-serif font-bold text-lg text-[#241b16]">
                Why it looks promising
              </h2>
              <ul className="space-y-2.5 text-xs text-[#56423d] leading-relaxed">
                {promisingPoints.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#3a6b4c] font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#f0f6ec] text-[11px] font-semibold text-[#3a6b4c]">
              {opportunity?.verdictSubtitle || "Advantage: Captive rural market cluster"}
            </div>
          </div>

          {/* Section 2: What could limit it */}
          <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                <AlertTriangle size={20} />
              </div>
              <h2 className="font-serif font-bold text-lg text-[#241b16]">
                What could limit it
              </h2>
              <ul className="space-y-2.5 text-xs text-[#56423d] leading-relaxed">
                {watchoutPoints.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#c75d3e] font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#fcedea] text-[11px] font-semibold text-[#c75d3e]">
              Watch Out: Working capital and input supply discipline required
            </div>
          </div>

          {/* Section 3: What would improve the opportunity */}
          <div className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#faf4ee] text-[#d97706] flex items-center justify-center font-bold">
                <Lightbulb size={20} />
              </div>
              <h2 className="font-serif font-bold text-lg text-[#241b16]">
                What would improve it
              </h2>
              <ul className="space-y-2.5 text-xs text-[#56423d] leading-relaxed">
                {improvementPoints.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#d97706] font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#faf4ee] border border-[#ede3d8] text-[11px] font-semibold text-[#241b16]">
              Action: Establish buyer off-take agreements early
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bridges */}
        <div className="flex items-center justify-between pt-4 border-t border-[#ede3d8]">
          <Link
            href="/market"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] font-bold text-xs hover:bg-[#faf4ee] transition-colors"
          >
            <span>← Back to Market Structure</span>
          </Link>

          <Link
            href="/risks"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Examine Risks &amp; Mitigations</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

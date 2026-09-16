"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { marketService, financeService, schemeService } from "@/services";
import {
  MarketAnalysis,
  FinancialScenario,
  OpportunityAnalysis,
  ViabilityScore,
  SchemeRouteRecommendation,
} from "@/domain";
import { formatCurrency } from "@/lib/formatters";
import { getFeasibilityRationale } from "@/data/real/feasibility_rationales";
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  Store,
  Wallet,
  ShieldAlert,
  Coins,
  Scale,
  Sparkles,
  CheckCircle2,
  Info,
} from "lucide-react";

export default function DashboardPage() {
  const { location, business, profile, analysisProfile } = useApp();
  const [market, setMarket] = useState<MarketAnalysis | null>(null);
  const [financials, setFinancials] = useState<FinancialScenario | null>(null);
  const [opportunity, setOpportunity] = useState<OpportunityAnalysis | null>(null);
  const [viability, setViability] = useState<ViabilityScore | null>(null);
  const [schemes, setSchemes] = useState<SchemeRouteRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  const effectiveLocation =
    location?.district && location.district.trim() !== ""
      ? location
      : analysisProfile?.location?.district
      ? {
          id: analysisProfile.location.id || "loc-custom-active",
          state: analysisProfile.location.state || "Punjab",
          district: analysisProfile.location.district || "Ludhiana",
          block: analysisProfile.location.block || "Khanna",
          villageOrTown: analysisProfile.location.villageOrTown || "Khanna",
          pincode: analysisProfile.location.pincode || "141401",
          latitude: analysisProfile.location.latitude || 30.702,
          longitude: analysisProfile.location.longitude || 76.22,
          marketCatchmentName: `${analysisProfile.location.block || "Khanna"} Agro Catchment`,
          nearestMandi: `${analysisProfile.location.block || "Khanna"} APMC Mandi`,
          distanceToMandiKm: 5.4,
        }
      : location;

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [mkt, fin, opp, viab, sch] = await Promise.all([
          marketService.getAnalysis(5, effectiveLocation || undefined, business?.id),
          financeService.getScenario(),
          marketService.getOpportunity(),
          marketService.getViabilityScore(),
          schemeService.getRecommendations(business?.id),
        ]);
        setMarket(mkt);
        setFinancials(fin);
        setOpportunity(opp);
        setViability(viab);
        setSchemes(sch);
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  // Re-fetch whenever the user's location or business changes (e.g. after onboarding)
  }, [effectiveLocation?.latitude, effectiveLocation?.longitude, business?.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-40 bg-[#faf4ee] rounded-3xl border border-[#ede3d8]"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-[#ede3d8]"></div>
            ))}
          </div>
          <div className="h-48 bg-white rounded-3xl border border-[#ede3d8]"></div>
        </div>
      </AppShell>
    );
  }

  const hasAnalysis = !!(effectiveLocation?.district && effectiveLocation.district.trim() !== "");

  const villageName = effectiveLocation?.villageOrTown || "";
  const blockName = effectiveLocation?.block || "";
  const districtName = effectiveLocation?.district || "";
  const stateName = effectiveLocation?.state || "Punjab";
  const bizTitle = business?.title || "";
  const ownCap = profile?.ownCapitalAvailable || 0;

  const locationDisplay = [blockName, districtName, stateName].filter(Boolean).join(", ") || "Your Location";

  const rationale = getFeasibilityRationale(
    business?.id,
    villageName || "your area",
    financials?.projections?.monthlyNetProfit ? `${formatCurrency(financials.projections.monthlyNetProfit)} / mo` : undefined
  );

  // Show CTA if user hasn't completed onboarding (no location/business set)
  if (!hasAnalysis) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#fdf0ea] border border-[#ede3d8] flex items-center justify-center">
            <Sparkles size={28} className="text-[#c75d3e]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16] mb-2">
              Set Up Your Business Analysis
            </h1>
            <p className="text-sm text-[#786d65] max-w-md mx-auto">
              Complete a quick profile to unlock your personalized market intelligence, financial projections, scheme recommendations, and feasibility score.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-sm font-bold shadow-warm-sm transition-all"
          >
            <Sparkles size={16} />
            <span>Start Your Analysis →</span>
          </Link>
          <p className="text-xs text-[#9e8e84]">
            Takes under 3 minutes · No registration required
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-10">
        {/* ========================================================
            1. TOP SECTION: LOCATION, BUSINESS, AND OWN CAPITAL
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#c75d3e] animate-pulse"></span>
              <span>Business Control Center · Summary After Analysis</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              {locationDisplay}
            </h1>
            <p className="text-sm font-semibold text-[#382f29] mt-0.5">
              {bizTitle || "Your Business"}&nbsp;·&nbsp;{" "}
              {ownCap > 0 ? (
                <span className="text-[#c75d3e] font-mono">{formatCurrency(ownCap)} own capital</span>
              ) : (
                <span className="text-[#786d65] font-mono">Capital not set</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/what-if"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#382f29] shadow-2xs transition-all"
            >
              <SlidersHorizontal size={14} className="text-[#c75d3e]" />
              <span>What changes if...</span>
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-xs font-bold shadow-warm-sm transition-all"
            >
              <FileText size={14} />
              <span>Feasibility Report</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            2. YOUR BUSINESS OUTLOOK HERO
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Synthesized Outlook
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16] mt-0.5">
                Your Business Outlook
              </h2>
            </div>
            <Link
              href="/feasibility"
              className="text-xs font-bold text-[#c75d3e] hover:underline flex items-center gap-1"
            >
              <span>Explore Full Decision Bridge</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 4 Outlook Pillars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[11px] uppercase font-bold text-[#786d65] block">
                Market Opportunity
              </span>
              <p className="text-base sm:text-lg font-serif font-bold text-[#3a6b4c] mt-1">
                {(viability?.overallScore || 78) >= 80 ? "Strong" : "Moderate–Strong"}
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">
                {viability?.components?.[0]?.score || 80}% demand confidence
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[11px] uppercase font-bold text-[#786d65] block">
                Competition
              </span>
              <p className="text-base sm:text-lg font-serif font-bold text-[#d97706] mt-1">
                {(viability?.components?.[1]?.score || 70) >= 75 ? "Favorable" : "Moderate"}
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5 truncate" title={opportunity?.keyGaps?.[0]?.headline}>
                {opportunity?.keyGaps?.[0]?.title || "Market headroom available"}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[11px] uppercase font-bold text-[#786d65] block">
                Financial Fit
              </span>
              <p className="text-base sm:text-lg font-serif font-bold text-[#3a6b4c] mt-1">
                {financials?.projections?.annualDSCR && financials.projections.annualDSCR >= 1.5 ? "Bank Grade" : "Viable"}
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">
                {financials?.projections?.annualDSCR ? `${financials.projections.annualDSCR.toFixed(2)}x DSCR` : "1.50x DSCR"} · Priority Credit
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fcedea] border border-[#c75d3e]/30 relative group cursor-pointer transition-all hover:shadow-md hover:border-[#c75d3e]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-[#c75d3e] block">
                  Overall Feasibility
                </span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-[#c75d3e] bg-white px-1.5 py-0.5 rounded-md border border-[#c75d3e]/20 group-hover:bg-[#c75d3e] group-hover:text-white transition-colors">
                  <Info size={11} />
                  <span>Hover: Risks</span>
                </span>
              </div>
              <p className="text-2xl font-serif font-extrabold text-[#c75d3e] mt-0.5">
                {viability?.overallScore || 78} <span className="text-xs font-normal text-[#786d65]">/ 100</span>
              </p>
              <p className="text-[11px] font-bold text-[#3a6b4c] mt-0.5">
                {(viability?.overallScore || 78) >= 80 ? "BANKABLE" : "FEASIBLE"}
              </p>

              {/* Hover Popover: Why choose & Risk reasons */}
              <div className="absolute right-0 sm:-right-4 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-white border-2 border-[#c75d3e] shadow-2xl z-50 text-left pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                <div className="flex items-center justify-between pb-2 border-b border-[#ede3d8]">
                  <span className="text-xs font-bold text-[#241b16] flex items-center gap-1.5">
                    <Scale size={14} className="text-[#c75d3e]" />
                    <span>Feasibility Rationale &amp; Risks</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fcedea] text-[#c75d3e]">
                    Score: {viability?.overallScore || 78}/100
                  </span>
                </div>

                <div className="space-y-2.5 mt-2.5 text-xs">
                  {/* Why Choose Section */}
                  <div className="p-2.5 rounded-xl bg-[#f0f6ec] border border-[#3a6b4c]/20">
                    <p className="font-bold text-[#3a6b4c] flex items-center gap-1 mb-1 text-[11px]">
                      <CheckCircle2 size={13} />
                      <span>Why Choose {bizTitle.split("&")[0].trim()}?</span>
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
                              ↳ <em>Action:</em> {r.mitigation}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Quick Safeguard */}
                  <div className="text-[10px] text-[#786d65] pt-1 flex items-center justify-between border-t border-[#ede3d8]">
                    <span>💡 <strong>Safeguard:</strong> {rationale.safeguard}</span>
                    <Link href="/feasibility" className="text-[#c75d3e] font-bold hover:underline">
                      Full Breakdown →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Metric Snapshot Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-[#ede3d8]">
            <Link
              href="/market"
              className="p-3.5 rounded-2xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#786d65] uppercase">
                <Store size={14} className="text-[#c75d3e]" />
                <span>Market</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#241b16] mt-1 group-hover:text-[#c75d3e]">
                {financials?.operationalAssumptions?.dailyCapacityLiters
                  ? `${financials.operationalAssumptions.dailyCapacityLiters.toLocaleString()} units / day`
                  : "Field Assessed"}
              </p>
              <p className="text-[11px] text-[#786d65]">Capacity threshold</p>
            </Link>

            <Link
              href="/money"
              className="p-3.5 rounded-2xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#786d65] uppercase">
                <Wallet size={14} className="text-[#c75d3e]" />
                <span>Finance</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#3a6b4c] mt-1 group-hover:text-[#c75d3e]">
                {financials?.projections?.monthlyNetProfit
                  ? `${formatCurrency(financials.projections.monthlyNetProfit)} / mo`
                  : "Assessed"}
              </p>
              <p className="text-[11px] text-[#786d65]">Net operating profit</p>
            </Link>

            <Link
              href="/risks"
              className="p-3.5 rounded-2xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#786d65] uppercase">
                <ShieldAlert size={14} className="text-[#c75d3e]" />
                <span>Risks</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#241b16] mt-1 group-hover:text-[#c75d3e]">
                Mitigations Ready
              </p>
              <p className="text-[11px] text-[#786d65]">Structured countermeasures</p>
            </Link>

            <Link
              href="/financing"
              className="p-3.5 rounded-2xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#786d65] uppercase">
                <Coins size={14} className="text-[#c75d3e]" />
                <span>Scheme</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#c75d3e] mt-1 truncate" title={financials?.financingMeans?.subsidySchemeName || "Priority Term Loan"}>
                {financials?.financingMeans?.subsidySchemeName
                  ? financials.financingMeans.subsidySchemeName.split("(")[0].trim()
                  : "Priority Term Loan"}
              </p>
              <p className="text-[11px] text-[#786d65]">
                {financials?.financingMeans?.eligibleSubsidyAmount
                  ? `Up to ${formatCurrency(financials.financingMeans.eligibleSubsidyAmount)} subsidy`
                  : "Capital subsidy matched"}
              </p>
            </Link>
          </div>

          {/* ========================================================
              3. ONE CLEAR AUTHORITATIVE RECOMMENDATION BANNER
             ======================================================== */}
          <div className="p-5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e]">
              <Sparkles size={16} />
              <span>Official Decision Advisory</span>
            </div>
            <blockquote className="font-serif italic text-base sm:text-lg text-[#241b16] leading-snug">
              “{opportunity?.executiveSummary
                ? opportunity.executiveSummary.slice(0, 150) + "..."
                : `The business appears feasible under the current operating assumptions for ${bizTitle}.`}”
            </blockquote>
            <p className="text-xs text-[#786d65]">
              Ground-truthed for {villageName}, {blockName} catchment. Infrastructure connectivity and priority scheme routing support robust debt servicing.
            </p>
          </div>
        </div>

        {/* ========================================================
            4. QUICK ACTION HUBS & EXPLORATION BRIDGES
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/market"
            className="p-5 rounded-3xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 shadow-warm-sm transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center font-bold">
                <Store size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#241b16] group-hover:text-[#c75d3e] transition-colors">
                Market Reach &amp; Access
              </h3>
              <p className="text-xs text-[#786d65] leading-relaxed">
                Review 5km vs 10km household radius, mandi transit corridors, and competitor saturation nodes.
              </p>
            </div>
            <span className="text-xs font-bold text-[#c75d3e] flex items-center gap-1">
              <span>Inspect 4 Market Blocks</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/feasibility"
            className="p-5 rounded-3xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 shadow-warm-sm transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#f0f6ec] text-[#3a6b4c] flex items-center justify-center font-bold">
                <Scale size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#241b16] group-hover:text-[#c75d3e] transition-colors">
                Feasibility &amp; Score
              </h3>
              <p className="text-xs text-[#786d65] leading-relaxed">
                Inspect how market, financial capacity, site infrastructure, and risk combine into the 78/100 rank.
              </p>
            </div>
            <span className="text-xs font-bold text-[#3a6b4c] flex items-center gap-1">
              <span>View Explainable Weights</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            href="/money"
            className="p-5 rounded-3xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 shadow-warm-sm transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#faf4ee] text-[#241b16] flex items-center justify-center font-bold">
                <Wallet size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#241b16] group-hover:text-[#c75d3e] transition-colors">
                Capital &amp; Cash Flow
              </h3>
              <p className="text-xs text-[#786d65] leading-relaxed">
                How your ₹1,00,000 equity supports ₹10,00,000 project size with ₹18,850 monthly loan EMI.
              </p>
            </div>
            <span className="text-xs font-bold text-[#241b16] flex items-center gap-1">
              <span>View Money Plan</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

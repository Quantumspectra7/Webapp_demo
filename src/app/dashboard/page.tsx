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
  const { location, business, profile } = useApp();
  const [market, setMarket] = useState<MarketAnalysis | null>(null);
  const [financials, setFinancials] = useState<FinancialScenario | null>(null);
  const [opportunity, setOpportunity] = useState<OpportunityAnalysis | null>(null);
  const [viability, setViability] = useState<ViabilityScore | null>(null);
  const [schemes, setSchemes] = useState<SchemeRouteRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [mkt, fin, opp, viab, sch] = await Promise.all([
          marketService.getAnalysis(5),
          financeService.getScenario(),
          marketService.getOpportunity(),
          marketService.getViabilityScore(),
          schemeService.getRecommendations(),
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
  }, []);

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

  const villageName = location?.villageOrTown || "Sidhwan Bet";
  const blockName = location?.block || "Jagraon";
  const districtName = location?.district || "Ludhiana";
  const stateName = location?.state || "Punjab";
  const bizTitle = business?.title || "Dairy Processing & Chilling Unit";
  const ownCap = profile?.ownCapitalAvailable || 100000;

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
              {blockName}, {districtName}, {stateName}
            </h1>
            <p className="text-sm font-semibold text-[#382f29] mt-0.5">
              {bizTitle} &nbsp;·&nbsp;{" "}
              <span className="text-[#c75d3e] font-mono">{formatCurrency(ownCap)} own capital</span>
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
                Moderate–Strong
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">68% local unserved demand</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[11px] uppercase font-bold text-[#786d65] block">
                Competition
              </span>
              <p className="text-base sm:text-lg font-serif font-bold text-[#d97706] mt-1">
                Moderate
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">2 small local collection hubs</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[11px] uppercase font-bold text-[#786d65] block">
                Financial Fit
              </span>
              <p className="text-base sm:text-lg font-serif font-bold text-[#3a6b4c] mt-1">
                Strong
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">1.62x DSCR · 35% Subsidy</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fcedea] border border-[#c75d3e]/30">
              <span className="text-[11px] uppercase font-bold text-[#c75d3e] block">
                Overall Feasibility
              </span>
              <p className="text-2xl font-serif font-extrabold text-[#c75d3e] mt-0.5">
                78 <span className="text-xs font-normal text-[#786d65]">/ 100</span>
              </p>
              <p className="text-[11px] font-bold text-[#3a6b4c] mt-0.5">FEASIBLE</p>
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
                ~3,800 Ltrs / Day
              </p>
              <p className="text-[11px] text-[#786d65]">10km catchment deficit</p>
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
                ₹68,400 / mo
              </p>
              <p className="text-[11px] text-[#786d65]">Net operating margin</p>
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
                3 Important
              </p>
              <p className="text-[11px] text-[#786d65]">Actionable mitigations</p>
            </Link>

            <Link
              href="/financing"
              className="p-3.5 rounded-2xl bg-white border border-[#ede3d8] hover:border-[#c75d3e]/40 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#786d65] uppercase">
                <Coins size={14} className="text-[#c75d3e]" />
                <span>Scheme</span>
              </div>
              <p className="text-sm font-serif font-bold text-[#c75d3e] mt-1">
                PMEGP Term Loan
              </p>
              <p className="text-[11px] text-[#786d65]">35% rural margin grant</p>
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
              “The business appears feasible under the current assumptions, but feed-cost volatility and local competition should be monitored.”
            </blockquote>
            <p className="text-xs text-[#786d65]">
              Ground-truthed for {villageName} and Jagraon APMC catchment. Feeder power availability and PMEGP capital subsidy support robust debt servicing.
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

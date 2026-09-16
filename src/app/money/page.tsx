"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { financeService } from "@/services";
import { FinancialScenario } from "@/domain";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import {
  Wallet,
  Coins,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  Table,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function MoneyPage() {
  const { profile, business, financialScenario } = useApp();
  const [scenario, setScenario] = useState<FinancialScenario | null>(financialScenario);
  const [loading, setLoading] = useState(!financialScenario);

  // Capital capacity state (synced with active profile)
  const ownCapital = profile?.ownCapitalAvailable || scenario?.financingMeans?.ownContribution || 100000;

  useEffect(() => {
    async function loadFinance() {
      try {
        setLoading(true);
        const data = await financeService.getScenario();
        setScenario(data);
      } catch (err) {
        console.error("Failed to load financial scenario", err);
      } finally {
        setLoading(false);
      }
    }
    if (!scenario || scenario.id !== financialScenario?.id) {
      loadFinance();
    }
  }, [financialScenario]);

  // Derive dynamic cost breakdown items
  const costItems = scenario?.costBreakdown || [];
  const totalProjectCost = scenario?.totalProjectCost || 1000000;
  const indicativeProjectCapacity = ownCapital * 10;
  const potentialFinancing = ownCapital * 9;

  // Repayment parameters from scenario loan terms
  const interestRate = scenario?.loanTerms?.interestRatePct || 9.5;
  const tenureMonths = scenario?.loanTerms?.tenureMonths || 60;
  const moratoriumMonths = scenario?.loanTerms?.moratoriumMonths || 6;
  const monthlyEmi = scenario?.loanTerms?.monthlyEMI || 0;

  // Business Health metrics directly from active projections
  const monthlyRevenue = scenario?.projections?.monthlyRevenue || 0;
  const monthlyRawMaterial = scenario?.projections?.monthlyRawMaterialCost || 0;
  const monthlyOpEx = scenario?.projections?.monthlyOperatingExpenses || 0;
  const monthlyTotalExp = monthlyRawMaterial + monthlyOpEx;
  const monthlyNetProfit = scenario?.projections?.monthlyNetProfit || 0;
  const dscr = scenario?.projections?.annualDSCR ? +scenario.projections.annualDSCR.toFixed(2) : 1.5;
  const breakEvenMonthly = scenario?.projections?.breakEvenMonthlyLiters || 0;
  const breakEvenUnitsDaily = Math.round(breakEvenMonthly / 30);

  // Dynamic business capacity units and labels
  const isDairy = business?.id?.includes("dairy") || business?.title?.toLowerCase().includes("dairy");
  const isFlour = business?.id?.includes("flour") || business?.title?.toLowerCase().includes("flour");
  const isFarm = business?.id?.includes("equipment") || business?.title?.toLowerCase().includes("equipment");

  const unitLabel = isDairy ? "L / day" : isFlour ? "kg / day" : "acres / day";
  const costSummaryLabel = isDairy
    ? "Milk + Power + Staff"
    : isFlour
    ? "Grain + Power + Labor"
    : "Fuel + Spares + Operator";

  const dailyCapacity = scenario?.operationalAssumptions?.dailyCapacityLiters || 500;
  const monthlyVolume = dailyCapacity * 30;
  const volumeSummaryLabel = `${monthlyVolume.toLocaleString()} ${isDairy ? "L" : isFlour ? "kg" : "acres"} / mo`;

  // 12-Month Cash Flow Dynamic Projection series
  const chartData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
    const ramp = m === 1 ? 0.7 : m === 2 ? 0.8 : m === 3 ? 0.9 : 1.0;
    const rev = Math.round(monthlyRevenue * ramp);
    const opex = Math.round(monthlyTotalExp * ramp);
    const emiApplied = m > moratoriumMonths ? monthlyEmi : 0;
    const exp = opex + emiApplied;
    const net = rev - exp;
    return {
      month: `M${m}`,
      Revenue: rev,
      Expenses: exp,
      NetCashFlow: net,
    };
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <Wallet size={16} />
              <span>Financial Structuring · Margin to Solvency</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              Capital Capacity, Costs &amp; Cash Flow
            </h1>
            <p className="text-sm text-[#786d65] mt-1">
              Evaluating how much enterprise your equity can leverage, capital capex structure, loan repayment, and DSCR solvency for {business?.title || "your enterprise"}.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/what-if"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#c75d3e] shadow-2xs transition-all"
            >
              <SlidersHorizontal size={14} />
              <span>Try a What-If</span>
            </Link>
            <Link
              href="/financing"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Next: Financing Route</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* ========================================================
            1. MARGIN CAPACITY OPENING: "How much business can your capital support?"
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white to-[#faf4ee] border border-[#ede3d8] shadow-warm-sm space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
              Core Financial Principle
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16] mt-0.5">
              How much business can your capital support?
            </h2>
            <p className="text-xs text-[#786d65] mt-1">
              Under RBI priority sector credit guidelines, a 10% own equity base can support up to 10x total enterprise outlay through term debt and sovereign capital subsidies.
            </p>
          </div>

          {/* 3-Stage Downward Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Step 1: Your Capital */}
            <div className="p-5 rounded-2xl bg-white border border-[#ede3d8] shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#786d65] tracking-wider block">
                1. Your Own Capital
              </span>
              <p className="text-2xl font-serif font-extrabold text-[#241b16]">
                {formatCurrency(ownCapital)}
              </p>
              <p className="text-[11px] text-[#786d65]">Promoter Equity Contribution</p>
            </div>

            {/* Step 2: Indicative Project Capacity */}
            <div className="p-5 rounded-2xl bg-[#faf4ee] border border-[#c75d3e]/30 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#c75d3e] tracking-wider block">
                2. Indicative Project Capacity
              </span>
              <p className="text-2xl font-serif font-extrabold text-[#c75d3e]">
                {formatCurrency(indicativeProjectCapacity)}
              </p>
              <p className="text-[11px] text-[#786d65]">10x Leverage Outlay Threshold</p>
            </div>

            {/* Step 3: Potential Financing Component */}
            <div className="p-5 rounded-2xl bg-[#f0f6ec] border border-[#3a6b4c]/30 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#3a6b4c] tracking-wider block">
                3. Potential Financing Component
              </span>
              <p className="text-2xl font-serif font-extrabold text-[#3a6b4c]">
                {formatCurrency(potentialFinancing)}
              </p>
              <p className="text-[11px] text-[#786d65]">Combined Bank Term Loan + Capital Subsidy</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#786d65] gap-2">
            <span>
              <strong>Regulatory Notice:</strong> Labeled as an <em>indicative financing capacity</em> based on standard rural credit norms, not guaranteed loan sanction.
            </span>
            <span className="font-mono font-bold text-[#3a6b4c]">
              {scenario?.financingMeans?.subsidySchemeName ? "Priority Scheme Aligned" : "RBI PSL Norms"}
            </span>
          </div>
        </div>

        {/* ========================================================
            2. DYNAMIC PROJECT COST STRUCTURE (from costBreakdown)
           ======================================================== */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#ede3d8] pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Capital Expenditure
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#241b16]">
                Project Cost Structure: {formatCurrency(totalProjectCost)}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#c75d3e] bg-[#fcedea] px-3 py-1 rounded-full">
              {costItems.length} Vetted Line Items
            </span>
          </div>

          {/* Dynamic CapEx Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {costItems.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block truncate">
                  {idx + 1}. {item.category}
                </span>
                <p className="text-lg font-serif font-bold text-[#241b16]">
                  {formatCurrency(item.cost)}
                </p>
                <p className="text-[11px] text-[#786d65] line-clamp-2" title={item.itemName}>
                  {item.itemName}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            3. REPAYMENT STRUCTURE: Interest, Tenure, Moratorium, EMI
           ======================================================== */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#ede3d8] pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Debt Service Schedule
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#241b16]">
                Bank Repayment Terms
              </h2>
            </div>
            <span className="text-xs font-bold text-[#3a6b4c] bg-[#f0f6ec] px-3 py-1 rounded-full">
              {scenario?.financingMeans?.subsidySchemeName || "Priority Lending"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] block">Interest Rate</span>
              <p className="text-lg font-serif font-bold text-[#241b16] mt-0.5">{interestRate}% p.a.</p>
              <p className="text-[10px] text-[#786d65]">Linked to MCLR</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] block">Repayment Tenure</span>
              <p className="text-lg font-serif font-bold text-[#241b16] mt-0.5">{tenureMonths} Months</p>
              <p className="text-[10px] text-[#786d65]">Equated Installment Schedule</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] block">Moratorium Grace</span>
              <p className="text-lg font-serif font-bold text-[#3a6b4c] mt-0.5">{moratoriumMonths} Months</p>
              <p className="text-[10px] text-[#3a6b4c]">Principal Free Window</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#fcedea] border border-[#c75d3e]/30">
              <span className="text-[10px] uppercase font-bold text-[#c75d3e] block">Monthly Loan EMI</span>
              <p className="text-xl font-serif font-extrabold text-[#c75d3e] mt-0.5">
                {formatCurrency(monthlyEmi)}
              </p>
              <p className="text-[10px] text-[#786d65]">Starting Month {moratoriumMonths + 1}</p>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. BUSINESS HEALTH: Revenue, Expenses, Cash Flow, Break-Even, DSCR
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#ede3d8] pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Solvency &amp; Sustainability
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#241b16]">
                Operational Business Health &amp; Solvency
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#3a6b4c] text-white">
                DSCR: {dscr}x ({dscr >= 1.5 ? "Bank Grade" : "Moderate Solvency"})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] block">Monthly Revenue</span>
              <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">
                {formatCurrency(monthlyRevenue)}
              </p>
              <p className="text-[10px] text-[#786d65]">{volumeSummaryLabel}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] block">Monthly OpEx</span>
              <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">
                {formatCurrency(monthlyTotalExp)}
              </p>
              <p className="text-[10px] text-[#786d65]">{costSummaryLabel}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f0f6ec] border border-[#3a6b4c]/30">
              <span className="text-[10px] uppercase font-bold text-[#3a6b4c] block">Monthly Net Profit</span>
              <p className="text-base font-serif font-bold text-[#3a6b4c] mt-0.5">
                {formatCurrency(monthlyNetProfit)}
              </p>
              <p className="text-[10px] text-[#3a6b4c]">Post EMI &amp; Depr.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] block">Break-Even Point</span>
              <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">
                {breakEvenUnitsDaily} {unitLabel}
              </p>
              <p className="text-[10px] text-[#786d65]">
                {scenario?.projections?.breakEvenCapacityPct
                  ? `${scenario.projections.breakEvenCapacityPct}% of capacity`
                  : "Sustainable threshold"}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] block">DSCR Ratio</span>
              <p className="text-base font-serif font-bold text-[#3a6b4c] mt-0.5">
                {dscr}x
              </p>
              <p className="text-[10px] text-[#786d65]">Benchmark &ge; 1.50x</p>
            </div>
          </div>

          {/* 12-Month Cash Flow Bar Chart */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65] block mb-3">
              12-Month Projected Cash Flow Series (₹)
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede3d8" />
                  <XAxis dataKey="month" stroke="#786d65" fontSize={11} />
                  <YAxis stroke="#786d65" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, ""]}
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#ede3d8", borderRadius: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="Revenue" fill="#3a6b4c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#c75d3e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="NetCashFlow" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bridges */}
        <div className="flex items-center justify-between pt-4 border-t border-[#ede3d8]">
          <Link
            href="/feasibility"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] font-bold text-xs hover:bg-[#faf4ee] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Review Feasibility Verdict</span>
          </Link>

          <Link
            href="/financing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Proceed to Financing Routes</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

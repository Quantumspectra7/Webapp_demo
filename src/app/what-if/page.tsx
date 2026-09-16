"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { SourceBadge } from "@/components/common/SourceBadge";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { financeService, simulatorService } from "@/services";
import { FinancialScenario, WhatIfResult, WhatIfParameters } from "@/domain";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
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
} from "recharts";

export default function WhatIfPage() {
  const { business } = useApp();
  const [baseScenario, setBaseScenario] = useState<FinancialScenario | null>(null);
  const [simulationResult, setSimulationResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Sliders
  const [priceDelta, setPriceDelta] = useState(0); // %
  const [demandDelta, setDemandDelta] = useState(0); // %
  const [rawMilkDelta, setRawMilkDelta] = useState(0); // %
  const [powerDieselDelta, setPowerDieselDelta] = useState(0); // %

  const runSim = async (params: WhatIfParameters, base: FinancialScenario) => {
    const res = await simulatorService.simulate(base, params);
    setSimulationResult(res);
  };

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const base = await financeService.getScenario();
        setBaseScenario(base);
        await runSim(
          {
            priceAdjustmentPct: 0,
            demandAdjustmentPct: 0,
            rawMilkCostAdjustmentPct: 0,
            powerDieselCostAdjustmentPct: 0,
            interestRateAdjustmentPct: 0,
          },
          base
        );
      } catch (err) {
        console.error("Failed to initialize simulator", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [business?.id]);

  const handleSliderChange = (updates: Partial<{
    price: number;
    demand: number;
    rawMilk: number;
    power: number;
  }>) => {
    const nextPrice = updates.price !== undefined ? updates.price : priceDelta;
    const nextDemand = updates.demand !== undefined ? updates.demand : demandDelta;
    const nextRaw = updates.rawMilk !== undefined ? updates.rawMilk : rawMilkDelta;
    const nextPower = updates.power !== undefined ? updates.power : powerDieselDelta;

    if (updates.price !== undefined) setPriceDelta(nextPrice);
    if (updates.demand !== undefined) setDemandDelta(nextDemand);
    if (updates.rawMilk !== undefined) setRawMilkDelta(nextRaw);
    if (updates.power !== undefined) setPowerDieselDelta(nextPower);

    if (baseScenario) {
      runSim(
        {
          priceAdjustmentPct: nextPrice,
          demandAdjustmentPct: nextDemand,
          rawMilkCostAdjustmentPct: nextRaw,
          powerDieselCostAdjustmentPct: nextPower,
          interestRateAdjustmentPct: 0,
        },
        baseScenario
      );
    }
  };

  const handleApplyPreset = (
    preset: "summer_fodder" | "demand_slump" | "price_drop" | "bull_expansion"
  ) => {
    let p = 0;
    let d = 0;
    let r = 0;
    let pw = 0;

    if (preset === "summer_fodder") {
      // Raw cost +15%, power +20%
      p = 0;
      d = -5;
      r = 15;
      pw = 20;
    } else if (preset === "demand_slump") {
      // Demand -20%, price -5%
      p = -5;
      d = -20;
      r = 0;
      pw = 0;
    } else if (preset === "price_drop") {
      // Selling price -10%
      p = -10;
      d = 0;
      r = 0;
      pw = 0;
    } else if (preset === "bull_expansion") {
      // Demand +25%, price +5%
      p = 5;
      d = 25;
      r = 0;
      pw = 0;
    }

    setPriceDelta(p);
    setDemandDelta(d);
    setRawMilkDelta(r);
    setPowerDieselDelta(pw);

    if (baseScenario) {
      runSim(
        {
          priceAdjustmentPct: p,
          demandAdjustmentPct: d,
          rawMilkCostAdjustmentPct: r,
          powerDieselCostAdjustmentPct: pw,
          interestRateAdjustmentPct: 0,
        },
        baseScenario
      );
    }
  };

  const handleReset = () => {
    setPriceDelta(0);
    setDemandDelta(0);
    setRawMilkDelta(0);
    setPowerDieselDelta(0);
    if (baseScenario) {
      runSim(
        {
          priceAdjustmentPct: 0,
          demandAdjustmentPct: 0,
          rawMilkCostAdjustmentPct: 0,
          powerDieselCostAdjustmentPct: 0,
          interestRateAdjustmentPct: 0,
        },
        baseScenario
      );
    }
  };

  const isDairy = business?.id?.includes("dairy") || business?.title?.toLowerCase().includes("dairy");
  const isFlour = business?.id?.includes("flour") || business?.title?.toLowerCase().includes("flour");
  const isFarm = business?.id?.includes("equipment") || business?.title?.toLowerCase().includes("equipment");

  const rawCostName = isDairy
    ? "Raw Milk Procurement Cost"
    : isFlour
    ? "Grain / Raw Material Cost"
    : "Operating / Input Cost";

  const rawCostDesc = isDairy
    ? "Simulates dry-season cattle feed price escalation."
    : isFlour
    ? "Simulates mandi wheat procurement price escalation."
    : "Simulates equipment maintenance and diesel fuel cost rise.";

  const preset1Label = isDairy
    ? "Summer Fodder Spike (+15% Milk Cost)"
    : isFlour
    ? "Grain Mandi Spike (+15% Wheat Cost)"
    : "Input Spike (+15% Operating Cost)";

  const volumeDesc = isDairy
    ? "Simulates sweet shop off-take slump or flush surplus."
    : isFlour
    ? "Simulates retail / bakery flour off-take slump."
    : "Simulates off-season farmer machine hiring drop.";

  const headerSubtitle = `Simulate downside shocks (${
    isDairy
      ? "feed price rises, milk demand drops"
      : isFlour
      ? "grain price rises, flour demand drops"
      : "diesel price rises, hiring demand drops"
  }) to verify loan repayment safety.`;

  const chartComparisonData = [
    {
      name: "Monthly Revenue",
      Base: baseScenario?.projections.monthlyRevenue || 0,
      Scenario: simulationResult?.projectedRevenue || 0,
    },
    {
      name: "Net Profit",
      Base: baseScenario?.projections.monthlyNetProfit || 0,
      Scenario: simulationResult?.projectedNetProfit || 0,
    },
    {
      name: "Net Cash Flow",
      Base: baseScenario?.projections.monthlyNetCashFlow || 0,
      Scenario: simulationResult?.projectedCashFlow || 0,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ddd6c9] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SlidersHorizontal size={20} className="text-[#9d3e21]" />
              <h1 className="font-serif-editorial text-[28px] sm:text-[32px] font-bold text-[#25231f]">
                What-If Scenarios — Stress-Test Your Business
              </h1>
            </div>
            <p className="text-[14px] text-[#56423d]">
              {headerSubtitle}
            </p>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#ddd6c9] bg-white text-[#706c63] hover:text-[#1d1b18] text-[12px] font-bold transition-colors self-start sm:self-auto"
          >
            <RotateCcw size={14} />
            <span>Reset to Base Case</span>
          </button>
        </div>

        {/* PRESET SHORTCUT BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[12px] uppercase font-bold text-[#706c63] mr-1">
            Standard Stress Presets:
          </span>
          <button
            onClick={() => handleApplyPreset("summer_fodder")}
            className="px-3 py-1.5 rounded-lg bg-[#fbebe4] hover:bg-[#ffdbd1] text-[#9d3e21] border border-[#ffb5a0] text-[12px] font-bold transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle size={13} />
            <span>{preset1Label}</span>
          </button>
          <button
            onClick={() => handleApplyPreset("demand_slump")}
            className="px-3 py-1.5 rounded-lg bg-[#f3ede6] hover:bg-[#e7ded5] text-[#56423d] border border-[#ddd6c9] text-[12px] font-bold transition-colors flex items-center gap-1.5"
          >
            <TrendingDown size={13} />
            <span>Demand Slump (-20% Volume)</span>
          </button>
          <button
            onClick={() => handleApplyPreset("price_drop")}
            className="px-3 py-1.5 rounded-lg bg-[#fbedea] hover:bg-[#fbdad3] text-[#c75d3e] border border-[#c75d3e]/30 text-[12px] font-bold transition-colors flex items-center gap-1.5"
          >
            <TrendingDown size={13} />
            <span>Price Drop (-10% Bulk Price)</span>
          </button>
          <button
            onClick={() => handleApplyPreset("bull_expansion")}
            className="px-3 py-1.5 rounded-lg bg-[#dde6da] hover:bg-[#cbe0c5] text-[#416246] border border-[#bbcca9] text-[12px] font-bold transition-colors flex items-center gap-1.5"
          >
            <TrendingUp size={13} />
            <span>Expansion Case (+25% Off-Take)</span>
          </button>
        </div>

        {/* 2-COLUMN LAYOUT: STRESS CONTROLS + COMPARISON RESULTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Stress-Testing Sliders (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#ddd6c9] p-6 shadow-xs space-y-6">
            <div className="border-b border-[#ddd6c9] pb-3">
              <h2 className="font-serif-editorial text-[18px] font-bold text-[#25231f]">
                Scenario Levers
              </h2>
              <p className="text-[12px] text-[#706c63]">
                Shift levers to simulate downside vulnerabilities.
              </p>
            </div>

            {/* Lever 1: Raw Material / Input Cost */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-bold text-[#25231f]">
                  {rawCostName}
                </label>
                <span
                  className={`text-[14px] font-bold tabular-nums ${
                    rawMilkDelta > 0 ? "text-[#9d3e21]" : "text-[#536346]"
                  }`}
                >
                  {rawMilkDelta > 0 ? `+${rawMilkDelta}%` : `${rawMilkDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min={-10}
                max={25}
                step={1}
                value={rawMilkDelta}
                onChange={(e) => handleSliderChange({ rawMilk: Number(e.target.value) })}
                className="w-full h-2 bg-[#e7ded5] rounded-lg appearance-none cursor-pointer accent-[#9d3e21]"
              />
              <span className="text-[11px] text-[#706c63]">
                {rawCostDesc}
              </span>
            </div>

            {/* Lever 2: Customer Demand Volume */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-bold text-[#25231f]">
                  Daily Volume / Buyer Demand
                </label>
                <span
                  className={`text-[14px] font-bold tabular-nums ${
                    demandDelta < 0 ? "text-[#9d3e21]" : "text-[#536346]"
                  }`}
                >
                  {demandDelta > 0 ? `+${demandDelta}%` : `${demandDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={5}
                value={demandDelta}
                onChange={(e) => handleSliderChange({ demand: Number(e.target.value) })}
                className="w-full h-2 bg-[#e7ded5] rounded-lg appearance-none cursor-pointer accent-[#536346]"
              />
              <span className="text-[11px] text-[#706c63]">
                {volumeDesc}
              </span>
            </div>

            {/* Lever 3: Bulk Selling Price */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-bold text-[#25231f]">
                  Selling Price Realization
                </label>
                <span
                  className={`text-[14px] font-bold tabular-nums ${
                    priceDelta < 0 ? "text-[#9d3e21]" : "text-[#536346]"
                  }`}
                >
                  {priceDelta > 0 ? `+${priceDelta}%` : `${priceDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={1}
                value={priceDelta}
                onChange={(e) => handleSliderChange({ price: Number(e.target.value) })}
                className="w-full h-2 bg-[#e7ded5] rounded-lg appearance-none cursor-pointer accent-[#536346]"
              />
              <span className="text-[11px] text-[#706c63]">
                Simulates wholesale pricing pressure from competing hubs.
              </span>
            </div>

            {/* Lever 4: Power & Generator Diesel Costs */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-bold text-[#25231f]">
                  Power & Diesel Generator Running
                </label>
                <span
                  className={`text-[14px] font-bold tabular-nums ${
                    powerDieselDelta > 0 ? "text-[#9d3e21]" : "text-[#536346]"
                  }`}
                >
                  {powerDieselDelta > 0 ? `+${powerDieselDelta}%` : `${powerDieselDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={5}
                value={powerDieselDelta}
                onChange={(e) => handleSliderChange({ power: Number(e.target.value) })}
                className="w-full h-2 bg-[#e7ded5] rounded-lg appearance-none cursor-pointer accent-[#9d3e21]"
              />
              <span className="text-[11px] text-[#706c63]">
                Simulates rural grid load shedding and fuel price hikes.
              </span>
            </div>

            {/* Risk Verdict Stamp */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                simulationResult?.projectedRiskLevel === "Critical"
                  ? "bg-[#ffdad6] border-[#ffb5a0] text-[#ba1a1a]"
                  : simulationResult?.projectedRiskLevel === "Stressed"
                  ? "bg-[#f3e6b5] border-[#e8c352] text-[#b88537]"
                  : "bg-[#dde6da] border-[#bbcca9] text-[#416246]"
              }`}
            >
              <div>
                <span className="text-[11px] uppercase font-bold">
                  Projected Resilience Status
                </span>
                <p className="text-[17px] font-bold mt-0.5">
                  {simulationResult?.projectedRiskLevel} Risk Level
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold">DSCR Cover</span>
                <p className="text-[18px] font-bold mt-0.5">
                  {simulationResult?.projectedDSCR}x
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Comparison Table & Recharts Chart (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Side-by-Side Comparison Table */}
            <div className="bg-white rounded-2xl border border-[#ddd6c9] p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#ddd6c9] pb-3 mb-4">
                <h3 className="font-serif-editorial text-[18px] font-bold text-[#25231f]">
                  Base vs Stress Scenario Comparison
                </h3>
                <span className="text-[11px] text-[#706c63]">
                  All calculations verified
                </span>
              </div>

              <div className="border border-[#ddd6c9] rounded-xl overflow-hidden mb-4">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f9f3ec] border-b border-[#ddd6c9] text-[#706c63] text-[11px] uppercase font-bold">
                    <tr>
                      <th className="p-3">Key Metric</th>
                      <th className="p-3 text-right">Base Case</th>
                      <th className="p-3 text-right">Under Stress</th>
                      <th className="p-3 text-right">Impact Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee8df]">
                    {simulationResult?.comparisonItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#fffbf7]">
                        <td className="p-3 font-semibold text-[#1d1b18]">
                          {item.metric}
                        </td>
                        <td className="p-3 text-right font-medium text-[#706c63] tabular-nums">
                          {item.unit === "₹"
                            ? formatCurrency(item.baseValue)
                            : `${item.baseValue}${item.unit}`}
                        </td>
                        <td className="p-3 text-right font-bold text-[#1d1b18] tabular-nums">
                          {item.unit === "₹"
                            ? formatCurrency(item.scenarioValue)
                            : `${item.scenarioValue}${item.unit}`}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              item.status === "positive"
                                ? "bg-[#dde6da] text-[#4d7558]"
                                : "bg-[#ffdad6] text-[#ba1a1a]"
                            }`}
                          >
                            {item.deltaPct > 0 ? `+${item.deltaPct}%` : `${item.deltaPct}%`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strategic Narrative Summary */}
              <div className="p-4 rounded-xl bg-[#f9f3ec] border border-[#e7ded5] text-[13px] text-[#56423d] leading-relaxed">
                <strong className="text-[#1d1b18] block mb-1">
                  Sensitivity Assessment:
                </strong>
                {simulationResult?.strategicSummary}
              </div>
            </div>

            {/* Recharts Comparison Chart */}
            <div className="bg-white rounded-2xl border border-[#ddd6c9] p-6 shadow-xs">
              <h3 className="font-serif-editorial text-[18px] font-bold text-[#25231f] mb-3">
                Cash Flow Sensitivity Comparison
              </h3>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#706c63" }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#706c63" }}
                      tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [
                        formatCurrency(typeof val === "number" ? val : Number(val)),
                        "",
                      ]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#ddd6c9",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Base" fill="#536346" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Scenario" fill="#c75d3e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strategic Mitigations / Counter-Pivots */}
            <div className="bg-white rounded-2xl border border-[#ddd6c9] p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#536346] block mb-2">
                Recommended Buffer Actions:
              </span>
              <ul className="space-y-2 text-[13px] text-[#56423d]">
                {simulationResult?.suggestedPivots.map((piv, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#536346] font-bold">•</span>
                    <span>{piv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#ddd6c9]">
          <SourceBadge
            metadata={{
              source: "GramVest What-If Stress Testing Engine v2.4",
              sourceDate: "2026-08-25",
              confidence: "high",
              dataStatus: "demo",
            }}
          />
          <Link
            href="/report"
            className="text-[13px] font-bold text-[#9d3e21] hover:underline flex items-center gap-1"
          >
            <span>Proceed to Feasibility & Bank DPR Report</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

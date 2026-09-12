"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { marketService } from "@/services";
import { SwotQuadrant, RiskItem } from "@/domain";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Filter,
  CheckCircle2,
  SlidersHorizontal,
  Scale,
  Wrench,
  Zap,
} from "lucide-react";

interface PracticalRisk {
  id: string;
  category: "input_cost" | "operational" | "competition" | "financial" | "seasonal";
  risk: string;
  severity: "High" | "Medium" | "Low";
  whyItMatters: string;
  whatYouCanDo: string;
}

const PRACTICAL_RISKS: PracticalRisk[] = [
  {
    id: "risk-feed",
    category: "input_cost",
    risk: "Feed-Price Volatility & Fodder Cost Inflation",
    severity: "High",
    whyItMatters: "Higher input costs can reduce operating margins from 28% down to 16%, lowering farmer livestock yields and procurement consistency.",
    whatYouCanDo: "Maintain multi-source silage contracts with local FPOs, lock in seasonal grain by-products in bulk during harvest, and review feed-cost assumptions monthly.",
  },
  {
    id: "risk-power",
    category: "operational",
    risk: "Afternoon Low-Voltage Grid Trips (1:00 PM – 3:30 PM)",
    severity: "High",
    whyItMatters: "Unchilled milk souring occurs if temperature climbs above 4°C for over 45 minutes, risking entire 1,000L batch rejection at private dairies.",
    whatYouCanDo: "Pre-budget an automated 15kVA DG generator directly into the bank loan capex; schedule primary chilling cycles during early morning and late night high-voltage hours.",
  },
  {
    id: "risk-credit",
    category: "competition",
    risk: "Informal Middlemen (Arhtiyas/Doodhis) Cash Advances",
    severity: "Medium",
    whyItMatters: "Traditional milk aggregators lock in small dairy farmers with informal wedding or crop cash loans, making farmers reluctant to switch.",
    whatYouCanDo: "Offer guaranteed prompt weekly digital bank settlements via UPI/NEFT and provide transparent digital ultrasonic fat/SNF slips that demonstrate ₹2–₹3/L higher fair compensation.",
  },
  {
    id: "risk-receivables",
    category: "financial",
    risk: "Delayed Working Capital Receivables from Local Halwais",
    severity: "Medium",
    whyItMatters: "Independent sweet makers sometimes defer payments by 30–45 days post-festival season, squeezing daily cash flow required to pay farmers.",
    whatYouCanDo: "Limit uncontracted commercial credit to a maximum 7-day rolling cycle; balance portfolio with 60% institutional corporate off-take (e.g. Verka/Nestle) on fixed 10-day settlement.",
  },
  {
    id: "risk-lean",
    category: "seasonal",
    risk: "Summer Flush-to-Lean Season Production Drop (-25%)",
    severity: "Medium",
    whyItMatters: "Buffalo milk output naturally contracts during extreme North Indian heat (May–June), driving procurement competition higher.",
    whatYouCanDo: "Diversify cow-buffalo procurement mix (40% cow milk with year-round lactation curves) and introduce heat-stress mineral supplements to member farmers.",
  },
];

export default function RisksPage() {
  const [swot, setSwot] = useState<SwotQuadrant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSwot, setShowSwot] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const swotData = await marketService.getSwot();
        setSwot(swotData);
      } catch (err) {
        console.error("Failed to load SWOT data", err);
      }
    }
    loadData();
  }, []);

  const filteredRisks = PRACTICAL_RISKS.filter((r) => {
    if (selectedCategory === "all") return true;
    return r.severity.toLowerCase() === selectedCategory;
  });

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <ShieldAlert size={16} />
              <span>Operational Resilience · Threat Diagnosis</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              Practical Risks &amp; Actionable Mitigations
            </h1>
            <p className="text-sm text-[#786d65] mt-1">
              Real-world operational, electrical, and supply chain vulnerabilities paired with bank-vetted risk mitigations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/what-if"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#382f29] shadow-2xs transition-all"
            >
              <SlidersHorizontal size={14} className="text-[#c75d3e]" />
              <span>Stress-Test in What-If</span>
            </Link>
            <Link
              href="/feasibility"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Next: Feasibility Bridge</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* PRACTICAL RISK MATRIX (Risk, Severity, Why it matters, What you can do) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Operational Risk Log
              </span>
              <span className="text-xs text-[#786d65]">({filteredRisks.length} threats audited)</span>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-[#786d65] uppercase">Filter:</span>
              {(["all", "high", "medium"] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSelectedCategory(sev)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                    selectedCategory === sev
                      ? "bg-[#c75d3e] text-white shadow-xs"
                      : "bg-white text-[#786d65] border border-[#ede3d8] hover:bg-[#faf4ee]"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredRisks.map((item) => {
              const isHigh = item.severity === "High";
              return (
                <div
                  key={item.id}
                  className="p-6 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-4 transition-all hover:border-[#c75d3e]/30"
                >
                  {/* Row Top: Risk Name & Severity Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ede3d8] pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isHigh ? "bg-[#fcedea] text-[#c75d3e]" : "bg-[#faf4ee] text-[#d97706]"
                        }`}
                      >
                        <AlertTriangle size={16} />
                      </div>
                      <h2 className="font-serif font-bold text-base sm:text-lg text-[#241b16]">
                        {item.risk}
                      </h2>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide self-start sm:self-auto ${
                        isHigh
                          ? "bg-[#fcedea] text-[#c75d3e] border border-[#c75d3e]/30"
                          : "bg-[#faf4ee] text-[#d97706] border border-[#d97706]/30"
                      }`}
                    >
                      {item.severity} Severity
                    </span>
                  </div>

                  {/* 2-Column Details: Why it matters vs What you can do */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#786d65] tracking-wider block">
                        Why It Matters
                      </span>
                      <p className="text-xs text-[#56423d] leading-relaxed">
                        {item.whyItMatters}
                      </p>
                    </div>

                    <div className="md:col-span-7 p-4 rounded-2xl bg-[#f0f6ec] border border-[#3a6b4c]/20 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#3a6b4c] tracking-wider flex items-center gap-1.5">
                        <Wrench size={13} />
                        <span>What You Can Do (Actionable Mitigation)</span>
                      </span>
                      <p className="text-xs font-medium text-[#241b16] leading-relaxed">
                        {item.whatYouCanDo}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible Academic SWOT Reference */}
        <div className="p-6 rounded-3xl bg-[#faf4ee] border border-[#ede3d8] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-[#241b16]">
                Secondary Reference: 2x2 Academic SWOT Matrix
              </h2>
              <p className="text-xs text-[#786d65]">
                Internal organizational strengths/weaknesses and macro opportunities/threats.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSwot(!showSwot)}
              className="text-xs font-bold text-[#c75d3e] hover:underline"
            >
              {showSwot ? "Collapse SWOT" : "Expand 2x2 Matrix"}
            </button>
          </div>

          {showSwot && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                <span className="text-xs font-bold text-[#3a6b4c] uppercase">Strengths</span>
                <ul className="space-y-1 text-xs text-[#56423d]">
                  <li>• High captive unchilled milk volume within 5km</li>
                  <li>• 3-phase agricultural power feeder connection at 180m</li>
                  <li>• Experienced promoter background in livestock handling</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                <span className="text-xs font-bold text-[#d97706] uppercase">Weaknesses</span>
                <ul className="space-y-1 text-xs text-[#56423d]">
                  <li>• Initial reliance on single commercial off-taker</li>
                  <li>• Working capital constraints during first 90 days</li>
                  <li>• Seasonal summer flush-to-lean lactation cycle</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                <span className="text-xs font-bold text-[#3a6b4c] uppercase">Opportunities</span>
                <ul className="space-y-1 text-xs text-[#56423d]">
                  <li>• Value addition into paneer and ghee increases margin by 14%</li>
                  <li>• PMEGP 35% non-repayable sovereign capital grant</li>
                  <li>• Direct bulk tanker collection contract with private dairy</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                <span className="text-xs font-bold text-[#c75d3e] uppercase">Threats</span>
                <ul className="space-y-1 text-xs text-[#56423d]">
                  <li>• Feed and silage price inflation during pre-monsoon dry spells</li>
                  <li>• Informal village credit chains offering cash advances</li>
                  <li>• Low voltage feeder trips during afternoon processing hours</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Bridges */}
        <div className="flex items-center justify-between pt-4 border-t border-[#ede3d8]">
          <Link
            href="/opportunity"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] font-bold text-xs hover:bg-[#faf4ee] transition-colors"
          >
            <span>← Back to Opportunity</span>
          </Link>

          <Link
            href="/feasibility"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Proceed to Feasibility Verdict</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

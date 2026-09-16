"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { marketService } from "@/services";
import { SwotQuadrant, RiskItem } from "@/domain";
import {
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  Wrench,
  Loader2,
} from "lucide-react";

export default function RisksPage() {
  const { business, location } = useApp();
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [swot, setSwot] = useState<SwotQuadrant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSwot, setShowSwot] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [swotData, risksData] = await Promise.all([
          marketService.getSwot(),
          marketService.getRisks(),
        ]);
        setSwot(swotData);
        setRisks(risksData);
      } catch (err) {
        console.error("Failed to load risks and SWOT data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [business?.id]);

  const filteredRisks = risks.filter((r) => {
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
              Real-world operational, electrical, and supply chain vulnerabilities for{" "}
              <strong className="text-[#241b16]">{business?.title || "your selected venture"}</strong> in{" "}
              {location?.villageOrTown || "your target area"} paired with bank-vetted mitigations.
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

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-[#c75d3e]" size={32} />
            <p className="text-xs text-[#786d65]">Loading dynamic risk matrix and threat diagnosis...</p>
          </div>
        ) : (
          /* PRACTICAL RISK MATRIX */
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
              {filteredRisks.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-[#ede3d8] text-xs text-[#786d65]">
                  No risks matching this filter.
                </div>
              ) : (
                filteredRisks.map((item) => {
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
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#786d65] block">
                              {item.category}
                            </span>
                            <h2 className="font-serif font-bold text-base sm:text-lg text-[#241b16]">
                              {item.risk}
                            </h2>
                          </div>
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
                            {item.whyItMatters || item.impactDescription}
                          </p>
                        </div>

                        <div className="md:col-span-7 p-4 rounded-2xl bg-[#f0f6ec] border border-[#3a6b4c]/20 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#3a6b4c] tracking-wider flex items-center gap-1.5">
                            <Wrench size={13} />
                            <span>What You Can Do (Actionable Mitigation)</span>
                          </span>
                          <p className="text-xs font-medium text-[#241b16] leading-relaxed">
                            {item.whatYouCanDo || item.mitigationStrategy}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Collapsible Academic SWOT Reference */}
        {swot && (
          <div className="p-6 rounded-3xl bg-[#faf4ee] border border-[#ede3d8] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif font-bold text-base text-[#241b16]">
                  Secondary Reference: 2x2 Academic SWOT Matrix
                </h2>
                <p className="text-xs text-[#786d65]">
                  Internal enterprise strengths/weaknesses and regional opportunities/threats for {business?.title || "your business"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSwot(!showSwot)}
                className="text-xs font-bold text-[#c75d3e] hover:underline cursor-pointer"
              >
                {showSwot ? "Collapse SWOT" : "Expand 2x2 Matrix"}
              </button>
            </div>

            {showSwot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                  <span className="text-xs font-bold text-[#3a6b4c] uppercase">Strengths</span>
                  <ul className="space-y-1.5 text-xs text-[#56423d]">
                    {swot.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#3a6b4c] font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                  <span className="text-xs font-bold text-[#d97706] uppercase">Weaknesses</span>
                  <ul className="space-y-1.5 text-xs text-[#56423d]">
                    {swot.weaknesses.map((wk, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#d97706] font-bold">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                  <span className="text-xs font-bold text-[#3a6b4c] uppercase">Opportunities</span>
                  <ul className="space-y-1.5 text-xs text-[#56423d]">
                    {swot.opportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#3a6b4c] font-bold">•</span>
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] space-y-2">
                  <span className="text-xs font-bold text-[#c75d3e] uppercase">Threats</span>
                  <ul className="space-y-1.5 text-xs text-[#56423d]">
                    {swot.threats.map((thr, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#c75d3e] font-bold">•</span>
                        <span>{thr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

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

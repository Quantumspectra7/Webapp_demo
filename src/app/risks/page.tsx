"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { marketService } from "@/services";
import { SwotQuadrant } from "@/domain";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";

export default function RisksPage() {
  const { business, location } = useApp();
  const [swot, setSwot] = useState<SwotQuadrant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const swotData = await marketService.getSwot();
        setSwot(swotData);
      } catch (err) {
        console.error("Failed to load SWOT data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [business?.id]);

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <Target size={16} />
              <span>Strategic Assessment · 2x2 Matrix</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              SWOT Analysis
            </h1>
            <p className="text-sm text-[#786d65] mt-1">
              Key internal strengths, weaknesses, market opportunities, and external threats for{" "}
              <strong className="text-[#241b16]">{business?.title || "your selected venture"}</strong> in{" "}
              {location?.villageOrTown || "your target area"}.
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
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="animate-spin text-[#c75d3e]" size={36} />
            <p className="text-xs font-medium text-[#786d65]">Loading strategic SWOT matrix...</p>
          </div>
        ) : !swot ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#ede3d8] text-sm text-[#786d65]">
            No SWOT analysis available for this business venture.
          </div>
        ) : (
          /* MAIN 2x2 SWOT MATRIX - CLEAN & FOCUSED ON KEY POINTS */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Strengths */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-white to-[#f0fdf4] border border-emerald-200/90 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                        Internal · Advantage
                      </span>
                      <h2 className="font-serif font-bold text-lg text-emerald-950">
                        Strengths
                      </h2>
                    </div>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-serif font-bold text-xs flex items-center justify-center">
                    S
                  </span>
                </div>

                <ul className="space-y-3">
                  {swot.strengths.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2b241f] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Weaknesses */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-white to-[#fffbeb] border border-amber-200/90 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                        Internal · Limitation
                      </span>
                      <h2 className="font-serif font-bold text-lg text-amber-950">
                        Weaknesses
                      </h2>
                    </div>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-serif font-bold text-xs flex items-center justify-center">
                    W
                  </span>
                </div>

                <ul className="space-y-3">
                  {swot.weaknesses.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2b241f] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Opportunities */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-white to-[#eff6ff] border border-blue-200/90 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-blue-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                        External · Growth
                      </span>
                      <h2 className="font-serif font-bold text-lg text-blue-950">
                        Opportunities
                      </h2>
                    </div>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-serif font-bold text-xs flex items-center justify-center">
                    O
                  </span>
                </div>

                <ul className="space-y-3">
                  {swot.opportunities.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2b241f] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Threats */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white via-white to-[#fff5f2] border border-[#c75d3e]/35 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#c75d3e]/15 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#fcedea] text-[#c75d3e] flex items-center justify-center">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c75d3e] block">
                        External · Risk
                      </span>
                      <h2 className="font-serif font-bold text-lg text-[#38201a]">
                        Threats
                      </h2>
                    </div>
                  </div>
                  <span className="w-7 h-7 rounded-lg bg-[#faf4ee] border border-[#c75d3e]/25 text-[#c75d3e] font-serif font-bold text-xs flex items-center justify-center">
                    T
                  </span>
                </div>

                <ul className="space-y-3">
                  {swot.threats.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2b241f] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c75d3e] shrink-0 mt-2" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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


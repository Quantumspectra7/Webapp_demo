"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
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
  }, []);

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
              Evaluating local supply deficits, competitor capacity bottlenecks, and capital alignment for Sidhwan Bet &amp; Jagraon.
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
              Grounded in Ludhiana Mandi Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Signal 1: Demand */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Demand Deficit Signal</span>
                <span className="font-mono font-bold text-[#3a6b4c]">82% · Strong</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden font-mono tracking-widest text-[10px] text-[#3a6b4c]">
                <div className="bg-[#3a6b4c] h-2.5 rounded-full" style={{ width: "82%" }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                Unserved dairy deficit (~3,800 L/day) across 14 Gram Panchayats with zero local commercial chilling.
              </p>
            </div>

            {/* Signal 2: Competition */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Competition Headroom</span>
                <span className="font-mono font-bold text-[#d97706]">70% · Moderate</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#d97706] h-2.5 rounded-full" style={{ width: "70%" }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                Only 2 facilities operating at &lt;40% utilization due to delayed farmer payment cycles.
              </p>
            </div>

            {/* Signal 3: Capital Fit */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Capital &amp; Subsidy Fit</span>
                <span className="font-mono font-bold text-[#3a6b4c]">88% · Exceptional</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#3a6b4c] h-2.5 rounded-full" style={{ width: "88%" }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                ₹1,00,000 own equity qualifies for 35% PMEGP capital grant (₹4,90,000 non-repayable).
              </p>
            </div>

            {/* Signal 4: Market Access */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#241b16]">Market Access &amp; Power</span>
                <span className="font-mono font-bold text-[#c75d3e]">78% · Solid</span>
              </div>
              <div className="w-full bg-[#ede3d8] rounded-full h-2.5 overflow-hidden">
                <div className="bg-[#c75d3e] h-2.5 rounded-full" style={{ width: "78%" }} />
              </div>
              <p className="text-[11px] text-[#786d65]">
                SH-13 pucca transit road within 80m and 3-phase agricultural power feeder at 180m.
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
                <li className="flex items-start gap-2">
                  <span className="text-[#3a6b4c] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Unchilled Milk Surplus:</strong> 14 neighboring villages produce over 14,000 Ltrs/day, with farmers losing ₹3–₹4/L due to souring in afternoon transit.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a6b4c] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Direct Highway Access:</strong> Immediate access to SH-13 and NH-703 connects your chilling hub to Ludhiana sweet clusters and corporate bulk tankers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#3a6b4c] font-bold mt-0.5">•</span>
                  <span>
                    <strong>PMEGP Subsidy Clearance:</strong> 35% non-repayable capital grant reduces loan debt servicing pressure, keeping break-even at only 42% capacity.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#f0f6ec] text-[11px] font-semibold text-[#3a6b4c]">
              Net Advantage: 68% captive supplier base
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
                <li className="flex items-start gap-2">
                  <span className="text-[#c75d3e] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Summer Afternoon Feeder Drops:</strong> Rural agricultural feeder schedules drop to low voltage between 1:00 PM and 3:30 PM, necessitating a diesel backup.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c75d3e] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Feed Price Volatility:</strong> Mustard cake and silage prices fluctuate up to 18% during dry pre-monsoon months, squeezing farmer milk yields.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c75d3e] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Informal Credit Chains:</strong> Local middlemen (doodhis) offer cash advances to small farmers, requiring competitive weekly settlement terms.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#fcedea] text-[11px] font-semibold text-[#c75d3e]">
              Watch Out: Diesel cost can erode 4% net margin
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
                <li className="flex items-start gap-2">
                  <span className="text-[#d97706] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Institutional Off-Take Agreement:</strong> Signing a guaranteed seasonal procurement contract with Verka or a private processor locks in a minimum floor price.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d97706] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Hybrid Solar Integration:</strong> Sizing a 10kVA solar-inverter array reduces DG fuel expenditure by 65% during peak refrigeration hours.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d97706] font-bold mt-0.5">•</span>
                  <span>
                    <strong>Transparent FAT/SNF Testing:</strong> Installing an ultrasonic milk testing kiosk with instant SMS slips builds trust and pulls farmers away from informal middlemen.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#faf4ee] border border-[#ede3d8] text-[11px] font-semibold text-[#241b16]">
              Action: Budget solar in DPR addendum
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

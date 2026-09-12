"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle, Compass } from "lucide-react";
import { EvidencePopover } from "./EvidencePopover";

interface MarketSignalsSectionProps {
  positiveSignals: string[];
  watchouts: string[];
}

export const MarketSignalsSection: React.FC<MarketSignalsSectionProps> = ({
  positiveSignals,
  watchouts,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-[#ede3d8] p-5 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#ede3d8] mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-[#c75d3e]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16]">
              What the Data Suggests
            </h3>
            <EvidencePopover
              title="Market Signals Diagnostic"
              source="GramVest Catchment Evidence Matrix"
              confidence="high"
              note="Synthesized from trade flow patterns, infrastructure surveys, and competitor concentration."
            />
          </div>
          <p className="text-xs text-[#786d65] mt-1">
            Structured interpretation of local business viability without speculative assumptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Signals */}
        <div className="p-5 rounded-2xl bg-[#f0f6ec]/70 border border-[#3a6b4c]/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={18} className="text-[#3a6b4c]" />
              <h4 className="text-sm font-bold text-[#1f422b] uppercase tracking-wider">
                Viability Strengths &amp; Signals
              </h4>
            </div>
            <ul className="space-y-2.5">
              {positiveSignals.map((sig, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#241b16] leading-relaxed">
                  <span className="font-bold text-[#3a6b4c] shrink-0">✓</span>
                  <span>{sig}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-[#3a6b4c] font-medium mt-4 pt-3 border-t border-[#3a6b4c]/15">
            Strong foundation for local product off-take and steady cash flow.
          </p>
        </div>

        {/* Watchouts & Caution Points */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-700" />
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                Watchouts &amp; Operational Risks
              </h4>
            </div>
            <ul className="space-y-2.5">
              {watchouts.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#241b16] leading-relaxed">
                  <span className="font-bold text-amber-700 shrink-0">⚠</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-amber-900 font-medium mt-4 pt-3 border-t border-amber-200">
            Address these operating risks in your capital reserve and supplier agreements.
          </p>
        </div>
      </div>
    </div>
  );
};

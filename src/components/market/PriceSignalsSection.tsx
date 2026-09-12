"use client";

import React from "react";
import { PriceSignalItem } from "@/domain";
import { Tag, TrendingUp, Minus, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { EvidencePopover } from "./EvidencePopover";

interface PriceSignalsSectionProps {
  priceSignals: PriceSignalItem[];
}

export const PriceSignalsSection: React.FC<PriceSignalsSectionProps> = ({
  priceSignals,
}) => {
  return (
    <div className="w-full bg-white rounded-3xl border border-[#ede3d8] p-5 sm:p-7 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#ede3d8] mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#c75d3e]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16]">
              Local Price Signals
            </h3>
            <EvidencePopover
              title="Price Signal Benchmarking"
              source="Punjab Mandi Board Daily Wholesales & Regional Farmgate Surveys"
              sourceYear="August 2026"
              status="Weekly Aggregation"
              confidence="high"
              note="Calculated from real trade rates across Jagraon APMC, Ludhiana wholesale dairy yards, and cooperative collection points."
            />
          </div>
          <p className="text-xs text-[#786d65] mt-1">
            Prevailing farmgate procurement prices, bulk sales spreads, and key input costs in your catchment.
          </p>
        </div>

        <span className="text-[11px] font-bold text-[#3a6b4c] bg-[#f0f6ec] px-3 py-1 rounded-full border border-[#3a6b4c]/20 hidden sm:inline-block">
          7-Day Rolling Benchmark
        </span>
      </div>

      {/* Grid of Price Range Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceSignals.map((item) => (
          <div
            key={item.commodity}
            className="p-4 rounded-2xl bg-[#faf4ee]/60 border border-[#ede3d8] hover:border-[#c75d3e]/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#241b16] leading-tight">
                  {item.commodity}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.trend === "rising"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-[#3a6b4c]/10 text-[#3a6b4c]"
                  }`}
                >
                  {item.trend === "rising" ? (
                    <ArrowUpRight size={11} />
                  ) : (
                    <Minus size={11} />
                  )}
                  <span className="capitalize">{item.trend}</span>
                </span>
              </div>

              {/* Price Range Visual */}
              <div className="my-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-xl font-bold text-[#241b16] font-mono">
                    ₹{item.rangeMin} – ₹{item.rangeMax}
                  </span>
                  <span className="text-xs text-[#786d65] font-medium">{item.unit}</span>
                </div>

                {/* Sub-bar showing current average position */}
                <div className="h-1.5 w-full bg-[#ede3d8] rounded-full overflow-hidden mt-2 relative">
                  <div
                    className="h-full bg-[#c75d3e] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          20,
                          ((item.currentAvg - item.rangeMin) /
                            (item.rangeMax - item.rangeMin || 1)) *
                            100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#786d65] mt-1">
                  <span>Min ₹{item.rangeMin}</span>
                  <span className="font-bold text-[#241b16]">
                    Current Avg ₹{item.currentAvg}
                  </span>
                  <span>Max ₹{item.rangeMax}</span>
                </div>
              </div>
            </div>

            {item.notes && (
              <p className="text-[11px] text-[#786d65] mt-2 pt-2 border-t border-[#ede3d8]/80 line-clamp-2">
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

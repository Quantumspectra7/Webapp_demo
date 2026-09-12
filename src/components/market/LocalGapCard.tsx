"use client";

import React from "react";
import { Sparkles, MapPin, ArrowRight, Lightbulb } from "lucide-react";
import Link from "next/link";

interface LocalGapCardProps {
  headline: string;
  observation: string;
  opportunity: string;
}

export const LocalGapCard: React.FC<LocalGapCardProps> = ({
  headline,
  observation,
  opportunity,
}) => {
  return (
    <div className="w-full bg-[#faf4ee] rounded-3xl border-2 border-[#c75d3e]/25 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#ede3d8]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#c75d3e] text-white flex items-center justify-center font-bold shadow-2xs">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c75d3e]">
              Spatial Feasibility Analysis
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16]">
              Local Gap: {headline}
            </h3>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-[#ede3d8] text-[#3a6b4c]">
          High Feasibility Pocket
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: What the map shows */}
        <div className="md:col-span-7 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
            Geographic Observation
          </h4>
          <p className="text-sm text-[#241b16] leading-relaxed">{observation}</p>
        </div>

        {/* Right: Potential Opportunity Window */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-white border border-[#ede3d8] shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#c75d3e] mb-1.5">
            <Lightbulb size={15} />
            <span>Recommended Venture Angle</span>
          </div>
          <p className="text-xs text-[#241b16] font-medium leading-relaxed">
            {opportunity}
          </p>

          <Link
            href="/opportunity"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c75d3e] hover:underline mt-3"
          >
            <span>Explore full opportunity dossier</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

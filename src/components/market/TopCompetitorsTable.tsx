"use client";

import React from "react";
import { Competitor } from "@/domain";
import { formatNumber, formatDistance } from "@/lib/formatters";
import {
  Building2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  HelpCircle,
} from "lucide-react";

interface TopCompetitorsTableProps {
  competitors: Competitor[];
  selectedCompetitorId: string | null;
  hoveredCompetitorId: string | null;
  onSelectCompetitor: (competitor: Competitor) => void;
  onHoverCompetitor: (competitorId: string | null) => void;
  categoryFilter: string;
  distanceFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  onDistanceFilterChange: (dist: string) => void;
}

const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Dairy", value: "Dairy" },
  { label: "Milk Processing", value: "Milk Processing" },
  { label: "Collection", value: "Collection" },
  { label: "Retail", value: "Retail" },
];

const DISTANCE_OPTIONS = [
  { label: "All Distances", value: "all" },
  { label: "< 2 km", value: "<2km" },
  { label: "2–5 km", value: "2-5km" },
  { label: "5–10 km", value: "5-10km" },
];

export const TopCompetitorsTable: React.FC<TopCompetitorsTableProps> = ({
  competitors,
  selectedCompetitorId,
  hoveredCompetitorId,
  onSelectCompetitor,
  onHoverCompetitor,
  categoryFilter,
  distanceFilter,
  onCategoryFilterChange,
  onDistanceFilterChange,
}) => {
  // Top 10 Slice per specification
  const top10 = competitors.slice(0, 10);

  const getCategoryBadge = (cat?: string, type?: string) => {
    if (cat === "Milk Processing" || type === "chilling_hub") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#3a6b4c]/10 text-[#3a6b4c]">
          Processing
        </span>
      );
    }
    if (cat === "Collection" || type === "cooperative_center") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
          Collection
        </span>
      );
    }
    if (type === "sweet_maker") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">
          Derivatives
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#c75d3e]/10 text-[#c75d3e]">
        Dairy
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-[#ede3d8] p-5 sm:p-7 shadow-sm">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#ede3d8]">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-[#c75d3e]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16]">
              Top 10 Relevant Businesses
            </h3>
          </div>
          <p className="text-xs text-[#786d65] mt-1">
            Ranked by proximity, operational capacity, and market overlap with your venture.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#faf4ee] p-1 rounded-xl border border-[#ede3d8]">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onCategoryFilterChange(opt.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  categoryFilter === opt.value
                    ? "bg-white text-[#c75d3e] shadow-2xs font-bold"
                    : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-1 bg-[#faf4ee] p-1 rounded-xl border border-[#ede3d8]">
            {DISTANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDistanceFilterChange(opt.value)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  distanceFilter === opt.value
                    ? "bg-white text-[#241b16] shadow-2xs font-bold"
                    : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranked List Content */}
      <div className="mt-4 divide-y divide-[#ede3d8]">
        {top10.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#786d65]">
            <p className="font-bold text-[#241b16]">No matching businesses in this filter</p>
            <p className="mt-1">Try expanding distance to 5–10 km or reset category filters.</p>
          </div>
        ) : (
          top10.map((comp, idx) => {
            const isSelected = comp.id === selectedCompetitorId;
            const isHovered = comp.id === hoveredCompetitorId;
            const rankStr = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={comp.id}
                onClick={() => onSelectCompetitor(comp)}
                onMouseEnter={() => onHoverCompetitor(comp.id)}
                onMouseLeave={() => onHoverCompetitor(null)}
                className={`py-3.5 px-3 sm:px-4 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-[#faf4ee] ring-2 ring-[#c75d3e]/30 shadow-2xs"
                    : isHovered
                    ? "bg-[#faf4ee]/60"
                    : "hover:bg-[#faf4ee]/40"
                }`}
              >
                {/* Left: Rank + Business Name + Category */}
                <div className="flex items-start sm:items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#786d65] bg-[#faf4ee] border border-[#ede3d8] px-2 py-1 rounded-lg shrink-0">
                    {rankStr}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#241b16] hover:text-[#c75d3e] transition-colors">
                        {comp.name}
                      </h4>
                      {getCategoryBadge(comp.category, comp.type)}
                    </div>
                    <p className="text-xs text-[#786d65] mt-0.5">
                      {comp.businessType || comp.primaryArea} · Est. {comp.operationalSinceYear}
                    </p>
                  </div>
                </div>

                {/* Right: Distance + Capacity + Fly to map */}
                <div className="flex items-center justify-between sm:justify-end gap-5 text-xs shrink-0 pl-9 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-[#c75d3e] font-mono block">
                      {formatDistance(comp.distanceKm)}
                    </span>
                    <span className="text-[10px] text-[#786d65]">from your site</span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-bold text-[#241b16] font-mono block">
                      {formatNumber(comp.dailyCapacityLiters)} L/day
                    </span>
                    <span className="text-[10px] text-[#786d65]">operating cap</span>
                  </div>

                  <div className="flex items-center gap-1 text-[#786d65] hover:text-[#c75d3e] text-xs font-semibold">
                    <span className="hidden md:inline">Focus</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Data Coverage Note per Section 25 */}
      <div className="mt-5 pt-4 border-t border-[#ede3d8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-[#786d65]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#3a6b4c] shrink-0" />
          <span>
            Businesses shown are identified from available public/map data and may not represent
            every operating business in the area.
          </span>
        </div>
        <span className="font-medium text-[#241b16]">
          Showing {Math.min(10, competitors.length)} of {competitors.length} nearby facilities
        </span>
      </div>
    </div>
  );
};

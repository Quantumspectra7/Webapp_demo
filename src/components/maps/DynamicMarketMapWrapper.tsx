"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Competitor, MarketLocation, VentureLocation } from "@/domain";
import { MarketMapFilterState } from "./MarketIntelligenceLeafletMap";

const MarketIntelligenceLeafletMap = dynamic(
  () =>
    import("@/components/maps/MarketIntelligenceLeafletMap").then(
      (mod) => mod.MarketIntelligenceLeafletMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] lg:h-[620px] rounded-3xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col items-center justify-center text-[#786d65] text-sm animate-pulse p-6 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#c75d3e] border-t-transparent animate-spin mb-3"></div>
        <span className="font-serif font-bold text-base text-[#241b16]">
          Initializing Local Geospatial Intelligence Canvas...
        </span>
        <span className="text-xs text-[#786d65] mt-1 max-w-sm">
          Rendering rural transport corridors, Mandi auction yards & competitor nodes
        </span>
      </div>
    ),
  }
);

interface DynamicMarketMapWrapperProps {
  location: VentureLocation;
  competitors: Competitor[];
  markets: MarketLocation[];
  radiusKm: 5 | 10;
  selectedCompetitorId: string | null;
  hoveredCompetitorId: string | null;
  onSelectCompetitor: (competitor: Competitor | null) => void;
  filters: MarketMapFilterState;
  onFilterChange: (filters: MarketMapFilterState) => void;
  onResetView?: () => void;
}

export const DynamicMarketMapWrapper: React.FC<DynamicMarketMapWrapperProps> = (
  props
) => {
  return <MarketIntelligenceLeafletMap {...props} />;
};

"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Competitor, VentureLocation } from "@/domain";

const CompetitorLeafletMap = dynamic(
  () =>
    import("@/components/maps/CompetitorLeafletMap").then(
      (mod) => mod.CompetitorLeafletMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] rounded-xl bg-[#f3ede6] border border-[#ddd6c9] flex flex-col items-center justify-center text-[#706c63] text-[13px] animate-pulse">
        <span className="font-bold">Loading Catchment Map...</span>
        <span className="text-[11px] text-[#a09a90] mt-1">
          Rendering Jagraon territorial boundaries & competitor nodes
        </span>
      </div>
    ),
  }
);

interface DynamicMapWrapperProps {
  location: VentureLocation;
  competitors: Competitor[];
  radiusKm: 5 | 10;
  selectedCompetitorId?: string;
  onSelectCompetitor?: (competitor: Competitor) => void;
}

export const DynamicMapWrapper: React.FC<DynamicMapWrapperProps> = (props) => {
  return <CompetitorLeafletMap {...props} />;
};

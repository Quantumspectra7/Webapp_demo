"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

const OnboardingLocationMap = dynamic(
  () =>
    import("@/components/maps/OnboardingLocationMap").then(
      (mod) => mod.OnboardingLocationMap
    ),
  {
    ssr: false,
    loading: () => <MapLoadingState />,
  }
);

function MapLoadingState() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full min-h-[380px] lg:min-h-[460px] rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col items-center justify-center text-[#786d65] p-6 text-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#c75d3e] border-t-transparent animate-spin mb-3"></div>
      <p className="text-sm font-semibold text-[#241b16]">Loading interactive map...</p>
      <p className="text-xs text-[#786d65] mt-1">Rendering Punjab geographic survey layer</p>
      {isSlow && (
        <p className="text-[11px] text-[#c75d3e] mt-3 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
          Map is taking longer than expected. You can still confirm your location or select manually below.
        </p>
      )}
    </div>
  );
}

interface DynamicOnboardingMapWrapperProps {
  latitude: number;
  longitude: number;
  locationName: string;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export const DynamicOnboardingMapWrapper: React.FC<DynamicOnboardingMapWrapperProps> = (
  props
) => {
  return <OnboardingLocationMap {...props} />;
};

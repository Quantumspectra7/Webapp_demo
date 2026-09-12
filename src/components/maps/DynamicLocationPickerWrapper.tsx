"use client";

import dynamic from "next/dynamic";
import React from "react";
import { LocationPickerCoords } from "./LocationPickerLeafletMap";

const LocationPickerLeafletMap = dynamic(
  () =>
    import("@/components/maps/LocationPickerLeafletMap").then(
      (mod) => mod.LocationPickerLeafletMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] sm:h-[460px] rounded-2xl bg-[#f5ece3] border border-[#ddd6c9] flex flex-col items-center justify-center text-[#706c63] text-[13px] animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-[#c75d3e] border-t-transparent animate-spin mb-3"></div>
        <span className="font-bold text-[#1d1b18]">Initializing Rural Geofencing & Feeder Map...</span>
        <span className="text-[11px] text-[#8e857b] mt-1">
          Loading Punjab cadastral boundaries & APMC mandi hubs
        </span>
      </div>
    ),
  }
);

interface DynamicLocationPickerWrapperProps {
  latitude: number;
  longitude: number;
  villageName: string;
  blockName: string;
  districtName: string;
  radiusKm?: 5 | 10 | 15;
  onChangeLocation: (coords: LocationPickerCoords) => void;
  nearestMandiName?: string;
  distanceToMandiKm?: number;
}

export const DynamicLocationPickerWrapper: React.FC<DynamicLocationPickerWrapperProps> = (
  props
) => {
  return <LocationPickerLeafletMap {...props} />;
};

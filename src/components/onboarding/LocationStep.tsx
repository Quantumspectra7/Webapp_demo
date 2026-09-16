"use client";

import React, { useState, useEffect, useRef } from "react";
import { LocationProfile } from "@/domain";
import { locationService } from "@/services";
import { DynamicOnboardingMapWrapper } from "@/components/maps/DynamicOnboardingMapWrapper";
import {
  Search,
  MapPin,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Compass,
  ArrowRight,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface LocationStepProps {
  initialLocation: LocationProfile;
  onConfirmLocation: (location: LocationProfile) => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  initialLocation,
  onConfirmLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationProfile>(initialLocation);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);

  // Manual dropdown lists
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);

  // Manual form values
  const [manualDistrict, setManualDistrict] = useState(initialLocation.district || "Ludhiana");
  const [manualBlock, setManualBlock] = useState(initialLocation.block || "Khanna");
  const [manualVillage, setManualVillage] = useState(initialLocation.villageOrTown || "Khanna");

  // GPS state
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      setSearchError("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingGps(true);
    setGpsMessage("Acquiring GPS fix...");
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = +pos.coords.latitude.toFixed(5);
        const lng = +pos.coords.longitude.toFixed(5);
        setGpsMessage(`Coordinates found: ${lat}°, ${lng}°. Resolving address...`);

        try {
          const resolved = await locationService.resolveLocation(lat, lng);
          const updatedLocation: LocationProfile = {
            ...resolved,
            latitude: lat,
            longitude: lng,
            precision: "point",
            source: "map",
            confidence: "high",
          };
          setSelectedLocation(updatedLocation);

          // Sync manual dropdowns so manual selectors stay in sync with live location
          if (updatedLocation.district) setManualDistrict(updatedLocation.district);
          if (updatedLocation.block) setManualBlock(updatedLocation.block);
          if (updatedLocation.villageOrTown) setManualVillage(updatedLocation.villageOrTown);

          setGpsMessage(`✓ Live location locked: ${updatedLocation.villageOrTown}, ${updatedLocation.district}`);
          setTimeout(() => setGpsMessage(null), 5000);
        } catch {
          setSelectedLocation((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            source: "map",
            confidence: "high",
          }));
          setGpsMessage(`✓ GPS coordinates locked: ${lat}°, ${lng}°`);
          setTimeout(() => setGpsMessage(null), 4000);
        } finally {
          setIsFetchingGps(false);
        }
      },
      (err) => {
        console.warn("GPS error", err);
        setIsFetchingGps(false);
        setGpsMessage(null);
        if (err.code === err.PERMISSION_DENIED) {
          setSearchError("Location permission was denied. Please enable permission or type your town/PIN code.");
        } else {
          setSearchError("Could not retrieve GPS location. Please enter your town or 6-digit PIN code.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Load districts on mount
  useEffect(() => {
    locationService.getAvailableDistricts("Punjab").then((districts) => {
      setAvailableDistricts(districts);
    });
  }, []);

  // When manual district changes, reload blocks
  useEffect(() => {
    if (manualDistrict) {
      locationService.getAvailableBlocks(manualDistrict).then((blocks) => {
        setAvailableBlocks(blocks);
        if (blocks.length > 0 && !blocks.includes(manualBlock)) {
          setManualBlock(blocks[0]);
        }
      });
    }
  }, [manualDistrict]);

  // When manual block changes, reload villages
  useEffect(() => {
    if (manualDistrict && manualBlock) {
      locationService.getAvailableVillages(manualDistrict, manualBlock).then((villages) => {
        setAvailableVillages(villages);
        if (villages.length > 0 && !villages.includes(manualVillage)) {
          setManualVillage(villages[0]);
        }
      });
    }
  }, [manualDistrict, manualBlock]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const results = await locationService.searchLocations(searchQuery);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError(
            "Couldn’t find that location. Try the village/town name or choose it manually."
          );
        }
      } catch (err) {
        setSearchError("Unable to search locations right now. Please choose manually.");
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selection from autocomplete search
  const handleSelectSearchResult = (item: LocationProfile) => {
    setSelectedLocation({
      ...item,
      precision: "point",
      source: "search",
      confidence: "high",
    });
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  // Handle map pin drag or click
  const handleCoordinatesChange = async (lat: number, lng: number) => {
    try {
      const resolved = await locationService.resolveLocation(lat, lng);
      const updated: LocationProfile = {
        ...resolved,
        latitude: lat,
        longitude: lng,
        precision: "point",
        source: "map",
        confidence: "high",
      };
      setSelectedLocation(updated);
      if (updated.district) setManualDistrict(updated.district);
      if (updated.block) setManualBlock(updated.block);
      if (updated.villageOrTown) setManualVillage(updated.villageOrTown);
    } catch {
      setSelectedLocation((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        precision: "point",
        source: "map",
        confidence: "high",
      }));
    }
  };

  // Handle manual selection apply
  const handleApplyManual = async () => {
    const manualQuery = `${manualVillage}, ${manualDistrict}`;
    const results = await locationService.searchLocations(manualQuery);
    if (results.length > 0) {
      setSelectedLocation({
        ...results[0],
        district: manualDistrict,
        block: manualBlock,
        villageOrTown: manualVillage,
        precision: "administrative",
        source: "manual",
        confidence: "medium",
      });
    } else {
      setSelectedLocation({
        id: `loc-manual-${Date.now()}`,
        state: "Punjab",
        district: manualDistrict,
        block: manualBlock,
        villageOrTown: manualVillage,
        pincode: "141401",
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        precision: "administrative",
        source: "manual",
        confidence: "medium",
      });
    }
    setShowManualSelection(false);
  };

  const handleConfirm = () => {
    onConfirmLocation(selectedLocation);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c75d3e]/10 text-[#c75d3e] mb-2.5">
          <MapPin size={13} />
          <span>Step 1 of 5</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241b16] tracking-tight">
          Where do you want to start your business?
        </h1>
        <p className="text-sm sm:text-base text-[#786d65] mt-2 max-w-2xl">
          Your local market matters. We’ll use your location to understand nearby customers,
          competitors and markets.
        </p>
      </div>

      {/* Split Layout: Left Form & Search / Right Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Search + Manual Options + Confirmation Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Live Location Quick Fetch */}
          <div className="bg-white rounded-2xl border border-[#ede3d8] p-4 sm:p-5 shadow-2xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Option 1: Live GPS Detection
              </label>
              <span className="text-[10px] font-semibold text-[#3a6b4c] bg-[#3a6b4c]/10 px-2 py-0.5 rounded-full">
                Instant Auto-Detect
              </span>
            </div>
            <button
              type="button"
              onClick={handleFetchLiveLocation}
              disabled={isFetchingGps}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#241b16] hover:bg-[#382f29] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Compass size={15} className={`text-[#d4e6c1] ${isFetchingGps ? "animate-spin" : ""}`} />
              <span>{isFetchingGps ? "Acquiring GPS Satellite Fix..." : "Use Current / Live Location"}</span>
            </button>
            {gpsMessage && (
              <p className="text-[11px] text-[#3a6b4c] font-medium animate-pulse text-center mt-1">
                {gpsMessage}
              </p>
            )}
          </div>

          {/* Method A: Search by Pincode or Town */}
          <div className="bg-white rounded-2xl border border-[#ede3d8] p-4 sm:p-5 shadow-2xs relative">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Option 2: Search by PIN Code or Town
              </label>
              <span className="text-[10px] text-[#786d65] font-mono">
                6-Digit PIN or Name
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 141401, Khanna, Samrala, Nakodar..."
                className="w-full rounded-xl border border-[#ede3d8] bg-[#faf4ee]/60 pl-10 pr-4 py-2.5 text-sm text-[#241b16] placeholder-[#786d65]/60 focus:border-[#c75d3e] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#c75d3e] transition-all"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#786d65]"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#c75d3e] border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-[#ede3d8] shadow-lg max-h-64 overflow-y-auto divide-y divide-[#ede3d8]">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#faf4ee] transition-colors flex items-start gap-2.5 cursor-pointer"
                  >
                    <MapPin size={15} className="text-[#c75d3e] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#241b16]">{item.villageOrTown}</p>
                      <p className="text-xs text-[#786d65]">
                        {item.block} Block · {item.district}, {item.state}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Error / Empty message */}
            {searchError && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Location Fallback: Manual Hierarchy Selection */}
          <div className="bg-white rounded-2xl border border-[#ede3d8] p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#241b16]">Prefer to choose manually?</span>
              <button
                type="button"
                onClick={() => setShowManualSelection(!showManualSelection)}
                className="text-xs font-bold text-[#c75d3e] hover:underline cursor-pointer"
              >
                {showManualSelection ? "Use map instead" : "Select from lists"}
              </button>
            </div>

            {showManualSelection && (
              <div className="mt-4 pt-4 border-t border-[#ede3d8] flex flex-col gap-3">
                {/* State (Agnostic architecture) */}
                <div>
                  <label className="block text-[11px] font-bold text-[#786d65] mb-1">State</label>
                  <select
                    disabled
                    className="w-full rounded-xl border border-[#ede3d8] bg-[#ede3d8]/40 px-3 py-2 text-xs font-medium text-[#241b16]"
                  >
                    <option value="Punjab">Punjab (Current Survey Coverage)</option>
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-[11px] font-bold text-[#786d65] mb-1">
                    District
                  </label>
                  <select
                    value={manualDistrict}
                    onChange={(e) => setManualDistrict(e.target.value)}
                    className="w-full rounded-xl border border-[#ede3d8] bg-white px-3 py-2 text-xs font-semibold text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                  >
                    {availableDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Block */}
                <div>
                  <label className="block text-[11px] font-bold text-[#786d65] mb-1">
                    Block / Sub-District
                  </label>
                  <select
                    value={manualBlock}
                    onChange={(e) => setManualBlock(e.target.value)}
                    className="w-full rounded-xl border border-[#ede3d8] bg-white px-3 py-2 text-xs font-semibold text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                  >
                    {availableBlocks.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Village / Town */}
                <div>
                  <label className="block text-[11px] font-bold text-[#786d65] mb-1">
                    Village / Town
                  </label>
                  <select
                    value={manualVillage}
                    onChange={(e) => setManualVillage(e.target.value)}
                    className="w-full rounded-xl border border-[#ede3d8] bg-white px-3 py-2 text-xs font-semibold text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                  >
                    {availableVillages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleApplyManual}
                  className="mt-2 w-full py-2 rounded-xl bg-[#241b16] hover:bg-[#382f29] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Apply Manual Selection
                </button>
              </div>
            )}
          </div>

          {/* Active Selected Location Confirmation Card */}
          <div className="bg-[#faf4ee] rounded-2xl border-2 border-[#c75d3e]/30 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#c75d3e]">
                Selected Location
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  selectedLocation.precision === "point"
                    ? "bg-[#3a6b4c]/10 text-[#3a6b4c]"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                <CheckCircle2 size={11} />
                {selectedLocation.precision === "point"
                  ? "Location confirmed on map"
                  : "Identified at village level"}
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#241b16]">
              {selectedLocation.villageOrTown}
            </h3>
            <p className="text-xs text-[#786d65] mt-0.5">
              {selectedLocation.block} Block · {selectedLocation.district}, {selectedLocation.state}
            </p>

            <div className="mt-3 pt-3 border-t border-[#ede3d8] flex items-center justify-between text-xs text-[#786d65]">
              <span className="font-mono text-[11px]">
                {selectedLocation.latitude.toFixed(4)}° N, {selectedLocation.longitude.toFixed(4)}° E
              </span>
              <span className="font-medium text-[#241b16]">
                PIN: {selectedLocation.pincode || "141401"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              className="mt-4 w-full py-3 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirm Location</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Leaflet Map */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <DynamicOnboardingMapWrapper
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            locationName={`${selectedLocation.villageOrTown}, ${selectedLocation.district}`}
            onCoordinatesChange={handleCoordinatesChange}
          />
        </div>
      </div>
    </div>
  );
};

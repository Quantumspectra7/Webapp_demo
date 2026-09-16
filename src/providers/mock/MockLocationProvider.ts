import { LocationProfile } from "@/domain";
import { ILocationProvider } from "@/providers/interfaces";
import { PUNJAB_DETAILED_LOCATIONS, PunjabLocationEntry } from "@/data/onboardingData";

export class MockLocationProvider implements ILocationProvider {
  private locations: PunjabLocationEntry[] = PUNJAB_DETAILED_LOCATIONS;

  async searchLocations(query: string): Promise<LocationProfile[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return top representative regional hubs
      return this.locations.slice(0, 5).map((entry, idx) => this.toLocationProfile(entry, `loc-preset-${idx}`, "preset"));
    }

    // 1. Direct match on village, block, district or pincode
    const matches = this.locations.filter(
      (loc) =>
        loc.villageOrTown.toLowerCase().includes(q) ||
        loc.block.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q) ||
        loc.pincode.startsWith(q) ||
        loc.pincode.includes(q)
    );

    if (matches.length > 0) {
      return matches.slice(0, 8).map((entry, idx) => this.toLocationProfile(entry, `loc-search-${idx}`, "search"));
    }

    // 2. If user enters a 6-digit Indian PIN code that isn't in local array, synthesize an administrative entry
    const isPincode = /^\d{6}$/.test(q);
    const pinDistrict = isPincode && q.startsWith("14") ? "Ludhiana" : "Punjab";

    return [
      {
        id: `loc-custom-${Date.now()}`,
        state: "Punjab",
        district: pinDistrict,
        block: isPincode ? `Postal Area ${q}` : "Khanna",
        villageOrTown: isPincode ? `PIN ${q}` : query.trim(),
        pincode: isPincode ? q : "141401",
        latitude: 30.702 + (Math.random() - 0.5) * 0.05,
        longitude: 76.22 + (Math.random() - 0.5) * 0.05,
        precision: "administrative",
        source: "search",
        confidence: "medium",
      },
    ];
  }

  async resolveLocation(latitude: number, longitude: number): Promise<LocationProfile> {
    // Attempt reverse geocoding via Nominatim when available in client
    try {
      if (typeof window !== "undefined") {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
          {
            headers: { "Accept-Language": "en" },
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const town = addr.village || addr.town || addr.city || addr.suburb || addr.hamlet || addr.county || "Selected Area";
          const district = (addr.state_district || addr.county || addr.district || "Ludhiana").replace(/district/i, "").trim();
          const state = addr.state || "Punjab";
          const pincode = addr.postcode || "141401";

          return {
            id: `loc-gps-${Date.now()}`,
            state,
            district,
            block: town,
            villageOrTown: town,
            pincode,
            latitude,
            longitude,
            precision: "point",
            source: "map",
            confidence: "high",
          };
        }
      }
    } catch {
      // Graceful fallback to nearest local dataset point
    }

    // Find closest location by coordinates in local dataset
    let closest = this.locations[0];
    let minDistanceSq = Number.MAX_VALUE;

    for (const loc of this.locations) {
      const dLat = loc.latitude - latitude;
      const dLng = loc.longitude - longitude;
      const distSq = dLat * dLat + dLng * dLng;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closest = loc;
      }
    }

    return {
      id: `loc-resolved-${closest.villageOrTown.toLowerCase().replace(/\s+/g, "-")}`,
      state: closest.state,
      district: closest.district,
      block: closest.block,
      villageOrTown: closest.villageOrTown,
      pincode: closest.pincode,
      latitude,
      longitude,
      precision: "point",
      source: "map",
      confidence: "high",
    };
  }

  async confirmLocation(loc: LocationProfile): Promise<LocationProfile> {
    return {
      ...loc,
      confidence: "high",
    };
  }

  async getAvailableDistricts(state: string = "Punjab"): Promise<string[]> {
    const districts = Array.from(new Set(this.locations.filter((l) => l.state === state).map((l) => l.district)));
    return districts.sort();
  }

  async getAvailableBlocks(district: string): Promise<string[]> {
    const blocks = Array.from(
      new Set(
        this.locations
          .filter((l) => l.district.toLowerCase() === district.toLowerCase())
          .map((l) => l.block)
      )
    );
    return blocks.sort();
  }

  async getAvailableVillages(district: string, block: string): Promise<string[]> {
    const villages = this.locations
      .filter(
        (l) =>
          l.district.toLowerCase() === district.toLowerCase() &&
          l.block.toLowerCase() === block.toLowerCase()
      )
      .map((l) => l.villageOrTown);
    return Array.from(new Set(villages)).sort();
  }

  private toLocationProfile(
    entry: PunjabLocationEntry,
    id: string,
    source: "search" | "map" | "manual" | "preset"
  ): LocationProfile {
    return {
      id,
      state: entry.state,
      district: entry.district,
      block: entry.block,
      villageOrTown: entry.villageOrTown,
      pincode: entry.pincode,
      latitude: entry.latitude,
      longitude: entry.longitude,
      precision: "point",
      source,
      confidence: "high",
    };
  }
}

import { LocationProfile } from "@/domain";
import { ILocationProvider } from "@/providers/interfaces";
import { PUNJAB_DETAILED_LOCATIONS, PunjabLocationEntry } from "@/data/onboardingData";

export class MockLocationProvider implements ILocationProvider {
  private locations: PunjabLocationEntry[] = PUNJAB_DETAILED_LOCATIONS;

  async searchLocations(query: string): Promise<LocationProfile[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return top representative hubs
      return this.locations.slice(0, 5).map((entry, idx) => this.toLocationProfile(entry, `loc-preset-${idx}`, "preset"));
    }

    const matches = this.locations.filter(
      (loc) =>
        loc.villageOrTown.toLowerCase().includes(q) ||
        loc.block.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q) ||
        loc.pincode.includes(q)
    );

    if (matches.length > 0) {
      return matches.slice(0, 8).map((entry, idx) => this.toLocationProfile(entry, `loc-search-${idx}`, "search"));
    }

    // Fallback: If user searched something specific not in list, synthesize an administrative location in Punjab
    return [
      {
        id: `loc-custom-${Date.now()}`,
        state: "Punjab",
        district: "Ludhiana",
        block: "Jagraon",
        villageOrTown: query.trim(),
        pincode: "142026",
        latitude: 30.7853 + (Math.random() - 0.5) * 0.05,
        longitude: 75.4731 + (Math.random() - 0.5) * 0.05,
        precision: "administrative",
        source: "search",
        confidence: "medium",
      },
    ];
  }

  async resolveLocation(latitude: number, longitude: number): Promise<LocationProfile> {
    // Find closest location by coordinates
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

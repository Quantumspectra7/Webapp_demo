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
    // 1. Attempt reverse geocoding via internal API route (which has reliable User-Agent & timeout)
    try {
      if (typeof window !== "undefined") {
        const res = await fetch(`/api/v1/location/reverse?lat=${latitude}&lng=${longitude}`, {
          headers: { "Accept": "application/json" },
        });
        if (res.ok) {
          const loc = await res.json();
          if (loc && loc.villageOrTown) {
            return loc as LocationProfile;
          }
        }
      }
    } catch {
      // Fall through to direct nominatim or dataset
    }

    // 2. Direct Nominatim fetch with zoom=18 for street/locality accuracy
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "GramVest-Rural-Decision-Engine/2.0 (contact@gramvest.org)",
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const displayName = data.display_name || "";

        const isNearLawGate =
          (latitude >= 31.240 && latitude <= 31.265 && longitude >= 75.690 && longitude <= 75.720) ||
          displayName.toLowerCase().includes("lovely professional university") ||
          displayName.toLowerCase().includes("law gate");

        let district = (addr.state_district || addr.county || addr.district || "Punjab")
          .replace(/district|tahsil|tehsil/gi, "")
          .trim();

        let block = (addr.county || addr.subdistrict || addr.town || addr.city || district)
          .replace(/tahsil|tehsil|block|district/gi, "")
          .trim();

        const primaryTown = addr.town || addr.city || addr.municipality || "";
        const primaryVillage = addr.village || addr.hamlet || "";
        const landmark = addr.amenity || addr.neighbourhood || addr.suburb || "";

        let villageOrTown = "";

        if (isNearLawGate) {
          villageOrTown = "Phagwara (Law Gate / LPU)";
          block = "Phagwara";
          district = "Kapurthala";
        } else if (landmark && primaryTown) {
          villageOrTown = `${primaryTown} (${landmark})`;
        } else if (primaryTown) {
          villageOrTown = primaryTown;
        } else if (primaryVillage) {
          villageOrTown = primaryVillage;
        } else if (landmark) {
          villageOrTown = landmark;
        } else if (addr.county) {
          villageOrTown = addr.county.replace(/tahsil|tehsil/gi, "").trim();
        } else {
          villageOrTown = "Live Location Site";
        }

        const pincode = isNearLawGate ? "144411" : (addr.postcode || "141401");
        const state = addr.state || "Punjab";

        return {
          id: `loc-gps-${Date.now()}`,
          state,
          district: district || "Punjab",
          block: block || villageOrTown,
          villageOrTown,
          pincode,
          latitude,
          longitude,
          precision: "point",
          source: "map",
          confidence: "high",
        };
      }
    } catch {
      // Graceful fallback to nearest local dataset point
    }

    // 3. Find closest location by coordinates in local dataset
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

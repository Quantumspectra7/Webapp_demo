import {
  EntrepreneurProfile,
  VentureLocation,
  BusinessCategory,
} from "@/domain";
import { IProfileProvider } from "@/providers/interfaces";
import { DEMO_BUSINESS } from "@/data/scenarios/dairy-jagraon";

/**
 * MockProfileProvider — Phase 1 Real Data Foundation
 *
 * Starts with a blank/anonymous profile. No hardcoded Gurpreet Singh,
 * no hardcoded Sidhwan Bet, no hardcoded Dairy business.
 *
 * Profile and location are populated via updateProfile() / updateLocation()
 * which are called by AppContext.applyAnalysisProfile() after onboarding.
 *
 * DEMO_BUSINESS is kept only as a fallback category placeholder until
 * the user completes onboarding; it does not expose fake entrepreneur data.
 */

const BLANK_PROFILE: EntrepreneurProfile = {
  id: "user-pending",
  fullName: "",
  initials: "--",
  phone: "",
  educationLevel: "",
  experienceLevel: "beginner",
  ownCapitalAvailable: 0,
  targetMonthlyIncome: 0,
  existingLandOrShed: false,
  creditCategory: "general",
  riskTolerance: "balanced",
};

const BLANK_LOCATION: VentureLocation = {
  id: "loc-pending",
  state: "Punjab",
  district: "",
  block: "",
  villageOrTown: "",
  pincode: "",
  latitude: 30.702,
  longitude: 76.22,
  marketCatchmentName: "",
  nearestMandi: "",
  distanceToMandiKm: 0,
};

const STORAGE_KEY_PROFILE = "gramvest_profile_v1";
const STORAGE_KEY_LOCATION = "gramvest_location_v1";
const STORAGE_KEY_BUSINESS = "gramvest_business_v1";

export class MockProfileProvider implements IProfileProvider {
  private profile: EntrepreneurProfile = { ...BLANK_PROFILE };
  private location: VentureLocation = { ...BLANK_LOCATION };
  private business: BusinessCategory = { ...DEMO_BUSINESS };

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const rawProf = window.localStorage.getItem(STORAGE_KEY_PROFILE);
        if (rawProf) this.profile = JSON.parse(rawProf);
        const rawLoc = window.localStorage.getItem(STORAGE_KEY_LOCATION);
        if (rawLoc) this.location = JSON.parse(rawLoc);
        const rawBiz = window.localStorage.getItem(STORAGE_KEY_BUSINESS);
        if (rawBiz) this.business = JSON.parse(rawBiz);
      } catch {
        // ignore
      }
    }
  }

  async getProfile(): Promise<EntrepreneurProfile> {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY_PROFILE);
        if (raw) this.profile = JSON.parse(raw);
      } catch {}
    }
    return { ...this.profile };
  }

  async updateProfile(updates: Partial<EntrepreneurProfile>): Promise<EntrepreneurProfile> {
    this.profile = { ...this.profile, ...updates };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(this.profile));
      } catch {}
    }
    return { ...this.profile };
  }

  async getLocation(): Promise<VentureLocation> {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY_LOCATION);
        if (raw) this.location = JSON.parse(raw);
      } catch {}
    }
    return { ...this.location };
  }

  async updateLocation(updates: Partial<VentureLocation>): Promise<VentureLocation> {
    this.location = { ...this.location, ...updates };
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(this.location));
      } catch {}
    }
    return { ...this.location };
  }

  async getBusinessCategory(): Promise<BusinessCategory> {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY_BUSINESS);
        if (raw) this.business = JSON.parse(raw);
      } catch {}
    }
    return { ...this.business };
  }
}

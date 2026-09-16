import { AnalysisProfile } from "@/domain";
import { IAnalysisProfileProvider } from "@/providers/interfaces";

const STORAGE_KEY = "gramvest_analysis_profile";

/**
 * MockAnalysisProfileProvider — Phase 1 Real Data Foundation
 *
 * Returns null by default. No hardcoded Jagraon/Dairy demo profile.
 * Only returns a profile after saveProfile() has been explicitly called
 * (i.e., after user completes onboarding).
 *
 * Persists to localStorage so the profile survives page refreshes.
 */
export class MockAnalysisProfileProvider implements IAnalysisProfileProvider {
  private currentProfile: AnalysisProfile | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.currentProfile = JSON.parse(raw) as AnalysisProfile;
        }
      } catch {
        this.currentProfile = null;
      }
    }
  }

  async saveProfile(profile: AnalysisProfile): Promise<AnalysisProfile> {
    const saved = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    this.currentProfile = saved;

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (e) {
        console.warn("Failed to persist analysis profile to localStorage", e);
      }
    }

    return saved;
  }

  async getProfile(): Promise<AnalysisProfile | null> {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.currentProfile = JSON.parse(raw) as AnalysisProfile;
        }
      } catch {
        // ignore
      }
    }
    return this.currentProfile;
  }
}


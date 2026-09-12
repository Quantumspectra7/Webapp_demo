import { AnalysisProfile } from "@/domain";
import { IAnalysisProfileProvider } from "@/providers/interfaces";

// Default demo baseline profile
const DEFAULT_ANALYSIS_PROFILE: AnalysisProfile = {
  userId: "user-demo-punjab-01",
  location: {
    id: "loc-jagraon-01",
    state: "Punjab",
    district: "Ludhiana",
    block: "Jagraon",
    villageOrTown: "Sidhwan Bet",
    pincode: "142024",
    latitude: 30.7853,
    longitude: 75.4731,
    precision: "point",
    source: "preset",
    confidence: "high",
  },
  business: {
    categoryId: "biz-dairy",
    categoryName: "Dairy Processing & Milk Chilling Unit",
    businessDescription: "Bulk milk cooling and dairy value addition supplying rural households and commercial buyers.",
    scale: "small",
    targetCustomers: ["Local households", "Private dairies (Verka, Nestle)"],
  },
  capital: 100000,
  experience: "beginner",
  hasRelevantSkills: "somewhat",
  existingAssets: ["Building / Shed", "Vehicle"],
  preferredScale: "small",
  desiredMonthlyIncome: 45000,
  riskPreference: "conservative",
  analysisRadius: 5,
};

export class MockAnalysisProfileProvider implements IAnalysisProfileProvider {
  private currentProfile: AnalysisProfile = { ...DEFAULT_ANALYSIS_PROFILE };

  async saveProfile(profile: AnalysisProfile): Promise<AnalysisProfile> {
    this.currentProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    return this.currentProfile;
  }

  async getProfile(): Promise<AnalysisProfile | null> {
    return this.currentProfile;
  }
}

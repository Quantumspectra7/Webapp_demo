import {
  EntrepreneurProfile,
  VentureLocation,
  BusinessCategory,
} from "@/domain";
import { IProfileProvider } from "@/providers/interfaces";
import {
  DEMO_PROFILE,
  DEMO_LOCATION,
  DEMO_BUSINESS,
} from "@/data/scenarios/dairy-jagraon";

export class MockProfileProvider implements IProfileProvider {
  private profile: EntrepreneurProfile = { ...DEMO_PROFILE };
  private location: VentureLocation = { ...DEMO_LOCATION };
  private business: BusinessCategory = { ...DEMO_BUSINESS };

  async getProfile(): Promise<EntrepreneurProfile> {
    // Simulate brief network latency
    await new Promise((res) => setTimeout(res, 50));
    return { ...this.profile };
  }

  async updateProfile(updates: Partial<EntrepreneurProfile>): Promise<EntrepreneurProfile> {
    this.profile = { ...this.profile, ...updates };
    return { ...this.profile };
  }

  async getLocation(): Promise<VentureLocation> {
    await new Promise((res) => setTimeout(res, 50));
    return { ...this.location };
  }

  async updateLocation(updates: Partial<VentureLocation>): Promise<VentureLocation> {
    this.location = { ...this.location, ...updates };
    return { ...this.location };
  }

  async getBusinessCategory(): Promise<BusinessCategory> {
    await new Promise((res) => setTimeout(res, 50));
    return { ...this.business };
  }
}

import { BusinessCategoryGroup, BusinessCategoryItem, BusinessProfile } from "@/domain";
import { IBusinessProvider } from "@/providers/interfaces";
import { BUSINESS_TAXONOMY_GROUPS } from "@/data/onboardingData";

export class MockBusinessProvider implements IBusinessProvider {
  private groups: BusinessCategoryGroup[] = BUSINESS_TAXONOMY_GROUPS;

  async getBusinessCategoryGroups(): Promise<BusinessCategoryGroup[]> {
    return this.groups;
  }

  async searchBusinesses(query: string): Promise<BusinessCategoryItem[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return popular items across categories
      return this.groups.flatMap((g) => g.items).slice(0, 8);
    }

    const allItems = this.groups.flatMap((g) => g.items);
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        (item.suggestedBuyers && item.suggestedBuyers.some((b) => b.toLowerCase().includes(q)))
    );
  }

  async getBusinessById(id: string): Promise<BusinessCategoryItem | null> {
    const allItems = this.groups.flatMap((g) => g.items);
    return allItems.find((item) => item.id === id) || null;
  }

  async saveCustomBusiness(name: string, description: string): Promise<BusinessProfile> {
    return {
      categoryId: null,
      categoryName: name.trim() || "Custom Enterprise",
      customBusinessName: name.trim(),
      businessDescription: description.trim() || "Independent rural commercial enterprise idea.",
      scale: "small",
      targetCustomers: ["Local households", "Community consumers"],
    };
  }
}

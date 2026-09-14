import {
  MarketAnalysis,
  Competitor,
  MarketLocation,
  PriceSignalItem,
  OpportunityAnalysis,
  SwotQuadrant,
  RiskItem,
  ViabilityScore,
  VentureLocation,
} from "@/domain";
import { IMarketProvider } from "@/providers/interfaces";
import { DEMO_SWOT, DEMO_RISKS, DEMO_VIABILITY_SCORE } from "@/data/scenarios/dairy-jagraon";

export class ApiMarketProvider implements IMarketProvider {
  private getBaseUrl(): string {
    if (typeof window !== "undefined") {
      return "";
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  async getMarketAnalysis(
    radiusKm: 5 | 10,
    location?: VentureLocation,
    category?: string
  ): Promise<MarketAnalysis> {
    const res = await fetch(`${this.getBaseUrl()}/api/v1/market/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude: location?.latitude || 30.7853,
        longitude: location?.longitude || 75.4731,
        radiusKm,
        businessCategoryId: category || "dairy",
        village: location?.villageOrTown || "Jagraon",
        district: location?.district || "Ludhiana",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch market analysis: ${res.statusText}`);
    }
    return res.json();
  }

  async getCompetitors(radiusKm: 5 | 10, category?: string): Promise<Competitor[]> {
    const url = new URL(`${this.getBaseUrl()}/api/v1/market/competitors`, "http://dummy");
    url.searchParams.set("radius", radiusKm.toString());
    if (category) url.searchParams.set("category", category);

    const fullUrl = this.getBaseUrl() ? `${this.getBaseUrl()}${url.pathname}${url.search}` : `${url.pathname}${url.search}`;
    const res = await fetch(fullUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch competitors");
    return res.json();
  }

  async getRankedCompetitors(
    radiusKm: 5 | 10,
    location?: VentureLocation,
    category?: string
  ): Promise<Competitor[]> {
    const comps = await this.getCompetitors(radiusKm, category);
    return comps.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  async getMarkets(radiusKm: 5 | 10, location?: VentureLocation): Promise<MarketLocation[]> {
    const lat = location?.latitude || 30.7853;
    const lng = location?.longitude || 75.4731;
    const url = `${this.getBaseUrl()}/api/v1/market/markets?lat=${lat}&lng=${lng}&radius=${radiusKm}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch markets");
    return res.json();
  }

  async getPriceSignals(businessSlug?: string): Promise<PriceSignalItem[]> {
    const category = businessSlug?.includes("poultry") ? "Poultry" : "Dairy";
    const url = `${this.getBaseUrl()}/api/v1/market/prices?category=${category}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch prices");
    return res.json();
  }

  async getOpportunityAnalysis(): Promise<OpportunityAnalysis> {
    const url = `${this.getBaseUrl()}/api/v1/market/opportunity?category=Dairy&village=Jagraon`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch opportunity analysis");
    return res.json();
  }

  async getSwotAnalysis(): Promise<SwotQuadrant> {
    return { ...DEMO_SWOT };
  }

  async getRisks(): Promise<RiskItem[]> {
    return [...DEMO_RISKS];
  }

  async getViabilityScore(): Promise<ViabilityScore> {
    return { ...DEMO_VIABILITY_SCORE };
  }
}

import {
  MarketAnalysis,
  OpportunityAnalysis,
  SwotQuadrant,
  RiskItem,
  ViabilityScore,
  Competitor,
  MarketLocation,
  PriceSignalItem,
  VentureLocation,
} from "@/domain";
import { IMarketProvider } from "@/providers/interfaces";
import {
  calculateHaversineDistanceKm,
  MASTER_COMPETITORS_JAGRAON,
  MASTER_MARKETS_JAGRAON,
  DAIRY_PRICE_SIGNALS,
} from "@/data/marketIntelligenceData";
import {
  DEMO_OPPORTUNITY,
  DEMO_SWOT,
  DEMO_RISKS,
  DEMO_VIABILITY_SCORE,
} from "@/data/scenarios/dairy-jagraon";

export class MockMarketProvider implements IMarketProvider {
  // Compute distance-adjusted competitors based on center location
  private getAdjustedCompetitors(
    centerLat: number,
    centerLng: number
  ): Competitor[] {
    return MASTER_COMPETITORS_JAGRAON.map((comp) => {
      const dist = calculateHaversineDistanceKm(
        centerLat,
        centerLng,
        comp.latitude,
        comp.longitude
      );

      // Compute weighted relevance score (0-100) per Section 15
      // Closer distance + high capacity + older operational year = higher relevance
      const distanceScore = Math.max(0, 100 - dist * 10);
      const capacityScore = Math.min(100, (comp.dailyCapacityLiters / 2000) * 100);
      const experienceScore = Math.min(100, (2026 - comp.operationalSinceYear) * 8);
      const relevanceScore = Math.round(
        distanceScore * 0.55 + capacityScore * 0.3 + experienceScore * 0.15
      );

      return {
        ...comp,
        distanceKm: dist,
        relevanceScore,
      };
    });
  }

  // Compute distance-adjusted markets
  private getAdjustedMarkets(
    centerLat: number,
    centerLng: number
  ): MarketLocation[] {
    return MASTER_MARKETS_JAGRAON.map((mkt) => {
      const dist = calculateHaversineDistanceKm(
        centerLat,
        centerLng,
        mkt.latitude,
        mkt.longitude
      );
      return {
        ...mkt,
        distanceKm: dist,
      };
    });
  }

  async getMarketAnalysis(
    radiusKm: 5 | 10,
    location?: VentureLocation,
    category?: string
  ): Promise<MarketAnalysis> {
    await new Promise((res) => setTimeout(res, 80));

    const centerLat = location?.latitude || 30.7853;
    const centerLng = location?.longitude || 75.4731;

    const allComps = this.getAdjustedCompetitors(centerLat, centerLng);
    const visibleComps = allComps.filter((c) => c.distanceKm <= radiusKm);

    const allMarkets = this.getAdjustedMarkets(centerLat, centerLng);
    const visibleMarkets = allMarkets.filter((m) => m.distanceKm <= radiusKm + 1.5);

    const nearestMkt =
      visibleMarkets.length > 0
        ? visibleMarkets.reduce((min, cur) => (cur.distanceKm < min.distanceKm ? cur : min))
        : allMarkets[0];

    const is5Km = radiusKm === 5;

    return {
      radiusKm,
      location: location || {
        id: "loc-active",
        state: "Punjab",
        district: "Ludhiana",
        block: "Jagraon",
        villageOrTown: "Jagraon",
        pincode: "142026",
        latitude: centerLat,
        longitude: centerLng,
        marketCatchmentName: "Jagraon Commercial Catchment",
        nearestMandi: nearestMkt.name,
        distanceToMandiKm: nearestMkt.distanceKm,
      },
      demographics: {
        populationInRadius: is5Km ? 42800 : 118400,
        householdsInRadius: is5Km ? 7120 : 19800,
        estimatedDailyMilkProductionLiters: is5Km ? 14200 : 38900,
        localConsumptionLiters: is5Km ? 12350 : 33400,
        unmetMarketDemandLiters: is5Km ? 1850 : 5500,
        averageFarmgatePrice: 40,
        averageRetailSellingPrice: 60,
        mandiDistanceKm: nearestMkt.distanceKm,
        competitorDensityRating: is5Km ? "Moderate" : "Medium",
        metadata: {
          source: "Punjab Livestock Census & Mandi Board Trade Reports",
          sourceDate: "2026-06-15",
          confidence: "high",
          dataStatus: "verified",
          sampleCoverage: is5Km
            ? "14 Gram Panchayats in Jagraon Block"
            : "32 Gram Panchayats across Jagraon, Raikot & Sidhwan Bet",
        },
      },
      competitors: visibleComps,
      markets: visibleMarkets,
      priceSignals: DAIRY_PRICE_SIGNALS,
      estimatedAddressableMarketLiters: is5Km ? 3200 : 8500,
      estimatedReachCustomers: is5Km ? 620 : 1850,
      addressableMarketSharePct: is5Km ? 5.2 : 4.8,
      marketShareTargetPct: is5Km ? 15.6 : 12.4,
      opportunitySignal: {
        status: is5Km ? "STRONG" : "MODERATE",
        summary: is5Km
          ? "Demand appears healthy relative to identified competition."
          : "Expanded regional reach with viable off-take corridors.",
        rationale: is5Km
          ? "Concentration of unchilled milk production and 7,120+ households creates a steady direct off-take environment for a 1,000L chilling unit."
          : "Larger regional volume available, though logistics along Raikot & Moga corridors require cold-chain transport.",
      },
      localGapInsight: {
        headline: "Underserved Southern Agro-Cluster",
        observation:
          "Most identified collection points and chillers are clustered around Jagraon town center and GT Road. The southern panchayats (Malak, Kothe Sher Jang) lack morning chilling facilities.",
        opportunity:
          "Establishing a collection hub with farmgate pickup can capture ~600–900 Liters/day of unserved evening and morning milk from progressive dairy farmers.",
      },
      marketSignals: {
        positive: [
          "Healthy household base generating ~12,350 L daily domestic fluid milk demand.",
          "Direct access to APMC Mandi and 22ft all-weather arterial link to SH-13.",
          "Moderate competitor density — operating chillers operate at only ~42% capacity.",
        ],
        watchouts: [
          "Input feed volatility: Cattle feed rates increased +8% over last two quarters.",
          "Informal milkmen (dudhis) retain loyalty through seasonal unsecured cash advances.",
        ],
      },
      priceTrend: [
        { period: "Jan 2026", procurementPrice: 38, retailPrice: 58 },
        { period: "Mar 2026", procurementPrice: 39, retailPrice: 58 },
        { period: "May 2026", procurementPrice: 41, retailPrice: 60 },
        { period: "Jul 2026", procurementPrice: 42, retailPrice: 62 },
        { period: "Sep 2026", procurementPrice: 40, retailPrice: 60 },
      ],
      metadata: {
        source: "Census reference data & Punjab Mandi Board Ledger",
        sourceDate: "2026-08-15",
        confidence: "high",
        dataStatus: "demo",
        assumptions: [
          "Census 2021 projected population and household counts.",
          "Daily fluid consumption benchmarked at 480 ml/day per capita (Punjab average).",
          "Publicly identifiable physical facilities; informal unorganized vendors estimated separately.",
        ],
      },
    };
  }

  async getCompetitors(
    radiusKm: 5 | 10,
    category?: string
  ): Promise<Competitor[]> {
    await new Promise((res) => setTimeout(res, 50));
    const all = this.getAdjustedCompetitors(30.7853, 75.4731);
    const visible = all.filter((c) => c.distanceKm <= radiusKm);
    if (!category || category === "all") {
      return visible;
    }
    return visible.filter(
      (c) =>
        c.category?.toLowerCase() === category.toLowerCase() ||
        c.type === category
    );
  }

  async getRankedCompetitors(
    radiusKm: 5 | 10,
    location?: VentureLocation,
    category?: string
  ): Promise<Competitor[]> {
    await new Promise((res) => setTimeout(res, 60));
    const centerLat = location?.latitude || 30.7853;
    const centerLng = location?.longitude || 75.4731;

    let comps = this.getAdjustedCompetitors(centerLat, centerLng).filter(
      (c) => c.distanceKm <= radiusKm
    );

    if (category && category !== "all") {
      comps = comps.filter(
        (c) =>
          c.category?.toLowerCase() === category.toLowerCase() ||
          c.type === category
      );
    }

    // Rank by relevance score descending
    return comps.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  async getMarkets(
    radiusKm: 5 | 10,
    location?: VentureLocation
  ): Promise<MarketLocation[]> {
    await new Promise((res) => setTimeout(res, 40));
    const centerLat = location?.latitude || 30.7853;
    const centerLng = location?.longitude || 75.4731;

    const all = this.getAdjustedMarkets(centerLat, centerLng);
    return all.filter((m) => m.distanceKm <= radiusKm + 1.5);
  }

  async getPriceSignals(businessSlug?: string): Promise<PriceSignalItem[]> {
    await new Promise((res) => setTimeout(res, 30));
    return DAIRY_PRICE_SIGNALS;
  }

  async getOpportunityAnalysis(): Promise<OpportunityAnalysis> {
    await new Promise((res) => setTimeout(res, 50));
    return { ...DEMO_OPPORTUNITY };
  }

  async getSwotAnalysis(): Promise<SwotQuadrant> {
    await new Promise((res) => setTimeout(res, 50));
    return { ...DEMO_SWOT };
  }

  async getRisks(): Promise<RiskItem[]> {
    await new Promise((res) => setTimeout(res, 50));
    return [...DEMO_RISKS];
  }

  async getViabilityScore(): Promise<ViabilityScore> {
    await new Promise((res) => setTimeout(res, 50));
    return { ...DEMO_VIABILITY_SCORE };
  }
}

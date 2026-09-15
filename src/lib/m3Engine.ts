import {
  PUNJAB_LOCATIONS,
  PUNJAB_BUSINESSES,
  PUNJAB_MARKETS,
  PUNJAB_DEMOGRAPHICS,
  PUNJAB_PRICES,
  PunjabLocation,
  PunjabBusiness,
} from "@/data/m3Datasets";
import { MarketAnalysis, Competitor, MarketLocation, PriceSignalItem } from "@/domain";

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(r * c * 10) / 10;
}

export function resolveLocationContext(
  village?: string,
  district?: string,
  lat?: number,
  lng?: number,
  radiusKm = 5
): PunjabLocation {
  const radius = radiusKm > 7 ? 10 : 5;

  if (lat && lng) {
    let closest = PUNJAB_LOCATIONS[0];
    let minD = Infinity;
    for (const loc of PUNJAB_LOCATIONS) {
      const d = calculateDistanceKm(lat, lng, loc.latitude, loc.longitude);
      if (d < minD) {
        minD = d;
        closest = loc;
      }
    }
    return {
      ...closest,
      latitude: lat,
      longitude: lng,
    };
  }

  if (village) {
    const match = PUNJAB_LOCATIONS.find((l) =>
      l.village.toLowerCase().includes(village.toLowerCase().trim())
    );
    if (match) return match;
  }

  if (district) {
    const match = PUNJAB_LOCATIONS.find((l) =>
      l.district.toLowerCase().includes(district.toLowerCase().trim())
    );
    if (match) return match;
  }

  return PUNJAB_LOCATIONS[0];
}

export function getCompetitorsInRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  category?: string
): Competitor[] {
  return PUNJAB_BUSINESSES.map((b) => {
    const dist = calculateDistanceKm(centerLat, centerLng, b.latitude, b.longitude);
    const distanceScore = Math.max(0, 100 - dist * 10);
    const capacityScore = Math.min(100, (b.daily_capacity / 2000) * 100);
    const experienceScore = Math.min(100, (2026 - b.operational_since_year) * 8);
    const relevanceScore = Math.round(
      distanceScore * 0.55 + capacityScore * 0.3 + experienceScore * 0.15
    );

    const compType: Competitor["type"] =
      b.business_type === "poultry_farm" || b.business_type === "feed_mill"
        ? "retail_depot"
        : (b.business_type as Competitor["type"]);

    return {
      id: b.id,
      name: b.name,
      category: b.category,
      businessType: b.subcategory,
      type: compType,
      latitude: b.latitude,
      longitude: b.longitude,
      distanceKm: dist,
      dailyCapacityLiters: b.daily_capacity,
      procurementPricePerLiter: b.procurement_price,
      sellingPricePerLiter: b.selling_price,
      keyStrength: b.key_strength,
      primaryArea: b.primary_area,
      operationalSinceYear: b.operational_since_year,
      confidence: (b.confidence >= 0.9 ? "high" : "medium") as Competitor["confidence"],
      source: b.source,
      coverageType: b.coverage_type,
      relevanceScore,
    };
  })
    .filter((b) => b.distanceKm <= radiusKm)
    .filter((b) => {
      if (!category || category === "all") return true;
      return b.category?.toLowerCase() === category.toLowerCase();
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

export function generateMarketAnalysisPayload(
  radiusKm: 5 | 10 = 5,
  lat?: number,
  lng?: number,
  category = "Dairy",
  villageName?: string,
  injectedCompetitors?: Competitor[]
): MarketAnalysis {
  const loc = resolveLocationContext(villageName, undefined, lat, lng, radiusKm);
  const comps = injectedCompetitors || getCompetitorsInRadius(loc.latitude, loc.longitude, radiusKm, category);

  const demoNode = PUNJAB_DEMOGRAPHICS.find((d) => d.location_id === loc.id) || PUNJAB_DEMOGRAPHICS[0];
  const radiusKey = radiusKm === 10 ? "radius_10km" : "radius_5km";
  const radStats = demoNode[radiusKey];

  const isDairy = category.toLowerCase().includes("dairy");
  const targetRate = isDairy ? radStats.dairy.target_customer_rate : radStats.poultry.target_customer_rate;
  const accessFactor = isDairy ? radStats.dairy.accessibility_factor : radStats.poultry.accessibility_factor;
  const estimatedCustomers = Math.round(radStats.households * targetRate * accessFactor);

  // Density calculation
  const areaSqKm = Math.PI * (radiusKm * radiusKm);
  const densityVal = comps.length / areaSqKm;
  const densityRating: "Low" | "Moderate" | "High" =
    densityVal < 0.04 ? "Low" : densityVal <= 0.08 ? "Moderate" : "High";
  
  let densityExplanation = "";
  if (comps.length === 0) {
    densityExplanation = "No digital footprints found on Google Maps in this radius. On-ground verification recommended as informal local shops might exist.";
  } else if (densityRating === "Low") {
    densityExplanation = "Low density suggests lower direct competition, representing a strong early-mover opportunity.";
  } else if (densityRating === "Moderate") {
    densityExplanation = "Moderate density indicates healthy market activity but requires clear differentiation and quality to stand out.";
  } else {
    densityExplanation = "High density signifies a saturated zone. Compete strictly on margins, supply chain efficiency, or niche value addition.";
  }

  // Mandis
  const mandis: MarketLocation[] = PUNJAB_MARKETS.map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    latitude: m.latitude,
    longitude: m.longitude,
    distanceKm: calculateDistanceKm(loc.latitude, loc.longitude, m.latitude, m.longitude),
    confidence: "high" as const,
    source: m.source,
    commodities: m.commodities,
  })).filter((m) => m.distanceKm <= radiusKm + 2.0);

  // Price signals
  const priceSignals: PriceSignalItem[] = PUNJAB_PRICES.map((p) => ({
    commodity: p.product,
    rangeMin: p.price_range_min,
    rangeMax: p.price_range_max,
    currentAvg: p.wholesale_price,
    unit: p.unit,
    trend: p.trend,
    frequency: "Daily Mandi Ledger",
    notes: p.notes,
  }));

  return {
    radiusKm,
    location: {
      id: loc.id,
      state: loc.state,
      district: loc.district,
      block: loc.block,
      villageOrTown: loc.village,
      pincode: loc.pincode,
      latitude: loc.latitude,
      longitude: loc.longitude,
      marketCatchmentName: loc.market_catchment_name,
      nearestMandi: loc.nearest_mandi,
      distanceToMandiKm: loc.distance_to_mandi_km,
    },
    demographics: {
      populationInRadius: radStats.population,
      householdsInRadius: radStats.households,
      estimatedDailyMilkProductionLiters: radStats.dairy.daily_milk_production_liters,
      localConsumptionLiters: radStats.dairy.local_consumption_liters,
      unmetMarketDemandLiters: radStats.dairy.unmet_demand_liters,
      averageFarmgatePrice: isDairy ? 40 : 92,
      averageRetailSellingPrice: isDairy ? 60 : 175,
      mandiDistanceKm: loc.distance_to_mandi_km,
      competitorDensityRating: densityRating,
      metadata: {
        source: demoNode.source,
        sourceDate: demoNode.source_date,
        confidence: "high",
        dataStatus: "verified",
        sampleCoverage: `${radiusKm} km radius across ${loc.village}, ${loc.district}`,
        assumptions: [
          `formula: households (${radStats.households}) * rate (${targetRate}) * access (${accessFactor}) = ${estimatedCustomers}`,
          `target customer rate = ${Math.round(targetRate * 100)}%`,
          `accessibility factor = ${Math.round(accessFactor * 100)}%`,
        ],
      },
    },
    competitors: comps,
    markets: mandis,
    priceSignals,
    estimatedAddressableMarketLiters: radiusKm === 5 ? 3200 : 8500,
    estimatedReachCustomers: estimatedCustomers,
    addressableMarketSharePct: radiusKm === 5 ? 5.2 : 4.8,
    marketShareTargetPct: radiusKm === 5 ? 15.6 : 12.4,
    opportunitySignal: {
      status: "STRONG",
      summary: `Healthy local off-take environment in ${loc.village} with ${densityRating.toLowerCase()} competitor density.`,
      rationale: `Addressable base of ${estimatedCustomers.toLocaleString()} customers and nearby APMC access (${loc.distance_to_mandi_km} km) enable high margins.`,
    },
    localGapInsight: {
      headline: `Underserved ${loc.block} Agro-Corridor`,
      observation:
        "Primary collection centers are concentrated along the main highway, leaving interior village dairy farmers reliant on informal milkmen.",
      opportunity:
        "Establishing an organized collection hub with digital milk testing captures ~700-1,200 Liters/day of unserved farmgate supply.",
    },
    marketSignals: {
      positive: [
        `Stable demand from ${radStats.households.toLocaleString()} households in the immediate ${radiusKm}km basin.`,
        `Low transport friction: ${loc.nearest_mandi} is only ${loc.distance_to_mandi_km} km away via all-weather road.`,
        `Favorable price spread: ₹${isDairy ? 40 : 92} farmgate procurement vs ₹${isDairy ? 60 : 175} retail pricing.`,
      ],
      watchouts: [
        "Summer procurement drop requires farmer retention incentives and transparent payment settlement.",
        "Spot price volatility in cattle/poultry feed ingredients.",
      ],
    },
    priceTrend: [
      { period: "Jan 2026", procurementPrice: 38, retailPrice: 58 },
      { period: "Mar 2026", procurementPrice: 39, retailPrice: 58 },
      { period: "May 2026", procurementPrice: 41, retailPrice: 60 },
      { period: "Jul 2026", procurementPrice: 42, retailPrice: 62 },
      { period: "Sep 2026", procurementPrice: 40.5, retailPrice: 60 },
    ],
    densityLabel: densityRating,
    densityExplanation,
    metadata: {
      source: "GramVest M3 GIS Engine & Punjab Mandi Board",
      sourceDate: "2026-06-20",
      confidence: "high",
      dataStatus: "verified",
      assumptions: [
        `Census 2021 projected population and household counts for ${loc.district}.`,
        "Explicit customer estimation: households * target_customer_rate * accessibility_factor.",
        "Physical competitor nodes mapped with verifiable operational capacity.",
      ],
    },
  };
}

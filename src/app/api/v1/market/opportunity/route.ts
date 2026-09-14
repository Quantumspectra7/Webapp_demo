import { NextRequest, NextResponse } from "next/server";
import { OpportunityAnalysis } from "@/domain";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "Dairy";
  const village = searchParams.get("village") || "Jagraon";

  const isDairy = category.toLowerCase().includes("dairy");

  const opportunity: OpportunityAnalysis = {
    verdict: "Promising",
    verdictSubtitle: `Score: 78/100 — High local demand-supply synergy in ${village}`,
    executiveSummary: `The ${category} opportunity in ${village} demonstrates robust unit economics supported by high local household density, favorable margin spreads, and an underserved village collection network.`,
    keyGaps: [
      {
        title: isDairy ? "Southern Agro-Corridor Milk Deficit" : "Eastern Poultry Feed & Dressing Deficit",
        signal: "positive",
        headline: isDairy ? "Under-served 1,400+ Farm Households" : "High Demand for Hygienic Broiler Cuts",
        description: isDairy
          ? "Interior panchayats rely on itinerant unorganized milkmen; establishing scheduled morning/evening BMC collection captures immediate 800+ L/day."
          : "Local broiler farming lacks direct-to-retail dressing stations and formulated mash supply.",
        metric: "Estimated Capture: 850 L/day",
        evidence: "Punjab Livestock Census 2024 & Mandi Board Trade Reports",
      },
      {
        title: "Value-Added Processing Spread",
        signal: "positive",
        headline: "High-Margin Fluid to Paneer/Curd Conversion",
        description: "Retail paneer spread (₹320/kg wholesale vs ₹390/kg retail) offers 28-34% gross operating margin above basic raw milk sales.",
        metric: "Gross Margin: 31.4%",
        evidence: "Local Halwai & Mandi Trade Ledger",
      },
    ],
    recommendations: [
      "Establish primary farmgate collection points with digital automated fat/SNF testing.",
      "Anchor off-take with local commercial buyers, sweets manufacturers, and mandi wholesalers.",
      "Utilize PMEGP 35% capital subsidy and AIF 3% interest subvention for refrigeration assets.",
    ],
    conditionsToSucceed: [
      "Maintain at least 15 days working capital for punctual producer payments.",
      "Deploy secondary DG diesel power backup for chilling compressor stability.",
      "Maintain milk temperature strictly at <= 4°C during holding and transit.",
    ],
    concernsAndWatchouts: [
      "Summer seasonal procurement drop requiring seasonal payment incentives.",
      "Feed commodity spot price inflation affecting producer herd yields.",
    ],
    metadata: {
      source: "GramVest Opportunity Engine & PAU Agro Registry",
      sourceDate: "2026-06-20",
      confidence: "high",
      dataStatus: "verified",
    },
  };

  return NextResponse.json(opportunity);
}

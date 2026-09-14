import { NextRequest, NextResponse } from "next/server";
import { generateMarketAnalysisPayload } from "@/lib/m3Engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const radius = parseInt(searchParams.get("radius") || "5", 10) > 7 ? 10 : 5;
  const category = searchParams.get("category") || "Dairy";
  const village = searchParams.get("village") || "Jagraon";

  const analysis = generateMarketAnalysisPayload(radius, undefined, undefined, category, village);

  return NextResponse.json({
    module_origin: "M3",
    target_module: "M4_Viability",
    business_category: category,
    analysis_radius_km: radius,
    market_score: 82,
    competition_score: analysis.demographics.competitorDensityRating === "Low" ? 85 : 72,
    customer_estimates: {
      households: analysis.demographics.householdsInRadius,
      addressable_customers: analysis.estimatedReachCustomers,
      assumptions: analysis.demographics.metadata.assumptions,
    },
    affordability_signals: {
      reference_procurement_price: analysis.demographics.averageFarmgatePrice,
      reference_retail_price: analysis.demographics.averageRetailSellingPrice,
      gross_spread_pct: Math.round(
        ((analysis.demographics.averageRetailSellingPrice - analysis.demographics.averageFarmgatePrice) /
          analysis.demographics.averageRetailSellingPrice) *
          100
      ),
    },
    opportunity_evidence: {
      status: analysis.opportunitySignal?.status,
      summary: analysis.opportunitySignal?.summary,
      rationale: analysis.opportunitySignal?.rationale,
    },
    confidence: 0.88,
  });
}

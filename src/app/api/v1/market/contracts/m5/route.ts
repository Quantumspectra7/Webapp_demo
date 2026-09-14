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
    target_module: "M5_AI_Advisory",
    business_category: category,
    location: `${analysis.location.villageOrTown}, ${analysis.location.district}, Punjab`,
    recommendation_explanation: analysis.opportunitySignal?.summary,
    swot_grounded_matrix: {
      strengths: analysis.marketSignals?.positive || [],
      weaknesses: [
        "Farmer retention requires prompt daily/weekly settlement against informal cash advances.",
        "Early working capital vulnerability during high procurement season.",
      ],
      opportunities: [
        analysis.localGapInsight?.opportunity || "Direct farmgate collection capture.",
        "Value-addition spread to packaged paneer, curd, and graded eggs.",
      ],
      threats: analysis.marketSignals?.watchouts || [],
    },
    risk_assessment: [
      {
        id: "risk-m3-01",
        category: "Competition",
        risk: "Aggressive price bids by large cooperatives or chilling centers.",
        severity: "Medium",
        likelihood: "Moderate",
        mitigation: "Provide transparent automated fat/SNF milk testing and loyalty bonuses.",
      },
    ],
    ai_grounding_citations: [
      {
        claim: `Reachable customers in ${analysis.location.villageOrTown}`,
        value: `${analysis.estimatedReachCustomers?.toLocaleString()} customers from ${analysis.demographics.householdsInRadius.toLocaleString()} households`,
        source: analysis.demographics.metadata.source,
      },
      {
        claim: "Nearest APMC Mandi Access",
        value: `${analysis.location.nearestMandi} at ${analysis.location.distanceToMandiKm} km`,
        source: "Punjab Mandi Board Directory",
      },
    ],
    confidence: 0.88,
  });
}

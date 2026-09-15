import { NextRequest, NextResponse } from "next/server";
import { generateMarketAnalysisPayload } from "@/lib/m3Engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { latitude, longitude, radiusKm = 5, businessCategoryId = "dairy" } = body;

    const radius = radiusKm > 7 ? 10 : 5;
    const category = businessCategoryId.toLowerCase().includes("poultry") ? "Poultry" : "Dairy";

    // Fetch competitors by internally querying our own route or fetching absolute url
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || request.nextUrl.origin || "http://localhost:3000";
    const compUrl = `${baseUrl}/api/v1/market/competitors?lat=${latitude}&lng=${longitude}&radius=${radius}&category=${category}`;
    
    const compsRes = await fetch(compUrl, { cache: "no-store" });
    let injectedCompetitors = undefined;
    if (compsRes.ok) {
      injectedCompetitors = await compsRes.json();
    }

    const payload = generateMarketAnalysisPayload(radius, latitude, longitude, category, undefined, injectedCompetitors);

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

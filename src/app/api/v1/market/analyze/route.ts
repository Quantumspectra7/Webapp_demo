import { NextRequest, NextResponse } from "next/server";
import { generateMarketAnalysisPayload } from "@/lib/m3Engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { latitude, longitude, radiusKm = 5, businessCategoryId = "dairy" } = body;

    const radius = radiusKm > 7 ? 10 : 5;
    const category = businessCategoryId.toLowerCase().includes("poultry") ? "Poultry" : "Dairy";

    const payload = generateMarketAnalysisPayload(radius, latitude, longitude, category);

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

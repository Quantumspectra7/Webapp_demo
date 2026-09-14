import { NextRequest, NextResponse } from "next/server";
import { getCompetitorsInRadius } from "@/lib/m3Engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "30.7853");
  const lng = parseFloat(searchParams.get("lng") || "75.4731");
  const radius = parseInt(searchParams.get("radius") || "5", 10);
  const category = searchParams.get("category") || "all";

  const competitors = getCompetitorsInRadius(lat, lng, radius, category);
  return NextResponse.json(competitors);
}

import { NextRequest, NextResponse } from "next/server";
import { PUNJAB_MARKETS } from "@/data/m3Datasets";
import { calculateDistanceKm } from "@/lib/m3Engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "30.7853");
  const lng = parseFloat(searchParams.get("lng") || "75.4731");
  const radius = parseInt(searchParams.get("radius") || "5", 10);

  const mandis = PUNJAB_MARKETS.map((m) => ({
    ...m,
    distanceKm: calculateDistanceKm(lat, lng, m.latitude, m.longitude),
  })).filter((m) => m.distanceKm <= radius + 2.0);

  return NextResponse.json(mandis);
}

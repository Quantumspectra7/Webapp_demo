import { NextRequest, NextResponse } from "next/server";
import { PUNJAB_MARKETS } from "@/data/m3Datasets";
import { calculateDistanceKm } from "@/lib/m3Engine";
import { generateRealtimeMarkets } from "@/lib/realtimeVendorEngine";
import { MarketLocation } from "@/domain";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "30.7853");
  const lng = parseFloat(searchParams.get("lng") || "75.4731");
  const radius = parseInt(searchParams.get("radius") || "5", 10) > 7 ? 10 : 5;
  const locality = searchParams.get("locality") || "Local";

  let mandis: MarketLocation[] = PUNJAB_MARKETS.map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type as MarketLocation["type"],
    latitude: m.latitude,
    longitude: m.longitude,
    distanceKm: calculateDistanceKm(lat, lng, m.latitude, m.longitude),
    confidence: "high" as const,
    source: m.source,
    commodities: m.commodities,
  })).filter((m) => m.distanceKm <= radius + 2.5);

  // If user is outside predefined dataset radius, dynamically generate local APMC mandis
  if (mandis.length === 0) {
    mandis = generateRealtimeMarkets(lat, lng, radius as 5 | 10, locality);
  }

  return NextResponse.json(mandis);
}

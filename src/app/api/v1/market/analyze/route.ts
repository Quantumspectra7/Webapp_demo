import { NextRequest, NextResponse } from "next/server";
import { generateMarketAnalysisPayload } from "@/lib/m3Engine";
import { generateRealtimeVendors } from "@/lib/realtimeVendorEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { latitude = 30.7853, longitude = 75.4731, radiusKm = 5, businessCategoryId = "dairy", village, district } = body;

    const radius = radiusKm > 7 ? 10 : 5;
    
    // Normalize category
    let category = "Dairy";
    const catLower = (businessCategoryId || "").toLowerCase();
    if (catLower.includes("flour") || catLower.includes("chakki") || catLower.includes("grain")) {
      category = "Commercial Chakki Flour & Dal Mill";
    } else if (catLower.includes("farm") || catLower.includes("equipment") || catLower.includes("machin") || catLower.includes("hiring")) {
      category = "Custom Hiring & Farm Machinery";
    } else if (catLower.includes("poultry")) {
      category = "Commercial Poultry Broiler & Layer Farm";
    } else if (catLower.includes("bakery")) {
      category = "Commercial Bakery & Confectionery Unit";
    } else if (catLower.includes("spice")) {
      category = "Spice Processing & Fine Grinding Unit";
    } else if (catLower.includes("cold")) {
      category = "Fruit & Vegetable Processing / Cold Storage";
    }

    // 1. Fetch live Google Maps competitors via SerpApi (with resilient fallback)
    let liveCompetitors = undefined;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || request.nextUrl.origin || "http://localhost:3000";
      const compUrl = `${baseUrl}/api/v1/market/competitors?lat=${latitude}&lng=${longitude}&radius=${radius}&category=${encodeURIComponent(category)}&village=${encodeURIComponent(village || "")}`;
      const compRes = await fetch(compUrl, { cache: "no-store" });
      if (compRes.ok) {
        liveCompetitors = await compRes.json();
      }
    } catch (fetchErr) {
      console.warn("Live competitors route fetch in analyze route fallback:", fetchErr);
    }

    if (!liveCompetitors || liveCompetitors.length === 0) {
      liveCompetitors = generateRealtimeVendors(
        latitude,
        longitude,
        radius as 5 | 10,
        category,
        {
          id: "loc-user",
          villageOrTown: village || "Local Area",
          district: district || "Local Catchment",
          state: "Punjab",
          block: "Local Catchment",
          pincode: "142026",
          latitude,
          longitude,
          marketCatchmentName: "Live Catchment",
          nearestMandi: "Nearby Mandi",
          distanceToMandiKm: 1.5,
        }
      );
    }

    // 2. Fetch live Google AI Overview Demographics via ScrapeBadger
    let aiCatchmentData = undefined;
    try {
      const { getGoogleAiCatchmentData } = await import("@/lib/googleAiOverviewService");
      aiCatchmentData = await getGoogleAiCatchmentData(
        village || "Jagraon",
        district || "Ludhiana",
        radius as 5 | 10,
        category
      );
    } catch (aiErr) {
      console.warn("Google AI overview demographics fetch fallback:", aiErr);
    }

    // 3. Synthesize Market Intelligence Payload
    const payload = generateMarketAnalysisPayload(
      radius as 5 | 10,
      latitude,
      longitude,
      category,
      village,
      liveCompetitors,
      aiCatchmentData
    );

    return NextResponse.json(payload);
  } catch (err: unknown) {
    console.error("Market analysis route error:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

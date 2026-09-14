import { NextRequest, NextResponse } from "next/server";
import { resolveLocationContext } from "@/lib/m3Engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const village = searchParams.get("village") || undefined;
  const district = searchParams.get("district") || undefined;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");

  const lat = latStr ? parseFloat(latStr) : undefined;
  const lng = lngStr ? parseFloat(lngStr) : undefined;
  const radius = radiusStr ? parseInt(radiusStr, 10) : 5;

  const loc = resolveLocationContext(village, district, lat, lng, radius);

  return NextResponse.json({
    id: loc.id,
    village: loc.village,
    block: loc.block,
    district: loc.district,
    state: loc.state,
    pincode: loc.pincode,
    latitude: loc.latitude,
    longitude: loc.longitude,
    analysis_radius_km: radius > 7 ? 10 : 5,
    confidence: loc.confidence,
    nearest_mandi: loc.nearest_mandi,
    distance_to_mandi_km: loc.distance_to_mandi_km,
    market_catchment_name: loc.market_catchment_name,
  });
}

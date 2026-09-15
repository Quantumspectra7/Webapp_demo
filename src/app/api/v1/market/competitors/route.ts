import { NextRequest, NextResponse } from "next/server";
import { calculateDistanceKm } from "@/lib/m3Engine";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "30.7853");
  const lng = parseFloat(searchParams.get("lng") || "75.4731");
  const radius = parseInt(searchParams.get("radius") || "5", 10);
  const category = searchParams.get("category") || "all";

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.google_map_api_key;
  
  if (!apiKey || apiKey === "your_google_maps_api_key_here") {
    console.warn("Google Maps API key is missing. Using static mock data fallback.");
    // Fallback to static if no key
    const { getCompetitorsInRadius } = await import("@/lib/m3Engine");
    return NextResponse.json(getCompetitorsInRadius(lat, lng, radius, category));
  }

  try {
    // Determine search query based on category
    let query = "business";
    if (category.toLowerCase().includes("dairy")) query = "dairy farm OR milk shop OR chilling center";
    if (category.toLowerCase().includes("poultry")) query = "poultry farm OR chicken shop";
    if (category.toLowerCase().includes("flour")) query = "flour mill OR chakki";
    if (category.toLowerCase().includes("cold")) query = "cold storage";
    if (category.toLowerCase().includes("bakery")) query = "bakery";
    if (category.toLowerCase().includes("spice")) query = "spice mill OR masala grinding";

    const radiusMeters = radius * 1000;
    
    // We use Places API (New) Text Search
    const googleApiUrl = `https://places.googleapis.com/v1/places:searchText`;
    
    const requestBody = {
      textQuery: query,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters
        }
      }
    };

    const response = await fetch(googleApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount,places.location,places.formattedAddress,places.primaryTypeDisplayName"
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();

    if (data.error) {
      throw new Error(`Google API Error: ${data.error.message || data.error.status}`);
    }

    const results = data.places || [];

    const competitors = results.map((place: any, index: number) => {
      const placeLat = place.location?.latitude || 0;
      const placeLng = place.location?.longitude || 0;
      const dist = calculateDistanceKm(lat, lng, placeLat, placeLng);
      
      const rating = place.rating || 0;
      const reviewCount = place.userRatingCount || 0;
      
      // Maturity proxy based on reviews
      let estimatedMaturity = "New / Unverified";
      if (reviewCount > 100) estimatedMaturity = "Established (> 5 yrs)";
      else if (reviewCount > 20) estimatedMaturity = "Growing (2-5 yrs)";
      else if (reviewCount > 0) estimatedMaturity = "Recent (1-2 yrs)";

      // Custom competitive ranking formula
      const ratingScore = rating * 10; // max 50
      const reviewScore = Math.min((reviewCount / 200) * 30, 30); // max 30
      const distanceScore = Math.max(20 - (dist * 2), 0); // closer is better, max 20
      const relevanceScore = Math.round(ratingScore + reviewScore + distanceScore);

      return {
        id: place.id || `g-place-${index}`,
        name: place.displayName?.text || "Unknown Business",
        type: "retail_depot", // generic type
        category: category,
        latitude: placeLat,
        longitude: placeLng,
        distanceKm: dist,
        dailyCapacityLiters: Math.round(Math.random() * 500 + 100), // static fallback metric for UI
        procurementPricePerLiter: 40,
        sellingPricePerLiter: 60,
        keyStrength: place.primaryTypeDisplayName?.text || "Local Business",
        primaryArea: place.formattedAddress || "Local Area",
        operationalSinceYear: 2024,
        confidence: "high",
        source: "Google Places API (Live)",
        rating,
        reviewCount,
        estimatedMaturity,
        relevanceScore
      };
    });

    // Filter strictly by requested radius since TextSearch might return results outside
    const filteredAndSorted = competitors
      .filter((c: any) => c.distanceKm <= radius)
      .sort((a: any, b: any) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return NextResponse.json(filteredAndSorted);
  } catch (err: any) {
    console.error("Google Places API error:", err);
    return NextResponse.json({ error: "Failed to fetch real-time market data." }, { status: 500 });
  }
}

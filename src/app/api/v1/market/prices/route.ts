import { NextRequest, NextResponse } from "next/server";
import { PUNJAB_PRICES } from "@/data/m3Datasets";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let prices = PUNJAB_PRICES;
  if (category && category !== "all") {
    prices = prices.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  return NextResponse.json(prices);
}

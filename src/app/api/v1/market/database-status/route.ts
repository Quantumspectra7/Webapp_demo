import { NextRequest, NextResponse } from "next/server";
import { getDatabaseStats } from "@/lib/scrapedDatabase";

export async function GET(request: NextRequest) {
  try {
    const stats = getDatabaseStats();
    return NextResponse.json({
      status: "operational",
      database: "scrapedDatabase.json",
      total_cached_businesses: stats.totalRecords,
      total_scraping_requests_saved: stats.totalHitsSaved,
      sample_keys: stats.keys.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read database stats" }, { status: 500 });
  }
}

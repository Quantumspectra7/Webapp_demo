import fs from "fs";
import path from "path";
import { GoogleAiCatchmentData } from "./googleAiOverviewService";

export interface ScrapedCatchmentRecord extends GoogleAiCatchmentData {
  key: string;
  locationName: string;
  districtName: string;
  radiusKm: number;
  category: string;
  scrapedAt: string;
  hitsCount: number;
}

// In-memory memory map for sub-millisecond lookup
const memoryDb = new Map<string, ScrapedCatchmentRecord>();
let isInitialized = false;

// Resolve storage file path
function getDbFilePath(): string {
  return path.join(process.cwd(), "src", "data", "scrapedDatabase.json");
}

/**
 * Normalizes input parameters to create a stable database key
 */
export function buildCatchmentKey(
  locationName: string,
  districtName: string,
  radiusKm: number,
  category: string
): string {
  const loc = (locationName || "jagraon").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const dist = (districtName || "ludhiana").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const cat = (category || "dairy").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${loc}-${dist}-${radiusKm}-${cat}`;
}

/**
 * Loads the database from disk into memory
 */
function initDb(): void {
  if (isInitialized) return;
  isInitialized = true;

  if (typeof window !== "undefined") return; // browser safety

  try {
    const filePath = getDbFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const list: ScrapedCatchmentRecord[] = JSON.parse(raw);
      for (const item of list) {
        if (item.key) {
          memoryDb.set(item.key, item);
        }
      }
      console.log(`[ScrapedDatabase] Loaded ${memoryDb.size} stored market records from disk.`);
    } else {
      // Create empty database file
      saveToDisk();
    }
  } catch (err) {
    console.warn("[ScrapedDatabase] Warning initializing database file:", err);
  }
}

/**
 * Flushes memory database to disk
 */
function saveToDisk(): void {
  if (typeof window !== "undefined") return;

  try {
    const filePath = getDbFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const array = Array.from(memoryDb.values());
    fs.writeFileSync(filePath, JSON.stringify(array, null, 2), "utf8");
  } catch (err) {
    console.warn("[ScrapedDatabase] Error saving database to disk:", err);
  }
}

/**
 * Checks if scraped data exists in database.
 * If found, increments hitsCount, saves back to disk, and returns the data without scraping.
 */
export function getScrapedCatchment(
  locationName: string,
  districtName: string,
  radiusKm: number,
  category: string
): ScrapedCatchmentRecord | null {
  initDb();
  const key = buildCatchmentKey(locationName, districtName, radiusKm, category);

  if (memoryDb.has(key)) {
    const record = memoryDb.get(key)!;
    record.hitsCount = (record.hitsCount || 0) + 1;
    saveToDisk();
    return record;
  }

  // Also check partial match on location and category (e.g. if category is "Dairy Processing & Chilling" matching "dairy")
  for (const [existingKey, item] of memoryDb.entries()) {
    const locClean = locationName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    const catClean = category.trim().toLowerCase();
    if (
      existingKey.includes(locClean) &&
      item.radiusKm === radiusKm &&
      (catClean.includes(item.category.toLowerCase()) || item.category.toLowerCase().includes(catClean))
    ) {
      item.hitsCount = (item.hitsCount || 0) + 1;
      saveToDisk();
      return item;
    }
  }

  return null;
}

/**
 * Saves newly scraped/calculated business data into the persistent database.
 */
export function saveScrapedCatchment(
  locationName: string,
  districtName: string,
  radiusKm: number,
  category: string,
  data: GoogleAiCatchmentData
): ScrapedCatchmentRecord {
  initDb();
  const key = buildCatchmentKey(locationName, districtName, radiusKm, category);

  const record: ScrapedCatchmentRecord = {
    ...data,
    key,
    locationName,
    districtName,
    radiusKm,
    category,
    scrapedAt: new Date().toISOString(),
    hitsCount: 1,
  };

  memoryDb.set(key, record);
  saveToDisk();
  console.log(`[ScrapedDatabase] Persisted new entry for '${category}' in '${locationName}' to database (Key: ${key}).`);

  return record;
}

/**
 * Returns database stats
 */
export function getDatabaseStats() {
  initDb();
  let totalHits = 0;
  for (const item of memoryDb.values()) {
    totalHits += item.hitsCount || 0;
  }
  return {
    totalRecords: memoryDb.size,
    totalHitsSaved: totalHits,
    keys: Array.from(memoryDb.keys()),
  };
}

## 1. Architecture Overview

GramVest is architected with complete decoupling between the UI and data layers:

```
Page Components (/dashboard, /market, /money, etc.)
               │
               ▼
       Domain Services (`src/services/index.ts`)
               │
               ▼
   Provider Interfaces (`src/providers/interfaces/*.ts`)
               │
   ┌───────────┴───────────┐
   ▼                       ▼
Mock Providers        Future API Providers
(`src/providers/mock/`)  (`src/providers/api/`)

---

## 2. Step-by-Step Backend Swap Procedure

### Step 1: Create `src/providers/api/` Implementations
Implement the same TypeScript provider interfaces (`IMarketProvider`, `IFinanceProvider`, etc.) using `fetch` or `axios`.

Example: `src/providers/api/ApiMarketProvider.ts`:
```typescript
import { IMarketProvider } from "@/providers/interfaces";
import { MarketAnalysis, Competitor, OpportunityAnalysis } from "@/domain";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiMarketProvider implements IMarketProvider {
  async getMarketAnalysis(radiusKm: 5 | 10): Promise<MarketAnalysis> {
    const res = await fetch(`${API_BASE}/market/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ radiusKm }),
    });
    if (!res.ok) throw new Error("Failed to fetch market analysis");
    return res.json();
  }

  async getCompetitors(radiusKm: 5 | 10, category?: string): Promise<Competitor[]> {
    const url = new URL(`${API_BASE}/market/competitors`);
    url.searchParams.set("radius", radiusKm.toString());
    if (category) url.searchParams.set("category", category);
    
    const res = await fetch(url.toString());
    return res.json();
  }

  // ... implement remaining interface methods
}
```

### Step 2: Swap the Provider Instance in `src/services/index.ts`

In `src/services/index.ts`, conditionally instantiate `ApiProvider` when `NEXT_PUBLIC_DEMO_MODE !== "true"`:

```typescript
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

// Provider Singletons
const profileProvider: IProfileProvider = isDemo
  ? new MockProfileProvider()
  : new ApiProfileProvider();

const marketProvider: IMarketProvider = isDemo
  ? new MockMarketProvider()
  : new ApiMarketProvider();

const financeProvider: IFinanceProvider = isDemo
  ? new MockFinanceProvider()
  : new ApiFinanceProvider();

const schemeProvider: ISchemeProvider = isDemo
  ? new MockSchemeProvider()
  : new ApiSchemeProvider();

const advisorProvider: IAdvisorProvider = isDemo
  ? new MockAdvisorProvider()
  : new ApiAdvisorProvider();

const simulatorProvider: ISimulatorProvider = isDemo
  ? new MockSimulatorProvider()
  : new ApiSimulatorProvider();

const reportProvider: IReportProvider = isDemo
  ? new MockReportProvider()
  : new ApiReportProvider();
```

### Result:
- Zero lines of code in `src/app/` or `src/components/` need to be changed.
- All routing, state management, Leaflet map renders, Recharts graphs, and form validations continue working out-of-the-box.

---

## 3. Recommended Backend Tech Stack (for SIH 2026 PS 26091)

1. **API Framework**: **FastAPI** (Python 3.11+) with Pydantic v2 schemas mirroring `src/domain/index.ts`.
2. **Database**: **PostgreSQL 16 + PostGIS extension** for spatial competitor catchment polygons (`ST_DWithin`, 5km/10km radius circles).
3. **Vector Store**: **pgvector** for local scheme guidelines and livestock census document retrieval.
4. **AI Reasoning**: LangChain / LlamaIndex with prompt grounding against Punjab PAU agricultural databases.
5. **PDF Generation**: **WeasyPrint** or **ReportLab** generating the 18-section CMA Detailed Project Report.

---

## 4. Environment Variables

Create `.env.local` with the following variables:

```bash
# Set to 'false' in production when backend is connected
NEXT_PUBLIC_DEMO_MODE=true

# Future FastAPI backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

# GramVest Onboarding & Profile API Integration Architecture

This document describes the backend integration architecture for the GramVest Registration, Get Started, and Business Analysis Onboarding flow (SIH 2026, PS 26091).

---

## 1. Architectural Philosophy: Decoupled Session vs. Analytical Profile

The onboarding system separates two distinct lifecycles:

1. **Lightweight Account / Session Lifecycle**:
   - Manages user identity, contact details, and session tokens.
   - Minimalist: asks only for Name and Phone / Email + OTP.
   - Zero sensitive documents (NO PAN, NO Aadhaar, NO bank account credentials).
   - Handled via `userAccount` state and optional auth services.

2. **Venture Feasibility Analysis Lifecycle**:
   - Captures hyper-local geography, business categorization, own capital contribution, and promoter familiarity.
   - State-agnostic, extensible domain model (`AnalysisProfile`).
   - Persisted via `profileService` and draft storage (`onboardingStore`).

---

## 2. API Endpoints Contract

### A. Location Resolution (`GET /api/location/resolve`)
Used by `locationService.resolveLocation` and `locationService.searchLocations`.

#### Request (Coordinate-based):
```http
GET /api/location/resolve?lat=30.7853&lng=75.4731 HTTP/1.1
Host: api.gramvest.in
Accept: application/json
```

#### Request (Search query):
```http
GET /api/location/search?query=Jagraon&state=Punjab HTTP/1.1
Host: api.gramvest.in
Accept: application/json
```

#### Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "id": "loc-punjab-ludhiana-jagraon",
    "state": "Punjab",
    "district": "Ludhiana",
    "block": "Jagraon",
    "villageOrTown": "Jagraon",
    "pincode": "142026",
    "latitude": 30.7853,
    "longitude": 75.4731,
    "precision": "point",
    "source": "map",
    "confidence": "high",
    "marketCatchment": {
      "name": "Jagraon Agro Catchment",
      "nearestMandi": "Jagraon APMC Grain Mandi",
      "distanceMandiKm": 2.1
    }
  }
}
```

---

### B. Analysis Profile Submission (`POST /api/profile`)
Executed when the user clicks **[ Start My Analysis ]** on the review screen.

#### Request:
```http
POST /api/profile HTTP/1.1
Host: api.gramvest.in
Content-Type: application/json
Authorization: Bearer <optional_jwt_session_token>

{
  "userId": "usr_94821a8f",
  "location": {
    "id": "loc-punjab-ludhiana-jagraon",
    "state": "Punjab",
    "district": "Ludhiana",
    "block": "Jagraon",
    "villageOrTown": "Jagraon",
    "pincode": "142026",
    "latitude": 30.7853,
    "longitude": 75.4731,
    "precision": "point",
    "source": "search",
    "confidence": "high"
  },
  "business": {
    "categoryId": "biz-dairy",
    "categoryName": "Dairy Farming & Milk Chilling Unit",
    "customBusinessName": null,
    "businessDescription": "Bulk milk cooling and collection hub supplying local sweet makers and private dairies.",
    "scale": "small",
    "targetCustomers": ["Local households", "Private dairies (Verka, Nestle)"]
  },
  "capital": 100000,
  "experience": "beginner",
  "hasRelevantSkills": "somewhat",
  "existingAssets": ["Building / Covered Shed"],
  "desiredMonthlyIncome": 45000,
  "riskPreference": "balanced",
  "analysisRadius": 5
}
```

#### Response (`201 Created`):
```json
{
  "status": "success",
  "profileId": "prof_77189a0c",
  "analysisSessionId": "sess_881920bd",
  "financialScenario": {
    "totalProjectCost": 1000000,
    "promoterEquity": 100000,
    "termLoanRequired": 900000,
    "subsidyIndicative": 350000,
    "indicativeRoute": "PMEGP / MUDRA Tarun"
  },
  "redirectUrl": "/dashboard"
}
```

---

## 3. Seamless Provider Swapping Architecture

GramVest follows the Dependency Inversion Principle using TypeScript interfaces in `src/providers/interfaces/index.ts`:

- `ILocationProvider`
- `IBusinessProvider`
- `IFinancePreviewProvider`
- `IAnalysisProfileProvider`

### Current Mock Provider:
```typescript
// src/services/index.ts
const locationProvider: ILocationProvider = new MockLocationProvider();
const businessProvider: IBusinessProvider = new MockBusinessProvider();
const analysisProfileProvider: IAnalysisProfileProvider = new MockAnalysisProfileProvider();
```

### Future Production API Provider (Drop-in Replacement):
```typescript
// src/providers/api/ApiLocationProvider.ts
export class ApiLocationProvider implements ILocationProvider {
  async resolveLocation(lat: number, lng: number): Promise<LocationProfile> {
    const res = await fetch(`/api/location/resolve?lat=${lat}&lng=${lng}`);
    const json = await res.json();
    return json.data;
  }

  async searchLocations(query: string): Promise<LocationProfile[]> {
    const res = await fetch(`/api/location/search?query=${encodeURIComponent(query)}`);
    const json = await res.json();
    return json.data;
  }
  // ...
}
```

When switching from Mock to Real API, **zero UI components or route handlers are modified**. Only the instantiation in `src/services/index.ts` is changed.

---

## 4. Local Draft Persistence Mechanism

To protect user progress against page refreshes or connection drops without requiring an account:

1. `onboardingStore.saveDraft(profile, currentStep)`:
   - Serializes `AnalysisProfile` and active step index into browser `localStorage`.
   - Adds timestamp `lastSavedAt`.
2. `onboardingStore.restoreDraft()`:
   - Hydrates the wizard on mount if an unfinished draft exists.
3. `onboardingStore.clearDraft()`:
   - Cleans up draft storage immediately upon successful completion of the review step.

# GramVest — Frontend Data Contracts

This document formalizes the data contracts between the GramVest frontend application and the data layer. Every domain service currently consumes an active Mock Provider and is engineered for seamless drop-in replacement by the future FastAPI / PostgreSQL backend.

---

## 1. Domain: Profile & Location

### 1.1 Get Active Profile
- **Domain Service**: `profileService.getProfile()`
- **Current Mock Provider**: `MockProfileProvider.getProfile()`
- **Future API Endpoint**: `GET /api/v1/profile`
- **Response Schema (`EntrepreneurProfile`)**:
  ```typescript
  {
    id: string;
    fullName: string;
    initials: string;
    phone: string;
    educationLevel: string;
    experienceLevel: "beginner" | "intermediate" | "experienced";
    ownCapitalAvailable: number; // in INR (e.g. 300000)
    targetMonthlyIncome: number;
    existingLandOrShed: boolean;
    creditCategory: "general" | "special_rural" | "women_sc_st";
    riskTolerance: "conservative" | "balanced" | "growth";
  }
  ```

### 1.2 Update Profile
- **Domain Service**: `profileService.updateProfile(data)`
- **Current Mock Provider**: `MockProfileProvider.updateProfile(data)`
- **Future API Endpoint**: `PUT /api/v1/profile`
- **Request Body**: `Partial<EntrepreneurProfile>`
- **Response**: `EntrepreneurProfile`

### 1.3 Resolve Location Catchment
- **Domain Service**: `profileService.getLocation()`
- **Current Mock Provider**: `MockProfileProvider.getLocation()`
- **Future API Endpoint**: `GET /api/v1/location/resolve?district=Ludhiana&block=Jagraon`
- **Response Schema (`VentureLocation`)**:
  ```typescript
  {
    id: string;
    state: string; // "Punjab"
    district: string; // "Ludhiana"
    block: string; // "Jagraon"
    villageOrTown: string; // "Sidhwan Bet"
    pincode: string; // "142026"
    latitude: number; // 30.7853
    longitude: number; // 75.4731
    marketCatchmentName: string;
    nearestMandi: string; // "Jagraon Grain Mandi"
    distanceToMandiKm: number; // 4.2
  }
  ```

---

## 2. Domain: Market Intelligence & Competitors

### 2.1 Get Market Analysis
- **Domain Service**: `marketService.getAnalysis(radiusKm)`
- **Current Mock Provider**: `MockMarketProvider.getMarketAnalysis(radiusKm)`
- **Future API Endpoint**: `POST /api/v1/market/analyze`
- **Request Body**:
  ```json
  {
    "latitude": 30.7853,
    "longitude": 75.4731,
    "radiusKm": 5,
    "businessCategoryId": "biz-dairy-processing"
  }
  ```
- **Response Schema (`MarketAnalysis`)**:
  ```typescript
  {
    radiusKm: 5 | 10;
    location: VentureLocation;
    demographics: {
      populationInRadius: number; // e.g. 42800
      householdsInRadius: number; // e.g. 7120
      estimatedDailyMilkProductionLiters: number; // e.g. 14200
      localConsumptionLiters: number; // e.g. 12350
      unmetMarketDemandLiters: number; // e.g. 1850
      averageFarmgatePrice: number; // e.g. 40
      averageRetailSellingPrice: number; // e.g. 60
      mandiDistanceKm: number; // 4.2
      competitorDensityRating: "Low" | "Medium" | "High";
      metadata: ConfidenceMetadata;
    };
    competitors: Competitor[];
    estimatedAddressableMarketLiters: number;
    marketShareTargetPct: number;
    priceTrend: Array<{ period: string; procurementPrice: number; retailPrice: number }>;
    metadata: ConfidenceMetadata;
  }
  ```

### 2.2 Get Competitor Spatial Nodes
- **Domain Service**: `marketService.getCompetitors(radiusKm, category)`
- **Current Mock Provider**: `MockMarketProvider.getCompetitors(radiusKm, category)`
- **Future API Endpoint**: `GET /api/v1/market/competitors?lat=30.7853&lng=75.4731&radius=5&category=all`
- **Response Schema (`Competitor[]`)**:
  ```typescript
  Array<{
    id: string;
    name: string;
    type: "chilling_hub" | "cooperative_center" | "local_dairy" | "sweet_maker";
    latitude: number;
    longitude: number;
    distanceKm: number;
    dailyCapacityLiters: number;
    procurementPricePerLiter: number;
    sellingPricePerLiter: number;
    keyStrength: string;
    primaryArea: string;
    operationalSinceYear: number;
  }>
  ```

---

## 3. Domain: Financial Structuring & Recalculation

### 3.1 Get Financial Scenario Baseline
- **Domain Service**: `financeService.getScenario()`
- **Current Mock Provider**: `MockFinanceProvider.getFinancialScenario()`
- **Future API Endpoint**: `GET /api/v1/finance/scenario`

### 3.2 Dynamic Recalculation Service
- **Domain Service**: `financeService.recalculateScenario(params)`
- **Current Mock Provider**: `MockFinanceProvider.recalculateScenario(params)`
- **Future API Endpoint**: `POST /api/v1/finance/recalculate`
- **Request Body**:
  ```json
  {
    "projectCost": 900000,
    "ownContribution": 300000,
    "interestRate": 8.5,
    "tenureMonths": 60,
    "dailyCapacity": 500,
    "capacityUtilization": 85,
    "sellingPrice": 60,
    "purchasePrice": 42,
    "powerAndDiesel": 18000
  }
  ```
- **Response Schema (`FinancialScenario`)**:
  - `totalProjectCost`: number
  - `financingMeans`: `{ ownContribution, ownContributionPct, termLoan, termLoanPct, eligibleSubsidyAmount, effectiveNetLoan }`
  - `loanTerms`: `{ principal, interestRatePct, tenureMonths, moratoriumMonths, monthlyEMI, totalInterest }`
  - `projections`: `{ monthlyRevenue, monthlyRawMaterialCost, monthlyOperatingExpenses, monthlyEBITDA, monthlyNetProfit, monthlyNetCashFlow, annualDSCR, breakEvenMonthlyLiters, breakEvenCapacityPct }`
  - `repaymentSchedule`: `Array<{ month, openingBalance, principalPaid, interestPaid, totalEmi, closingBalance }>`

---

## 4. Domain: Scheme Routing & Subsidies

### 4.1 Route Scheme Recommendation
- **Domain Service**: `schemeService.getRecommendations()`
- **Current Mock Provider**: `MockSchemeProvider.getRecommendedSchemes()`
- **Future API Endpoint**: `POST /api/v1/schemes/route`
- **Response Schema (`SchemeRouteRecommendation`)**:
  - `recommendedScheme`: `Scheme` (PMEGP with 35% subsidy)
  - `secondaryScheme`: `Scheme` (AIF with 3% subvention)
  - `indicativeSubsidyBenefit`: number (₹3,15,000)
  - `indicativeEmiReduction`: number (₹4,850)
  - `mandatoryDocuments`: `Array<{ id, name, requiredForSanction, description }>`

---

## 5. Domain: AI Advisory Assistant

### 5.1 Chat Query
- **Domain Service**: `advisorService.ask(message, context)`
- **Current Mock Provider**: `MockAdvisorProvider.sendMessage(message, context)`
- **Future API Endpoint**: `POST /api/v1/advisor/chat`
- **Request Body**:
  ```json
  {
    "message": "How does the PMEGP 35% subsidy reduce my loan interest & EMI?",
    "context": {
      "entrepreneurName": "Gurpreet Singh",
      "businessType": "Dairy Processing & Milk Chilling Unit",
      "location": "Sidhwan Bet, Jagraon, Punjab",
      "totalProjectCost": 900000,
      "ownCapital": 300000,
      "viabilityScore": 74
    }
  }
  ```
- **Response Schema (`AdvisorMessage`)**:
  - `id`: string
  - `role`: "assistant"
  - `content`: string
  - `citations`: `Array<{ id, title, source, url? }>`
  - `actionLinks`: `Array<{ label, route }>`

---

## 6. Domain: What-If Stress Testing

### 6.1 Run What-If Simulation
- **Domain Service**: `simulatorService.simulate(baseScenario, params)`
- **Current Mock Provider**: `MockSimulatorProvider.runWhatIfSimulation(baseScenario, params)`
- **Future API Endpoint**: `POST /api/v1/simulator/what-if`
- **Request Body**:
  ```json
  {
    "priceAdjustmentPct": -5,
    "demandAdjustmentPct": -20,
    "rawMilkCostAdjustmentPct": 15,
    "powerDieselCostAdjustmentPct": 20,
    "interestRateAdjustmentPct": 0
  }
  ```
- **Response Schema (`WhatIfResult`)**:
  - `comparisonItems`: `Array<{ metric, baseValue, scenarioValue, unit, deltaPct, status, interpretation }>`
  - `projectedRevenue`, `projectedNetProfit`, `projectedCashFlow`, `projectedDSCR`
  - `projectedRiskLevel`: `"Low" | "Moderate" | "Stressed" | "Critical"`
  - `strategicSummary`: string
  - `suggestedPivots`: string[]

---

## 7. Domain: Feasibility DPR Report

### 7.1 Generate / Fetch Full Bank DPR
- **Domain Service**: `reportService.getReport()`
- **Current Mock Provider**: `MockReportProvider.getFeasibilityReport()`
- **Future API Endpoint**: `GET /api/v1/report/dpr?ventureId=xxx`

### 7.2 Download DPR PDF
- **Domain Service**: `reportService.downloadPdf(reportId)`
- **Current Mock Provider**: `MockReportProvider.generateDownloadPdfUrl(reportId)`
- **Future API Endpoint**: `POST /api/v1/report/export-pdf`

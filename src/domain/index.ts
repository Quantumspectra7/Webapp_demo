/**
 * Domain Models for GramVest
 * Strictly typed interfaces defining core business entities.
 */

export interface ConfidenceMetadata {
  source: string;
  sourceDate: string;
  confidence: "high" | "medium" | "low" | "provisional";
  dataStatus: "live" | "demo" | "verified" | "audited";
  sampleCoverage?: string;
  assumptions?: string[];
  aiSnippet?: string;
  references?: Array<{ title?: string; link?: string }>;
}

export interface VentureLocation {
  id: string;
  state: string; // e.g. "Punjab"
  district: string; // e.g. "Ludhiana"
  block: string; // e.g. "Jagraon"
  villageOrTown: string; // e.g. "Sidhwan Bet"
  pincode: string;
  latitude: number;
  longitude: number;
  marketCatchmentName: string;
  nearestMandi: string;
  distanceToMandiKm: number;
}

export interface BusinessCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  typicalInvestmentRange: [number, number]; // e.g. [500000, 1500000]
  unitOfProduction: string; // "Liters / day", "Quintals / month", etc.
  benchmarkGrossMarginPct: number;
  primaryMachinery: string[];
  applicableSchemes: string[];
}

export interface EntrepreneurProfile {
  id: string;
  fullName: string;
  initials: string;
  phone: string;
  educationLevel: string;
  experienceLevel: "beginner" | "intermediate" | "experienced";
  ownCapitalAvailable: number; // e.g. ₹3,00,000
  targetMonthlyIncome: number;
  existingLandOrShed: boolean;
  creditCategory: "general" | "special_rural" | "women_sc_st";
  riskTolerance: "conservative" | "balanced" | "growth";
}

export interface Competitor {
  id: string;
  name: string;
  type: "chilling_hub" | "cooperative_center" | "local_dairy" | "sweet_maker" | "retail_depot";
  category?: string; // e.g. "Dairy", "Milk Processing", "Collection", "Retail"
  businessType?: string; // e.g. "Retail + Milk Collection", "Bulk Chilling Hub"
  latitude: number;
  longitude: number;
  distanceKm: number;
  dailyCapacityLiters: number;
  procurementPricePerLiter: number;
  sellingPricePerLiter: number;
  keyStrength: string;
  primaryArea: string;
  operationalSinceYear: number;
  confidence?: "high" | "medium" | "provisional";
  source?: string;
  coverageType?: string;
  relevanceScore?: number;
  rating?: number;
  reviewCount?: number;
  estimatedMaturity?: string;
}

export interface MarketLocation {
  id: string;
  name: string;
  type: "apmc_mandi" | "sub_mandi" | "livestock_market" | "wholesale_hub";
  latitude: number;
  longitude: number;
  distanceKm: number;
  confidence: "high" | "medium" | "provisional";
  source: string;
  commodities?: string[];
}

export interface PriceSignalItem {
  commodity: string;
  rangeMin: number;
  rangeMax: number;
  currentAvg: number;
  unit: string;
  trend: "stable" | "rising" | "softening";
  frequency: string;
  notes?: string;
}

export interface DemographicSummary {
  populationInRadius: number; // e.g. 42,800
  householdsInRadius: number; // e.g. 7,120
  estimatedDailyMilkProductionLiters: number; // e.g. 14,200 L
  localConsumptionLiters: number; // e.g. 12,350 L
  unmetMarketDemandLiters: number; // e.g. 1,850 L
  averageFarmgatePrice: number; // ₹40
  averageRetailSellingPrice: number; // ₹60
  mandiDistanceKm: number;
  competitorDensityRating: "Low" | "Moderate" | "Medium" | "High";
  metadata: ConfidenceMetadata;
}

export interface MarketAnalysis {
  radiusKm: 5 | 10;
  location: VentureLocation;
  demographics: DemographicSummary;
  competitors: Competitor[];
  markets?: MarketLocation[];
  priceSignals?: PriceSignalItem[];
  estimatedAddressableMarketLiters: number;
  estimatedReachCustomers?: number;
  addressableMarketSharePct?: number;
  marketShareTargetPct: number;
  opportunitySignal?: {
    status: "STRONG" | "MODERATE" | "LIMITED";
    summary: string;
    rationale: string;
  };
  localGapInsight?: {
    headline: string;
    observation: string;
    opportunity: string;
  };
  marketSignals?: {
    positive: string[];
    watchouts: string[];
  };
  densityLabel?: "Low" | "Moderate" | "High";
  densityExplanation?: string;
  priceTrend: {
    period: string;
    procurementPrice: number;
    retailPrice: number;
  }[];
  metadata: ConfidenceMetadata;
}

export interface OpportunityGap {
  title: string;
  signal: "positive" | "moderate" | "watchout";
  headline: string;
  description: string;
  metric: string;
  evidence: string;
}

export interface OpportunityAnalysis {
  verdict: "Promising" | "Viable with Caution" | "High Risk";
  verdictSubtitle: string;
  executiveSummary: string;
  keyGaps: OpportunityGap[];
  recommendations: string[];
  conditionsToSucceed: string[];
  concernsAndWatchouts: string[];
  metadata: ConfidenceMetadata;
}

export interface SwotQuadrant {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RiskItem {
  id: string;
  category: "Demand" | "Competition" | "Supply / Input Cost" | "Operational" | "Seasonal" | "Financial" | "Regulatory";
  risk: string;
  severity: "High" | "Medium" | "Low";
  likelihood: "High" | "Medium" | "Low";
  impactDescription: string;
  mitigationStrategy: string;
  whyItMatters?: string;
  whatYouCanDo?: string;
}

export interface ViabilityScore {
  overallScore: number; // e.g. 74
  verdict: "Promising" | "Viable with Caution" | "High Risk";
  quartileLabel: string;
  statusPills: {
    label: string;
    status: "Good" | "Manageable" | "Strong" | "Attention Needed";
    tone: "positive" | "caution" | "warning";
  }[];
  components: {
    category: string;
    weight: number; // e.g. 0.25
    score: number; // 0-100
    driver: string;
    improvementAction: string;
  }[];
  metadata: ConfidenceMetadata;
}

export interface ProjectCostItem {
  category: "Plant & Machinery" | "Civil Works & Shed" | "Electrification & DG" | "Testing & Cans" | "Working Capital";
  itemName: string;
  cost: number;
  eligibleForSubsidy: boolean;
  notes: string;
}

export interface FinancingMeans {
  ownContribution: number;
  ownContributionPct: number;
  termLoan: number;
  termLoanPct: number;
  eligibleSubsidyAmount: number;
  subsidySchemeName: string;
  effectiveNetLoan: number;
}

export interface FinancialScenario {
  id: string;
  title: string;
  totalProjectCost: number;
  costBreakdown: ProjectCostItem[];
  financingMeans: FinancingMeans;
  loanTerms: {
    principal: number;
    interestRatePct: number;
    tenureMonths: number;
    moratoriumMonths: number;
    monthlyEMI: number;
    totalInterest: number;
  };
  operationalAssumptions: {
    dailyCapacityLiters: number;
    capacityUtilizationPct: number;
    purchasePricePerLiter: number;
    sellingPricePerLiter: number;
    powerAndDieselMonthly: number;
    laborMonthly: number;
    consumablesMonthly: number;
    maintenanceMonthly: number;
  };
  projections: {
    monthlyRevenue: number;
    monthlyRawMaterialCost: number;
    monthlyOperatingExpenses: number;
    monthlyEBITDA: number;
    monthlyNetProfit: number;
    monthlyNetCashFlow: number;
    annualDSCR: number;
    breakEvenMonthlyLiters: number;
    breakEvenCapacityPct: number;
  };
  cashFlowSeries: {
    month: number;
    revenue: number;
    expenses: number;
    netCashFlow: number;
  }[];
  repaymentSchedule: {
    month: number;
    openingBalance: number;
    principalPaid: number;
    interestPaid: number;
    totalEmi: number;
    closingBalance: number;
  }[];
  metadata: ConfidenceMetadata;
}

export type SchemeProviderType = "central_government" | "state_government" | "bank" | "other";
export type SchemeCategoryType = "subsidy" | "bank_loan" | "credit_guarantee" | "state_scheme";

export interface Scheme {
  id: string;
  code: string;
  name: string;
  fullName: string;
  governingMinistry: string;
  providerType?: SchemeProviderType;
  supportType?: string;
  categoryType?: SchemeCategoryType;
  subsidyRatePct: number; // e.g. 35% for PMEGP rural
  maxProjectCost: number;
  maxSubsidyAmount: number;
  interestSubventionPct: number; // e.g. 3% for AIF
  indicativeInterestRatePct?: number; // e.g. 8.85%
  tenureMonths?: number;
  moratoriumMonths?: number;
  creditGuaranteeCover: string; // e.g. "CGTMSE up to ₹2 Cr"
  keyFitReason: string;
  highlightBadge?: string;
  eligibilityCriteria: string[];
  mandatoryDocuments: {
    id: string;
    name: string;
    requiredForSanction: boolean;
    description: string;
  }[];
  officialPortalUrl: string;
  sourceReference?: string;
  statusNotes: string;
  isPrimaryRecommendation: boolean;
}

export interface SchemeRouteRecommendation {
  recommendedScheme: Scheme;
  secondaryScheme: Scheme;
  allSchemes?: Scheme[];
  indicativeSubsidyBenefit: number;
  indicativeEmiReduction: number;
  appraisalCheckpoints: string[];
  disclaimerText: string;
  metadata: ConfidenceMetadata;
}

export interface AdvisorCitation {
  id: string;
  title: string;
  source: string;
  url?: string;
}

export interface StructuredAdvisorResponse {
  intent: string;
  answer: string;
  verdict?: "PROMISING" | "PROMISING WITH CAUTION" | "FINANCIALLY CONSTRAINED" | "HIGH COMPETITION" | "REQUIRES VALIDATION" | "INSUFFICIENT DATA";
  key_findings?: string[];
  financial_snapshot?: { label: string; value: string }[];
  market_evidence?: string[];
  risks?: string[];
  scheme_matches?: { name: string; subsidy: string; note: string }[];
  recommendations?: string[];
  next_actions?: { label: string; action_type: string; route: string }[];
  confidence: "high" | "medium" | "low" | "unknown";
  needs_clarification: boolean;
}
export interface AdvisorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  structuredData?: StructuredAdvisorResponse;
  citations?: AdvisorCitation[];
  actionLinks?: {
    label: string;
    route: string;
  }[];
}
export interface WhatIfParameters {
  priceAdjustmentPct: number; // e.g. -10 to +15%
  demandAdjustmentPct: number; // e.g. -30 to +30%
  rawMilkCostAdjustmentPct: number; // e.g. +10%
  powerDieselCostAdjustmentPct: number; // e.g. +15%
  interestRateAdjustmentPct: number; // e.g. +1.5%
}

export interface WhatIfComparison {
  metric: string;
  baseValue: number;
  scenarioValue: number;
  unit: string;
  deltaPct: number;
  status: "positive" | "neutral" | "negative";
  interpretation: string;
}
export interface WhatIfResult {
  parameters: WhatIfParameters;
  comparisonItems: WhatIfComparison[];
  projectedRevenue: number;
  projectedNetProfit: number;
  projectedCashFlow: number;
  projectedDSCR: number;
  projectedViabilityScore: number;
  projectedRiskLevel: "Low" | "Moderate" | "Stressed" | "Critical";
  strategicSummary: string;
  suggestedPivots: string[];
}

export interface FeasibilityReport {
  id: string;
  reportNumber: string;
  generatedDate: string;
  version: string;
  entrepreneur: EntrepreneurProfile;
  location: VentureLocation;
  business: BusinessCategory;
  opportunitySummary: OpportunityAnalysis;
  swot: SwotQuadrant;
  topRisks: RiskItem[];
  viability: ViabilityScore;
  financialScenario: FinancialScenario;
  schemeRoute: SchemeRouteRecommendation;
  implementationPlan: {
    phase: string;
    timeline: string;
    keyDeliverables: string[];
  }[];
  statutoryChecklist: {
    authority: string;
    licenseName: string;
    indicativeFee: string;
    turnaroundDays: string;
  }[];
  formalDisclaimer: string;
}

// ==========================================
// Onboarding & Multi-Step Analysis Contracts
// ==========================================

export interface LocationProfile {
  id: string;
  state: string; // e.g. "Punjab"
  district: string; // e.g. "Ludhiana"
  block: string; // e.g. "Jagraon"
  villageOrTown: string; // e.g. "Sidhwan Bet"
  pincode?: string;
  latitude: number;
  longitude: number;
  precision: "point" | "administrative";
  source: "search" | "map" | "manual" | "preset";
  confidence: "high" | "medium" | "provisional";
}

export interface BusinessCategoryItem {
  id: string;
  groupId: string;
  name: string;
  shortDescription: string;
  typicalScaleOptions: ("small" | "medium")[];
  defaultUnit: string;
  benchmarkMarginPct: number;
  indicativeCapitalRange: [number, number];
  suggestedBuyers?: string[];
}

export interface BusinessCategoryGroup {
  id: string;
  name: string;
  description: string;
  iconName: string;
  items: BusinessCategoryItem[];
}

export interface BusinessProfile {
  categoryId: string | null;
  categoryName: string;
  customBusinessName?: string;
  businessDescription: string;
  scale: "small" | "medium";
  targetCustomers?: string[];
  locationId?: string;
}

export interface CapitalStructurePreview {
  ownCapital: number;
  indicativeProjectSize: number;
  indicativeFinancingComponent: number;
  routeType: "micro" | "term";
  disclaimer: string;
}

export interface AnalysisProfile {
  userId?: string;
  location: LocationProfile;
  business: BusinessProfile;
  capital: number;
  experience: "beginner" | "intermediate" | "experienced" | "already_running";
  hasRelevantSkills?: "yes" | "no" | "somewhat";
  existingAssets?: string[];
  preferredScale?: "small" | "medium";
  desiredMonthlyIncome?: number;
  riskPreference?: "conservative" | "balanced" | "growth";
  analysisRadius: 5 | 10;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  contact: string; // phone or email
  phone?: string;
  email?: string;
  businessName?: string;
  registeredAt?: string;
  isGuest: boolean;
  authenticated: boolean;
}


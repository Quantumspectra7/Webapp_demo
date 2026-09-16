import {
  EntrepreneurProfile,
  VentureLocation,
  BusinessCategory,
  MarketAnalysis,
  OpportunityAnalysis,
  SwotQuadrant,
  RiskItem,
  ViabilityScore,
  FinancialScenario,
  SchemeRouteRecommendation,
  AdvisorMessage,
  WhatIfParameters,
  WhatIfResult,
  FeasibilityReport,
  MarketLocation,
  PriceSignalItem,
  Competitor,
} from "@/domain";

export interface IProfileProvider {
  getProfile(): Promise<EntrepreneurProfile>;
  updateProfile(profile: Partial<EntrepreneurProfile>): Promise<EntrepreneurProfile>;
  getLocation(): Promise<VentureLocation>;
  updateLocation(location: Partial<VentureLocation>): Promise<VentureLocation>;
  getBusinessCategory(): Promise<BusinessCategory>;
}

export interface IMarketProvider {
  getMarketAnalysis(radiusKm: 5 | 10, location?: VentureLocation, category?: string): Promise<MarketAnalysis>;
  getCompetitors(radiusKm: 5 | 10, category?: string): Promise<Competitor[]>;
  getRankedCompetitors(radiusKm: 5 | 10, location?: VentureLocation, category?: string): Promise<Competitor[]>;
  getMarkets(radiusKm: 5 | 10, location?: VentureLocation): Promise<MarketLocation[]>;
  getPriceSignals(businessSlug?: string): Promise<PriceSignalItem[]>;
  getOpportunityAnalysis(): Promise<OpportunityAnalysis>;
  getSwotAnalysis(): Promise<SwotQuadrant>;
  getRisks(): Promise<RiskItem[]>;
  getViabilityScore(): Promise<ViabilityScore>;
  setActiveCategory?(categoryId: string): void;
}

export interface IFinanceProvider {
  getFinancialScenario(): Promise<FinancialScenario>;
  recalculateScenario(params: {
    projectCost: number;
    ownContribution: number;
    interestRate: number;
    tenureMonths: number;
    dailyCapacity: number;
    capacityUtilization: number;
    sellingPrice: number;
    purchasePrice: number;
    powerAndDiesel: number;
    categoryId?: string;
  }): Promise<FinancialScenario>;
}

export interface ISchemeProvider {
  getRecommendedSchemes(categoryId?: string, projectCost?: number, ownCapital?: number): Promise<SchemeRouteRecommendation>;
  calculateSubsidy(projectCost: number, schemeCode: string, isRuralSpecial: boolean): Promise<{
    subsidyAmount: number;
    subsidyRatePct: number;
    effectiveNetLoan: number;
    disclaimer: string;
  }>;
  setActiveCategory?(categoryId: string): void;
}

export interface IAdvisorProvider {
  getConversationHistory(): Promise<AdvisorMessage[]>;
  sendMessage(userMessage: string, contextState: unknown): Promise<AdvisorMessage>;
  resetConversation(): Promise<void>;
  getSuggestedQuestions(): Promise<string[]>;
}

export interface ISimulatorProvider {
  runWhatIfSimulation(baseScenario: FinancialScenario, params: WhatIfParameters): Promise<WhatIfResult>;
}

export interface IReportProvider {
  getFeasibilityReport(): Promise<FeasibilityReport>;
  generateDownloadPdfUrl(reportId: string): Promise<{ downloadUrl: string; filename: string }>;
}

// Onboarding & Profile Services
import {
  LocationProfile,
  BusinessCategoryGroup,
  BusinessCategoryItem,
  BusinessProfile,
  CapitalStructurePreview,
  AnalysisProfile,
} from "@/domain";

export interface ILocationProvider {
  searchLocations(query: string): Promise<LocationProfile[]>;
  resolveLocation(latitude: number, longitude: number): Promise<LocationProfile>;
  confirmLocation(loc: LocationProfile): Promise<LocationProfile>;
  getAvailableDistricts(state?: string): Promise<string[]>;
  getAvailableBlocks(district: string): Promise<string[]>;
  getAvailableVillages(district: string, block: string): Promise<string[]>;
}

export interface IBusinessProvider {
  getBusinessCategoryGroups(): Promise<BusinessCategoryGroup[]>;
  searchBusinesses(query: string): Promise<BusinessCategoryItem[]>;
  getBusinessById(id: string): Promise<BusinessCategoryItem | null>;
  saveCustomBusiness(name: string, description: string): Promise<BusinessProfile>;
}

export interface IFinancePreviewProvider {
  calculateCapitalStructure(ownCapital: number): CapitalStructurePreview;
}

export interface IAnalysisProfileProvider {
  saveProfile(profile: AnalysisProfile): Promise<AnalysisProfile>;
  getProfile(): Promise<AnalysisProfile | null>;
}


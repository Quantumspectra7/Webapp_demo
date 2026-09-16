import {
  IProfileProvider,
  IMarketProvider,
  IFinanceProvider,
  ISchemeProvider,
  IAdvisorProvider,
  ISimulatorProvider,
  IReportProvider,
  ILocationProvider,
  IBusinessProvider,
  IFinancePreviewProvider,
  IAnalysisProfileProvider,
} from "@/providers/interfaces";

import { MockProfileProvider } from "@/providers/mock/MockProfileProvider";
import { MockMarketProvider } from "@/providers/mock/MockMarketProvider";
import { MockFinanceProvider } from "@/providers/mock/MockFinanceProvider";
import { MockSchemeProvider } from "@/providers/mock/MockSchemeProvider";
import { MockAdvisorProvider } from "@/providers/mock/MockAdvisorProvider";
import { ApiAdvisorProvider } from "@/providers/api/ApiAdvisorProvider";
import { MockSimulatorProvider } from "@/providers/mock/MockSimulatorProvider";
import { MockReportProvider } from "@/providers/mock/MockReportProvider";
import { MockLocationProvider } from "@/providers/mock/MockLocationProvider";
import { MockBusinessProvider } from "@/providers/mock/MockBusinessProvider";
import { MockFinancePreviewProvider } from "@/providers/mock/MockFinancePreviewProvider";
import { MockAnalysisProfileProvider } from "@/providers/mock/MockAnalysisProfileProvider";
import { ApiMarketProvider } from "@/providers/api/ApiMarketProvider";
import { VentureLocation, LocationProfile, AnalysisProfile } from "@/domain";

export { onboardingStore } from "./onboardingStore";

/**
 * Service Layer for GramVest
 *
 * Current implementation uses Mock Providers by default.
 * In production or live API mode, set NEXT_PUBLIC_DEMO_MODE=false to use ApiMarketProvider
 * without changing any page or component call signatures.
 */

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

// Provider Singletons
const profileProvider: IProfileProvider = new MockProfileProvider();
const marketProvider: IMarketProvider = new ApiMarketProvider();
const financeProvider: IFinanceProvider = new MockFinanceProvider();
const schemeProvider: ISchemeProvider = new MockSchemeProvider();
const advisorProvider: IAdvisorProvider = new ApiAdvisorProvider();
const simulatorProvider: ISimulatorProvider = new MockSimulatorProvider();
const reportProvider: IReportProvider = new MockReportProvider();
const locationProvider: ILocationProvider = new MockLocationProvider();
const businessProvider: IBusinessProvider = new MockBusinessProvider();
const financePreviewProvider: IFinancePreviewProvider = new MockFinancePreviewProvider();
const analysisProfileProvider: IAnalysisProfileProvider = new MockAnalysisProfileProvider();

// Domain Services
export const profileService = {
  getProfile: () => profileProvider.getProfile(),
  updateProfile: (data: Parameters<IProfileProvider["updateProfile"]>[0]) =>
    profileProvider.updateProfile(data),
  getLocation: () => profileProvider.getLocation(),
  updateLocation: (data: Parameters<IProfileProvider["updateLocation"]>[0]) =>
    profileProvider.updateLocation(data),
  getBusinessCategory: () => profileProvider.getBusinessCategory(),
};

export const marketService = {
  getAnalysis: (radiusKm: 5 | 10 = 5, location?: VentureLocation, category?: string) =>
    marketProvider.getMarketAnalysis(radiusKm, location, category),
  getCompetitors: (radiusKm: 5 | 10 = 5, category?: string) =>
    marketProvider.getCompetitors(radiusKm, category),
  getRankedCompetitors: (radiusKm: 5 | 10 = 5, location?: VentureLocation, category?: string) =>
    marketProvider.getRankedCompetitors(radiusKm, location, category),
  getMarkets: (radiusKm: 5 | 10 = 5, location?: VentureLocation) =>
    marketProvider.getMarkets(radiusKm, location),
  getPriceSignals: (businessSlug?: string) => marketProvider.getPriceSignals(businessSlug),
  getOpportunity: () => marketProvider.getOpportunityAnalysis(),
  getSwot: () => marketProvider.getSwotAnalysis(),
  getRisks: () => marketProvider.getRisks(),
  getViabilityScore: () => marketProvider.getViabilityScore(),
  setActiveCategory: (categoryId: string) => marketProvider.setActiveCategory?.(categoryId),
};

export const financeService = {
  getScenario: () => financeProvider.getFinancialScenario(),
  recalculateScenario: (params: Parameters<IFinanceProvider["recalculateScenario"]>[0]) =>
    financeProvider.recalculateScenario(params),
};

export const schemeService = {
  getRecommendations: (categoryId?: string, projectCost?: number, ownCapital?: number) =>
    schemeProvider.getRecommendedSchemes(categoryId, projectCost, ownCapital),
  calculateSubsidy: (projectCost: number, schemeCode: string, isRuralSpecial = true) =>
    schemeProvider.calculateSubsidy(projectCost, schemeCode, isRuralSpecial),
  setActiveCategory: (categoryId: string) => schemeProvider.setActiveCategory?.(categoryId),
};

export const advisorService = {
  getHistory: () => advisorProvider.getConversationHistory(),
  ask: (message: string, context?: unknown) => advisorProvider.sendMessage(message, context),
  reset: () => advisorProvider.resetConversation(),
  getSuggestions: () => advisorProvider.getSuggestedQuestions(),
};

export const simulatorService = {
  simulate: (baseScenario: Parameters<ISimulatorProvider["runWhatIfSimulation"]>[0], params: Parameters<ISimulatorProvider["runWhatIfSimulation"]>[1]) =>
    simulatorProvider.runWhatIfSimulation(baseScenario, params),
};

export const reportService = {
  getReport: () => reportProvider.getFeasibilityReport(),
  downloadPdf: (reportId: string) => reportProvider.generateDownloadPdfUrl(reportId),
};

export const locationService = {
  searchLocations: (query: string) => locationProvider.searchLocations(query),
  resolveLocation: (lat: number, lng: number) => locationProvider.resolveLocation(lat, lng),
  confirmLocation: (loc: LocationProfile) => locationProvider.confirmLocation(loc),
  getAvailableDistricts: (state?: string) => locationProvider.getAvailableDistricts(state),
  getAvailableBlocks: (district: string) => locationProvider.getAvailableBlocks(district),
  getAvailableVillages: (district: string, block: string) => locationProvider.getAvailableVillages(district, block),
};

export const businessService = {
  getBusinessCategoryGroups: () => businessProvider.getBusinessCategoryGroups(),
  searchBusinesses: (query: string) => businessProvider.searchBusinesses(query),
  getBusinessById: (id: string) => businessProvider.getBusinessById(id),
  saveCustomBusiness: (name: string, description: string) =>
    businessProvider.saveCustomBusiness(name, description),
};

export const financePreviewService = {
  calculateCapitalStructure: (ownCapital: number) =>
    financePreviewProvider.calculateCapitalStructure(ownCapital),
};

export const onboardingProfileService = {
  saveProfile: (profile: AnalysisProfile) => analysisProfileProvider.saveProfile(profile),
  getProfile: () => analysisProfileProvider.getProfile(),
};


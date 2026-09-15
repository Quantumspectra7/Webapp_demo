"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  EntrepreneurProfile,
  VentureLocation,
  BusinessCategory,
  FinancialScenario,
  AnalysisProfile,
  UserAccount,
} from "@/domain";
import { profileService, financeService, onboardingProfileService } from "@/services";

import { getScenarioForBusiness } from "@/data/real/business_scenarios";

interface AppContextType {
  profile: EntrepreneurProfile | null;
  location: VentureLocation | null;
  business: BusinessCategory | null;
  financialScenario: FinancialScenario | null;
  analysisProfile: AnalysisProfile | null;
  userAccount: UserAccount | null;
  selectedRadius: 5 | 10;
  language: "EN" | "PA" | "HI";
  setSelectedRadius: (radius: 5 | 10) => void;
  setLanguage: (lang: "EN" | "PA" | "HI") => void;
  setUserAccount: (account: UserAccount | null) => void;
  setAnalysisProfile: (profile: AnalysisProfile | null) => void;
  applyAnalysisProfile: (profile: AnalysisProfile) => Promise<void>;
  updateProfile: (data: Partial<EntrepreneurProfile>) => Promise<void>;
  updateLocation: (data: Partial<VentureLocation>) => Promise<void>;
  updateFinancialScenario: (scenario: FinancialScenario) => void;
  reloadDemoData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [location, setLocation] = useState<VentureLocation | null>(null);
  const [business, setBusiness] = useState<BusinessCategory | null>(null);
  const [financialScenario, setFinancialScenario] = useState<FinancialScenario | null>(null);
  const [analysisProfile, setAnalysisProfile] = useState<AnalysisProfile | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>({
    id: "guest-user-01",
    name: "Guest Explorer",
    contact: "guest@gramvest.in",
    isGuest: true,
    authenticated: false,
  });
  const [selectedRadius, setSelectedRadius] = useState<5 | 10>(5);
  const [language, setLanguage] = useState<"EN" | "PA" | "HI">("EN");
  const [isLoading, setIsLoading] = useState(true);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [prof, loc, biz, fin, savedAnalysis] = await Promise.all([
        profileService.getProfile(),
        profileService.getLocation(),
        profileService.getBusinessCategory(),
        financeService.getScenario(),
        onboardingProfileService.getProfile(),
      ]);

      setProfile(prof);
      setLocation(loc);

      // If user had previously saved an analysis profile, restore business & financials
      if (savedAnalysis) {
        setAnalysisProfile(savedAnalysis);
        const scenario = getScenarioForBusiness(savedAnalysis.business?.categoryId);
        const syncedBiz: BusinessCategory = {
          id: scenario.id,
          title: savedAnalysis.business.customBusinessName || scenario.title,
          slug: scenario.categoryId,
          description: savedAnalysis.business.businessDescription || scenario.description,
          typicalInvestmentRange: [
            Math.round(scenario.indicativeProjectCost * 0.8),
            Math.round(scenario.indicativeProjectCost * 1.2),
          ],
          unitOfProduction: scenario.capacityUnit,
          benchmarkGrossMarginPct: scenario.marketInsights.valueAdditionPct,
          primaryMachinery: scenario.capexItems.map((c) => c.name),
          applicableSchemes: scenario.governmentSchemes.map((s) => s.schemeName),
        };
        setBusiness(syncedBiz);
        setSelectedRadius(savedAnalysis.analysisRadius || 5);

        // Recalculate financial scenario to match saved business
        try {
          const recalculated = await financeService.recalculateScenario({
            projectCost: scenario.indicativeProjectCost,
            ownContribution: savedAnalysis.capital || scenario.ownContribution,
            interestRate: scenario.interestRate,
            tenureMonths: scenario.tenureMonths,
            dailyCapacity: scenario.dailyCapacity,
            capacityUtilization: scenario.capacityUtilization,
            sellingPrice: scenario.sellingPricePerUnit,
            purchasePrice: scenario.purchasePricePerUnit,
            powerAndDiesel: scenario.monthlyPowerCost,
            categoryId: scenario.id,
          });
          setFinancialScenario(recalculated);
        } catch {
          setFinancialScenario(fin);
        }
      } else {
        setBusiness(biz);
        setFinancialScenario(fin);
      }
    } catch (err) {
      console.error("Failed to load initial context data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const updateProfile = async (data: Partial<EntrepreneurProfile>) => {
    if (!profile) return;
    const updated = await profileService.updateProfile(data);
    setProfile(updated);
  };

  const updateLocation = async (data: Partial<VentureLocation>) => {
    if (!location) return;
    const updated = await profileService.updateLocation(data);
    setLocation(updated);
  };

  const updateFinancialScenario = (scenario: FinancialScenario) => {
    setFinancialScenario(scenario);
  };

  const applyAnalysisProfile = async (newProfile: AnalysisProfile) => {
    setAnalysisProfile(newProfile);
    await onboardingProfileService.saveProfile(newProfile);

    // Sync Location
    const updatedLoc: VentureLocation = {
      id: newProfile.location.id || "loc-custom-active",
      state: newProfile.location.state,
      district: newProfile.location.district,
      block: newProfile.location.block,
      villageOrTown: newProfile.location.villageOrTown,
      pincode: newProfile.location.pincode || "142024",
      latitude: newProfile.location.latitude,
      longitude: newProfile.location.longitude,
      marketCatchmentName: `${newProfile.location.block} Agro Catchment`,
      nearestMandi: `${newProfile.location.block} APMC Mandi`,
      distanceToMandiKm: 5.4,
    };
    setLocation(updatedLoc);
    await profileService.updateLocation(updatedLoc);

    // Fetch matching real business scenario
    const scenarioData = getScenarioForBusiness(newProfile.business.categoryId);

    // Sync Business
    const updatedBiz: BusinessCategory = {
      id: scenarioData.id,
      title: newProfile.business.customBusinessName || scenarioData.title,
      slug: scenarioData.categoryId,
      description: newProfile.business.businessDescription || scenarioData.description,
      typicalInvestmentRange: [
        Math.round(scenarioData.indicativeProjectCost * 0.8),
        Math.round(scenarioData.indicativeProjectCost * 1.2),
      ],
      unitOfProduction: scenarioData.capacityUnit,
      benchmarkGrossMarginPct: scenarioData.marketInsights.valueAdditionPct,
      primaryMachinery: scenarioData.capexItems.map((c) => c.name),
      applicableSchemes: scenarioData.governmentSchemes.map((s) => s.schemeName),
    };
    setBusiness(updatedBiz);

    // Sync Entrepreneur Profile
    if (profile) {
      const updatedProf: EntrepreneurProfile = {
        ...profile,
        ownCapitalAvailable: newProfile.capital,
        experienceLevel:
          newProfile.experience === "beginner"
            ? "beginner"
            : newProfile.experience === "intermediate"
            ? "intermediate"
            : "experienced",
        targetMonthlyIncome: newProfile.desiredMonthlyIncome || profile.targetMonthlyIncome,
        riskTolerance: newProfile.riskPreference || "balanced",
      };
      setProfile(updatedProf);
      await profileService.updateProfile(updatedProf);
    }

    setSelectedRadius(newProfile.analysisRadius);

    // Recalculate Financial Scenario with verified domain parameters
    try {
      const recalculated = await financeService.recalculateScenario({
        projectCost: scenarioData.indicativeProjectCost,
        ownContribution: newProfile.capital || scenarioData.ownContribution,
        interestRate: scenarioData.interestRate,
        tenureMonths: scenarioData.tenureMonths,
        dailyCapacity: scenarioData.dailyCapacity,
        capacityUtilization: scenarioData.capacityUtilization,
        sellingPrice: scenarioData.sellingPricePerUnit,
        purchasePrice: scenarioData.purchasePricePerUnit,
        powerAndDiesel: scenarioData.monthlyPowerCost,
      });
      setFinancialScenario(recalculated);
    } catch (e) {
      console.warn("Failed to dynamically recalculate scenario", e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        location,
        business,
        financialScenario,
        analysisProfile,
        userAccount,
        selectedRadius,
        language,
        setSelectedRadius,
        setLanguage,
        setUserAccount,
        setAnalysisProfile,
        applyAnalysisProfile,
        updateProfile,
        updateLocation,
        updateFinancialScenario,
        reloadDemoData: loadInitialData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
};


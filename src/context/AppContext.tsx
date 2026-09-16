"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translateText, SupportedLanguage } from "@/lib/i18n";
import {
  EntrepreneurProfile,
  VentureLocation,
  BusinessCategory,
  FinancialScenario,
  AnalysisProfile,
  UserAccount,
} from "@/domain";
import { profileService, financeService, onboardingProfileService, marketService, schemeService } from "@/services";

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
  t: (text: string) => string;
  setSelectedRadius: (radius: 5 | 10) => void;
  setLanguage: (lang: "EN" | "PA" | "HI") => void;
  setUserAccount: (account: UserAccount | null) => void;
  registerUserAccount: (accountData: {
    name: string;
    phone: string;
    email: string;
    businessName?: string;
  }) => void;
  logoutUserAccount: () => void;
  setAnalysisProfile: (profile: AnalysisProfile | null) => void;
  applyAnalysisProfile: (profile: AnalysisProfile) => Promise<void>;
  updateProfile: (data: Partial<EntrepreneurProfile>) => Promise<void>;
  updateLocation: (data: Partial<VentureLocation>) => Promise<void>;
  updateFinancialScenario: (scenario: FinancialScenario) => void;
  reloadDemoData: () => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY_USER = "gramvest_user_account";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [location, setLocation] = useState<VentureLocation | null>(null);
  const [business, setBusiness] = useState<BusinessCategory | null>(null);
  const [financialScenario, setFinancialScenario] = useState<FinancialScenario | null>(null);
  const [analysisProfile, setAnalysisProfile] = useState<AnalysisProfile | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
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

      // Restore user account from local storage if registered
      let currentUser: UserAccount | null = null;
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.authenticated) {
              setUserAccount(parsed);
              currentUser = parsed;
            }
          } catch (e) {
            console.error("Failed to parse saved user account", e);
          }
        }
      }

      // If user had previously saved an analysis profile, restore business, location, profile & financials
      if (savedAnalysis) {
        setAnalysisProfile(savedAnalysis);

        // 1. Restore & sync Location
        const restoredLoc: VentureLocation = {
          id: savedAnalysis.location?.id || loc?.id || "loc-custom-active",
          state: savedAnalysis.location?.state || "Punjab",
          district: savedAnalysis.location?.district || "Ludhiana",
          block: savedAnalysis.location?.block || "Khanna",
          villageOrTown: savedAnalysis.location?.villageOrTown || "Khanna",
          pincode: savedAnalysis.location?.pincode || "141401",
          latitude: savedAnalysis.location?.latitude || 30.702,
          longitude: savedAnalysis.location?.longitude || 76.22,
          marketCatchmentName: `${savedAnalysis.location?.block || "Khanna"} Agro Catchment`,
          nearestMandi: `${savedAnalysis.location?.block || "Khanna"} APMC Mandi`,
          distanceToMandiKm: 5.4,
        };
        setLocation(restoredLoc);
        await profileService.updateLocation(restoredLoc);

        // 2. Restore & sync Business
        const scenario = getScenarioForBusiness(savedAnalysis.business?.categoryId);
        const syncedBiz: BusinessCategory = {
          id: scenario.id,
          title: savedAnalysis.business?.customBusinessName || scenario.title,
          slug: scenario.categoryId,
          description: savedAnalysis.business?.businessDescription || scenario.description,
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

        // 3. Restore & sync Entrepreneur Profile
        const restoredProf: EntrepreneurProfile = {
          ...prof,
          id: prof?.id || "user-active",
          fullName: currentUser?.name || prof?.fullName || "",
          phone: currentUser?.phone || prof?.phone || "",
          initials: ((currentUser?.name || prof?.fullName || "User").substring(0, 2)).toUpperCase(),
          ownCapitalAvailable: savedAnalysis.capital || prof?.ownCapitalAvailable || 100000,
          experienceLevel:
            savedAnalysis.experience === "beginner"
              ? "beginner"
              : savedAnalysis.experience === "intermediate"
              ? "intermediate"
              : "experienced",
          targetMonthlyIncome: savedAnalysis.desiredMonthlyIncome || prof?.targetMonthlyIncome || 45000,
          riskTolerance: savedAnalysis.riskPreference || prof?.riskTolerance || "balanced",
        };
        setProfile(restoredProf);
        await profileService.updateProfile(restoredProf);

        marketService.setActiveCategory(scenario.categoryId);
        schemeService.setActiveCategory(scenario.categoryId);

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
        // If user is registered but no explicit savedAnalysis yet, ensure valid non-empty location
        if (currentUser && (!loc?.district || loc.district.trim() === "")) {
          const defaultLoc: VentureLocation = {
            id: loc?.id || "loc-khanna-01",
            state: loc?.state || "Punjab",
            district: "Ludhiana",
            block: "Khanna",
            villageOrTown: "Khanna",
            pincode: loc?.pincode || "141401",
            latitude: loc?.latitude || 30.702,
            longitude: loc?.longitude || 76.22,
            marketCatchmentName: "Khanna Agro Catchment",
            nearestMandi: "Khanna APMC Mandi",
            distanceToMandiKm: 5.4,
          };
          setLocation(defaultLoc);
          await profileService.updateLocation(defaultLoc);

          if (currentUser.name) {
            const updatedProf: EntrepreneurProfile = {
              ...prof,
              id: prof?.id || "user-active",
              fullName: currentUser.name,
              phone: currentUser.phone || "",
              initials: currentUser.name.substring(0, 2).toUpperCase(),
              ownCapitalAvailable: prof?.ownCapitalAvailable || 100000,
            };
            setProfile(updatedProf);
            await profileService.updateProfile(updatedProf);
          }
        }

        setBusiness(biz);
        setFinancialScenario(fin);
        if (biz?.id) {
          marketService.setActiveCategory(biz.id);
          schemeService.setActiveCategory(biz.id);
        }
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

    marketService.setActiveCategory(scenarioData.categoryId);
    schemeService.setActiveCategory(scenarioData.categoryId);

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
        categoryId: scenarioData.id,
      });
      setFinancialScenario(recalculated);
    } catch (e) {
      console.warn("Failed to dynamically recalculate scenario", e);
    }
  };

  const registerUserAccount = (accountData: {
    name: string;
    phone: string;
    email: string;
    businessName?: string;
  }) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: accountData.name.trim(),
      contact: accountData.phone.trim() || accountData.email.trim(),
      phone: accountData.phone.trim(),
      email: accountData.email.trim(),
      businessName: accountData.businessName?.trim(),
      registeredAt: new Date().toISOString(),
      isGuest: false,
      authenticated: true,
    };
    setUserAccount(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    }
  };

  const logoutUserAccount = () => {
    setUserAccount(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  };

  const t = useCallback(
    (text: string) => translateText(text, language as SupportedLanguage),
    [language]
  );

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
        t,
        setSelectedRadius,
        setLanguage,
        setUserAccount,
        registerUserAccount,
        logoutUserAccount,
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


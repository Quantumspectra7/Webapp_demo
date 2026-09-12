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
      setBusiness(biz);
      setFinancialScenario(fin);
      if (savedAnalysis) {
        setAnalysisProfile(savedAnalysis);
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

    // Sync Business
    if (business) {
      const updatedBiz: BusinessCategory = {
        ...business,
        id: newProfile.business.categoryId || "biz-custom",
        title: newProfile.business.customBusinessName || newProfile.business.categoryName,
        description: newProfile.business.businessDescription,
      };
      setBusiness(updatedBiz);
    }

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

    // Recalculate Financial Scenario dynamically with indicative project cost:
    const calculatedProjectCost = Math.round(newProfile.capital / 0.1);
    try {
      const recalculated = await financeService.recalculateScenario({
        projectCost: calculatedProjectCost,
        ownContribution: newProfile.capital,
        interestRate: 8.5,
        tenureMonths: 84,
        dailyCapacity: 1000,
        capacityUtilization: 75,
        sellingPrice: 42,
        purchasePrice: 32,
        powerAndDiesel: 12000,
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


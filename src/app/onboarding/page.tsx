"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { AnalysisProfile, LocationProfile, BusinessProfile } from "@/domain";
import { onboardingStore } from "@/services";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { LocationStep } from "@/components/onboarding/LocationStep";
import { BusinessStep } from "@/components/onboarding/BusinessStep";
import { CapitalStep } from "@/components/onboarding/CapitalStep";
import { ExperienceStep } from "@/components/onboarding/ExperienceStep";
import { PersonalDetailsStep, PersonalDetails } from "@/components/onboarding/PersonalDetailsStep";
import { AnalysisTransition } from "@/components/onboarding/AnalysisTransition";

// Default profile — no pre-filled dummy user data
const DEFAULT_PROFILE: AnalysisProfile = {
  userId: "user-onboarding-new",
  location: {
    id: "loc-khanna-01",
    state: "Punjab",
    district: "Ludhiana",
    block: "Khanna",
    villageOrTown: "Khanna",
    pincode: "141401",
    latitude: 30.702,
    longitude: 76.22,
    precision: "point",
    source: "preset",
    confidence: "high",
  },
  business: {
    categoryId: "biz-dairy",
    categoryName: "Dairy Farming & Milk Chilling Unit",
    businessDescription:
      "Bulk milk cooling, testing and distribution to local dairies and cooperatives.",
    scale: "small",
    targetCustomers: ["Local households", "Private dairies (Verka, Nestle)"],
  },
  capital: 100000,
  experience: "beginner",
  hasRelevantSkills: "somewhat",
  existingAssets: ["Building / Covered Shed"],
  desiredMonthlyIncome: 45000,
  riskPreference: "balanced",
  analysisRadius: 5,
};

const PERSONAL_DETAILS_KEY = "gramvest_onboarding_personal_v1";

export default function OnboardingPage() {
  const router = useRouter();
  const { applyAnalysisProfile, analysisProfile } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<AnalysisProfile>(DEFAULT_PROFILE);
  const [personalDetails, setPersonalDetails] = useState<Partial<PersonalDetails>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [draftLastSaved, setDraftLastSaved] = useState<string | null>(null);

  // Restore onboarding draft or active profile from localStorage on mount
  useEffect(() => {
    if (analysisProfile) {
      setProfile((prev) => ({
        ...prev,
        ...analysisProfile,
        location: analysisProfile.location || prev.location,
        business: analysisProfile.business || prev.business,
      }));
    }

    const saved = onboardingStore.restoreDraft();
    if (saved && saved.profile) {
      setProfile((prev) => ({
        ...prev,
        ...saved.profile,
        location: saved.profile.location || prev.location,
        business: saved.profile.business || prev.business,
      }));
      if (saved.step && saved.step >= 1 && saved.step <= 5) {
        setCurrentStep(saved.step);
      }
      setDraftLastSaved(saved.lastSavedAt);
    }

    // Restore personal details entered during a previous onboarding session
    try {
      const rawPersonal = localStorage.getItem(PERSONAL_DETAILS_KEY);
      if (rawPersonal) {
        setPersonalDetails(JSON.parse(rawPersonal));
      }
    } catch {
      // ignore
    }
  }, [analysisProfile]);

  // Persist step helper
  const persistStep = (updatedProfile: AnalysisProfile, nextStep: number) => {
    setProfile(updatedProfile);
    setCurrentStep(nextStep);
    onboardingStore.saveDraft(updatedProfile, nextStep);
    setDraftLastSaved(new Date().toISOString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 1: Location
  const handleLocationConfirmed = (location: LocationProfile) => {
    persistStep({ ...profile, location }, 2);
  };

  // Step 2: Business
  const handleBusinessConfirmed = (business: BusinessProfile) => {
    persistStep({ ...profile, business }, 3);
  };

  // Step 3: Capital
  const handleCapitalConfirmed = (capital: number) => {
    persistStep({ ...profile, capital }, 4);
  };

  // Step 4: Experience / Familiarity
  const handleExperienceConfirmed = (data: {
    experience: "beginner" | "intermediate" | "experienced" | "already_running";
    hasRelevantSkills: "yes" | "no" | "somewhat";
    existingAssets: string[];
    desiredMonthlyIncome: number;
    riskPreference: "conservative" | "balanced" | "growth";
  }) => {
    const updated: AnalysisProfile = {
      ...profile,
      experience: data.experience,
      hasRelevantSkills: data.hasRelevantSkills,
      existingAssets: data.existingAssets,
      desiredMonthlyIncome: data.desiredMonthlyIncome,
      riskPreference: data.riskPreference,
    };
    persistStep(updated, 5);
  };

  // Step 5: Personal Details → Register + trigger analysis
  const handlePersonalDetailsConfirmed = async (details: PersonalDetails) => {
    // Save personal details to localStorage for persistence
    try {
      localStorage.setItem(PERSONAL_DETAILS_KEY, JSON.stringify(details));
    } catch {
      // ignore
    }
    setPersonalDetails(details);

    const updatedProfile: AnalysisProfile = {
      ...profile,
      business: {
        ...profile.business,
        customBusinessName: details.businessName || profile.business.customBusinessName,
      },
    };
    setProfile(updatedProfile);

    // Mark step 6 (analysis) in draft so reload knows flow is complete
    onboardingStore.saveDraft(updatedProfile, 6);

    // Trigger the analysis transition
    setIsTransitioning(true);
    await applyAnalysisProfile(updatedProfile);
  };

  // Back navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  // Analysis complete → clear draft and go to dashboard
  const handleTransitionComplete = () => {
    onboardingStore.clearDraft();
    router.replace("/dashboard");
  };

  if (isTransitioning) {
    return (
      <AnalysisTransition
        locationName={`${profile.location.villageOrTown}, ${profile.location.district}`}
        businessTitle={profile.business.customBusinessName || profile.business.categoryName}
        userName={personalDetails.name}
        onComplete={handleTransitionComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f2] text-[#1d1b18] flex flex-col justify-between selection:bg-[#c75d3e] selection:text-white">
      {/* Progress Bar */}
      <OnboardingProgress
        currentStep={currentStep}
        onStepClick={(s) => { if (s < currentStep) setCurrentStep(s); }}
        onBack={handleBack}
        canGoBack={true}
        draftLastSaved={draftLastSaved}
      />

      {/* Step Content */}
      <main className="flex-1 py-4 sm:py-8">
        {currentStep === 1 && (
          <LocationStep
            initialLocation={profile.location}
            onConfirmLocation={handleLocationConfirmed}
          />
        )}

        {currentStep === 2 && (
          <BusinessStep
            initialBusiness={profile.business}
            onConfirmBusiness={handleBusinessConfirmed}
          />
        )}

        {currentStep === 3 && (
          <CapitalStep
            initialCapital={profile.capital}
            onConfirmCapital={handleCapitalConfirmed}
          />
        )}

        {currentStep === 4 && (
          <ExperienceStep
            initialExperience={profile.experience}
            initialSkills={profile.hasRelevantSkills}
            initialAssets={profile.existingAssets}
            initialIncome={profile.desiredMonthlyIncome}
            initialRisk={profile.riskPreference}
            onConfirmExperience={handleExperienceConfirmed}
          />
        )}

        {currentStep === 5 && (
          <PersonalDetailsStep
            initialDetails={personalDetails}
            onConfirmDetails={handlePersonalDetailsConfirmed}
          />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[#ede3d8] bg-white/40 py-4 px-6 text-center text-xs text-[#786d65]">
        <p>GramVest · Hyper-Local Business Decision Engine for Rural Punjab</p>
      </footer>
    </div>
  );
}

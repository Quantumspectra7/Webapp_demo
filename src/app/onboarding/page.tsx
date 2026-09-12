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
import { ReviewStep } from "@/components/onboarding/ReviewStep";
import { AnalysisTransition } from "@/components/onboarding/AnalysisTransition";

// Demo initial baseline for SIH demonstration
const DEFAULT_PROFILE: AnalysisProfile = {
  userId: "user-demo-punjab-01",
  location: {
    id: "loc-jagraon-01",
    state: "Punjab",
    district: "Ludhiana",
    block: "Jagraon",
    villageOrTown: "Jagraon",
    pincode: "142026",
    latitude: 30.7853,
    longitude: 75.4731,
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

export default function OnboardingPage() {
  const router = useRouter();
  const { applyAnalysisProfile } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [profile, setProfile] = useState<AnalysisProfile>(DEFAULT_PROFILE);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [draftLastSaved, setDraftLastSaved] = useState<string | null>(null);

  // Restore draft if present on client mount
  useEffect(() => {
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
  }, []);

  // Save draft helper
  const persistStep = (updatedProfile: AnalysisProfile, nextStep: number) => {
    setProfile(updatedProfile);
    setCurrentStep(nextStep);
    onboardingStore.saveDraft(updatedProfile, nextStep);
    setDraftLastSaved(new Date().toISOString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 1: Location confirmed
  const handleLocationConfirmed = (location: LocationProfile) => {
    const updated: AnalysisProfile = {
      ...profile,
      location,
    };
    persistStep(updated, 2);
  };

  // Step 2: Business confirmed
  const handleBusinessConfirmed = (business: BusinessProfile) => {
    const updated: AnalysisProfile = {
      ...profile,
      business,
    };
    persistStep(updated, 3);
  };

  // Step 3: Capital confirmed
  const handleCapitalConfirmed = (capital: number) => {
    const updated: AnalysisProfile = {
      ...profile,
      capital,
    };
    persistStep(updated, 4);
  };

  // Step 4: Experience confirmed
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

  // Step 5: Start Analysis triggered
  const handleStartAnalysis = async () => {
    setIsTransitioning(true);
    await applyAnalysisProfile(profile);
    onboardingStore.clearDraft();
  };

  // Back navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/get-started");
    }
  };

  if (isTransitioning) {
    return (
      <AnalysisTransition
        locationName={`${profile.location.villageOrTown}, ${profile.location.district}`}
        businessTitle={profile.business.customBusinessName || profile.business.categoryName}
        onComplete={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f2] text-[#1d1b18] flex flex-col justify-between selection:bg-[#c75d3e] selection:text-white">
      {/* Top Lightweight Progress Bar */}
      <OnboardingProgress
        currentStep={currentStep}
        onStepClick={(s) => setCurrentStep(s)}
        onBack={handleBack}
        canGoBack={true}
        draftLastSaved={draftLastSaved}
      />

      {/* Step Content Container */}
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
          <ReviewStep
            profile={profile}
            onEditStep={(s) => setCurrentStep(s)}
            onStartAnalysis={handleStartAnalysis}
            isSubmitting={isTransitioning}
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

import { AnalysisProfile } from "@/domain";

const STORAGE_KEY = "gramvest_onboarding_draft_v1";

export interface OnboardingDraft {
  step: number;
  profile: Partial<AnalysisProfile>;
  lastSavedAt: string;
}

export const onboardingStore = {
  saveDraft: (profile: Partial<AnalysisProfile>, currentStep: number): void => {
    if (typeof window === "undefined") return;
    try {
      const draft: OnboardingDraft = {
        step: currentStep,
        profile,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn("Failed to persist onboarding draft to localStorage", e);
    }
  },

  restoreDraft: (): OnboardingDraft | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as OnboardingDraft;
    } catch (e) {
      console.warn("Failed to restore onboarding draft", e);
      return null;
    }
  },

  clearDraft: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Failed to clear onboarding draft", e);
    }
  },
};

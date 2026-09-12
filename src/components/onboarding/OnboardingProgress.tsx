"use client";

import React from "react";
import { ArrowLeft, Check, CheckCircle2, ShieldCheck } from "lucide-react";

interface StepItem {
  number: number;
  label: string;
}

const STEPS: StepItem[] = [
  { number: 1, label: "Location" },
  { number: 2, label: "Business" },
  { number: 3, label: "Capital" },
  { number: 4, label: "Your Experience" },
  { number: 5, label: "Review" },
];

interface OnboardingProgressProps {
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  draftLastSaved?: string | null;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  onStepClick,
  onBack,
  canGoBack = true,
  draftLastSaved,
}) => {
  return (
    <div className="w-full bg-[#faf4ee] border-b border-[#ede3d8] px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-2xs backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Back button & brand indicator */}
        <div className="flex items-center gap-3">
          {canGoBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#fff8f2] text-xs font-semibold text-[#786d65] hover:text-[#1d1b18] shadow-2xs transition-all cursor-pointer"
              aria-label="Go back to previous step"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : null}

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#786d65] bg-[#ede3d8]/60 px-2 py-0.5 rounded-md">
              Analysis Setup
            </span>
            {draftLastSaved && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#3a6b4c] font-medium">
                <CheckCircle2 size={12} />
                Draft saved
              </span>
            )}
          </div>
        </div>

        {/* Center: Compact lightweight 5-step indicator */}
        <nav aria-label="Onboarding Steps" className="flex items-center gap-1.5 sm:gap-2">
          {STEPS.map((s, idx) => {
            const isCompleted = s.number < currentStep;
            const isCurrent = s.number === currentStep;
            const isClickable = s.number < currentStep && onStepClick;

            return (
              <React.Fragment key={s.number}>
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(s.number)}
                  disabled={!isClickable}
                  className={`flex items-center gap-1.5 py-1 px-2 sm:px-2.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? "bg-white text-[#c75d3e] font-bold border border-[#c75d3e]/20 shadow-2xs"
                      : isCompleted
                      ? "text-[#3a6b4c] hover:bg-white/80 cursor-pointer"
                      : "text-[#786d65]/70 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isCurrent
                        ? "bg-[#c75d3e] text-white"
                        : isCompleted
                        ? "bg-[#3a6b4c] text-white"
                        : "bg-[#ede3d8] text-[#786d65]"
                    }`}
                  >
                    {isCompleted ? <Check size={10} strokeWidth={3} /> : s.number}
                  </span>
                  <span className="hidden md:inline">{s.label}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <span className="text-[#ede3d8] text-xs select-none">/</span>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right: Security & Privacy reassurance */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#786d65]">
          <ShieldCheck size={13} className="text-[#3a6b4c]" />
          <span>No PAN or Aadhaar required</span>
        </div>
      </div>
    </div>
  );
};

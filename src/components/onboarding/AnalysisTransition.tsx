"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MapPin, Search, Building2, Calculator } from "lucide-react";

interface AnalysisTransitionProps {
  locationName: string;
  businessTitle: string;
  onComplete?: () => void;
}

const TRANSITION_STEPS = [
  {
    title: "Analyzing your location & catchment...",
    detail: "Querying village survey demographics and transport access",
    icon: MapPin,
  },
  {
    title: "Checking nearby market signals...",
    detail: "Estimating unserved dairy & agro-processing demand",
    icon: Search,
  },
  {
    title: "Looking at business competition...",
    detail: "Mapping commercial hubs and cooperative collection centers",
    icon: Building2,
  },
  {
    title: "Structuring the financial scenario...",
    detail: "Applying PMEGP subsidy parameters and debt service coverage",
    icon: Calculator,
  },
];

export const AnalysisTransition: React.FC<AnalysisTransitionProps> = ({
  locationName,
  businessTitle,
  onComplete,
}) => {
  const router = useRouter();
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    // Step progression every 750ms
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < TRANSITION_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            if (onComplete) {
              onComplete();
            } else {
              router.push("/dashboard");
            }
          }, 600);
          return prev;
        }
      });
    }, 750);

    return () => clearInterval(timer);
  }, [router, onComplete]);

  return (
    <div className="min-h-screen bg-[#fff8f2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#ede3d8] p-8 shadow-lg text-center">
        {/* Brand Crest */}
        <div className="w-12 h-12 rounded-2xl bg-[#c75d3e] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
          GV
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#241b16]">
          Synthesizing Decision Dossier
        </h2>
        <p className="text-xs text-[#786d65] mt-1 mb-8">
          {businessTitle} · {locationName}
        </p>

        {/* Step Progress List */}
        <div className="space-y-4 text-left mb-8">
          {TRANSITION_STEPS.map((step, idx) => {
            const isFinished = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3.5 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? "bg-[#faf4ee] border border-[#ede3d8]"
                    : "opacity-75"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isFinished ? (
                    <CheckCircle2 size={18} className="text-[#3a6b4c]" />
                  ) : isCurrent ? (
                    <Loader2 size={18} className="text-[#c75d3e] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#ede3d8] bg-white mt-0.5"></div>
                  )}
                </div>

                <div>
                  <p
                    className={`text-xs font-bold ${
                      isCurrent ? "text-[#c75d3e]" : isFinished ? "text-[#241b16]" : "text-[#786d65]"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-[#786d65] mt-0.5">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[#786d65]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3a6b4c] animate-pulse"></span>
          <span>Preparing feasibility radar & financial tables...</span>
        </div>
      </div>
    </div>
  );
};

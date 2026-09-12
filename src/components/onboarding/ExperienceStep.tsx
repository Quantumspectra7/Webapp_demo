"use client";

import React, { useState } from "react";
import {
  Award,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Building,
  Landmark,
  Shield,
  FastForward,
} from "lucide-react";

interface ExperienceStepProps {
  initialExperience: "beginner" | "intermediate" | "experienced" | "already_running";
  initialSkills?: "yes" | "no" | "somewhat";
  initialAssets?: string[];
  initialIncome?: number;
  initialRisk?: "conservative" | "balanced" | "growth";
  onConfirmExperience: (data: {
    experience: "beginner" | "intermediate" | "experienced" | "already_running";
    hasRelevantSkills: "yes" | "no" | "somewhat";
    existingAssets: string[];
    desiredMonthlyIncome: number;
    riskPreference: "conservative" | "balanced" | "growth";
  }) => void;
}

const EXPERIENCE_OPTIONS = [
  {
    id: "beginner" as const,
    title: "New to this",
    description: "First time exploring this business. Interested in a step-by-step feasibility guide.",
  },
  {
    id: "intermediate" as const,
    title: "Some experience",
    description: "Familiar through family, relatives, or informal previous work in this field.",
  },
  {
    id: "experienced" as const,
    title: "Experienced",
    description: "Hands-on experience, direct technical skills, or formal vocational training.",
  },
  {
    id: "already_running" as const,
    title: "Already running a similar business",
    description: "Currently operational at small scale and looking to formalize, expand, or finance.",
  },
];

const ASSET_OPTIONS = [
  "Land / Plot",
  "Building / Covered Shed",
  "Equipment / Machinery",
  "Transport Vehicle",
  "Existing Shop / Commercial Space",
  "None of the above",
];

export const ExperienceStep: React.FC<ExperienceStepProps> = ({
  initialExperience,
  initialSkills = "somewhat",
  initialAssets = ["None of the above"],
  initialIncome = 45000,
  initialRisk = "balanced",
  onConfirmExperience,
}) => {
  const [experience, setExperience] = useState<
    "beginner" | "intermediate" | "experienced" | "already_running"
  >(initialExperience || "beginner");
  const [skills, setSkills] = useState<"yes" | "no" | "somewhat">(initialSkills);
  const [assets, setAssets] = useState<string[]>(initialAssets);
  const [desiredIncome, setDesiredIncome] = useState<number>(initialIncome);
  const [riskPreference, setRiskPreference] = useState<"conservative" | "balanced" | "growth">(
    initialRisk
  );
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  const handleToggleAsset = (asset: string) => {
    if (asset === "None of the above") {
      setAssets(["None of the above"]);
      return;
    }
    setAssets((prev) => {
      const filtered = prev.filter((a) => a !== "None of the above");
      return filtered.includes(asset) ? filtered.filter((a) => a !== asset) : [...filtered, asset];
    });
  };

  const handleProceed = () => {
    onConfirmExperience({
      experience,
      hasRelevantSkills: skills,
      existingAssets: assets.length > 0 ? assets : ["None of the above"],
      desiredMonthlyIncome: desiredIncome,
      riskPreference,
    });
  };

  const handleSkipOptional = () => {
    onConfirmExperience({
      experience,
      hasRelevantSkills: "somewhat",
      existingAssets: ["None of the above"],
      desiredMonthlyIncome: 45000,
      riskPreference: "balanced",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c75d3e]/10 text-[#c75d3e] mb-2.5">
          <Award size={13} />
          <span>Step 4 of 5</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241b16] tracking-tight">
          How familiar are you with this kind of business?
        </h1>
        <p className="text-sm sm:text-base text-[#786d65] mt-2 max-w-2xl">
          GramVest tunes the operational complexity, training recommendations, and risk models to
          your background.
        </p>
      </div>

      {/* 4 Primary Experience Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {EXPERIENCE_OPTIONS.map((opt) => {
          const isSelected = experience === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setExperience(opt.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-2 border-[#c75d3e] shadow-md ring-2 ring-[#c75d3e]/20"
                  : "bg-white hover:bg-[#faf4ee] border-[#ede3d8] shadow-2xs hover:border-[#c75d3e]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-[#241b16]">{opt.title}</h3>
                  {isSelected && <CheckCircle2 size={18} className="text-[#c75d3e] shrink-0" />}
                </div>
                <p className="text-xs text-[#786d65] leading-relaxed">{opt.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional Context Toggle */}
      <div className="bg-white rounded-2xl border border-[#ede3d8] p-5 sm:p-6 shadow-2xs mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#241b16]">
              Optional: Relevant Skills & Existing Assets
            </h4>
            <p className="text-xs text-[#786d65] mt-0.5">
              Helps us determine if you can save on startup machinery or construction capex.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowOptionalDetails(!showOptionalDetails)}
            className="text-xs font-bold text-[#c75d3e] hover:underline cursor-pointer"
          >
            {showOptionalDetails ? "Hide optional fields" : "Add details"}
          </button>
        </div>

        {showOptionalDetails && (
          <div className="mt-5 pt-5 border-t border-[#ede3d8] space-y-5">
            {/* Skills */}
            <div>
              <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2">
                Do you already have relevant skills or training?
              </label>
              <div className="flex gap-2">
                {(["yes", "somewhat", "no"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkills(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                      skills === s
                        ? "bg-[#c75d3e] text-white border-[#c75d3e]"
                        : "bg-[#faf4ee] text-[#786d65] border-[#ede3d8] hover:bg-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Assets */}
            <div>
              <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2">
                Do you already own anything that could support the business?
              </label>
              <div className="flex flex-wrap gap-2">
                {ASSET_OPTIONS.map((asset) => {
                  const active = assets.includes(asset);
                  return (
                    <button
                      key={asset}
                      type="button"
                      onClick={() => handleToggleAsset(asset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        active
                          ? "bg-[#3a6b4c] text-white border-[#3a6b4c]"
                          : "bg-[#faf4ee] text-[#786d65] border-[#ede3d8] hover:bg-white"
                      }`}
                    >
                      {asset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Monthly Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
                  Desired Monthly Net Income (₹)
                </label>
                <input
                  type="number"
                  value={desiredIncome}
                  onChange={(e) => setDesiredIncome(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#ede3d8] p-2.5 text-sm font-bold font-mono text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-1.5">
                  Risk Preference
                </label>
                <div className="flex gap-2">
                  {(["conservative", "balanced", "growth"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRiskPreference(r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        riskPreference === r
                          ? "bg-[#241b16] text-white border-[#241b16]"
                          : "bg-[#faf4ee] text-[#786d65] border-[#ede3d8] hover:bg-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action CTAs: Next or Skip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleSkipOptional}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#786d65] hover:text-[#1d1b18] shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FastForward size={14} />
          <span>Skip optional details</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue to Review</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

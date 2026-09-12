"use client";

import React from "react";
import { AnalysisProfile } from "@/domain";
import { formatCurrency } from "@/lib/formatters";
import {
  FileText,
  MapPin,
  Briefcase,
  Wallet,
  Award,
  CheckCircle2,
  Edit3,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface ReviewStepProps {
  profile: AnalysisProfile;
  onEditStep: (stepNumber: number) => void;
  onStartAnalysis: () => void;
  isSubmitting?: boolean;
}

const ANALYSIS_CHECKLIST = [
  "Local market reach & 5 km catchment demand",
  "Nearby competition & operational chilling/service hubs",
  "Business opportunity gaps & price realization",
  "Key risks & statutory compliance requirements",
  "Financial capex structure & indicative project size",
  "Indicative financing route (MUDRA / PMEGP / Term Loan)",
  "Repayment health, debt service (DSCR) & break-even",
  "Overall bankability & viability score",
];

export const ReviewStep: React.FC<ReviewStepProps> = ({
  profile,
  onEditStep,
  onStartAnalysis,
  isSubmitting = false,
}) => {
  const businessTitle =
    profile.business.customBusinessName || profile.business.categoryName || "Custom Business";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c75d3e]/10 text-[#c75d3e] mb-2.5">
          <FileText size={13} />
          <span>Step 5 of 5 · Final Review</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241b16] tracking-tight">
          Ready to see what the local market says?
        </h1>
        <p className="text-sm sm:text-base text-[#786d65] mt-2 max-w-2xl">
          Review your business inputs. We will run our hyper-local feasibility model against
          Punjab survey benchmarks.
        </p>
      </div>

      {/* Main Review Card: "YOUR BUSINESS PLAN" */}
      <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-sm overflow-hidden mb-6">
        <div className="bg-[#faf4ee] px-6 py-3.5 border-b border-[#ede3d8] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
            YOUR BUSINESS PLAN
          </span>
          <span className="text-xs text-[#3a6b4c] font-semibold flex items-center gap-1">
            <ShieldCheck size={14} />
            Verified Parameters
          </span>
        </div>

        <div className="divide-y divide-[#ede3d8] text-sm">
          {/* Row 1: Location */}
          <div className="p-5 flex items-start justify-between gap-4 hover:bg-[#fff8f2]/40 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c75d3e]/10 flex items-center justify-center text-[#c75d3e] shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                  Location
                </p>
                <h4 className="text-base font-bold text-[#241b16] mt-0.5">
                  {profile.location.villageOrTown}
                </h4>
                <p className="text-xs text-[#786d65]">
                  {profile.location.block} Block · {profile.location.district},{" "}
                  {profile.location.state}
                </p>
                <p className="text-[11px] font-mono text-[#786d65] mt-1">
                  {profile.location.latitude.toFixed(4)}° N,{" "}
                  {profile.location.longitude.toFixed(4)}° E (
                  {profile.location.precision === "point" ? "Pin-point" : "Administrative"})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ede3d8] hover:bg-white text-xs font-bold text-[#c75d3e] transition-all cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          </div>

          {/* Row 2: Business */}
          <div className="p-5 flex items-start justify-between gap-4 hover:bg-[#fff8f2]/40 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c75d3e]/10 flex items-center justify-center text-[#c75d3e] shrink-0 mt-0.5">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                  Business
                </p>
                <h4 className="text-base font-bold text-[#241b16] mt-0.5">{businessTitle}</h4>
                <p className="text-xs text-[#786d65] mt-0.5 capitalize">
                  {profile.business.scale || "Small"} Scale
                  {profile.business.targetCustomers && profile.business.targetCustomers.length > 0 && (
                    <span> · Target: {profile.business.targetCustomers.join(", ")}</span>
                  )}
                </p>
                {profile.business.businessDescription && (
                  <p className="text-xs text-[#786d65] mt-1 line-clamp-2 italic">
                    &quot;{profile.business.businessDescription}&quot;
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ede3d8] hover:bg-white text-xs font-bold text-[#c75d3e] transition-all cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          </div>

          {/* Row 3: Capital */}
          <div className="p-5 flex items-start justify-between gap-4 hover:bg-[#fff8f2]/40 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c75d3e]/10 flex items-center justify-center text-[#c75d3e] shrink-0 mt-0.5">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                  Your Contribution
                </p>
                <h4 className="text-xl font-bold text-[#241b16] font-mono mt-0.5">
                  {formatCurrency(profile.capital)}
                </h4>
                <p className="text-xs text-[#786d65] mt-0.5">
                  Indicative project capacity:{" "}
                  <strong className="text-[#3a6b4c]">
                    {formatCurrency(Math.round(profile.capital / 0.1))}
                  </strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ede3d8] hover:bg-white text-xs font-bold text-[#c75d3e] transition-all cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          </div>

          {/* Row 4: Experience */}
          <div className="p-5 flex items-start justify-between gap-4 hover:bg-[#fff8f2]/40 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#c75d3e]/10 flex items-center justify-center text-[#c75d3e] shrink-0 mt-0.5">
                <Award size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                  Experience & Profile
                </p>
                <h4 className="text-base font-bold text-[#241b16] mt-0.5 capitalize">
                  {profile.experience.replace("_", " ")}
                </h4>
                {profile.existingAssets && profile.existingAssets.length > 0 && (
                  <p className="text-xs text-[#786d65] mt-0.5">
                    Assets: {profile.existingAssets.join(", ")}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#ede3d8] hover:bg-white text-xs font-bold text-[#c75d3e] transition-all cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* What GramVest will analyze Checklist */}
      <div className="bg-[#faf4ee] rounded-2xl border border-[#ede3d8] p-5 sm:p-6 mb-8">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#786d65] mb-3">
          What GramVest will analyze for this venture
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ANALYSIS_CHECKLIST.map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-[#241b16]">
              <CheckCircle2 size={14} className="text-[#3a6b4c] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onEditStep(1)}
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#786d65] transition-all cursor-pointer"
        >
          Modify Inputs
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onStartAnalysis}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#b34f32] text-white text-base font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>Start My Analysis</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

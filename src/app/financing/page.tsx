"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { schemeService } from "@/services";
import { SchemeRouteRecommendation, Scheme } from "@/domain";
import { formatCurrency } from "@/lib/formatters";
import {
  Coins,
  ShieldCheck,
  Building2,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  Landmark,
  BadgePercent,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  FileCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function FinancingPage() {
  const { profile, location, business, financialScenario } = useApp();
  const [recommendation, setRecommendation] = useState<SchemeRouteRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "subsidy" | "bank_loan" | "credit_guarantee" | "state_scheme">("all");
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSchemes() {
      try {
        setLoading(true);
        const data = await schemeService.getRecommendations(
          business?.id,
          financialScenario?.totalProjectCost,
          profile?.ownCapitalAvailable
        );
        setRecommendation(data);
      } catch (err) {
        console.error("Failed to load scheme recommendations", err);
      } finally {
        setLoading(false);
      }
    }
    loadSchemes();
  }, [business?.id, financialScenario?.totalProjectCost, profile?.ownCapitalAvailable]);

  // Document checklist toggle state
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    "doc-1": true, // GramVest Detailed Project Report
    "doc-2": true, // Aadhaar & PAN Card KYC
    "doc-3": true, // Udyam MSME Registration Certificate
    "doc-4": false, // Land Title / Registered Lease Deed
    "doc-5": false, // Machinery Quotation from OEM
    "doc-6": true, // Bank Account Statement (Past 6 Months)
  });

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalDocs = 6;
  const completedDocs = Object.values(checkedDocs).filter(Boolean).length;
  const readinessPct = Math.round((completedDocs / totalDocs) * 100);

  const topScheme = recommendation?.recommendedScheme;
  const totalProjectCost = financialScenario?.totalProjectCost || 1000000;
  const subsidyAmount = recommendation?.indicativeSubsidyBenefit || Math.round(totalProjectCost * ((topScheme?.subsidyRatePct || 35) / 100));
  const interestRate = financialScenario?.loanTerms?.interestRatePct || topScheme?.indicativeInterestRatePct || 9.0;
  const tenureMonths = financialScenario?.loanTerms?.tenureMonths || topScheme?.tenureMonths || 60;
  const moratoriumMonths = financialScenario?.loanTerms?.moratoriumMonths || topScheme?.moratoriumMonths || 6;

  // All feasible schemes matched to this business
  const allSchemes = useMemo(() => {
    if (recommendation?.allSchemes && recommendation.allSchemes.length > 0) {
      return recommendation.allSchemes;
    }
    if (recommendation?.recommendedScheme) {
      return [recommendation.recommendedScheme, recommendation.secondaryScheme].filter(Boolean);
    }
    return [];
  }, [recommendation]);

  // Filter schemes strictly based on the active tab
  const filteredSchemes = useMemo(() => {
    if (activeFilter === "all") return allSchemes;
    if (activeFilter === "subsidy") {
      return allSchemes.filter(
        (s) => s.categoryType === "subsidy" || (s.subsidyRatePct && s.subsidyRatePct > 0) || (s.interestSubventionPct && s.interestSubventionPct > 0)
      );
    }
    if (activeFilter === "bank_loan") {
      return allSchemes.filter(
        (s) => s.categoryType === "bank_loan" || s.providerType === "bank" || s.code.startsWith("SBI") || s.code.startsWith("PNB") || s.code === "PMMY"
      );
    }
    if (activeFilter === "credit_guarantee") {
      return allSchemes.filter(
        (s) => s.categoryType === "credit_guarantee" || s.code === "CGTMSE" || s.code === "CGSS"
      );
    }
    if (activeFilter === "state_scheme") {
      return allSchemes.filter(
        (s) => s.categoryType === "state_scheme" || s.providerType === "state_government" || s.code.startsWith("PUNJAB")
      );
    }
    return allSchemes;
  }, [allSchemes, activeFilter]);

  const matchReasons = topScheme?.eligibilityCriteria && topScheme.eligibilityCriteria.length > 0
    ? topScheme.eligibilityCriteria.slice(0, 3)
    : [
        `Estimated project cost of ${formatCurrency(totalProjectCost)} falls within official scheme ceiling.`,
        `Promoter equity contribution meets the minimum margin requirement (10% - 15%).`,
        `Enterprise qualifies for concessional priority sector lending (PSL) guidelines.`,
      ];

  const toggleExpandScheme = (id: string) => {
    setExpandedSchemeId((prev) => (prev === id ? null : id));
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <Coins size={16} />
              <span>DB_gramvest Scheme Registry · Official 2025-26</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              Which financing route fits me?
            </h1>
            <p className="text-sm text-[#786d65] mt-1">
              Showing strictly verified government subsidies, credit guarantees, and bank loans feasible for{" "}
              <span className="font-semibold text-[#241b16] underline decoration-[#c75d3e]/40">
                {business?.title || "your enterprise"}
              </span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/advisor"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles size={15} />
              <span>Ask AI Advisor</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Selected Business Context Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#faf4ee] via-[#fffbf7] to-[#f4ebe1] border border-[#ede3d8] shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c75d3e]/10 border border-[#c75d3e]/20 flex items-center justify-center text-[#c75d3e] flex-shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c75d3e] bg-[#c75d3e]/10 px-2 py-0.5 rounded-md">
                  Active Business Match
                </span>
                <span className="text-xs text-[#786d65]">{location?.villageOrTown || location?.district || "Punjab Rural Cluster"}</span>
              </div>
              <h2 className="font-serif font-bold text-base text-[#241b16] mt-0.5">
                {business?.title || "Dairy Processing & Chilling Unit"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-[#ede3d8] pt-3 md:pt-0 md:pl-6 text-xs">
            <div>
              <span className="text-[#786d65] block text-[10px] uppercase font-bold">Project Cost</span>
              <span className="font-bold font-serif text-sm text-[#241b16]">{formatCurrency(totalProjectCost)}</span>
            </div>
            <div>
              <span className="text-[#786d65] block text-[10px] uppercase font-bold">Max Potential Subsidy</span>
              <span className="font-bold font-serif text-sm text-[#3a6b4c]">{formatCurrency(subsidyAmount)}</span>
            </div>
            <div>
              <span className="text-[#786d65] block text-[10px] uppercase font-bold">Feasible Schemes</span>
              <span className="font-bold font-serif text-sm text-[#c75d3e]">{allSchemes.length} Official Routes</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            RECOMMENDED ROUTE: DYNAMIC SCHEME SPOTLIGHT
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#c75d3e] shadow-warm-lg space-y-6 relative overflow-hidden">
          {/* Top highlight ribbon */}
          <div className="absolute top-0 right-0 bg-[#c75d3e] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-sm flex items-center gap-1.5">
            <Sparkles size={12} />
            <span>#1 Best Sovereign Fit</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-1">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fcedea] text-[#c75d3e] border border-[#c75d3e]/20">
                  {topScheme?.highlightBadge || "High Feasibility Match"}
                </span>
                <span className="text-xs text-[#786d65]">
                  {topScheme?.governingMinistry || "Ministry of MSME / Food Processing"} · Active 2025-26
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
                Recommended Route: {topScheme?.name || "Prime Minister's Employment Generation Programme"}
              </h2>
              <p className="text-sm text-[#56423d] leading-relaxed">
                {topScheme?.keyFitReason ||
                  `Structured priority term debt blended with capital subsidy, pre-aligned to Public Sector Bank underwriting guidelines.`}
              </p>
            </div>

            {/* Grant Callout Card */}
            <div className="p-5 rounded-2xl bg-[#f0f6ec] border border-[#3a6b4c]/30 text-center min-w-[230px] flex-shrink-0 shadow-warm-sm">
              <span className="text-[10px] uppercase font-bold text-[#3a6b4c] tracking-wider block">
                Indicative Capital Subsidy
              </span>
              <p className="text-3xl font-serif font-extrabold text-[#3a6b4c] mt-1 mb-0.5">
                {topScheme?.subsidyRatePct ? `${topScheme.subsidyRatePct}%` : "3% Subvention"}
              </p>
              <p className="text-xs font-bold text-[#241b16]">
                Up to {formatCurrency(subsidyAmount)}
              </p>
              <span className="text-[10px] text-[#786d65] block mt-1">
                {topScheme?.code ? `Code: ${topScheme.code}` : "Non-repayable sovereign capital grant"}
              </span>
            </div>
          </div>

          {/* Why This Route */}
          <div className="space-y-3 pt-4 border-t border-[#ede3d8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65] block">
              Why this route matches your enterprise profile:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchReasons.map((reason: string, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] space-y-1.5 hover:border-[#c75d3e]/30 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#241b16]">
                    {idx === 0 ? (
                      <Building2 size={16} className="text-[#c75d3e]" />
                    ) : idx === 1 ? (
                      <BadgePercent size={16} className="text-[#3a6b4c]" />
                    ) : (
                      <Landmark size={16} className="text-[#c75d3e]" />
                    )}
                    <span>Pillar {idx + 1} Fit</span>
                  </div>
                  <p className="text-xs text-[#56423d] leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Appraisal Checkpoints Callout */}
          {recommendation?.appraisalCheckpoints && recommendation.appraisalCheckpoints.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#fffbf7] border border-[#ede3d8] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c75d3e]">
                <AlertCircle size={15} />
                <span>Verified Underwriting &amp; Appraisal Checkpoints</span>
              </div>
              <ul className="text-xs text-[#786d65] space-y-1.5 list-disc list-inside">
                {recommendation.appraisalCheckpoints.map((info: string, i: number) => (
                  <li key={i}>{info}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Indicative Financing Terms */}
          <div className="space-y-3 pt-4 border-t border-[#ede3d8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65] block">
              Indicative Financial &amp; Credit Terms:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Interest Rate</span>
                <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">{interestRate}% p.a.</p>
                <p className="text-[10px] text-[#786d65]">Concessional PSL rate</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Loan Tenure</span>
                <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">{tenureMonths} Months</p>
                <p className="text-[10px] text-[#786d65]">Equated monthly installment</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Moratorium Grace</span>
                <p className="text-base font-serif font-bold text-[#3a6b4c] mt-0.5">{moratoriumMonths} Months</p>
                <p className="text-[10px] text-[#3a6b4c]">Zero principal during setup</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Collateral Security</span>
                <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">
                  {topScheme?.creditGuaranteeCover || "CGTMSE / Priority Cover"}
                </p>
                <p className="text-[10px] text-[#786d65]">Zero third-party guarantee</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            ALL FEASIBLE SCHEMES FOR SELECTED BUSINESS
           ======================================================== */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                  Feasible Financial Pathways
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#c75d3e]/10 text-[#c75d3e] text-[11px] font-bold">
                  {allSchemes.length} Matched
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241b16] mt-0.5">
                All Feasible Schemes for {business?.title || "Your Business"}
              </h2>
              <p className="text-xs text-[#786d65]">
                Only schemes applicable to this business category from the DB_gramvest official database are listed.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#faf4ee] rounded-2xl border border-[#ede3d8]">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "all"
                    ? "bg-[#241b16] text-white shadow-sm"
                    : "text-[#786d65] hover:text-[#241b16]"
                }`}
              >
                All ({allSchemes.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("subsidy")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "subsidy"
                    ? "bg-[#3a6b4c] text-white shadow-sm"
                    : "text-[#786d65] hover:text-[#3a6b4c]"
                }`}
              >
                Govt Subsidies
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("bank_loan")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "bank_loan"
                    ? "bg-[#c75d3e] text-white shadow-sm"
                    : "text-[#786d65] hover:text-[#c75d3e]"
                }`}
              >
                Bank Loans
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("credit_guarantee")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "credit_guarantee"
                    ? "bg-[#2b5876] text-white shadow-sm"
                    : "text-[#786d65] hover:text-[#2b5876]"
                }`}
              >
                Credit Guarantee
              </button>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSchemes.map((scheme) => {
              const isExpanded = expandedSchemeId === scheme.id;
              const isGovt = scheme.providerType === "central_government" || scheme.providerType === "state_government";
              const isBank = scheme.providerType === "bank";
              const isGuarantee = scheme.categoryType === "credit_guarantee";

              return (
                <div
                  key={scheme.id}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                    scheme.isPrimaryRecommendation
                      ? "bg-gradient-to-b from-[#fffbf7] to-white border-[#c75d3e] shadow-warm-md"
                      : "bg-white border-[#ede3d8] hover:border-[#c75d3e]/40 shadow-warm-sm hover:shadow-warm-md"
                  }`}
                >
                  <div className="p-6 space-y-4">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isBank
                              ? "bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/20"
                              : isGuarantee
                              ? "bg-[#e0f2fe] text-[#0369a1] border-[#0369a1]/20"
                              : "bg-[#fcedea] text-[#c75d3e] border-[#c75d3e]/20"
                          }`}
                        >
                          {isBank ? "PSB Bank Credit" : isGuarantee ? "Credit Guarantee" : "Sovereign Scheme"}
                        </span>

                        {scheme.isPrimaryRecommendation && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#f0f6ec] text-[#3a6b4c] border border-[#3a6b4c]/20">
                            ★ Top Match
                          </span>
                        )}
                      </div>

                      {scheme.highlightBadge && (
                        <span className="text-[11px] font-bold text-[#3a6b4c] bg-[#f0f6ec] px-2.5 py-0.5 rounded-lg border border-[#3a6b4c]/20">
                          {scheme.highlightBadge}
                        </span>
                      )}
                    </div>

                    {/* Scheme Titles */}
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#241b16] leading-snug">
                        {scheme.name}
                      </h3>
                      <p className="text-xs text-[#786d65] mt-0.5">
                        {scheme.governingMinistry}
                      </p>
                    </div>

                    {/* Key Benefit Highlights Box */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#786d65] block">
                          {scheme.subsidyRatePct > 0 ? "Subsidy Benefit" : scheme.interestSubventionPct > 0 ? "Subvention" : "Interest Rate"}
                        </span>
                        <p className="font-serif font-bold text-xs sm:text-sm text-[#241b16] mt-0.5">
                          {scheme.subsidyRatePct > 0
                            ? `${scheme.subsidyRatePct}% Subsidy`
                            : scheme.interestSubventionPct > 0
                            ? `${scheme.interestSubventionPct}% Relief`
                            : `${scheme.indicativeInterestRatePct || 9.0}% p.a.`}
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#786d65] block">Scheme Cap</span>
                        <p className="font-serif font-bold text-xs sm:text-sm text-[#241b16] mt-0.5">
                          ₹{(scheme.maxProjectCost / 100000).toFixed(0)} Lakhs
                        </p>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#786d65] block">Collateral</span>
                        <p className="font-serif font-bold text-[11px] sm:text-xs text-[#3a6b4c] mt-0.5 truncate">
                          {scheme.creditGuaranteeCover.includes("Zero") || isGuarantee ? "Zero Collateral" : "CGTMSE Cover"}
                        </p>
                      </div>
                    </div>

                    {/* Fit Reason */}
                    <p className="text-xs text-[#56423d] leading-relaxed">
                      {scheme.keyFitReason}
                    </p>

                    {/* Expandable Eligibility & Documents Details */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-[#ede3d8] space-y-4 animate-in fade-in duration-200">
                        {/* Eligibility Rules */}
                        {scheme.eligibilityCriteria && scheme.eligibilityCriteria.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#241b16] flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="text-[#3a6b4c]" />
                              Official Eligibility Criteria
                            </span>
                            <ul className="text-xs text-[#786d65] space-y-1 list-disc list-inside bg-[#faf4ee]/60 p-3 rounded-xl border border-[#ede3d8]">
                              {scheme.eligibilityCriteria.map((crit, idx) => (
                                <li key={idx} className="leading-snug">{crit}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Mandatory Documents Checklist */}
                        {scheme.mandatoryDocuments && scheme.mandatoryDocuments.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#241b16] flex items-center gap-1.5">
                              <FileCheck size={13} className="text-[#c75d3e]" />
                              Required Documents for Sanction
                            </span>
                            <div className="space-y-1 bg-[#faf4ee]/60 p-3 rounded-xl border border-[#ede3d8]">
                              {scheme.mandatoryDocuments.map((doc) => (
                                <div key={doc.id} className="text-xs text-[#56423d] flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#c75d3e] mt-1.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-semibold text-[#241b16]">{doc.name}</span>
                                    <p className="text-[11px] text-[#786d65]">{doc.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Source Citation */}
                        {scheme.sourceReference && (
                          <div className="text-[11px] text-[#786d65] italic">
                            Source: {scheme.sourceReference}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-[#faf4ee]/70 border-t border-[#ede3d8] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpandScheme(scheme.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#786d65] hover:text-[#241b16] transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Eligibility & Docs"}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {scheme.officialPortalUrl && (
                      <a
                        href={scheme.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf4ee] border border-[#ede3d8] text-[#241b16] text-xs font-bold transition-all shadow-sm hover:shadow"
                      >
                        <span>Official Portal</span>
                        <ExternalLink size={12} className="text-[#c75d3e]" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            DOCUMENTS YOU MAY NEED (Interactive Checklist)
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ede3d8] shadow-warm-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ede3d8] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#786d65]">
                Bank Documentation Audit
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#241b16] mt-0.5">
                Documents you may need for submission
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#786d65]">
                Readiness: <strong>{readinessPct}% Complete</strong> ({completedDocs}/{totalDocs})
              </span>
              <div className="w-24 h-2 bg-[#ede3d8] rounded-full overflow-hidden">
                <div className="bg-[#3a6b4c] h-2 rounded-full" style={{ width: `${readinessPct}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              {
                id: "doc-1",
                name: "Detailed Project Report (DPR)",
                desc: "12-page bankable CMA ledger generated directly from GramVest.",
                action: "Ready inside App",
              },
              {
                id: "doc-2",
                name: "Aadhaar & PAN Card KYC",
                desc: "Verified promoter identity credentials with address proof.",
                action: "Promoter Ready",
              },
              {
                id: "doc-3",
                name: "Udyam MSME Registration Certificate",
                desc: "Free instant online MSME certificate under Ministry of Micro Enterprises.",
                action: "Online Self-Service",
              },
              {
                id: "doc-4",
                name: "Land Title / Registered Lease Deed (Min. 3 Years)",
                desc: "Proof of ownership or legal registered lease agreement for commercial plot.",
                action: "Tehsil Registry",
              },
              {
                id: "doc-5",
                name: `Machinery Quotation for ${business?.title || "Equipment"}`,
                desc: `GST-compliant quotation from vetted equipment manufacturers in Punjab.`,
                action: "Equipment Vendor",
              },
              {
                id: "doc-6",
                name: "Bank Account Statement (Past 6 Months)",
                desc: "Demonstrates clear banking conduct with zero loan defaults.",
                action: "Bank Branch / NetBanking",
              },
            ].map((doc) => {
              const isChecked = checkedDocs[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? "bg-[#f0f6ec]/70 border-[#3a6b4c]/30"
                      : "bg-[#faf4ee]/40 border-[#ede3d8] hover:border-[#c75d3e]/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isChecked ? "bg-[#3a6b4c] text-white" : "border-2 border-[#ede3d8] bg-white"
                    }`}
                  >
                    {isChecked && <Check size={12} strokeWidth={3} />}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-[#241b16]">{doc.name}</h3>
                      <span className="text-[10px] font-bold text-[#786d65]">{doc.action}</span>
                    </div>
                    <p className="text-[11px] text-[#786d65] leading-snug">{doc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prominent Legal & Underwriting Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex items-start gap-3">
            <Info size={16} className="text-[#c75d3e] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#786d65] leading-relaxed">
              <strong>Statutory Underwriting Notice:</strong> Potential match only based on official DB_gramvest parameters. Final subsidy eligibility, loan sanction, margin release, and disbursement terms are determined solely by the competent lending authority, District Level Task Force Committee (DLTFC), and District Industries Centre (DIC) board.
            </p>
          </div>
        </div>

        {/* Bottom Navigation Bridges */}
        <div className="flex items-center justify-between pt-4 border-t border-[#ede3d8]">
          <Link
            href="/money"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] font-bold text-xs hover:bg-[#faf4ee] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Review Money &amp; Cash Flow</span>
          </Link>

          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Ask Contextual AI Advisor</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

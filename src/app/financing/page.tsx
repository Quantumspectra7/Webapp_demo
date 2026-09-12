"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Building2,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  Lock,
  Landmark,
  BadgePercent,
  AlertCircle,
} from "lucide-react";

export default function FinancingPage() {
  const { profile, location, business } = useApp();

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

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ede3d8] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c75d3e] mb-1">
              <Coins size={16} />
              <span>Capital Route Matching · Actionable Fit</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              Which financing route fits me?
            </h1>
            <p className="text-sm text-[#786d65] mt-1">
              Targeted credit pathway matching your enterprise scale, capital structure, and rural location.
            </p>
          </div>

          <Link
            href="/advisor"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all self-start sm:self-auto transform hover:-translate-y-0.5"
          >
            <span>Consult AI Advisor</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* ========================================================
            RECOMMENDED ROUTE: TERM LOAN + 35% SOVEREIGN SUBSIDY
           ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#c75d3e] shadow-warm-md space-y-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fcedea] text-[#c75d3e] border border-[#c75d3e]/20">
                  Optimal Financing Match
                </span>
                <span className="text-xs text-[#786d65]">Rural Priority Lending</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
                Recommended Route: Rural Term Loan with PMEGP Margin Subsidy
              </h2>
              <p className="text-sm text-[#56423d] leading-relaxed">
                Structured term debt blended with a 35% non-repayable sovereign capital subsidy, pre-aligned to Public Sector Bank underwriting guidelines (SBI, PNB, Punjab Gramin Bank).
              </p>
            </div>

            {/* Grant Callout Card */}
            <div className="p-5 rounded-2xl bg-[#f0f6ec] border border-[#3a6b4c]/30 text-center min-w-[220px] flex-shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#3a6b4c] tracking-wider block">
                Eligible Capital Subsidy
              </span>
              <p className="text-3xl font-serif font-extrabold text-[#3a6b4c] mt-1 mb-0.5">
                35%
              </p>
              <p className="text-xs font-bold text-[#241b16]">₹3,50,000 to ₹4,90,000</p>
              <span className="text-[10px] text-[#786d65] block mt-1">Non-repayable KVIC margin money</span>
            </div>
          </div>

          {/* Why This Route (Project Size, Capital Structure, Business Category) */}
          <div className="space-y-3 pt-4 border-t border-[#ede3d8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65] block">
              Why this route was selected for your venture:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#241b16]">
                  <Building2 size={16} className="text-[#c75d3e]" />
                  <span>1. Project Size Fit</span>
                </div>
                <p className="text-xs text-[#56423d] leading-relaxed">
                  Your estimated ₹10,00,000 capex fits perfectly under PMEGP's ₹50 Lakhs manufacturing ceiling, eliminating complex corporate underwriting hurdles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#241b16]">
                  <BadgePercent size={16} className="text-[#3a6b4c]" />
                  <span>2. Capital Structure Fit</span>
                </div>
                <p className="text-xs text-[#56423d] leading-relaxed">
                  Your ₹1,00,000 own savings meets the mandatory 10% promoter equity threshold, unlocking 90% debt-and-subsidy financing with zero collateral up to ₹10L.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#241b16]">
                  <Landmark size={16} className="text-[#c75d3e]" />
                  <span>3. Business Category Fit</span>
                </div>
                <p className="text-xs text-[#56423d] leading-relaxed">
                  Dairy value addition &amp; rural food processing qualifies as Priority Sector Lending (PSL), ensuring preferential interest rates and quick branch signoff.
                </p>
              </div>
            </div>
          </div>

          {/* Indicative Financing Terms */}
          <div className="space-y-3 pt-4 border-t border-[#ede3d8]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65] block">
              Indicative Financing Terms:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Interest Rate</span>
                <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">8.5% – 9.5% p.a.</p>
                <p className="text-[10px] text-[#786d65]">Concessional PSL rate</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Loan Tenure</span>
                <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">60 Months (5 Yrs)</p>
                <p className="text-[10px] text-[#786d65]">Equated monthly installment</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Moratorium Grace</span>
                <p className="text-base font-serif font-bold text-[#3a6b4c] mt-0.5">6 Months</p>
                <p className="text-[10px] text-[#3a6b4c]">Zero principal during setup</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede3d8]">
                <span className="text-[10px] uppercase font-bold text-[#786d65] block">Collateral Security</span>
                <p className="text-base font-serif font-bold text-[#241b16] mt-0.5">CGTMSE Covered</p>
                <p className="text-[10px] text-[#786d65]">Zero third-party guarantee</p>
              </div>
            </div>
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
                name: "Machinery Quotation from Vetted OEM",
                desc: "GST-compliant quotation for 1,000L bulk milk chiller and lab testing set.",
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
              <strong>Statutory Underwriting Notice:</strong> Indicative only — final subsidy eligibility, loan sanction, and disbursement terms are determined solely by the competent lending authority (SBI/PNB branch manager) and District Industries Centre (DIC) board.
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

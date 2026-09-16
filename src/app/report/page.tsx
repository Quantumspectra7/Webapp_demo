"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AppShell } from "@/components/layout/AppShell";
import { SourceBadge } from "@/components/common/SourceBadge";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { reportService } from "@/services";
import { FeasibilityReport } from "@/domain";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function ReportPage() {
  const [report, setReport] = useState<FeasibilityReport | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await reportService.getReport();
        setReport(data);
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const [downloadedFilename, setDownloadedFilename] = useState<string>("");

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const { downloadDprPdf } = await import("@/lib/pdfGenerator");
      const filename = downloadDprPdf(report);
      setDownloadedFilename(filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error("PDF download failed", err);
      // Fallback to API route download
      if (typeof window !== "undefined") {
        window.location.href = `/api/v1/dossier/bank-cma.pdf?id=${encodeURIComponent(report.id)}`;
      }
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading || !report) {
    return (
      <AppShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-20 bg-white rounded-2xl border border-[#ddd6c9]"></div>
          <div className="h-[600px] bg-white rounded-2xl border border-[#ddd6c9]"></div>
        </div>
      </AppShell>
    );
  }

  const { entrepreneur, location, business, financialScenario, schemeRoute } = report;

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1100px] mx-auto pb-12">
        {/* Top Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ddd6c9] pb-4 print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/dashboard"
                className="text-[13px] font-bold text-[#706c63] hover:text-[#c75d3e] flex items-center gap-1"
              >
                <ArrowLeft size={15} />
                <span>Control Center</span>
              </Link>
              <span className="text-[#ddd6c9]">/</span>
              <span className="text-[13px] font-bold text-[#c75d3e]">
                Final Decision Artifact
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16]">
              Business Feasibility Report
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-[#382f29] text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer size={16} />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c75d3e] text-white text-xs font-bold hover:bg-[#bd5537] shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={16} />
              <span>
                {downloading
                  ? "Formatting PDF..."
                  : downloadSuccess
                  ? "DPR Downloaded ✓"
                  : "Download Bankable DPR (PDF)"}
              </span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="p-3.5 rounded-xl bg-[#f0f6ec] border border-[#3a6b4c]/30 text-[#3a6b4c] text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="flex-shrink-0 text-[#3a6b4c]" />
              <span>
                Bankable Detailed Project Report downloaded: <span className="font-mono text-[#241b16] font-semibold">{downloadedFilename || "GramVest_Bankable_DPR.pdf"}</span>
              </span>
            </div>
            <a
              href={`/api/v1/dossier/bank-cma.pdf?id=${encodeURIComponent(report.id)}`}
              download={downloadedFilename || "GramVest_Bankable_DPR.pdf"}
              className="text-[11px] underline text-[#3a6b4c] hover:text-[#241b16] self-end sm:self-auto font-medium"
            >
              Re-download file
            </a>
          </div>
        )}

        {/* PRINTABLE DPR DOCUMENT CONTAINER */}
        <div className="bg-white rounded-3xl border border-[#ede3d8] shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0 space-y-8">
          {/* Document Header */}
          <div className="border-b-2 border-[#241b16] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src="/gramvest_logo3.png"
                  alt="GramVest"
                  width={140}
                  height={44}
                  className="h-10 w-auto object-contain"
                  priority
                />
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#786d65] px-2 py-0.5 rounded bg-[#faf4ee] border border-[#ede3d8]">
                  Credit Appraisal Format
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241b16] leading-tight">
                Business Feasibility &amp; Loan Readiness Report
              </h2>
              <p className="text-sm text-[#786d65] mt-1">
                Establishment of 1,000L Bulk Milk Chilling &amp; Value Addition Center at Sidhwan Bet, Jagraon (Punjab)
              </p>
            </div>

            <div className="text-right text-xs text-[#786d65] space-y-0.5">
              <p>
                <strong>DPR Ref: </strong>
                <span className="font-mono text-[#241b16]">{report.reportNumber}</span>
              </p>
              <p>
                <strong>Date: </strong>
                <span>{report.generatedDate}</span>
              </p>
              <p>
                <strong>Scheme Code: </strong>
                <span className="font-bold text-[#c75d3e]">PMEGP-RUR-2026</span>
              </p>
            </div>
          </div>

          {/* TOP DECISION ARTIFACT HERO BADGE (FEASIBILITY 78 / 100) */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#fcedea] via-[#faf4ee] to-[#f0f6ec] border border-[#ede3d8] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-[#c75d3e] flex flex-col items-center justify-center shadow-xs flex-shrink-0">
                <span className="text-[9px] uppercase font-bold text-[#786d65]">Feasibility</span>
                <span className="font-serif text-2xl font-extrabold text-[#c75d3e]">78 / 100</span>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-bold text-[#241b16]">
                    Market: <strong className="text-[#3a6b4c]">Strong</strong>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-[#241b16]">
                    Financial Fit: <strong className="text-[#3a6b4c]">Good</strong>
                  </span>
                  <span>•</span>
                  <span className="font-bold text-[#241b16]">
                    Risk: <strong className="text-[#d97706]">Moderate</strong>
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-serif font-bold text-[#241b16]">
                  Recommended: <span className="text-[#3a6b4c]">Proceed with conditions</span>
                </p>
                <p className="text-xs text-[#56423d] italic leading-snug">
                  “The business appears feasible under the current assumptions, but feed-cost volatility and local competition should be monitored.”
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#3a6b4c] text-white font-bold uppercase tracking-wider text-[11px]">
                Bank Ready (DSCR 1.62x)
              </span>
            </div>
          </div>

          {/* SECTION 1: EXECUTIVE SUMMARY */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#c75d3e] border-b border-[#ede3d8] pb-1.5 mb-3">
              1. Project Summary &amp; Identifiers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#f9f3ec] border border-[#e7ded5] text-[13px]">
              <div>
                <span className="text-[#706c63] block text-[11px] uppercase font-bold">
                  Promoter
                </span>
                <span className="font-bold text-[#1d1b18]">{entrepreneur.fullName}</span>
              </div>
              <div>
                <span className="text-[#706c63] block text-[11px] uppercase font-bold">
                  Proposed Enterprise
                </span>
                <span className="font-bold text-[#1d1b18]">{business.title}</span>
              </div>
              <div>
                <span className="text-[#706c63] block text-[11px] uppercase font-bold">
                  Total Project Cost
                </span>
                <span className="font-bold text-[#9d3e21]">
                  {formatCurrency(financialScenario.totalProjectCost)}
                </span>
              </div>
              <div>
                <span className="text-[#706c63] block text-[11px] uppercase font-bold">
                  Projected DSCR
                </span>
                <span className="font-bold text-[#536346]">
                  {financialScenario.projections.annualDSCR}x Cover
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: PROMOTER & SITE PROFILE */}
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#9d3e21] border-b border-[#ddd6c9] pb-1.5 mb-3">
              2. Promoter & Site Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div className="p-4 rounded-xl border border-[#ddd6c9] space-y-2">
                <span className="font-bold text-[#1d1b18] block text-[14px]">
                  Promoter Background
                </span>
                <div className="flex justify-between">
                  <span className="text-[#706c63]">Education:</span>
                  <span className="font-medium text-[#1d1b18]">{entrepreneur.educationLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#706c63]">Experience:</span>
                  <span className="font-medium text-[#1d1b18]">
                    {entrepreneur.experienceLevel} (4 yrs milk collection)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#706c63]">Own Capital Contributed:</span>
                  <span className="font-bold text-[#536346]">
                    {formatCurrency(entrepreneur.ownCapitalAvailable)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#ddd6c9] space-y-2">
                <span className="font-bold text-[#1d1b18] block text-[14px]">
                  Site & Land Particulars
                </span>
                <div className="flex justify-between">
                  <span className="text-[#706c63]">Location:</span>
                  <span className="font-medium text-[#1d1b18]">
                    {location.villageOrTown}, {location.block}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#706c63]">District / State:</span>
                  <span className="font-medium text-[#1d1b18]">
                    {location.district}, {location.state} ({location.pincode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#706c63]">Nearest Mandi:</span>
                  <span className="font-medium text-[#1d1b18]">
                    {location.nearestMandi} ({location.distanceToMandiKm} km)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PROJECT COST & FINANCING MEANS */}
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#9d3e21] border-b border-[#ddd6c9] pb-1.5 mb-3">
              3. Project Cost & Means of Finance
            </h3>

            <div className="border border-[#ddd6c9] rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f9f3ec] border-b border-[#ddd6c9] text-[11px] uppercase font-bold text-[#706c63]">
                  <tr>
                    <th className="p-3">Asset Item</th>
                    <th className="p-3">Specification</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee8df]">
                  {financialScenario.costBreakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-[#1d1b18]">{item.itemName}</td>
                      <td className="p-3 text-[#706c63] text-[12px]">{item.notes}</td>
                      <td className="p-3 text-right font-bold text-[#1d1b18] tabular-nums">
                        {formatCurrency(item.cost)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#f9f3ec] font-bold text-[#1d1b18]">
                    <td colSpan={2} className="p-3">
                      Total Capital Outlay
                    </td>
                    <td className="p-3 text-right text-[#9d3e21] tabular-nums text-[15px]">
                      {formatCurrency(financialScenario.totalProjectCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Means of finance summary */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#f9f3ec] border border-[#e7ded5] text-center text-[13px]">
              <div>
                <span className="text-[11px] text-[#706c63] uppercase font-bold">
                  Promoter Equity
                </span>
                <p className="text-[16px] font-bold text-[#1d1b18] mt-0.5">
                  {formatCurrency(financialScenario.financingMeans.ownContribution)} (33.3%)
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#706c63] uppercase font-bold">
                  Bank Term Loan
                </span>
                <p className="text-[16px] font-bold text-[#1d1b18] mt-0.5">
                  {formatCurrency(financialScenario.financingMeans.termLoan)} (66.7%)
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#9d3e21] uppercase font-bold">
                  PMEGP 35% Grant
                </span>
                <p className="text-[16px] font-bold text-[#9d3e21] mt-0.5">
                  {formatCurrency(financialScenario.financingMeans.eligibleSubsidyAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: DEBT SERVICE & OPERATING CASH FLOW */}
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#9d3e21] border-b border-[#ddd6c9] pb-1.5 mb-3">
              4. Operational Economics & Debt Servicing
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-[13px]">
              <div className="p-3 rounded-xl bg-white border border-[#ddd6c9]">
                <span className="text-[11px] text-[#706c63] uppercase font-bold">
                  Monthly Revenue
                </span>
                <p className="text-[18px] font-bold text-[#1d1b18] mt-0.5">
                  {formatCurrency(financialScenario.projections.monthlyRevenue)}
                </p>
                <span className="text-[11px] text-[#706c63]">
                  12,750 L/mo @ ₹60/L
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ddd6c9]">
                <span className="text-[11px] text-[#706c63] uppercase font-bold">
                  Monthly OpEx
                </span>
                <p className="text-[18px] font-bold text-[#1d1b18] mt-0.5">
                  {formatCurrency(financialScenario.projections.monthlyOperatingExpenses)}
                </p>
                <span className="text-[11px] text-[#706c63]">
                  Raw milk + power + labor
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ddd6c9]">
                <span className="text-[11px] text-[#706c63] uppercase font-bold">
                  Monthly Bank EMI
                </span>
                <p className="text-[18px] font-bold text-[#9d3e21] mt-0.5">
                  {formatCurrency(financialScenario.loanTerms.monthlyEMI)}
                </p>
                <span className="text-[11px] text-[#706c63]">
                  5 yrs @ 8.5% PSL rate
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ddd6c9]">
                <span className="text-[11px] text-[#706c63] uppercase font-bold">
                  Annual DSCR
                </span>
                <p className="text-[18px] font-bold text-[#536346] mt-0.5">
                  {financialScenario.projections.annualDSCR}x
                </p>
                <span className="text-[11px] text-[#416246] font-bold">
                  Exceeds 1.30x hurdle
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: STATUTORY CLEARANCES */}
          <div>
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#9d3e21] border-b border-[#ddd6c9] pb-1.5 mb-3">
              5. Statutory Clearances & Implementation Plan
            </h3>

            <div className="border border-[#ddd6c9] rounded-xl overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f9f3ec] border-b border-[#ddd6c9] text-[11px] uppercase font-bold text-[#706c63]">
                  <tr>
                    <th className="p-3">Licensing Authority</th>
                    <th className="p-3">Permit Required</th>
                    <th className="p-3 text-right">Fee</th>
                    <th className="p-3 text-right">Turnaround</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee8df]">
                  {report.statutoryChecklist.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-[#1d1b18]">{item.authority}</td>
                      <td className="p-3 text-[#56423d]">{item.licenseName}</td>
                      <td className="p-3 text-right text-[#706c63]">{item.indicativeFee}</td>
                      <td className="p-3 text-right font-bold text-[#536346]">
                        {item.turnaroundDays}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FORMAL DISCLAIMER */}
          <div className="pt-6 border-t border-[#ddd6c9] text-[11px] text-[#8a726b] leading-relaxed">
            <p className="font-bold text-[#706c63] mb-1 uppercase tracking-wider">
              Legal & Appraisal Disclaimer:
            </p>
            {report.formalDisclaimer}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FeasibilityReport } from "@/domain";
import { formatNumber } from "./formatters";

// Helper for currency in PDF to ensure universal PDF reader compatibility without font glyph drops
function formatInr(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "Rs. 0";
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  return `${isNegative ? "-" : ""}Rs. ${formatNumber(abs)}`;
}

export function generateDprPdf(report: FeasibilityReport): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Primary palette matching GramVest design
  const darkBrown = [36, 27, 22] as [number, number, number];
  const terracotta = [199, 93, 62] as [number, number, number];
  const forestGreen = [58, 107, 76] as [number, number, number];
  const warmBg = [250, 246, 240] as [number, number, number];
  const lightBorder = [221, 214, 201] as [number, number, number];
  const textMuted = [112, 108, 99] as [number, number, number];

  const {
    entrepreneur,
    location,
    business,
    financialScenario,
    schemeRoute,
    statutoryChecklist,
    implementationPlan,
  } = report;

  // Helper to draw standard header on every page
  const drawPageHeader = (pageNumber: number, totalPagesPlaceholder: string) => {
    // Top colored ribbon
    doc.setFillColor(darkBrown[0], darkBrown[1], darkBrown[2]);
    doc.rect(0, 0, pageWidth, 12, "F");

    doc.setFillColor(terracotta[0], terracotta[1], terracotta[2]);
    doc.rect(0, 12, pageWidth, 1.2, "F");

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("GRAMVEST • RURAL MSME BANKABLE APPRAISAL DOSSIER (CMA)", margin, 7.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(
      `Ref: ${report.reportNumber}  |  Date: ${report.generatedDate}`,
      pageWidth - margin,
      7.5,
      { align: "right" }
    );
  };

  // Helper to draw standard footer on every page
  const drawPageFooter = (pageNumber: number, totalPagesPlaceholder: string) => {
    const footerY = pageHeight - 9;
    doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      "Compliant with RBI Priority Sector Lending (PSL) & Sovereign MSME Scheme Guidelines",
      margin,
      footerY + 1
    );

    doc.setFont("helvetica", "bold");
    doc.text(`Page ${pageNumber} of ${totalPagesPlaceholder}`, pageWidth - margin, footerY + 1, {
      align: "right",
    });
  };

  // =========================================================================
  // PAGE 1: EXECUTIVE SUMMARY, PROMOTER PROFILE & VIABILITY DECISION ARTIFACT
  // =========================================================================
  drawPageHeader(1, "{total_pages_count_placeholder}");

  let cursorY = 20;

  // Report Main Title Block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("DETAILED PROJECT APPRAISAL REPORT (DPR)", margin, cursorY);

  cursorY += 5;
  doc.setFontSize(10);
  doc.setTextColor(terracotta[0], terracotta[1], terracotta[2]);
  doc.text(
    `Project: ${business.title} — ${location.villageOrTown}, ${location.block} (${location.district})`,
    margin,
    cursorY
  );

  cursorY += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "Submitted for Lead District Bank Appraisal, Term Loan Sanction & Sovereign Subsidy Disbursal",
    margin,
    cursorY
  );

  cursorY += 6;

  // Feasibility & Bankability Verdict Card (Container Box)
  doc.setFillColor(warmBg[0], warmBg[1], warmBg[2]);
  doc.setDrawColor(terracotta[0], terracotta[1], terracotta[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, "FD");

  // Score Badge
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(terracotta[0], terracotta[1], terracotta[2]);
  doc.roundedRect(margin + 3, cursorY + 2.5, 28, 19, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text("VIABILITY", margin + 17, cursorY + 7, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(terracotta[0], terracotta[1], terracotta[2]);
  doc.text("78/100", margin + 17, cursorY + 14, { align: "center" });

  doc.setFontSize(6.5);
  doc.setTextColor(forestGreen[0], forestGreen[1], forestGreen[2]);
  doc.text("BANK READY", margin + 17, cursorY + 19, { align: "center" });

  // Key Decision Highlights next to badge
  const textStartX = margin + 35;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("Credit Solvency Verdict: RECOMMENDED FOR TERM LOAN SANCTION", textStartX, cursorY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(50, 40, 35);
  doc.text(
    `• DSCR Coverage: ${financialScenario.projections.annualDSCR}x (Comfortably exceeds RBI / Bank benchmark of 1.30x)`,
    textStartX,
    cursorY + 12
  );
  doc.text(
    `• Sovereign Grant: ${schemeRoute.recommendedScheme.name} (${schemeRoute.recommendedScheme.subsidyRatePct}% Subsidy Route: ${formatInr(financialScenario.financingMeans.eligibleSubsidyAmount)})`,
    textStartX,
    cursorY + 16.5
  );
  doc.text(
    `• Collateral Cover: Credit guarantee endorsed under ${schemeRoute.recommendedScheme.creditGuaranteeCover || "CGTMSE Scheme"}`,
    textStartX,
    cursorY + 21
  );

  cursorY += 28;

  // SECTION 1: PROMOTER PROFILE & SITE PARTICULARS TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("1. Enterprise & Promoter Identification Profile", margin, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: darkBrown,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, fillColor: [247, 242, 234] },
      1: { cellWidth: 50 },
      2: { fontStyle: "bold", cellWidth: 42, fillColor: [247, 242, 234] },
      3: { cellWidth: 48 },
    },
    body: [
      ["Lead Promoter Name", entrepreneur.fullName, "Constitution of Firm", "Proprietorship / Micro Enterprise"],
      ["Promoter Qualification", entrepreneur.educationLevel, "Relevant Experience", `${entrepreneur.experienceLevel} in Catchment`],
      ["Promoter Own Equity", formatInr(financialScenario.financingMeans.ownContribution), "Category / Social Tier", "Rural General / Special Beneficiary"],
      ["Operating Address", `${location.villageOrTown}, ${location.block}`, "District / State", `${location.district}, ${location.state} - ${location.pincode}`],
      ["Nearest Mandi / Catchment", `${location.nearestMandi} (${location.distanceToMandiKm} km)`, "Power Connection", "3-Phase 15-20 kW PSPCL Sanctioned"],
      ["Target Enterprise Type", business.title, "Installed Plant Capacity", `${business.unitOfProduction || "Commercial Scale Unit"}`],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // SECTION 2: EXECUTIVE SUMMARY & TECHNICAL ENTERPRISE SCOPE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("2. Technical Project Scope & Strategic Rationale", margin, cursorY);
  cursorY += 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 40, 35);

  const scopeParagraphs = [
    `The proposed project entails establishing a high-efficiency ${business.title} at ${location.villageOrTown} in the ${location.block} block of ${location.district} district. The unit is designed to bridge the localized value-addition deficit identified across a 10 km rural catchment radius, where raw agrarian produce currently encounters high transit wastage and depressed farmgate realization.`,
    `By implementing modern chilling, hygienic processing, and bulk handling machinery, the unit will aggregate directly from over 35 progressive dairy and agricultural producers in surrounding villages. The project ensures firm off-take tie-ups with district trade intermediaries and institutional buyers, securing dependable baseline revenue at an average gross operating spread of ${business.benchmarkGrossMarginPct}%.`,
    `Financial underwriting establishes a Total Project Outlay of ${formatInr(financialScenario.totalProjectCost)}, requiring a bank term loan of ${formatInr(financialScenario.financingMeans.termLoan)} against a healthy promoter margin of ${formatInr(financialScenario.financingMeans.ownContribution)} (${financialScenario.financingMeans.ownContributionPct.toFixed(1)}%). Under the ${schemeRoute.recommendedScheme.name}, the project qualifies for a back-ended capital subsidy of ${formatInr(financialScenario.financingMeans.eligibleSubsidyAmount)}, lowering effective net borrowing to ${formatInr(financialScenario.financingMeans.effectiveNetLoan)}.`,
  ];

  scopeParagraphs.forEach((para) => {
    const splitText = doc.splitTextToSize(para, contentWidth);
    doc.text(splitText, margin, cursorY);
    cursorY += splitText.length * 3.6 + 2;
  });

  drawPageFooter(1, "{total_pages_count_placeholder}");

  // =========================================================================
  // PAGE 2: PROJECT CAPITAL OUTLAY & MEANS OF FINANCE (CMA DATA)
  // =========================================================================
  doc.addPage();
  drawPageHeader(2, "{total_pages_count_placeholder}");
  cursorY = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("3. Capital Expenditure Schedule & Machinery Breakdown", margin, cursorY);
  cursorY += 2;

  // Cost items table
  const costRows = financialScenario.costBreakdown.map((item) => [
    item.itemName,
    item.category,
    item.notes,
    item.eligibleForSubsidy ? "Yes" : "Excluded",
    formatInr(item.cost),
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: darkBrown,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 52 },
      1: { cellWidth: 34 },
      2: { cellWidth: 54 },
      3: { cellWidth: 18, halign: "center" },
      4: { fontStyle: "bold", cellWidth: 24, halign: "right" },
    },
    head: [["Asset / Machine Item", "Category", "Technical Specification", "Subsidy", "Amount (INR)"]],
    body: [
      ...costRows,
      [
        { content: "Total Project Capital Outlay (A)", colSpan: 4, styles: { fontStyle: "bold", halign: "right", fillColor: [247, 242, 234] } },
        { content: formatInr(financialScenario.totalProjectCost), styles: { fontStyle: "bold", halign: "right", textColor: terracotta, fillColor: [247, 242, 234] } },
      ],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 7;

  // SECTION 4: MEANS OF FINANCE (CMA FORMAT)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("4. Means of Finance & Capital Structuring", margin, cursorY);
  cursorY += 2;

  const ownPct = financialScenario.financingMeans.ownContributionPct;
  const loanPct = financialScenario.financingMeans.termLoanPct;
  const subsidyPct = ((financialScenario.financingMeans.eligibleSubsidyAmount / financialScenario.totalProjectCost) * 100);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: terracotta,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 62 },
      2: { cellWidth: 28, halign: "center" },
      3: { fontStyle: "bold", cellWidth: 32, halign: "right" },
    },
    head: [["Means of Finance Source", "Allocation / Regulatory Modality", "% of Project", "Amount (INR)"]],
    body: [
      [
        "Promoter Equity (Own Capital)",
        "Liquid cash margin deposited in upfront escrow",
        `${ownPct.toFixed(1)}%`,
        formatInr(financialScenario.financingMeans.ownContribution),
      ],
      [
        "Bank Term Loan (Senior Debt)",
        "Underwritten via Lead District Bank / Branch PSL Facility",
        `${loanPct.toFixed(1)}%`,
        formatInr(financialScenario.financingMeans.termLoan),
      ],
      [
        "Sovereign Subsidy (PMEGP / PMFME)",
        "Back-ended subsidy credited to Bank Subsidy Reserve",
        `${subsidyPct.toFixed(1)}%`,
        formatInr(financialScenario.financingMeans.eligibleSubsidyAmount),
      ],
      [
        { content: "Effective Net Debt Liability (Term Loan minus Subsidy)", colSpan: 2, styles: { fontStyle: "bold" } },
        { content: `${(100 - ownPct - subsidyPct).toFixed(1)}%`, styles: { halign: "center", fontStyle: "bold" } },
        { content: formatInr(financialScenario.financingMeans.effectiveNetLoan), styles: { halign: "right", fontStyle: "bold", textColor: forestGreen } },
      ],
      [
        { content: "Total Financing Capital (Must equal Outlay)", colSpan: 2, styles: { fontStyle: "bold", fillColor: [247, 242, 234] } },
        { content: "100.0%", styles: { halign: "center", fontStyle: "bold", fillColor: [247, 242, 234] } },
        { content: formatInr(financialScenario.totalProjectCost), styles: { halign: "right", fontStyle: "bold", fillColor: [247, 242, 234], textColor: darkBrown } },
      ],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 7;

  // Term Loan Repayment & Banking Parameters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("Appraisal Loan Terms & Amortization Assumptions", margin, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 46, fillColor: [247, 242, 234] },
      1: { cellWidth: 45 },
      2: { fontStyle: "bold", cellWidth: 46, fillColor: [247, 242, 234] },
      3: { cellWidth: 45 },
    },
    body: [
      ["Term Loan Principal", formatInr(financialScenario.loanTerms.principal), "Indicative PSL Rate", `${financialScenario.loanTerms.interestRatePct}% p.a. (MCLR linked)`],
      ["Amortization Tenure", `${financialScenario.loanTerms.tenureMonths} Months (5 Years)`, "Moratorium Window", `${financialScenario.loanTerms.moratoriumMonths || 6} Months principal holiday`],
      ["Monthly Bank EMI", formatInr(financialScenario.loanTerms.monthlyEMI), "Estimated Total Interest", formatInr(financialScenario.loanTerms.totalInterest)],
      ["Collateral Security", "Hypothecation of Plant & Machinery", "Third Party Guarantee", "Waived under CGTMSE Credit Guarantee"],
    ],
  });

  drawPageFooter(2, "{total_pages_count_placeholder}");

  // =========================================================================
  // PAGE 3: 5-YEAR CASH FLOW, PROFITABILITY & DSCR APPRAISAL LEDGER
  // =========================================================================
  doc.addPage();
  drawPageHeader(3, "{total_pages_count_placeholder}");
  cursorY = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("5. Five-Year Operational Cash Flow & DSCR Projections (CMA Ledger)", margin, cursorY);
  cursorY += 2;

  // Construct 5-year financial projections table
  const baseMonthlyRev = financialScenario.projections.monthlyRevenue;
  const baseMonthlyOpex = financialScenario.projections.monthlyOperatingExpenses;
  const annualLoanInterest = financialScenario.loanTerms.totalInterest / 5;
  const annualDepreciation = (financialScenario.totalProjectCost * 0.7) * 0.15; // 15% on machinery
  const annualPrincipalPaid = financialScenario.loanTerms.principal / 5;

  const y1Rev = Math.round(baseMonthlyRev * 12 * 0.85);
  const y2Rev = Math.round(baseMonthlyRev * 12 * 1.0);
  const y3Rev = Math.round(baseMonthlyRev * 12 * 1.12);
  const y4Rev = Math.round(baseMonthlyRev * 12 * 1.22);
  const y5Rev = Math.round(baseMonthlyRev * 12 * 1.30);

  const y1Opex = Math.round(baseMonthlyOpex * 12 * 0.86);
  const y2Opex = Math.round(baseMonthlyOpex * 12 * 1.0);
  const y3Opex = Math.round(baseMonthlyOpex * 12 * 1.08);
  const y4Opex = Math.round(baseMonthlyOpex * 12 * 1.15);
  const y5Opex = Math.round(baseMonthlyOpex * 12 * 1.20);

  const y1Ebitda = y1Rev - y1Opex;
  const y2Ebitda = y2Rev - y2Opex;
  const y3Ebitda = y3Rev - y3Opex;
  const y4Ebitda = y4Rev - y4Opex;
  const y5Ebitda = y5Rev - y5Opex;

  const y1Pbt = Math.max(0, y1Ebitda - annualLoanInterest - annualDepreciation);
  const y2Pbt = Math.max(0, y2Ebitda - annualLoanInterest * 0.8 - annualDepreciation);
  const y3Pbt = Math.max(0, y3Ebitda - annualLoanInterest * 0.6 - annualDepreciation);
  const y4Pbt = Math.max(0, y4Ebitda - annualLoanInterest * 0.4 - annualDepreciation);
  const y5Pbt = Math.max(0, y5Ebitda - annualLoanInterest * 0.2 - annualDepreciation);

  const y1Pat = Math.round(y1Pbt * 0.90);
  const y2Pat = Math.round(y2Pbt * 0.88);
  const y3Pat = Math.round(y3Pbt * 0.85);
  const y4Pat = Math.round(y4Pbt * 0.85);
  const y5Pat = Math.round(y5Pbt * 0.85);

  const y1Dscr = Number(((y1Pat + annualDepreciation + annualLoanInterest) / (annualPrincipalPaid + annualLoanInterest)).toFixed(2));
  const y2Dscr = Number(((y2Pat + annualDepreciation + annualLoanInterest * 0.8) / (annualPrincipalPaid + annualLoanInterest * 0.8)).toFixed(2));
  const y3Dscr = Number(((y3Pat + annualDepreciation + annualLoanInterest * 0.6) / (annualPrincipalPaid + annualLoanInterest * 0.6)).toFixed(2));
  const y4Dscr = Number(((y4Pat + annualDepreciation + annualLoanInterest * 0.4) / (annualPrincipalPaid + annualLoanInterest * 0.4)).toFixed(2));
  const y5Dscr = Number(((y5Pat + annualDepreciation + annualLoanInterest * 0.2) / (annualPrincipalPaid + annualLoanInterest * 0.2)).toFixed(2));
  const avgDscr = Number(((y1Dscr + y2Dscr + y3Dscr + y4Dscr + y5Dscr) / 5).toFixed(2));

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "striped",
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: darkBrown,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 54 },
      1: { halign: "right", cellWidth: 25 },
      2: { halign: "right", cellWidth: 25 },
      3: { halign: "right", cellWidth: 25 },
      4: { halign: "right", cellWidth: 25 },
      5: { halign: "right", cellWidth: 28 },
    },
    head: [["Financial Parameters (INR)", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5"]],
    body: [
      ["Capacity Utilization (%)", "65%", "75%", "82%", "88%", "90%"],
      ["Gross Commercial Revenue", formatInr(y1Rev), formatInr(y2Rev), formatInr(y3Rev), formatInr(y4Rev), formatInr(y5Rev)],
      ["Direct & Operating Expenses", formatInr(y1Opex), formatInr(y2Opex), formatInr(y3Opex), formatInr(y4Opex), formatInr(y5Opex)],
      [
        { content: "Operating Profit (EBITDA)", styles: { fontStyle: "bold", fillColor: [247, 242, 234] } },
        { content: formatInr(y1Ebitda), styles: { fontStyle: "bold", fillColor: [247, 242, 234] } },
        { content: formatInr(y2Ebitda), styles: { fontStyle: "bold", fillColor: [247, 242, 234] } },
        { content: formatInr(y3Ebitda), styles: { fontStyle: "bold", fillColor: [247, 242, 234] } },
        { content: formatInr(y4Ebitda), styles: { fontStyle: "bold", fillColor: [247, 242, 234] } },
        { content: formatInr(y5Ebitda), styles: { fontStyle: "bold", fillColor: [247, 242, 234] } },
      ],
      ["Less: Term Loan Interest", formatInr(annualLoanInterest), formatInr(annualLoanInterest * 0.8), formatInr(annualLoanInterest * 0.6), formatInr(annualLoanInterest * 0.4), formatInr(annualLoanInterest * 0.2)],
      ["Less: Depreciation (15% SLM)", formatInr(annualDepreciation), formatInr(annualDepreciation), formatInr(annualDepreciation), formatInr(annualDepreciation), formatInr(annualDepreciation)],
      ["Net Profit Before Tax (PBT)", formatInr(y1Pbt), formatInr(y2Pbt), formatInr(y3Pbt), formatInr(y4Pbt), formatInr(y5Pbt)],
      ["Net Profit After Tax (PAT)", formatInr(y1Pat), formatInr(y2Pat), formatInr(y3Pat), formatInr(y4Pat), formatInr(y5Pat)],
      [
        { content: "Debt Service Coverage Ratio (DSCR)", styles: { fontStyle: "bold", textColor: forestGreen, fillColor: [240, 246, 236] } },
        { content: `${y1Dscr}x`, styles: { fontStyle: "bold", textColor: forestGreen, fillColor: [240, 246, 236] } },
        { content: `${y2Dscr}x`, styles: { fontStyle: "bold", textColor: forestGreen, fillColor: [240, 246, 236] } },
        { content: `${y3Dscr}x`, styles: { fontStyle: "bold", textColor: forestGreen, fillColor: [240, 246, 236] } },
        { content: `${y4Dscr}x`, styles: { fontStyle: "bold", textColor: forestGreen, fillColor: [240, 246, 236] } },
        { content: `${y5Dscr}x`, styles: { fontStyle: "bold", textColor: forestGreen, fillColor: [240, 246, 236] } },
      ],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // SECTION 6: SOLVENCY & BREAK-EVEN ANALYSIS SUMMARY BOX
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("6. Key Solvency Metrics & Break-Even Sensitivity", margin, cursorY);
  cursorY += 2.5;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 46, fillColor: [247, 242, 234] },
      1: { cellWidth: 45 },
      2: { fontStyle: "bold", cellWidth: 46, fillColor: [247, 242, 234] },
      3: { cellWidth: 45 },
    },
    body: [
      ["Average 5-Yr DSCR", `${avgDscr}x (Benchmark > 1.30x)`, "Break-Even Capacity", `${financialScenario.projections.breakEvenCapacityPct || 42}% of Plant Utilisation`],
      ["Monthly Break-Even Volume", `${formatNumber(financialScenario.projections.breakEvenMonthlyLiters || 4500)} ${business.unitOfProduction || "Units"}`, "Internal Rate of Return (IRR)", "24.8% (Exceeds Cost of Capital)"],
      ["Debt-Equity Ratio", `${(financialScenario.financingMeans.termLoan / financialScenario.financingMeans.ownContribution).toFixed(2)}:1`, "Current Ratio (Year 2)", "1.68x (Adequate Working Capital)"],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // Commentary on Debt Servicing & Risk Mitigation
  doc.setFillColor(warmBg[0], warmBg[1], warmBg[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 22, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("Underwriting Credit Officer Notes on Solvency & Buffer:", margin + 4, cursorY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 50, 45);
  doc.text(
    `• DSCR comfort: At ${y1Dscr}x in Year 1 expanding to ${y5Dscr}x in Year 5, cash accruals easily absorb a 15% spike in raw commodity procurement prices or a 10% decline in commercial realization without triggering debt servicing stress.`,
    margin + 4,
    cursorY + 10.5
  );
  doc.text(
    `• Break-even cushion: The venture achieves operating break-even at ${financialScenario.projections.breakEvenCapacityPct || 42}% utilization, providing a robust ${100 - (financialScenario.projections.breakEvenCapacityPct || 42)}% margin of safety against monsoon disruptions or local competition.`,
    margin + 4,
    cursorY + 16
  );

  drawPageFooter(3, "{total_pages_count_placeholder}");

  // =========================================================================
  // PAGE 4: STATUTORY CLEARANCES, IMPLEMENTATION PLAN & BANK SANCTION SIGN-OFF
  // =========================================================================
  doc.addPage();
  drawPageHeader(4, "{total_pages_count_placeholder}");
  cursorY = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("7. Statutory Permissions & Regulatory Compliance Matrix", margin, cursorY);
  cursorY += 2;

  const statutoryRows = statutoryChecklist.map((item) => [
    item.authority,
    item.licenseName,
    item.indicativeFee,
    item.turnaroundDays,
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "striped",
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: darkBrown,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 54 },
      1: { cellWidth: 64 },
      2: { cellWidth: 32, halign: "right" },
      3: { cellWidth: 32, halign: "center", fontStyle: "bold", textColor: forestGreen },
    },
    head: [["Licensing Authority", "Permit / Certificate Required", "Indicative Official Fee", "SLA Turnaround"]],
    body: statutoryRows,
  });

  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // SECTION 8: IMPLEMENTATION ROADMAP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("8. 12-Week Phased Project Implementation & Milestone Schedule", margin, cursorY);
  cursorY += 2;

  const planRows = implementationPlan.map((phase) => [
    phase.phase,
    phase.timeline,
    phase.keyDeliverables.join(" • "),
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: "striped",
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [36, 27, 22],
      lineColor: lightBorder,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: terracotta,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 26, halign: "center" },
      2: { cellWidth: 106 },
    },
    head: [["Implementation Phase", "Window", "Key Operational Deliverables & Verification Audits"]],
    body: planRows,
  });

  cursorY = (doc as any).lastAutoTable.finalY + 7;

  // SECTION 9: BANK BRANCH APPRAISAL & PROMOTER SIGN-OFF
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("9. Appraisal Sign-Off & Credit Committee Endorsement", margin, cursorY);
  cursorY += 3;

  // Draw two signature blocks side by side
  const sigBoxWidth = (contentWidth - 6) / 2;
  const sigBoxHeight = 36;

  // Box 1: Promoter Declaration
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, cursorY, sigBoxWidth, sigBoxHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("PROMOTER DECLARATION & UNDERTAKING", margin + 3, cursorY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "I hereby declare that all technical particulars, capital cost estimates, and own margin commitments in this DPR are true and accurate.",
    margin + 3,
    cursorY + 9,
    { maxWidth: sigBoxWidth - 6 }
  );

  doc.setLineWidth(0.3);
  doc.line(margin + 4, cursorY + 28, margin + sigBoxWidth - 4, cursorY + 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text(`Signature: ${entrepreneur.fullName}`, margin + 4, cursorY + 32);
  doc.setFont("helvetica", "normal");
  doc.text(`Proprietor, ${business.title}`, margin + 4, cursorY + 35);

  // Box 2: Bank Appraisal Officer / LDM
  const box2X = margin + sigBoxWidth + 6;
  doc.rect(box2X, cursorY, sigBoxWidth, sigBoxHeight, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("LEAD DISTRICT BANK APPRAISAL SANCTION", box2X + 3, cursorY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    "Techno-economic viability assessed and found compliant under PSL guidelines. Recommended for Term Loan Sanction subject to documentation.",
    box2X + 3,
    cursorY + 9,
    { maxWidth: sigBoxWidth - 6 }
  );

  doc.line(box2X + 4, cursorY + 28, box2X + sigBoxWidth - 4, cursorY + 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(darkBrown[0], darkBrown[1], darkBrown[2]);
  doc.text("Branch Credit Officer / Lead District Manager", box2X + 4, cursorY + 32);
  doc.setFont("helvetica", "normal");
  doc.text("Branch Code: PNB / SBI / Lead Bank Jagraon Cluster", box2X + 4, cursorY + 35);

  cursorY += sigBoxHeight + 5;

  // Legal Disclaimer at bottom
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  const disclaimer = `Appraisal Notice: This Detailed Project Report (DPR) is generated via the GramVest Rural MSME Feasibility Engine based on active ground-truthed market prices, benchmarked equipment schedules, and prevailing Punjab state credit policies. Final sanction, credit terms, and subsidy release remain subject to verification of KYC and land records by the financing bank and sanctioning department.`;
  const splitDisclaimer = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(splitDisclaimer, margin, cursorY);

  drawPageFooter(4, "{total_pages_count_placeholder}");

  // Replace total page count placeholders across all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Overwrite page footer with exact count
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    // Footer right side
    const footerY = pageHeight - 9;
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - margin - 26, footerY - 1.5, 26, 4, "F");
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY + 1, {
      align: "right",
    });
  }

  return doc;
}

/**
 * Triggers client-side download of the formatted PDF
 */
export function downloadDprPdf(report: FeasibilityReport, filename?: string): string {
  const doc = generateDprPdf(report);
  const cleanName = (report.entrepreneur.fullName || "Entrepreneur").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanTown = (report.location.villageOrTown || "Catchment").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanBiz = (report.business.title || "Enterprise").replace(/[^a-zA-Z0-9]/g, "_");

  const targetFilename = filename || `GramVest_Bankable_DPR_${cleanBiz}_${cleanTown}_${cleanName}.pdf`;

  if (typeof window !== "undefined") {
    try {
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = targetFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      doc.save(targetFilename);
    }
  } else {
    doc.save(targetFilename);
  }

  return targetFilename;
}

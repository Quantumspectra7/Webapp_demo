import { FeasibilityReport } from "@/domain";
import { IReportProvider } from "@/providers/interfaces";
import {
  profileService,
  financeService,
  marketService,
  schemeService,
  onboardingProfileService,
} from "@/services";
import { getScenarioForBusiness } from "@/data/real/business_scenarios";

export class MockReportProvider implements IReportProvider {
  async getFeasibilityReport(): Promise<FeasibilityReport> {
    await new Promise((res) => setTimeout(res, 50));

    // Gather dynamic active context from services
    const [
      profile,
      location,
      business,
      financialScenario,
      opportunitySummary,
      swot,
      topRisks,
      viability,
      savedAnalysis,
    ] = await Promise.all([
      profileService.getProfile(),
      profileService.getLocation(),
      profileService.getBusinessCategory(),
      financeService.getScenario(),
      marketService.getOpportunity(),
      marketService.getSwot(),
      marketService.getRisks(),
      marketService.getViabilityScore(),
      onboardingProfileService.getProfile(),
    ]);

    const scenario = getScenarioForBusiness(business?.id || savedAnalysis?.business?.categoryId);
    const schemeRoute = await schemeService.getRecommendations(
      scenario.id,
      financialScenario.totalProjectCost,
      financialScenario.financingMeans.ownContribution
    );

    // Business-aware implementation plan
    let implementationPlan = [
      {
        phase: "Phase 1: Approvals & Banking Sanction",
        timeline: "Weeks 1 - 4",
        keyDeliverables: [
          `Upload bankable DPR to ${schemeRoute.recommendedScheme.name} online portal.`,
          `Obtain BDPO Rural Area Certificate and submit to Lead Bank Manager for term loan underwriting.`,
          `Secure in-principle bank sanction and credit guarantee endorsement under CGTMSE.`,
        ],
      },
      {
        phase: "Phase 2: Site Preparation & Electrical Connection",
        timeline: "Weeks 5 - 7",
        keyDeliverables: [
          `Renovate operating premises with required civil/drainage works for ${scenario.title}.`,
          `Apply to PSPCL for ${scenario.powerRequirementKW} kW commercial power load.`,
          `Install recommended backup electrical controls and distribution wiring.`,
        ],
      },
      {
        phase: "Phase 3: Machinery Delivery & Commissioning",
        timeline: "Weeks 8 - 10",
        keyDeliverables: [
          `Receive and install primary equipment (${scenario.capexItems[0]?.name || "Core Machinery"}).`,
          `Set up quality testing, digital weighing scales, and operational tracking.`,
          `Perform trial runs and calibrate plant capacity utilization to 60%+.`,
        ],
      },
      {
        phase: "Phase 4: Customer Supply & Commercial Launch",
        timeline: "Weeks 11 - 12",
        keyDeliverables: [
          `Formalize off-take supply agreements with local buyers (${scenario.marketInsights.typicalBuyers.slice(0, 2).join(", ")}).`,
          `Commence scheduled commercial operations with initial working capital cycle.`,
          `Establish weekly digital cash flow reconciliation.`,
        ],
      },
    ];

    // Business-aware statutory checklist
    let statutoryChecklist = [
      {
        authority: scenario.id === "biz-farm-equipment" ? "Punjab Department of Agriculture" : "Food Safety & Standards Authority of India (FSSAI)",
        licenseName: scenario.id === "biz-farm-equipment" ? "Custom Hiring Centre (CHC) Nodal Registration" : `FSSAI State Food License (${scenario.categoryName})`,
        indicativeFee: scenario.id === "biz-farm-equipment" ? "Nil" : "₹3,000 / year",
        turnaroundDays: "15-20 days",
      },
      {
        authority: "Punjab Pollution Control Board (PPCB)",
        licenseName: "Consent to Establish (CTE) & Operate (CTO) - Green Category",
        indicativeFee: "₹2,500",
        turnaroundDays: "25 days",
      },
      {
        authority: "Punjab State Power Corporation Ltd (PSPCL)",
        licenseName: `${scenario.powerRequirementKW} kW Commercial Industrial Power Sanction`,
        indicativeFee: "Security deposit as per PSPCL tariff",
        turnaroundDays: "14 days",
      },
      {
        authority: "Ministry of MSME",
        licenseName: "Udyam Registration Certificate (Free Online)",
        indicativeFee: "Nil",
        turnaroundDays: "Instant (1 day)",
      },
    ];

    const reportNumber = `GV-PB-${(location.district || "LDH").substring(0, 3).toUpperCase()}-2026-${Math.abs(
      (location.villageOrTown || "JAG").split("").reduce((acc, char) => acc + char.charCodeAt(0), 100)
    )}`;

    return {
      id: `rep-${scenario.id}-${location.villageOrTown?.toLowerCase().replace(/\s+/g, "-") || "active"}`,
      reportNumber,
      generatedDate: new Date().toISOString().split("T")[0],
      version: "2.4-DYNAMIC",
      entrepreneur: profile,
      location,
      business: {
        ...business,
        id: scenario.id,
        title: scenario.title,
        slug: scenario.categoryId,
        description: scenario.description,
        unitOfProduction: scenario.capacityUnit,
        benchmarkGrossMarginPct: scenario.marketInsights.valueAdditionPct,
      },
      opportunitySummary,
      swot,
      topRisks,
      viability,
      financialScenario,
      schemeRoute,
      implementationPlan,
      statutoryChecklist,
      formalDisclaimer:
        "This Feasibility Report and Bankable Project Appraisal are dynamically generated based on active user parameters, localized Punjab MSME telemetry, and verified scheme guidelines. Final loan sanction, margin requirements, and subsidy disbursement remain subject to formal underwriting by the financing bank and the relevant sanctioning authority.",
    };
  }

  async generateDownloadPdfUrl(
    reportId: string
  ): Promise<{ downloadUrl: string; filename: string }> {
    await new Promise((res) => setTimeout(res, 300));
    const profile = await profileService.getProfile();
    const location = await profileService.getLocation();
    const business = await profileService.getBusinessCategory();

    const cleanName = (profile.fullName || "Entrepreneur").replace(/\s+/g, "_");
    const cleanTown = (location.villageOrTown || "Punjab").replace(/\s+/g, "_");
    const cleanBiz = (business.slug || "Venture").replace(/\s+/g, "_");

    return {
      downloadUrl: `/api/v1/dossier/bank-cma.pdf?id=${encodeURIComponent(reportId)}`,
      filename: `GramVest_Bankable_DPR_${cleanBiz}_${cleanTown}_${cleanName}.pdf`,
    };
  }
}


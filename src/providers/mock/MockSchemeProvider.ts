import { SchemeRouteRecommendation, Scheme } from "@/domain";
import { ISchemeProvider } from "@/providers/interfaces";
import { getScenarioForBusiness } from "@/data/real/business_scenarios";

export class MockSchemeProvider implements ISchemeProvider {
  private activeCategoryId: string = "biz-dairy-processing";

  public setActiveCategory(categoryId: string) {
    if (categoryId) {
      this.activeCategoryId = categoryId;
    }
  }

  async getRecommendedSchemes(
    categoryId?: string,
    projectCostOverride?: number,
    ownCapitalOverride?: number
  ): Promise<SchemeRouteRecommendation> {
    await new Promise((res) => setTimeout(res, 50));
    const targetCat = categoryId || this.activeCategoryId;
    const scenario = getScenarioForBusiness(targetCat);

    const projectCost = projectCostOverride || scenario.indicativeProjectCost;
    const ownCapital = ownCapitalOverride || scenario.ownContribution;

    // Build authentic schemes tailored to the business category
    let recommendedScheme: Scheme;
    let secondaryScheme: Scheme;

    if (scenario.id === "biz-farm-equipment") {
      const subsidyPct = 40;
      const maxSubsidy = 1000000;

      recommendedScheme = {
        id: "sch-smam",
        code: "PMEGP",
        name: "SMAM Custom Hiring Centre Capital Subsidy",
        fullName: "Sub-Mission on Agricultural Mechanization (SMAM)",
        governingMinistry: "Department of Agriculture & Farmers Welfare, Punjab",
        subsidyRatePct: subsidyPct,
        maxProjectCost: 2500000,
        maxSubsidyAmount: maxSubsidy,
        interestSubventionPct: 0,
        creditGuaranteeCover: "CGTMSE Collateral-Free Cover up to ₹2.0 Cr",
        keyFitReason: "Establishing a rural Custom Hiring Centre with Tractor, Super Seeder, and Laser Leveler qualifies for 40% capital investment subsidy.",
        eligibilityCriteria: [
          "Individual rural entrepreneur or FPO member with valid Punjab driving license",
          "Permanent resident of targeted rural block (priority for stubble management zones)",
          "Promoter equity of minimum 10% (₹" + Math.round(projectCost * 0.1).toLocaleString("en-IN") + ")",
          "Machine procurement strictly from approved OEMs registered on the Agricoop portal",
        ],
        mandatoryDocuments: [
          { id: "doc-smam-1", name: "GramVest Detailed Project Report (DPR)", requiredForSanction: true, description: "Technical viability & crop acreage schedule" },
          { id: "doc-smam-2", name: "Aadhaar & PAN Card KYC", requiredForSanction: true, description: "Applicant identity and age verification" },
          { id: "doc-smam-3", name: "Tractor Driving License", requiredForSanction: true, description: "Commercial/Heavy tractor driving endorsement" },
          { id: "doc-smam-4", name: "Land Holding / Shed Proof", requiredForSanction: false, description: "Panchayat NOC or ownership/lease deed for tractor parking" },
          { id: "doc-smam-5", name: "Approved OEM Proforma Invoices", requiredForSanction: true, description: "Itemized machinery quotations with valid GSTIN" },
          { id: "doc-smam-6", name: "Bank Account Statement (6 Months)", requiredForSanction: true, description: "Financial statement demonstrating equity buffer" },
        ],
        officialPortalUrl: "https://agrimachinery.nic.in",
        statusNotes: "Potential match — Needs verification at District Agriculture Office",
        isPrimaryRecommendation: true,
      };

      secondaryScheme = {
        id: "sch-aif",
        code: "AIF",
        name: "Agriculture Infrastructure Fund (AIF)",
        fullName: "Central Sector Scheme of Financing Facility under Agriculture Infrastructure Fund",
        governingMinistry: "Department of Agriculture, Cooperation & Farmers Welfare (DA&FW)",
        subsidyRatePct: 0,
        maxProjectCost: 20000000,
        maxSubsidyAmount: 2000000,
        interestSubventionPct: 3.0,
        creditGuaranteeCover: "CGTMSE guarantee fee fully borne by Government of India",
        keyFitReason: "3% interest subvention for 7 years reduces loan servicing burden significantly on Custom Hiring Centre capex.",
        eligibilityCriteria: [
          "Micro agri-service centres established in rural/peri-urban blocks",
          "Bank term loan sanctioned by scheduled commercial or cooperative bank",
        ],
        mandatoryDocuments: [
          { id: "doc-aif-1", name: "Detailed Project Report (DPR)", requiredForSanction: true, description: "Cash flow projections" },
          { id: "doc-aif-2", name: "Bank In-Principle Sanction Letter", requiredForSanction: true, description: "Commercial bank term loan approval" },
        ],
        officialPortalUrl: "https://agriinfra.dac.gov.in",
        statusNotes: "Potential match — Interest subvention applicable upon term loan disbursement",
        isPrimaryRecommendation: false,
      };
    } else if (scenario.id === "biz-flour-mill") {
      const subsidyPct = 35;
      const maxSubsidy = 1000000;

      recommendedScheme = {
        id: "sch-pmfme-flour",
        code: "PMEGP",
        name: "PMFME Grain & Pulse Milling Cluster Subsidy",
        fullName: "PM Formalisation of Micro food processing Enterprises (PMFME)",
        governingMinistry: "Ministry of Food Processing Industries (MOFPI) / Punjab Agro",
        subsidyRatePct: subsidyPct,
        maxProjectCost: 5000000,
        maxSubsidyAmount: maxSubsidy,
        interestSubventionPct: 0,
        creditGuaranteeCover: "CGTMSE Guarantee Cover up to ₹2.0 Cr",
        keyFitReason: "Commercial stone chakki and pulse processing qualify for 35% credit-linked capital subsidy on machinery.",
        eligibilityCriteria: [
          "Individual micro-entrepreneur setting up grain/atta processing facility",
          "Applicant aged 18+ with minimum 8th class educational pass certificate",
          "Promoter equity minimum 10% of total project cost",
          "Willingness to obtain basic FSSAI registration and Udyam certification",
        ],
        mandatoryDocuments: [
          { id: "doc-flour-1", name: "Bankable Feasibility DPR", requiredForSanction: true, description: "GramVest technical & financial appraisal" },
          { id: "doc-flour-2", name: "Aadhaar & PAN Identity KYC", requiredForSanction: true, description: "Proof of residence in rural Punjab block" },
          { id: "doc-flour-3", name: "Udyam MSME Registration Certificate", requiredForSanction: true, description: "NIC code 1061 for grain mill products" },
          { id: "doc-flour-4", name: "Premises Ownership / 5-Yr Lease Agreement", requiredForSanction: false, description: "Registered lease deed for chakki shed" },
          { id: "doc-flour-5", name: "OEM Machinery Quotations (Batala/Ludhiana)", requiredForSanction: true, description: "Stone chakki, cleaner, and motor invoices" },
          { id: "doc-flour-6", name: "Bank Account Statement (Past 6 Months)", requiredForSanction: true, description: "Bank statement showing equity balance" },
        ],
        officialPortalUrl: "https://pmfme.mofpi.gov.in",
        statusNotes: "Potential match — Needs verification by Punjab Agro Industries Corporation (PAIC)",
        isPrimaryRecommendation: true,
      };

      secondaryScheme = {
        id: "sch-pmegp",
        code: "PMEGP",
        name: "PMEGP Rural Agro Processing Scheme",
        fullName: "Prime Minister's Employment Generation Programme",
        governingMinistry: "Ministry of MSME / KVIC",
        subsidyRatePct: 35,
        maxProjectCost: 5000000,
        maxSubsidyAmount: 1750000,
        interestSubventionPct: 0,
        creditGuaranteeCover: "CGTMSE coverage included automatically",
        keyFitReason: "35% margin money grant for rural manufacturing unit under KVIC/KVIB guidelines.",
        eligibilityCriteria: ["Rural resident setting up manufacturing unit up to ₹50L"],
        mandatoryDocuments: [
          { id: "doc-pmegp-1", name: "PMEGP Online Application Form", requiredForSanction: true, description: "Submitted on KVIC e-portal" },
          { id: "doc-pmegp-2", name: "Rural Area Certificate from BDPO", requiredForSanction: true, description: "Confirmation of rural project location" },
        ],
        officialPortalUrl: "https://www.kviconline.gov.in/pmegp",
        statusNotes: "Potential match — Alternative route through District Industries Centre",
        isPrimaryRecommendation: false,
      };
    } else if (scenario.id === "biz-cold-storage") {
      recommendedScheme = {
        id: "sch-midh",
        code: "PMEGP",
        name: "MIDH Post-Harvest Horticulture Cold Room Subsidy",
        fullName: "Mission for Integrated Development of Horticulture (MIDH)",
        governingMinistry: "National Horticulture Board (NHB) / Punjab Horticulture Dept",
        subsidyRatePct: 35,
        maxProjectCost: 5000000,
        maxSubsidyAmount: 1200000,
        interestSubventionPct: 0,
        creditGuaranteeCover: "Credit Guarantee under CGTMSE",
        keyFitReason: "Decentralized micro cold room (25 MT) and pack house qualify for 35% back-ended capital subsidy.",
        eligibilityCriteria: [
          "Setting up controlled atmosphere or micro cold room up to 100 MT",
          "Location in vegetable or fruit growing catchment with farmer tie-ups",
          "Promoter contribution minimum 20% of project cost",
        ],
        mandatoryDocuments: [
          { id: "doc-midh-1", name: "Bankable Detailed Project Report", requiredForSanction: true, description: "Cold chain thermal calculation & DSCR" },
          { id: "doc-midh-2", name: "KYC & Land Revenue Records (Jamabandi)", requiredForSanction: true, description: "Proof of unencumbered rural land" },
          { id: "doc-midh-3", name: "Refrigeration Unit OEM Technical Specs", requiredForSanction: true, description: "PUF panel thickness & condensing unit specs" },
          { id: "doc-midh-4", name: "Udyam MSME Certificate", requiredForSanction: true, description: "Cold storage warehousing category" },
        ],
        officialPortalUrl: "https://nhb.gov.in",
        statusNotes: "Potential match — Needs verification at NHB Ludhiana nodal cell",
        isPrimaryRecommendation: true,
      };

      secondaryScheme = {
        id: "sch-aif",
        code: "AIF",
        name: "Agriculture Infrastructure Fund (AIF)",
        fullName: "AIF Post-Harvest Management Facility",
        governingMinistry: "Department of Agriculture & Farmers Welfare",
        subsidyRatePct: 0,
        maxProjectCost: 20000000,
        maxSubsidyAmount: 2000000,
        interestSubventionPct: 3.0,
        creditGuaranteeCover: "Full CGTMSE fee waiver for 7 years",
        keyFitReason: "3% interest subvention stacks seamlessly with MIDH capital grant on the term loan balance.",
        eligibilityCriteria: ["Cold chain infrastructure project approved by participating commercial bank"],
        mandatoryDocuments: [
          { id: "doc-aif-1", name: "Bank Term Loan Sanction Letter", requiredForSanction: true, description: "Commercial bank sign-off" },
        ],
        officialPortalUrl: "https://agriinfra.dac.gov.in",
        statusNotes: "Potential match — Top-up interest relief route",
        isPrimaryRecommendation: false,
      };
    } else {
      // Default: Dairy Processing
      recommendedScheme = {
        id: "sch-pmegp-dairy",
        code: "PMEGP",
        name: "Rural Term Loan with PMEGP Margin Subsidy",
        fullName: "Prime Minister's Employment Generation Programme (PMEGP)",
        governingMinistry: "Ministry of MSME & KVIC",
        subsidyRatePct: 35,
        maxProjectCost: 5000000,
        maxSubsidyAmount: 1750000,
        interestSubventionPct: 0,
        creditGuaranteeCover: "CGTMSE Cover up to ₹2.0 Cr (Zero Third-Party Guarantee)",
        keyFitReason: "Dairy value addition & chilling qualifies under Priority Sector Lending (PSL) with 35% non-repayable sovereign margin grant.",
        eligibilityCriteria: [
          "Applicant age 18+ with minimum 8th class educational pass certificate",
          "Proposed unit located in designated rural area (BDPO certificate required)",
          "Promoter equity minimum 10% of total project cost (₹" + Math.round(projectCost * 0.1).toLocaleString("en-IN") + ")",
          "No prior default on any government-sponsored credit scheme",
        ],
        mandatoryDocuments: [
          { id: "doc-1", name: "GramVest Detailed Project Report (DPR)", requiredForSanction: true, description: "Full technical, market & financial assessment" },
          { id: "doc-2", name: "Aadhaar & PAN Card KYC", requiredForSanction: true, description: "Identity, age, and address proof" },
          { id: "doc-3", name: "Udyam MSME Registration Certificate", requiredForSanction: true, description: "Free online MSME self-declaration" },
          { id: "doc-4", name: "Land Title / Registered Lease Deed (5+ Yrs)", requiredForSanction: false, description: "Proof of site control for chilling shed" },
          { id: "doc-5", name: "Machinery Quotation from OEM with GSTIN", requiredForSanction: true, description: "Itemized quotation for BMC and testing lab" },
          { id: "doc-6", name: "Bank Account Statement (Past 6 Months)", requiredForSanction: true, description: "Demonstrating available equity margin funds" },
        ],
        officialPortalUrl: "https://www.kviconline.gov.in/pmegp",
        statusNotes: "Potential match — Pre-aligned to Public Sector Bank underwriting guidelines (SBI, PNB, Punjab Gramin Bank)",
        isPrimaryRecommendation: true,
      };

      secondaryScheme = {
        id: "sch-pmfme",
        code: "PMEGP",
        name: "PM Formalisation of Micro food processing Enterprises (PMFME)",
        fullName: "PM Formalisation of Micro food processing Enterprises Scheme",
        governingMinistry: "Ministry of Food Processing Industries (MOFPI)",
        subsidyRatePct: 35,
        maxProjectCost: 10000000,
        maxSubsidyAmount: 1000000,
        interestSubventionPct: 0,
        creditGuaranteeCover: "CGTMSE eligible with priority credit-linkage",
        keyFitReason: "One District One Product (ODOP) focus scheme for micro dairy and food processing units in Punjab.",
        eligibilityCriteria: [
          "Existing or new micro food processing enterprise",
          "Ownership status: Individual / proprietorship / partnership",
          "Applicant should be willing to achieve FSSAI standards within 18 months",
        ],
        mandatoryDocuments: [
          { id: "doc-pmfme-1", name: "PMFME Online Project Profile", requiredForSanction: true, description: "MOFPI online registration" },
          { id: "doc-pmfme-2", name: "FSSAI Basic Registration", requiredForSanction: false, description: "Food safety compliance commitment" },
        ],
        officialPortalUrl: "https://pmfme.mofpi.gov.in",
        statusNotes: "Potential match — Ideal alternative if ODOP dairy cluster criteria apply",
        isPrimaryRecommendation: false,
      };
    }

    const subsidyRate = (recommendedScheme.subsidyRatePct || 35) / 100;
    const indicativeSubsidyBenefit = Math.min(
      recommendedScheme.maxSubsidyAmount,
      Math.round(projectCost * subsidyRate)
    );
    const indicativeEmiReduction = Math.round(indicativeSubsidyBenefit * 0.015);

    return {
      recommendedScheme,
      secondaryScheme,
      indicativeSubsidyBenefit,
      indicativeEmiReduction,
      appraisalCheckpoints: [
        "Potential match: Estimated project cost of ₹" + (projectCost / 100000).toFixed(1) + "L fits well within the scheme cap of ₹" + (recommendedScheme.maxProjectCost / 100000).toFixed(0) + "L.",
        "Potential match: Promoter capital of ₹" + ownCapital.toLocaleString("en-IN") + " covers the mandatory equity margin requirement.",
        "Needs verification: Ensure formal registration on the official nodal portal (" + recommendedScheme.officialPortalUrl + ") before bank appraisal.",
        "Missing information: Obtain manufacturer/OEM proforma tax invoices with GSTIN before filing District Task Force application.",
      ],
      disclaimerText:
        "Indicative scheme match based on verified parameters. Sanction, margin money release, and interest terms are strictly subject to formal underwriting, verification by District Level Task Force Committee (DLTFC), and bank branch appraisal. Never treated as an automated or guaranteed entitlement.",
      metadata: {
        source: `${recommendedScheme.governingMinistry} Official Guidelines (${scenario.registrySource})`,
        sourceDate: "2026-09-01",
        confidence: "high",
        dataStatus: "verified",
      },
    };
  }

  async calculateSubsidy(
    projectCost: number,
    schemeCode: string,
    isRuralSpecial: boolean
  ): Promise<{
    subsidyAmount: number;
    subsidyRatePct: number;
    effectiveNetLoan: number;
    disclaimer: string;
  }> {
    await new Promise((res) => setTimeout(res, 50));

    let rate = 0.25;
    if (schemeCode === "PMEGP" || schemeCode === "SMAM") {
      rate = isRuralSpecial ? 0.35 : 0.25;
    } else if (schemeCode === "PMFME" || schemeCode === "MIDH") {
      rate = 0.35;
    }

    const cappedCost = Math.min(projectCost, 5000000);
    const subsidyAmount = Math.round(cappedCost * rate);
    const termLoan = projectCost * 0.7;
    const effectiveNetLoan = Math.max(0, termLoan - subsidyAmount);

    return {
      subsidyAmount,
      subsidyRatePct: rate * 100,
      effectiveNetLoan,
      disclaimer:
        "Indicative calculation. Final subsidy sanction is approved by the District Level Task Force Committee (DLTFC) and released back-ended by the nodal department.",
    };
  }
}


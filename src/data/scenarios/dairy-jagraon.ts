import {
  EntrepreneurProfile,
  VentureLocation,
  BusinessCategory,
  MarketAnalysis,
  OpportunityAnalysis,
  SwotQuadrant,
  RiskItem,
  ViabilityScore,
  FinancialScenario,
  SchemeRouteRecommendation,
  FeasibilityReport,
} from "@/domain";
import { calculateEMI, calculateOperatingFinancials } from "@/lib/calculations";

export const DEMO_LOCATION: VentureLocation = {
  id: "loc-jagraon-01",
  state: "Punjab",
  district: "Ludhiana",
  block: "Jagraon",
  villageOrTown: "Sidhwan Bet",
  pincode: "142026",
  latitude: 30.7853,
  longitude: 75.4731,
  marketCatchmentName: "Jagraon-Sidhwan Milk Shed",
  nearestMandi: "Jagraon Grain & Agro Mandi",
  distanceToMandiKm: 4.2,
};

export const DEMO_BUSINESS: BusinessCategory = {
  id: "biz-dairy-processing",
  title: "Dairy Processing & Milk Chilling Unit",
  slug: "dairy-chilling",
  description:
    "Small-scale bulk milk chilling (BMC) and value-addition facility aggregating raw milk from local dairy farmers, chilling to 4°C, and supplying bulk consumers and bottled fresh milk.",
  typicalInvestmentRange: [600000, 1200000],
  unitOfProduction: "Liters / day",
  benchmarkGrossMarginPct: 22.5,
  primaryMachinery: [
    "1,000L Bulk Milk Cooler (BMC)",
    "Automatic Milk Collection Station (AMCS)",
    "Electronic MilkoTester & Lactometer",
    "15 kVA Diesel Generator Set",
    "Insulated SS Milk Cans (40L)",
  ],
  applicableSchemes: ["PMEGP", "AIF", "MUDRA (Tarun)", "NABARD DEDS"],
};

export const DEMO_PROFILE: EntrepreneurProfile = {
  id: "ent-gurpreet-01",
  fullName: "Gurpreet Singh",
  initials: "GS",
  phone: "+91 98765 43210",
  educationLevel: "Senior Secondary (10+2) + Dairy Tech Certificate",
  experienceLevel: "intermediate",
  ownCapitalAvailable: 300000, // ₹3,00,000
  targetMonthlyIncome: 45000,
  existingLandOrShed: true,
  creditCategory: "special_rural",
  riskTolerance: "balanced",
};

export const DEMO_MARKET_5KM: MarketAnalysis = {
  radiusKm: 5,
  location: DEMO_LOCATION,
  demographics: {
    populationInRadius: 42800,
    householdsInRadius: 7120,
    estimatedDailyMilkProductionLiters: 14200,
    localConsumptionLiters: 12350,
    unmetMarketDemandLiters: 1850,
    averageFarmgatePrice: 40,
    averageRetailSellingPrice: 60,
    mandiDistanceKm: 4.2,
    competitorDensityRating: "Medium",
    metadata: {
      source: "Punjab Livestock Census & Mandi Board Trade Reports",
      sourceDate: "2026-06-15",
      confidence: "high",
      dataStatus: "verified",
      sampleCoverage: "14 Gram Panchayats in Jagraon Block",
    },
  },
  competitors: [
    {
      id: "comp-1",
      name: "Sharma Dairy & Collection",
      type: "local_dairy",
      latitude: 30.792,
      longitude: 75.461,
      distanceKm: 1.8,
      dailyCapacityLiters: 450,
      procurementPricePerLiter: 39,
      sellingPricePerLiter: 58,
      keyStrength: "Longstanding relationship with GT road dhabas",
      primaryArea: "GT Road Junction",
      operationalSinceYear: 2018,
    },
    {
      id: "comp-2",
      name: "Kisan Cooperative Collection Center",
      type: "cooperative_center",
      latitude: 30.771,
      longitude: 75.495,
      distanceKm: 3.2,
      dailyCapacityLiters: 850,
      procurementPricePerLiter: 41,
      sellingPricePerLiter: 56,
      keyStrength: "Government federation backing, daily fat testing",
      primaryArea: "Sidhwan Bet East",
      operationalSinceYear: 2012,
    },
    {
      id: "comp-3",
      name: "Guru Nanak Chilling Center",
      type: "chilling_hub",
      latitude: 30.804,
      longitude: 75.448,
      distanceKm: 4.1,
      dailyCapacityLiters: 1200,
      procurementPricePerLiter: 40.5,
      sellingPricePerLiter: 62,
      keyStrength: "Large bulk cooler; supplies Ludhiana commercial confectioners",
      primaryArea: "Raikot Link Road",
      operationalSinceYear: 2019,
    },
    {
      id: "comp-4",
      name: "Doaba Milk Point",
      type: "local_dairy",
      latitude: 30.755,
      longitude: 75.452,
      distanceKm: 4.9,
      dailyCapacityLiters: 400,
      procurementPricePerLiter: 38.5,
      sellingPricePerLiter: 58,
      keyStrength: "Direct door-to-door morning supply",
      primaryArea: "Jagraon Old Bazaar",
      operationalSinceYear: 2021,
    },
  ],
  estimatedAddressableMarketLiters: 3200,
  marketShareTargetPct: 15.6,
  priceTrend: [
    { period: "Jan 2026", procurementPrice: 38, retailPrice: 58 },
    { period: "Mar 2026", procurementPrice: 39, retailPrice: 58 },
    { period: "May 2026", procurementPrice: 41, retailPrice: 60 },
    { period: "Jul 2026", procurementPrice: 42, retailPrice: 62 },
    { period: "Sep 2026", procurementPrice: 40, retailPrice: 60 },
  ],
  metadata: {
    source: "Field survey & Mandi market reports",
    sourceDate: "2026-08-10",
    confidence: "high",
    dataStatus: "demo",
    assumptions: [
      "5 km radial coverage area includes Sidhwan Bet and 9 satellite hamlets",
      "Per capita milk consumption benchmarked at 480 ml/day (Punjab average)",
    ],
  },
};

export const DEMO_MARKET_10KM: MarketAnalysis = {
  ...DEMO_MARKET_5KM,
  radiusKm: 10,
  demographics: {
    ...DEMO_MARKET_5KM.demographics,
    populationInRadius: 118400,
    householdsInRadius: 19800,
    estimatedDailyMilkProductionLiters: 38900,
    localConsumptionLiters: 33400,
    unmetMarketDemandLiters: 5500,
    competitorDensityRating: "High",
  },
  competitors: [
    ...DEMO_MARKET_5KM.competitors,
    {
      id: "comp-5",
      name: "Jalandhar Fresh Bulk Dairies",
      type: "chilling_hub",
      latitude: 30.825,
      longitude: 75.512,
      distanceKm: 7.8,
      dailyCapacityLiters: 1800,
      procurementPricePerLiter: 41.5,
      sellingPricePerLiter: 64,
      keyStrength: "Cold chain logistics fleet supplying restaurants",
      primaryArea: "Sutlej Canal Belt",
      operationalSinceYear: 2016,
    },
    {
      id: "comp-6",
      name: "Randhawa Dairy Farm",
      type: "local_dairy",
      latitude: 30.742,
      longitude: 75.419,
      distanceKm: 8.4,
      dailyCapacityLiters: 900,
      procurementPricePerLiter: 40,
      sellingPricePerLiter: 60,
      keyStrength: "In-house herd with 45 crossbred cows",
      primaryArea: "Malak Road",
      operationalSinceYear: 2015,
    },
    {
      id: "comp-7",
      name: "Doaba Khoya & Paneer Hub",
      type: "sweet_maker",
      latitude: 30.841,
      longitude: 75.438,
      distanceKm: 9.3,
      dailyCapacityLiters: 1100,
      procurementPricePerLiter: 42,
      sellingPricePerLiter: 68,
      keyStrength: "Dedicated value-added dairy derivatives processing",
      primaryArea: "Moga Highway",
      operationalSinceYear: 2017,
    },
  ],
  estimatedAddressableMarketLiters: 8500,
  marketShareTargetPct: 9.2,
};

export const DEMO_OPPORTUNITY: OpportunityAnalysis = {
  verdict: "Promising",
  verdictSubtitle: "High catchment potential with steady procurement margins in Jagraon block.",
  executiveSummary:
    "Your market looks healthy, but rising summer input costs deserve immediate attention before procurement contracts lock in. The 5 km radius exhibits an unmet demand of 1,850 liters/day with high consumer willingness to pay for hygienic, chilled milk without adulteration.",
  keyGaps: [
    {
      title: "Chilled Supply Deficit",
      signal: "positive",
      headline: "1,850 L/day unmet demand for certified 4°C chilled milk",
      description:
        "Local halwais and urban sweet houses in Jagraon currently source unchilled milk that sours by midday during April-August.",
      metric: "1,850 L/day gap",
      evidence: "Mandi Board Summer Quality Log & Confectioners Survey",
    },
    {
      title: "Farmer Fat-Testing Transparency",
      signal: "positive",
      headline: "Farmers losing ₹2-3/L to arbitrary middleman deductions",
      description:
        "Providing transparent digital MilkoTester readouts gives immediate competitive advantage to secure reliable daily farmer supply.",
      metric: "+25 farmer commitments",
      evidence: "Field interviews with dairy farmers in Sidhwan Bet",
    },
    {
      title: "Feed & Fodder Volatility",
      signal: "watchout",
      headline: "Green fodder prices spike up to 22% during dry summer months",
      description:
        "Higher farmer production costs will exert upward pressure on farmgate milk procurement rates between May and July.",
      metric: "+18-22% seasonal spike",
      evidence: "Punjab Agricultural University Seasonal Price Monitor",
    },
  ],
  recommendations: [
    "Lock in written off-take agreements with 3 major sweet manufacturers in Jagraon before ordering chilling tanks.",
    "Offer transparent digital fat/SNF testing at collection counters with weekly bank-transfer payouts to build farmer loyalty.",
    "Install a dedicated 15 kVA diesel generator backup to protect the 4°C cold chain against rural grid outages.",
    "Apply for PMEGP subsidy under rural manufacturing category to claim 35% capital subsidy on machinery.",
  ],
  conditionsToSucceed: [
    "Maintain daily chilling volume above 380 Liters (minimum break-even threshold).",
    "Procurement cost must not exceed ₹43/L to preserve gross margins above 20%.",
    "Chilling temperature must reach 4°C within 3.5 hours of milking to meet FSSAI standards.",
  ],
  concernsAndWatchouts: [
    "Intense procurement competition from Kisan Cooperative during winter flush season (Nov-Jan).",
    "Diesel fuel consumption could increase operating costs by ₹6,000/mo if rural power supply drops below 16 hrs/day.",
  ],
  metadata: {
    source: "GramVest Decision Model v2.4 (Regional Punjab Dataset)",
    sourceDate: "2026-08-25",
    confidence: "high",
    dataStatus: "verified",
  },
};

export const DEMO_SWOT: SwotQuadrant = {
  strengths: [
    "Prime road connectivity on Sidhwan Bet road enabling 20-minute transit to Jagraon town.",
    "Existing brick shed owned by entrepreneur eliminates ₹1,80,000 in upfront civil construction.",
    "Prior 4-year experience in dairy milk collection and testing ensures rapid operational ramp-up.",
    "Strong local kinship network with 25+ buffalo-rearing households in village.",
  ],
  weaknesses: [
    "Modest equity buffer (₹3,00,000 own capital) leaves little cushion for initial working capital delay.",
    "No commercial delivery truck; initially dependent on buyers picking up chilled milk or 3-wheeler auto rental.",
    "Dependence on single electricity feeder line requiring diesel generator backup.",
  ],
  opportunities: [
    "High premium (₹4-6/L extra) for FSSAI-certified, temperature-monitored bulk chilled milk.",
    "35% PMEGP capital subsidy reduces effective debt burden from ₹6.0L to ₹2.85L.",
    "Potential forward integration into paneer and curd processing within 18 months.",
    "Tie-up with local dairy cooperative societies for seasonal surplus procurement during flush season.",
  ],
  threats: [
    "Seasonal flush season price depression when regional milk supply surges by 30% in December.",
    "Diesel price escalation impacting generator running expenses during peak summer load-shedding.",
    "Sudden livestock epidemic or lumpy skin disease outbreak reducing local milk output.",
  ],
};

export const DEMO_RISKS: RiskItem[] = [
  {
    id: "risk-1",
    category: "Supply / Input Cost",
    risk: "Summer Fodder Shortage & Farmgate Procurement Price Rise",
    severity: "High",
    likelihood: "High",
    impactDescription:
      "Farmgate price could rise from ₹40/L to ₹44/L, compressing monthly EBITDA by ₹18,000.",
    mitigationStrategy:
      "Offer dry silage bulk procurement assistance to dairy farmers during winter harvest to stabilize year-round supply cost.",
  },
  {
    id: "risk-2",
    category: "Operational",
    risk: "Rural Grid Load-Shedding during Peak Summer Chilling Hours",
    severity: "High",
    likelihood: "Medium",
    impactDescription:
      "Temperature rise above 8°C causes milk souring and microbial spoilage, leading to full batch rejection.",
    mitigationStrategy:
      "Provision 15 kVA automatic DG set in capital expenditure; maintain 100-liter diesel emergency reserve.",
  },
  {
    id: "risk-3",
    category: "Demand",
    risk: "Payment Delay from Urban Sweet Shops / Confectionery Buyers",
    severity: "Medium",
    likelihood: "Medium",
    impactDescription:
      "Working capital strain if buyers delay receivables past 15 days while farmers demand weekly cash settlement.",
    mitigationStrategy:
      "Enforce maximum 7-day credit terms with 2% prompt-payment discount; require advance security deposit for new accounts.",
  },
  {
    id: "risk-4",
    category: "Seasonal",
    risk: "Winter Flush Season Surplus & Spot Price Crash",
    severity: "Medium",
    likelihood: "High",
    impactDescription:
      "Supply exceeds regular buyer quota by 25-30% between November and January.",
    mitigationStrategy:
      "Pre-contract seasonal offloading agreement with Ludhiana milk powder plant or Mother Dairy collection agent.",
  },
  {
    id: "risk-5",
    category: "Regulatory",
    risk: "FSSAI Food Safety Testing & Pollution Clearance Hurdles",
    severity: "Low",
    likelihood: "Low",
    impactDescription:
      "Temporary sealing or penalty if effluent discharge from wash-down waters does not meet standards.",
    mitigationStrategy:
      "Install basic concrete soak-pit with fat separator trap and apply for FSSAI State License with lab calibration records.",
  },
];

export const DEMO_VIABILITY_SCORE: ViabilityScore = {
  overallScore: 74,
  verdict: "Promising",
  quartileLabel: "Top Quartile (Jalandhar & Ludhiana Rural Belt)",
  statusPills: [
    { label: "Market", status: "Good", tone: "positive" },
    { label: "Money", status: "Manageable", tone: "positive" },
    { label: "Customers", status: "Strong", tone: "positive" },
    { label: "Risk", status: "Attention Needed", tone: "warning" },
  ],
  components: [
    {
      category: "Market Demand",
      weight: 0.25,
      score: 82,
      driver: "High unmet deficit (1,850 L/day) and growing consumption in Jagraon commercial corridor.",
      improvementAction: "Pre-sign supply contracts with 2 additional sweet shop chains to reach 90+.",
    },
    {
      category: "Competition Opportunity",
      weight: 0.2,
      score: 76,
      driver: "Only 1 organized chilling hub within 4 km; existing middlemen lack digital fat-testing transparency.",
      improvementAction: "Emphasize digital weigh-scale and instant receipt printout for dairy farmers.",
    },
    {
      category: "Capital Fit",
      weight: 0.2,
      score: 68,
      driver: "₹3.0L own equity is tight against ₹9.0L project, but PMEGP 35% subsidy covers debt servicing cushion.",
      improvementAction: "Secure ₹50,000 contingency line or family backing for initial raw milk working capital.",
    },
    {
      category: "Profit & Cash Flow Potential",
      weight: 0.2,
      score: 75,
      driver: "Projected 1.62x DSCR and ₹28,400 monthly net cash flow comfortably exceeds minimum 1.3x bank benchmark.",
      improvementAction: "Direct packaging of 100 L/day in retail pouches lifts gross margin to 28%.",
    },
    {
      category: "Risk Resilience",
      weight: 0.15,
      score: 64,
      driver: "Exposed to summer green fodder price hikes and occasional power interruptions.",
      improvementAction: "Budget ₹18,000/mo diesel contingency and organize seasonal silage procurement.",
    },
  ],
  metadata: {
    source: "GramVest Explainable Scoring Engine (weights configurable)",
    sourceDate: "2026-08-25",
    confidence: "high",
    dataStatus: "verified",
  },
};

// Compute base financials for Gurpreet's Dairy
const baseCostItems = [
  {
    category: "Plant & Machinery" as const,
    itemName: "1,000L Bulk Milk Cooler (BMC with SS-304 Tank & Condenser)",
    cost: 480000,
    eligibleForSubsidy: true,
    notes: "Direct expansion tank, agitator, digital temperature controller",
  },
  {
    category: "Civil Works & Shed" as const,
    itemName: "Existing Shed Renovation, Tiled Wash Area & Drain Slopes",
    cost: 160000,
    eligibleForSubsidy: true,
    notes: "Hygienic washable anti-bacterial wall tiles up to 6 ft",
  },
  {
    category: "Electrification & DG" as const,
    itemName: "15 kVA Soundproof Silent DG Set & 3-Phase Wiring",
    cost: 160000,
    eligibleForSubsidy: true,
    notes: "Ensures continuous chilling during rural power outages",
  },
  {
    category: "Testing & Cans" as const,
    itemName: "Digital Ultrasonic MilkoTester, Electronic Weigh Scale & 10 SS Cans",
    cost: 50000,
    eligibleForSubsidy: true,
    notes: "Instant fat and SNF testing readout with thermal printer",
  },
  {
    category: "Working Capital" as const,
    itemName: "Working Capital Margin (15 Days Raw Milk Cycle)",
    cost: 50000,
    eligibleForSubsidy: false,
    notes: "Bank margin requirement for initial procurement cash flow",
  },
];

const totalProjectCost = baseCostItems.reduce((acc, item) => acc + item.cost, 0); // ₹9,00,000
const ownContribution = 300000; // ₹3,00,000 (~33.3%)
const loanAmount = totalProjectCost - ownContribution; // ₹6,00,000 (66.7%)

const loanOutput = calculateEMI({
  principal: loanAmount,
  annualInterestRate: 8.5,
  tenureMonths: 60,
  moratoriumMonths: 6,
});

// Calibrated operating monthly figures for 500 L/day capacity at 80% utilization:
const opFinancials = calculateOperatingFinancials({
  dailyCapacity: 500,
  capacityUtilization: 85, // 425 L/day = 12,750 L/month
  sellingPricePerUnit: 60, // ₹60/L average blended sales price
  rawMaterialCostPerUnit: 42, // ₹42/L procurement from farmers
  powerAndFuelMonthly: 18000,
  laborMonthly: 15000,
  packagingAndConsumablesMonthly: 8000,
  maintenanceAndOtherMonthly: 4000,
  monthlyLoanEMI: loanOutput.monthlyEMI,
  depreciationMonthly: 6000,
});

export const DEMO_FINANCIAL_SCENARIO: FinancialScenario = {
  id: "fin-scenario-base",
  title: "Base Financial Scenario — 500L/day Chilling Unit",
  totalProjectCost,
  costBreakdown: baseCostItems,
  financingMeans: {
    ownContribution,
    ownContributionPct: 33.3,
    termLoan: loanAmount,
    termLoanPct: 66.7,
    eligibleSubsidyAmount: 315000, // 35% PMEGP on ₹9.0L
    subsidySchemeName: "PMEGP (Rural Special Category)",
    effectiveNetLoan: loanAmount - 315000, // ₹2,85,000 effective liability after subsidy credit
  },
  loanTerms: {
    principal: loanAmount,
    interestRatePct: 8.5,
    tenureMonths: 60,
    moratoriumMonths: 6,
    monthlyEMI: loanOutput.monthlyEMI,
    totalInterest: loanOutput.totalInterest,
  },
  operationalAssumptions: {
    dailyCapacityLiters: 500,
    capacityUtilizationPct: 85,
    purchasePricePerLiter: 42,
    sellingPricePerLiter: 60,
    powerAndDieselMonthly: 18000,
    laborMonthly: 15000,
    consumablesMonthly: 8000,
    maintenanceMonthly: 4000,
  },
  projections: {
    monthlyRevenue: opFinancials.monthlyRevenue,
    monthlyRawMaterialCost: opFinancials.monthlyRawMaterialCost,
    monthlyOperatingExpenses: opFinancials.monthlyOperatingExpenses,
    monthlyEBITDA: opFinancials.monthlyEBITDA,
    monthlyNetProfit: opFinancials.monthlyNetProfit,
    monthlyNetCashFlow: opFinancials.monthlyNetCashFlow,
    annualDSCR: 1.62, // Calibrated standard debt service ratio
    breakEvenMonthlyLiters: opFinancials.monthlyBreakEvenUnits,
    breakEvenCapacityPct: opFinancials.breakEvenCapacityPct,
  },
  cashFlowSeries: [
    { month: 1, revenue: 510000, expenses: 475000, netCashFlow: 35000 },
    { month: 2, revenue: 580000, expenses: 510000, netCashFlow: 70000 },
    { month: 3, revenue: 670000, expenses: 575000, netCashFlow: 95000 },
    { month: 4, revenue: 740000, expenses: 630000, netCashFlow: 110000 },
    { month: 5, revenue: 765000, expenses: 650000, netCashFlow: 115000 },
    { month: 6, revenue: 765000, expenses: 650000, netCashFlow: 115000 },
    { month: 7, revenue: 765000, expenses: 662000, netCashFlow: 103000 }, // EMI servicing commences
    { month: 8, revenue: 765000, expenses: 662000, netCashFlow: 103000 },
    { month: 9, revenue: 765000, expenses: 662000, netCashFlow: 103000 },
    { month: 10, revenue: 765000, expenses: 662000, netCashFlow: 103000 },
    { month: 11, revenue: 765000, expenses: 662000, netCashFlow: 103000 },
    { month: 12, revenue: 765000, expenses: 662000, netCashFlow: 103000 },
  ],
  repaymentSchedule: loanOutput.schedule.slice(0, 12),
  metadata: {
    source: "GramVest Financial Model & Jagraon Micro-Finance Benchmarks",
    sourceDate: "2026-08-25",
    confidence: "high",
    dataStatus: "demo",
    assumptions: [
      "8.5% interest p.a. under priority sector lending (PSL) agriculture & allied",
      "6-month moratorium on principal repayment during installation and initial farmer onboarding",
      "Presumptive taxation under Section 44AD of Income Tax Act applied",
    ],
  },
};

export const DEMO_SCHEMES: SchemeRouteRecommendation = {
  recommendedScheme: {
    id: "scheme-pmegp",
    code: "PMEGP",
    name: "PMEGP — Prime Minister's Employment Generation Programme",
    fullName: "Prime Minister's Employment Generation Programme (KVIC / KVIB / DIC)",
    governingMinistry: "Ministry of Micro, Small and Medium Enterprises (MSME)",
    subsidyRatePct: 35,
    maxProjectCost: 5000000,
    maxSubsidyAmount: 1750000,
    interestSubventionPct: 0,
    creditGuaranteeCover: "CGTMSE cover for collateral-free sanction",
    keyFitReason:
      "Highest direct capital subsidy (35% = ₹3,15,000) for rural area manufacturing/processing ventures with own contribution as low as 5-10%.",
    eligibilityCriteria: [
      "Applicant must be above 18 years of age and hold at least 8th pass certificate (Project > ₹10 Lakhs).",
      "Enterprise must be newly established in rural designated area (Sidhwan Bet qualifies).",
      "No prior assistance availed under PMRY, REGP, or PMEGP.",
      "Beneficiary own contribution: 5% (Special category/Rural) to 10% (General).",
    ],
    mandatoryDocuments: [
      {
        id: "doc-1",
        name: "Detailed Project Report (DPR)",
        requiredForSanction: true,
        description: "Standard bankable DPR with 5-year projections, DSCR, and machinery quotations.",
      },
      {
        id: "doc-2",
        name: "Aadhaar Card & PAN Card",
        requiredForSanction: true,
        description: "Primary identity and address verification of entrepreneur.",
      },
      {
        id: "doc-3",
        name: "Rural Area Certificate",
        requiredForSanction: true,
        description: "Issued by Gram Panchayat Sarpanch or Block Development & Panchayat Officer (BDPO).",
      },
      {
        id: "doc-4",
        name: "Machinery Quotations (2 Vendors)",
        requiredForSanction: true,
        description: "Competitive GST quotations for BMC, DG Set, and AMCS equipment.",
      },
      {
        id: "doc-5",
        name: "Land Title / Registered Lease Deed (Minimum 3 Years)",
        requiredForSanction: true,
        description: "Proof of site possession for installing machinery and shed.",
      },
      {
        id: "doc-6",
        name: "Special Category / Rural Domicile Certificate",
        requiredForSanction: true,
        description: "Required to claim the higher 35% subsidy rate instead of 25%.",
      },
    ],
    officialPortalUrl: "https://www.kviconline.gov.in/pmegpeportal",
    statusNotes: "DIC Ludhiana actively accepting physical and online portal applications for FY 2026-27.",
    isPrimaryRecommendation: true,
  },
  secondaryScheme: {
    id: "scheme-aif",
    code: "AIF",
    name: "Agriculture Infrastructure Fund (AIF)",
    fullName: "National Agriculture Infrastructure Fund (MoA&FW / NABARD)",
    governingMinistry: "Ministry of Agriculture & Farmers Welfare",
    subsidyRatePct: 0,
    maxProjectCost: 20000000,
    maxSubsidyAmount: 0,
    interestSubventionPct: 3.0,
    creditGuaranteeCover: "CGTMSE fee paid by Government of India up to ₹2 Crore",
    keyFitReason:
      "3% interest subvention for 7 years on term loans reduces effective borrowing rate from 8.5% to 5.5% p.a., saving ₹12,000+ annually in interest.",
    eligibilityCriteria: [
      "Eligible for post-harvest management infrastructure, including bulk milk chilling centers.",
      "Available to individual farmers, agri-entrepreneurs, and FPOs.",
      "Loan term up to 7 years with moratorium up to 2 years.",
    ],
    mandatoryDocuments: [
      {
        id: "doc-aif-1",
        name: "Detailed Project Report (DPR)",
        requiredForSanction: true,
        description: "Feasibility study uploaded on the central AIF portal.",
      },
      {
        id: "doc-aif-2",
        name: "Bank In-Principle Sanction Letter",
        requiredForSanction: true,
        description: "Commercial bank approval for lending.",
      },
    ],
    officialPortalUrl: "https://agriinfra.dac.gov.in",
    statusNotes: "Excellent alternative or top-up for larger cold chain and logistics investments.",
    isPrimaryRecommendation: false,
  },
  indicativeSubsidyBenefit: 315000,
  indicativeEmiReduction: 4850,
  appraisalCheckpoints: [
    "Viability score > 70 with comfortable DSCR (GramVest: 1.62x vs bank hurdle 1.30x).",
    "Applicant possesses technical qualification in dairy operations (Gurpreet has Dairy Tech Cert).",
    "Clear physical possession of shed with road access for 407/pickup trucks.",
    "Credible milk procurement tie-up with local dairy farmers (25 farmer letters).",
  ],
  disclaimerText:
    "Indicative guidance based on official scheme guidelines. Sanction, subsidy release, and loan interest rates are subject to formal verification, bank appraisal, and DIC/KVIC committee approval.",
  metadata: {
    source: "KVIC PMEGP Guidelines & NABARD Agri Infra Fund Portal",
    sourceDate: "2026-07-01",
    confidence: "high",
    dataStatus: "verified",
  },
};

export const DEMO_ADVISOR_CONTEXT = {
  entrepreneurName: "Gurpreet Singh",
  businessType: "Dairy Processing & Milk Chilling Unit (1,000 L/day)",
  location: "Sidhwan Bet, Jagraon Block, Ludhiana District, Punjab",
  totalProjectCost: 900000,
  ownCapital: 300000,
  loanRequirement: 600000,
  viabilityScore: 74,
  dscr: 1.62,
  recommendedScheme: "PMEGP (35% Subsidy = ₹3,15,000)",
};

export const DEMO_FEASIBILITY_REPORT: FeasibilityReport = {
  id: "rep-jagraon-2026-001",
  reportNumber: "GV-PB-LDH-2026-0482",
  generatedDate: "2026-09-12",
  version: "2.4-PROD",
  entrepreneur: DEMO_PROFILE,
  location: DEMO_LOCATION,
  business: DEMO_BUSINESS,
  opportunitySummary: DEMO_OPPORTUNITY,
  swot: DEMO_SWOT,
  topRisks: DEMO_RISKS,
  viability: DEMO_VIABILITY_SCORE,
  financialScenario: DEMO_FINANCIAL_SCENARIO,
  schemeRoute: DEMO_SCHEMES,
  implementationPlan: [
    {
      phase: "Phase 1: Approvals & Banking Sanction",
      timeline: "Weeks 1 - 4",
      keyDeliverables: [
        "Upload bankable DPR to PMEGP / KVIC online portal.",
        "Obtain BDPO Rural Area Certificate and submit to Lead Bank Manager (Punjab National Bank, Jagraon branch).",
        "Secure in-principle bank sanction and credit guarantee endorsement under CGTMSE.",
      ],
    },
    {
      phase: "Phase 2: Site Preparation & Electrical Connection",
      timeline: "Weeks 5 - 7",
      keyDeliverables: [
        "Renovate existing shed with washable tiles, milk reception dock, and sanitary drainage.",
        "Apply to PSPCL (Punjab State Power Corp) for 12 kW commercial industrial load.",
        "Install 15 kVA soundproof diesel generator backup and wiring.",
      ],
    },
    {
      phase: "Phase 3: Machinery Delivery & Commissioning",
      timeline: "Weeks 8 - 10",
      keyDeliverables: [
        "Receive and install 1,000L SS-304 Bulk Milk Cooler (BMC).",
        "Set up Electronic MilkoTester, digital scale, and automated farmer accounting software.",
        "Perform trial run with water chilling to 4°C within 3 hours.",
      ],
    },
    {
      phase: "Phase 4: Farmer Procurement & Commercial Launch",
      timeline: "Weeks 11 - 12",
      keyDeliverables: [
        "Convene meeting with 25 enrolled dairy farmers in Sidhwan Bet; distribute clean milk cans.",
        "Sign dispatch agreement with 2 Jagraon commercial sweet manufacturers.",
        "Commence morning and evening milk chilling operations.",
      ],
    },
  ],
  statutoryChecklist: [
    {
      authority: "Food Safety & Standards Authority of India (FSSAI)",
      licenseName: "FSSAI State License (Dairy Processing)",
      indicativeFee: "₹3,000 / year",
      turnaroundDays: "15-20 days",
    },
    {
      authority: "Punjab Pollution Control Board (PPCB)",
      licenseName: "Consent to Establish (CTE) & Consent to Operate (CTO) - Green Category",
      indicativeFee: "₹2,500",
      turnaroundDays: "25 days",
    },
    {
      authority: "Punjab State Power Corporation Ltd (PSPCL)",
      licenseName: "12 kW Non-Domestic / Small Industrial Power Sanction",
      indicativeFee: "₹18,000 security deposit",
      turnaroundDays: "14 days",
    },
    {
      authority: "Ministry of MSME",
      licenseName: "Udyam Registration Certificate (Free Online)",
      indicativeFee: "Nil",
      turnaroundDays: "Instant (1 day)",
    },
  ],
  formalDisclaimer:
    "This Feasibility Report and Bankable Project Appraisal are generated for decision-support and credit evaluation purposes based on declared parameters, field benchmarks, and published government scheme guidelines for Punjab. Final loan sanction, margin requirements, interest rate, and subsidy disbursement remain at the sole discretion of the financing bank and the relevant sanctioning authority.",
};

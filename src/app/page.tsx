"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Archetype Data Model for Rural Enterprise Simulator
interface ArchetypeConfig {
  id: string;
  businessId: string;
  title: string;
  emoji: string;
  unit: string;
  subtitle: string;
  baseCost: number;
  unmetDemand: string;
  subsidyPct: number;
  maxSubsidy: number;
  subsidyName: string;
  marginBase: number;
  deficitPct: number;
  costPerUnit: number;
  minScale: number;
  maxScale: number;
  defaultScale: number;
  scaleStep: number;
  dscrBenchmark: number;
}

const ARCHETYPES: Record<string, ArchetypeConfig> = {
  dairy: {
    id: "dairy",
    businessId: "biz-dairy-processing",
    title: "Dairy Chilling & Value Addition",
    emoji: "🥛",
    unit: "Liters / day",
    subtitle: "Bulk milk chiller & paneer unit",
    baseCost: 1450000,
    unmetDemand: "~1,850 - 3,800 L/day Deficit",
    subsidyPct: 35,
    maxSubsidy: 1750000,
    subsidyName: "35% PMEGP Sovereign Subsidy",
    marginBase: 78000,
    deficitPct: 74,
    costPerUnit: 220,
    minScale: 500,
    maxScale: 5000,
    defaultScale: 1500,
    scaleStep: 250,
    dscrBenchmark: 1.82,
  },
  flour: {
    id: "flour",
    businessId: "biz-flour-mill",
    title: "Chakki Flour & Dal Processing",
    emoji: "🌾",
    unit: "Kg / day",
    subtitle: "Atta, pulses & grain milling",
    baseCost: 850000,
    unmetDemand: "~1,650 Kg/day Local Deficit",
    subsidyPct: 35,
    maxSubsidy: 1000000,
    subsidyName: "35% PMFME Cluster Grant",
    marginBase: 52000,
    deficitPct: 62,
    costPerUnit: 140,
    minScale: 300,
    maxScale: 3500,
    defaultScale: 1200,
    scaleStep: 100,
    dscrBenchmark: 1.76,
  },
  chc: {
    id: "chc",
    businessId: "biz-farm-equipment",
    title: "Custom Hiring & Farm Machinery",
    emoji: "🚜",
    unit: "Acres served / mo",
    subtitle: "Tractor, Super Seeder & Leveler",
    baseCost: 2250000,
    unmetDemand: "~750 Acres Seasonal Need",
    subsidyPct: 40,
    maxSubsidy: 1000000,
    subsidyName: "40% SMAM CHC Capital Grant",
    marginBase: 110000,
    deficitPct: 78,
    costPerUnit: 350,
    minScale: 150,
    maxScale: 1200,
    defaultScale: 450,
    scaleStep: 50,
    dscrBenchmark: 1.95,
  },
  cold: {
    id: "cold",
    businessId: "biz-cold-storage",
    title: "Micro Cold Storage & Pack House",
    emoji: "❄️",
    unit: "Metric Tonnes (MT)",
    subtitle: "25-50 MT horticulture chamber",
    baseCost: 2400000,
    unmetDemand: "~35 MT Perishables Spoilage",
    subsidyPct: 35,
    maxSubsidy: 1200000,
    subsidyName: "35% MIDH + 3% AIF Relief",
    marginBase: 125000,
    deficitPct: 81,
    costPerUnit: 25000,
    minScale: 10,
    maxScale: 100,
    defaultScale: 30,
    scaleStep: 5,
    dscrBenchmark: 1.88,
  },
  bakery: {
    id: "bakery",
    businessId: "biz-bakery",
    title: "Bakery & Confectionery Unit",
    emoji: "🍞",
    unit: "Kg / day",
    subtitle: "Rotary rack oven & mixer unit",
    baseCost: 1150000,
    unmetDemand: "~900 Kg/day Packaged Demand",
    subsidyPct: 35,
    maxSubsidy: 1000000,
    subsidyName: "35% PMFME Micro Food Grant",
    marginBase: 64000,
    deficitPct: 58,
    costPerUnit: 210,
    minScale: 200,
    maxScale: 2000,
    defaultScale: 600,
    scaleStep: 100,
    dscrBenchmark: 1.74,
  },
  spices: {
    id: "spices",
    businessId: "biz-spice-processing",
    title: "Automatic Spice Grinding Unit",
    emoji: "🌶️",
    unit: "Kg / day",
    subtitle: "Turmeric, chilli & coriander lines",
    baseCost: 920000,
    unmetDemand: "~550 Kg/day Pure Spice Deficit",
    subsidyPct: 35,
    maxSubsidy: 1000000,
    subsidyName: "35% PMEGP Agro Margin Money",
    marginBase: 58000,
    deficitPct: 65,
    costPerUnit: 160,
    minScale: 100,
    maxScale: 1500,
    defaultScale: 500,
    scaleStep: 50,
    dscrBenchmark: 1.79,
  },
};

const PUNJAB_DISTRICTS: Record<
  string,
  {
    name: string;
    tehsils: { id: string; name: string; mandiDeficit: string; feederStatus: string; powerHours: number }[];
  }
> = {
  ludhiana: {
    name: "Ludhiana (Central Agri & Industrial Hub)",
    tehsils: [
      {
        id: "jagraon",
        name: "Jagraon Mandi & Catchment",
        mandiDeficit: "1,850 L/day unchilled milk deficit in 5km perimeter; 420 Qtl wheat gap",
        feederStatus: "PSPCL AP-Jagraon Feeder: 8.5 hrs day / 8 hrs night uninterrupted 3-phase supply. Commercial transformer within 140m.",
        powerHours: 16.5,
      },
      {
        id: "khanna",
        name: "Khanna Mandi (Asia's Largest Grain Market)",
        mandiDeficit: "Asia's premier foodgrain terminal: 450 Qtl/day grain & pulse processing gap",
        feederStatus: "Khanna Industrial Mixed Feeder: 21.5 hrs high-reliability commercial 415V line. Zero transformer upgrade backlog.",
        powerHours: 21.5,
      },
      {
        id: "samrala",
        name: "Samrala Agro Corridor",
        mandiDeficit: "Dairy & cattle feed deficit: 1,350 L/day unserved in 7km perimeter",
        feederStatus: "Samrala Rural Substation: 16 hrs stable supply, dedicated agro feeder line.",
        powerHours: 16.0,
      },
      {
        id: "raikot",
        name: "Raikot Farming Perimeter",
        mandiDeficit: "Spice grinding & flour gap: 900 kg/day local commercial chakki shortage",
        feederStatus: "Raikot 66kV Grid: 15.5 hrs scheduled farm supply, 10kVA solar sync recommended.",
        powerHours: 15.5,
      },
    ],
  },
  sangrur: {
    name: "Sangrur (Malwa Food Processing Belt)",
    tehsils: [
      {
        id: "dhuri",
        name: "Dhuri Agro Industrial Cluster",
        mandiDeficit: "Dhuri Sugarcane & Agro Belt: 2,400 L/day dairy deficit; PMEGP priority",
        feederStatus: "Dhuri Agricultural Feeder: 18 hrs high-tension 415V line within 180m. DIC Special Category clearance active.",
        powerHours: 18.0,
      },
      {
        id: "sunam",
        name: "Sunam Grain & Pulse Catchment",
        mandiDeficit: "1,550 kg/day pulse splitting & flour demand; direct APMC mandi linkage",
        feederStatus: "Sunam Substation: 17 hrs power supply with automated load balancing.",
        powerHours: 17.0,
      },
      {
        id: "malerkotla",
        name: "Malerkotla (Vegetable Capital)",
        mandiDeficit: "35 MT perishables spoilage risk; micro cold room demand peak in summer",
        feederStatus: "Malerkotla Horticulture Feeder: 20 hrs continuous commercial 3-phase power line.",
        powerHours: 20.0,
      },
      {
        id: "lehragaga",
        name: "Lehragaga Agricultural Belt",
        mandiDeficit: "Farm equipment rental deficit: 650 acres unserved in stubble management",
        feederStatus: "Lehragaga Feeder: 14 hrs daily agricultural power allocation.",
        powerHours: 14.0,
      },
    ],
  },
  patiala: {
    name: "Patiala (Dairy & Mechanization Corridor)",
    tehsils: [
      {
        id: "nabha",
        name: "Nabha Dairy & Farm Machinery Hub",
        mandiDeficit: "Nabha milk corridor: 3,100 L/day bulk milk chilling deficit in 10km",
        feederStatus: "Nabha Agro-Engineering Substation: 21 hrs 415V supply with low voltage fluctuation.",
        powerHours: 21.0,
      },
      {
        id: "rajpura",
        name: "Rajpura Logistics Corridor",
        mandiDeficit: "Food processing & bakery demand: 1,800 kg/day consumer reach gap",
        feederStatus: "Rajpura Highway Feeder: 23 hrs continuous industrial grade power line.",
        powerHours: 23.0,
      },
      {
        id: "samana",
        name: "Samana Paddy & Dairy Catchment",
        mandiDeficit: "1,600 L/day chilling deficit; high cattle density in village clusters",
        feederStatus: "Samana Rural Feeder: 16 hrs reliable agricultural power line.",
        powerHours: 16.0,
      },
    ],
  },
  bathinda: {
    name: "Bathinda (Southwest Cotton & Oilseed Belt)",
    tehsils: [
      {
        id: "talwandi_sabo",
        name: "Talwandi Sabo Rural Hub",
        mandiDeficit: "Mustard & oil expelling deficit: 950 kg/day cold-press oil gap",
        feederStatus: "Guru Kashi Rural Feeder: 16 hrs daily supply, high solar irradiance viability.",
        powerHours: 16.0,
      },
      {
        id: "rampura_phul",
        name: "Rampura Phul Mandi Catchment",
        mandiDeficit: "Grain milling & agro supply deficit: 1,200 kg/day packaged atta gap",
        feederStatus: "Rampura 66kV Grid: 17 hrs stable agricultural 3-phase connection.",
        powerHours: 17.0,
      },
      {
        id: "maur",
        name: "Maur Agro Processing Sector",
        mandiDeficit: "Cottonseed cake & cattle feed deficit: 1,400 kg/day animal feed gap",
        feederStatus: "Maur Commercial Feeder: 16.5 hrs uninterrupted 3-phase line within 160m.",
        powerHours: 16.5,
      },
    ],
  },
};

const STEP_DETAILS: Record<
  number,
  {
    badge: string;
    title: string;
    desc: string;
    checklist: string[];
    method: string;
    endpoint: string;
    logLines: string[];
    highlightResult: string;
    auditMetric: string;
  }
> = {
  1: {
    badge: "Step 1 of 4 • Spatial Setup",
    title: "Enter your exact village location & intended enterprise archetype.",
    desc: "GramVest resolves tehsil boundary definitions, distance to nearest state highway, high-tension power grid feeder reliability, and primary agricultural crop surpluses.",
    checklist: [
      "Automatic pincode & tehsil boundary polygon extraction",
      "Verification of seasonal crop arrivals & unserved milk/grain pools",
      "Applicant category classification (General 25%, SC/ST/Women/OBC 35%)",
    ],
    method: "POST",
    endpoint: "/api/v1/catchment/scan",
    logLines: [
      '// Input location parameters: Punjab Mandi Cluster',
      '"state": "Punjab", "district": "Sangrur", "tehsil": "Dhuri",',
      '"enterprise": "Dairy Value Addition & Chilling Hub",',
      '"grid_category": "PSPCL Agricultural Mixed Feeder (18.0h/day)",',
      '"nearest_apmc_mandi": "Dhuri Grain Terminal (3.2 km)"',
    ],
    highlightResult:
      "✓ 14 Gram Panchayats Identified within 12km radius. Total unserved milk volume: 2,400 L/day.",
    auditMetric: "14 Panchayats In Radius",
  },
  2: {
    badge: "Step 2 of 4 • Geospatial Analytics",
    title: "360-Degree Catchment Scan & Competitor Radius Mapping.",
    desc: "Analyzes actual farmer tractor transit routes, competing processing facilities in a 15km perimeter, and verifies existing unfulfilled Mandi trade procurement inquiries.",
    checklist: [
      "Real-time geofenced competition density audit",
      "Historical APMC Mandi volume deficit & price arbitrage",
      "Haat Day transaction patterns and seasonal peak loads",
    ],
    method: "GET",
    endpoint: "/api/v1/catchment/competition-density",
    logLines: [
      '// Geospatial competition scan: 15km perimeter',
      '"active_competitors": 2 (operating at only 42% capacity),',
      '"unserved_catchment_radius": "12 km",',
      '"mandi_arrival_deficit": "2,400 L/day unchilled milk",',
      '"feasibility_confidence": "91% (Agmarknet & DIC verified)"',
    ],
    highlightResult:
      "✓ 2 Competing units located (operating at 42% capacity). Local Market Deficit: 74% Unserved.",
    auditMetric: "74% Unserved Deficit",
  },
  3: {
    badge: "Step 3 of 4 • Sovereign Grant Matching",
    title: "Automated Government Capital Subsidy Entitlement Check.",
    desc: "Cross-checks central and state schemes including PMEGP, PMFME, SMAM, and AIF to match your demographic and sector for maximum non-repayable capital grants.",
    checklist: [
      "PMEGP 25% to 35% margin money clearance (up to ₹17.5L)",
      "AIF 3% interest subvention + CGTMSE collateral fee waiver",
      "Zero-broker direct DIC application readiness & checklist",
    ],
    method: "CALCULATE",
    endpoint: "/api/v1/subsidies/pmegp-aif",
    logLines: [
      '// Sovereign subsidy rules computation',
      '"matched_scheme": "PMEGP Rural (Category: Special / Rural)",',
      '"project_cost": "₹14,50,000", "promoter_equity_15pct": "₹2,17,500",',
      '"capital_grant_eligible": "₹5,07,500 non-repayable margin money",',
      '"interest_benefit": "CGTMSE guarantee covered (No land mortgage)"',
    ],
    highlightResult:
      "✓ Matched scheme: PMEGP Rural (Special Category). Capital grant eligible: ₹5,07,500 non-repayable.",
    auditMetric: "₹5.07L Capital Subsidy",
  },
  4: {
    badge: "Step 4 of 4 • Lender-Grade Output",
    title: "Export SBI, PNB, and NABARD-Compliant Project Dossier.",
    desc: "Generates a complete 12-page CMA report containing 5-year balance sheet projections, DSCR calculations, and quotation-backed machinery schedules.",
    checklist: [
      "Pre-formatted DSCR (1.82x) financial solvency ratios",
      "Pre-cleared quotation layouts from vetted OEMs",
      "One-click PDF download for Lead District Bank branch submission",
    ],
    method: "GENERATE",
    endpoint: "/api/v1/dossier/bank-cma.pdf",
    logLines: [
      '// CMA underwriting dossier compilation',
      '"status": "100% compliant with RBI Priority Sector Lending",',
      '"dscr_benchmark": "1.82x (comfortably above 1.30x bank hurdle)",',
      '"term_loan": "₹7,25,000", "emi_5yr": "₹15,047 / mo",',
      '"bank_format": "PNB, SBI & Punjab Gramin Bank Lead Standard"',
    ],
    highlightResult:
      "✓ Status: 100% compliant with RBI Priority Sector Lending. Ready for Lead District Manager branch submission.",
    auditMetric: "1.82x DSCR Benchmark",
  },
};

export default function LandingPage() {
  const router = useRouter();

  // Hero Rotator state
  const heroBenefits = [
    "Verify government subsidies up to 35% (PMEGP, AIF) before taking high-interest private debt.",
    "Stop guessing mandi demand before you invest your savings.",
    "Audit 3-phase agricultural power stability before purchasing industrial machinery.",
  ];
  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroBenefits.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBenefits.length]);

  // Simulator state
  const [activeArchetypeKey, setActiveArchetypeKey] = useState<string>("dairy");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ludhiana");
  const [selectedTehsil, setSelectedTehsil] = useState<string>("jagraon");

  const currentArchetype = ARCHETYPES[activeArchetypeKey] || ARCHETYPES.dairy;
  const [scaleValue, setScaleValue] = useState<number>(currentArchetype.defaultScale);

  const handleSelectDistrict = (districtKey: string) => {
    setSelectedDistrict(districtKey);
    const tehsils = PUNJAB_DISTRICTS[districtKey]?.tehsils;
    if (tehsils && tehsils.length > 0) {
      setSelectedTehsil(tehsils[0].id);
    }
  };

  const handleSelectArchetype = (key: string) => {
    setActiveArchetypeKey(key);
    const arch = ARCHETYPES[key];
    if (arch) {
      setScaleValue(arch.defaultScale);
    }
  };

  const currentDistrictObj = PUNJAB_DISTRICTS[selectedDistrict] || PUNJAB_DISTRICTS.ludhiana;
  const currentTehsilObj =
    currentDistrictObj.tehsils.find((t) => t.id === selectedTehsil) || currentDistrictObj.tehsils[0];

  // Dynamic calculations for simulator
  const calculatedCost = Math.round(
    currentArchetype.baseCost +
    (scaleValue - currentArchetype.defaultScale) * currentArchetype.costPerUnit
  );
  const grantAmount = Math.min(
    currentArchetype.maxSubsidy,
    Math.round(calculatedCost * (currentArchetype.subsidyPct / 100))
  );
  const promoterEquity = Math.round(calculatedCost * 0.15);
  const bankLoan = Math.max(0, calculatedCost - grantAmount - promoterEquity);
  const monthlyEmi = Math.round((bankLoan * 0.09 * (1.09 ** 5)) / ((1.09 ** 5) - 1) / 12);
  const projectedMargin = Math.round(
    currentArchetype.marginBase * (scaleValue / currentArchetype.defaultScale)
  );
  const gridStatusText = currentTehsilObj.feederStatus;
  const mandiDeficitText = currentTehsilObj.mandiDeficit;
  const feasibilityScore = Math.min(94, Math.max(76, Math.round(78 + (currentArchetype.deficitPct / 10) + (currentArchetype.subsidyPct / 20))));
  
  // 4-Step Engine state
  const [activeEngineStep, setActiveEngineStep] = useState<number>(1);
  const [isSimulatingStep, setIsSimulatingStep] = useState<boolean>(false);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);

  const handleTriggerSimulation = (stepNum: number) => {
    setActiveEngineStep(stepNum);
    setIsSimulatingStep(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setIsSimulatingStep(false);
      setSimulationComplete(true);
    }, 600);
  };
  const stepData = STEP_DETAILS[activeEngineStep];

  // Accordion FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(1);
  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-[#fff8f2] text-[#241b16] min-h-screen selection:bg-[#c75d3e] selection:text-white font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#fff8f2]/90 backdrop-blur-md border-b border-[#ede3d8]/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link aria-label="GramVest Home" className="flex items-center py-1 group" href="/">
            <Image
              src="/gramvest_logo3.png"
              alt="GramVest"
              width={160}
              height={56}
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#382f29]">
            <a className="hover:text-[#c75d3e] transition-colors" href="#simulator">
              Catchment Simulator
            </a>
            <a className="hover:text-[#c75d3e] transition-colors" href="#ground-truth">
              Ground Truth
            </a>
            <a className="hover:text-[#c75d3e] transition-colors" href="#engine">
              4-Step Engine
            </a>
            <a className="hover:text-[#c75d3e] transition-colors" href="#faqs">
              FAQs
            </a>
          </nav>

          {/* CTA and Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link
              className="hidden sm:inline-block text-sm font-semibold text-[#382f29] hover:text-[#c75d3e] transition-colors"
              href="/dashboard"
            >
              Sign In
            </Link>
            <Link
              className="relative group overflow-hidden rounded-xl bg-[#c75d3e] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#bd5537] transition-all transform hover:-translate-y-0.5"
              href="/onboarding"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Start Feasibility Check
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </span>
              <span className="absolute top-0 -left-full w-full h-full bg-white/20 transform skew-x-12 group-hover:left-full transition-all duration-700 ease-out"></span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* BEGIN: HeroSection */}
        <section className="relative pt-12 pb-20 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Copy & CTAs */}
              <div className="lg:col-span-7 space-y-7">
                {/* Live Status Pill & Voice Search Announcement */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#ede3d8] shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3a6b4c] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3a6b4c]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#382f29] tracking-wide uppercase">
                      Hyper-Local Punjab Business Intelligence
                    </span>
                  </div>
                  <Link
                    href="/onboarding"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fcedea] hover:bg-[#fbdad3] text-[#c75d3e] text-xs font-bold border border-[#c75d3e]/25 transition-all shadow-2xs"
                  >
                    <span>🎙️ Multilingual Voice Search Active</span>
                    <span className="text-[10px] font-extrabold bg-[#c75d3e] text-white px-1.5 py-0.5 rounded-md">New</span>
                  </Link>
                </div>

                {/* Main Question & Headline */}
                <div className="space-y-3">
                  <p className="font-serif italic text-lg md:text-xl text-[#786d65]">
                    Thinking of starting a business in your village or town?
                  </p>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#241b16] leading-[1.18]">
                    Stop guessing mandi demand before you invest your savings.
                  </h1>
                </div>

                {/* Rotating Impact Sub-Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-[#ede3d8]/80 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#c75d3e] tracking-wider uppercase">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Verified Capital Advantage
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-[#382f29] transition-opacity duration-300 min-h-[56px] flex items-center">
                    {heroBenefits[currentHeroIdx]}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    {heroBenefits.map((_, idx) => (
                      <button
                        suppressHydrationWarning
                        key={idx}
                        onClick={() => setCurrentHeroIdx(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${currentHeroIdx === idx
                            ? "bg-[#c75d3e] w-6"
                            : "bg-[#ede3d8] w-2"
                          }`}
                        aria-label={`Show benefit ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Core Value Paragraph */}
                <p className="text-base sm:text-lg text-[#786d65] leading-relaxed">
                  GramVest models real footfall, competing village mills, true equipment power tariffs, and unlocks qualifying capital grants (
                  <span className="text-[#241b16] font-semibold">PMEGP, AIF, Mudra</span>
                  ) for your exact tehsil.
                </p>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    className="inline-flex justify-center items-center gap-2 px-7 py-4 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-base font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                    href="/onboarding"
                  >
                    Run Free 3-Min Business Check
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                  <a
                    className="inline-flex justify-center items-center gap-2 px-6 py-4 rounded-xl bg-white border border-[#ede3d8] hover:border-[#c75d3e] text-[#382f29] text-base font-semibold transition-all"
                    href="#simulator"
                  >
                    <svg
                      className="w-5 h-5 text-[#3a6b4c]"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10 8 16 12 10 16 10 8"></polygon>
                    </svg>
                    Explore Live Catchment Demo
                  </a>
                </div>

                {/* Ground-Truth Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-[#786d65] font-medium">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-[#3a6b4c] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Takes 3 minutes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-[#3a6b4c] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Zero bank details required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-[#3a6b4c] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Free instant ledger
                  </span>
                </div>
              </div>

              {/* Right Column: Visual Portrait & Live Telemetry Overlays */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Ambient Halo Glow behind portrait */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[#c75d3e]/20 via-[#3a6b4c]/15 to-transparent rounded-3xl blur-2xl -z-10"></div>

                  {/* Main Hero Image Frame */}
                  <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-[#ede3d8]">
                    <img
                      alt="Rural Entrepreneur surveying modern agricultural venture feasibility in Punjab workshop"
                      className="w-full h-[470px] object-cover object-center transform hover:scale-102 transition-transform duration-500"
                      src="/dairy_entrepreneur.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#241b16]/80 via-transparent to-black/20 pointer-events-none"></div>

                    {/* Bottom Image Banner Content */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs uppercase tracking-wider text-[#d4e6c1] font-bold">
                        Verified Micro-Enterprise Profile
                      </p>
                      <p className="text-base font-serif font-semibold">
                        Dairy Value Addition Hub • Gurpreet S., Jagraon
                      </p>
                    </div>
                  </div>

                  {/* Floating Live Metric Badge 1 (Top Left Overhang) */}
                  <div className="absolute -top-6 -left-4 sm:-left-8 bg-white/95 backdrop-blur-sm border border-[#ede3d8] p-3.5 rounded-2xl shadow-lg max-w-[240px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#786d65]">
                        Catchment Score
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#d4e6c1] text-[#3a6b4c]">
                        74 / 100
                      </span>
                    </div>
                    <div className="w-full bg-[#ede3d8]/60 rounded-full h-1.5 mb-1.5 overflow-hidden">
                      <div className="bg-[#3a6b4c] h-1.5 rounded-full w-3/4"></div>
                    </div>
                    <p className="text-xs font-semibold text-[#241b16]">
                      Jagraon Mandi Catchment
                    </p>
                    <p className="text-[10px] text-[#786d65]">
                      1,850 L/day unchilled milk deficit in 5km
                    </p>
                  </div>

                  {/* Floating Live Metric Badge 2 (Mid-Right Overhang) */}
                  <div className="absolute top-1/2 -right-4 sm:-right-8 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm border border-[#ede3d8] p-3.5 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#c75d3e]/10 flex items-center justify-center text-[#c75d3e]">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#786d65]">
                          Unmet Local Demand
                        </span>
                        <p className="text-sm font-bold text-[#241b16]">
                          ~1,850 Ltrs / Day
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Live Metric Badge 3 (Bottom Centered Overhang) */}
                  <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 w-11/12 bg-white/95 backdrop-blur-sm border border-[#ede3d8] px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3a6b4c]"></div>
                      <div>
                        <p className="text-[11px] font-bold text-[#382f29]">
                          PMEGP Grant Sanction
                        </p>
                        <p className="text-xs font-serif font-bold text-[#c75d3e]">
                          ₹3,15,000 grant eligible (35%)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#f0f6ec] text-[#3a6b4c] border border-[#3a6b4c]/30">
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: HeroSection */}

        {/* BEGIN: RealTimeMetricsTicker */}
        <section className="bg-white border-y border-[#ede3d8] py-8 relative shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#ede3d8]">
              <div className="text-center pt-2 md:pt-0">
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#241b16]">₹18.4 Cr+</span>
                <p className="text-xs font-bold text-[#786d65] mt-1">Sovereign Grants Mapped</p>
                <span className="text-[10px] text-[#3a6b4c] font-extrabold uppercase tracking-wider block mt-0.5">
                  PMEGP • PMFME • SMAM • AIF
                </span>
              </div>
              <div className="text-center pt-4 md:pt-0 md:pl-4">
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#241b16]">22 Mandis</span>
                <p className="text-xs font-bold text-[#786d65] mt-1">Daily APMC Price Feeds</p>
                <span className="text-[10px] text-[#3a6b4c] font-extrabold uppercase tracking-wider block mt-0.5">
                  Arrival Deficit Radar
                </span>
              </div>
              <div className="text-center pt-4 md:pt-0 md:pl-4">
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#241b16]">14,200+</span>
                <p className="text-xs font-bold text-[#786d65] mt-1">Panchayats Feeder Tracked</p>
                <span className="text-[10px] text-[#3a6b4c] font-extrabold uppercase tracking-wider block mt-0.5">
                  PSPCL 3-Phase Grid Telemetry
                </span>
              </div>
              <div className="text-center pt-4 md:pt-0 md:pl-4">
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#241b16]">1.82x DSCR</span>
                <p className="text-xs font-bold text-[#786d65] mt-1">Average Solvency Ratio</p>
                <span className="text-[10px] text-[#3a6b4c] font-extrabold uppercase tracking-wider block mt-0.5">
                  Exceeds 1.30x Bank Hurdle
                </span>
              </div>
              <div className="col-span-2 md:col-span-1 text-center pt-4 md:pt-0 md:pl-4">
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#c75d3e]">&lt; 3 Mins</span>
                <p className="text-xs font-bold text-[#786d65] mt-1">Bankable CMA Dossier</p>
                <span className="text-[10px] text-[#c75d3e] font-extrabold uppercase tracking-wider block mt-0.5">
                  Instant Lead Bank PDF
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* END: RealTimeMetricsTicker */}

        {/* BEGIN: StandoutSimulator */}
        <section className="py-20 bg-[#faf4ee] border-y border-[#ede3d8] relative" id="simulator">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fcedea] text-[#c75d3e] uppercase tracking-wider">
                Real-Time Sandbox • Punjab Mandi Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#241b16] font-serif">
                Instant Rural Catchment &amp; Subsidy Simulator
              </h2>
              <p className="text-base text-[#786d65]">
                Select your intended enterprise archetype, Punjab tehsil catchment, and capacity to simulate live feasibility, sovereign grant entitlements, and lender underwriting metrics.
              </p>
            </div>

            {/* Simulator Container Grid */}
            <div className="bg-white rounded-3xl border border-[#ede3d8] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Controls Panel (Left) */}
              <div className="p-6 sm:p-8 lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#ede3d8] space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider">
                      1. Select Commercial Enterprise Archetype
                    </label>
                    <span className="text-[10px] font-bold text-[#3a6b4c] bg-[#f0f6ec] px-2 py-0.5 rounded-full border border-[#3a6b4c]/20">
                      6 Verified Sectors
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {Object.keys(ARCHETYPES).map((key) => {
                      const arch = ARCHETYPES[key];
                      const isSelected = activeArchetypeKey === key;
                      return (
                        <button
                          suppressHydrationWarning
                          key={key}
                          onClick={() => handleSelectArchetype(key)}
                          type="button"
                          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#c75d3e] bg-[#fcedea]/60 text-[#c75d3e] shadow-2xs ring-1 ring-[#c75d3e]/30"
                              : "border-[#ede3d8] bg-white text-[#382f29] hover:border-[#c75d3e]/50 hover:bg-[#faf4ee]/40"
                          }`}
                        >
                          <span className="text-2xl mb-1">{arch.emoji}</span>
                          <div>
                            <p className="text-xs font-bold leading-tight">{arch.title}</p>
                            <p className="text-[10px] text-[#786d65] mt-0.5 line-clamp-1">
                              {arch.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* District & Tehsil Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label
                      className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2"
                      htmlFor="district-select"
                    >
                      Target Punjab District
                    </label>
                    <select
                      suppressHydrationWarning
                      id="district-select"
                      value={selectedDistrict}
                      onChange={(e) => handleSelectDistrict(e.target.value)}
                      className="w-full rounded-xl border-[#ede3d8] bg-[#faf4ee]/40 text-xs sm:text-sm font-semibold text-[#382f29] focus:border-[#c75d3e] focus:ring-[#c75d3e] p-2.5 cursor-pointer"
                    >
                      {Object.keys(PUNJAB_DISTRICTS).map((dKey) => (
                        <option key={dKey} value={dKey}>
                          {PUNJAB_DISTRICTS[dKey].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2"
                      htmlFor="tehsil-select"
                    >
                      Target Mandi / Tehsil
                    </label>
                    <select
                      suppressHydrationWarning
                      id="tehsil-select"
                      value={selectedTehsil}
                      onChange={(e) => setSelectedTehsil(e.target.value)}
                      className="w-full rounded-xl border-[#ede3d8] bg-[#faf4ee]/40 text-xs sm:text-sm font-semibold text-[#382f29] focus:border-[#c75d3e] focus:ring-[#c75d3e] p-2.5 cursor-pointer"
                    >
                      {currentDistrictObj.tehsils.map((tObj) => (
                        <option key={tObj.id} value={tObj.id}>
                          {tObj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Volume Capacity Slider */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label
                      className="text-xs font-bold text-[#786d65] uppercase tracking-wider"
                      htmlFor="volume-range"
                    >
                      Target Operating Volume / Scale
                    </label>
                    <span className="text-xs sm:text-sm font-bold text-[#c75d3e] bg-[#fcedea] px-3 py-1 rounded-xl border border-[#c75d3e]/20">
                      {scaleValue.toLocaleString()} {currentArchetype.unit}
                    </span>
                  </div>
                  <input
                    id="volume-range"
                    type="range"
                    min={currentArchetype.minScale}
                    max={currentArchetype.maxScale}
                    step={currentArchetype.scaleStep}
                    value={scaleValue}
                    onChange={(e) => setScaleValue(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
                  />
                  <div className="flex justify-between text-[11px] font-medium text-[#786d65]">
                    <span>Micro Unit ({currentArchetype.minScale} {currentArchetype.unit})</span>
                    <span>Commercial Hub ({currentArchetype.defaultScale} {currentArchetype.unit})</span>
                    <span>Cluster Scale ({currentArchetype.maxScale} {currentArchetype.unit})</span>
                  </div>
                </div>

                {/* Real-time Feasibility & Grid Clearance Box */}
                <div className="p-4 rounded-2xl bg-[#f0f6ec] border border-[#3a6b4c]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#3a6b4c] uppercase tracking-wider flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 text-[#3a6b4c]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      PSPCL Grid &amp; Mandi Feeder Intel
                    </p>
                    <span className="text-[10px] font-bold text-[#3a6b4c] bg-white px-2 py-0.5 rounded-md border border-[#3a6b4c]/20">
                      {currentTehsilObj.powerHours}h/day Power
                    </span>
                  </div>
                  <p className="text-xs text-[#241b16] font-medium leading-relaxed">
                    {gridStatusText}
                  </p>
                  <p className="text-[11px] text-[#786d65] pt-1 border-t border-[#3a6b4c]/15">
                    <strong>Local Market Gap:</strong> {mandiDeficitText}
                  </p>
                </div>
              </div>

              {/* Output Results Dossier Card (Right) */}
              <div className="p-6 sm:p-8 lg:col-span-6 bg-gradient-to-br from-white via-[#faf4ee]/40 to-[#fff8f2] flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#ede3d8] pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65]">
                        Live Capital Ledger • {currentTehsilObj.name}
                      </span>
                      <h3 className="text-xl font-bold font-serif text-[#241b16]">
                        {currentArchetype.title}
                      </h3>
                      <p className="text-xs text-[#786d65] mt-0.5">
                        Capacity: {scaleValue.toLocaleString()} {currentArchetype.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#3a6b4c] text-white shadow-xs">
                        Feasible ({feasibilityScore}/100)
                      </span>
                      <span className="text-[10px] block text-[#786d65] mt-0.5 font-medium">PSL Tier-1 Match</span>
                    </div>
                  </div>

                  {/* Metric Matrix Cards */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] shadow-xs hover:border-[#c75d3e]/30 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65] block">
                        Total Project CaPEx
                      </span>
                      <p className="text-lg font-serif font-bold text-[#241b16] mt-1">
                        ₹{calculatedCost.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-[#786d65] mt-0.5">
                        Machinery + Shed + Power
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] shadow-xs hover:border-[#3a6b4c]/30 transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#3a6b4c] block">
                        Eligible Sovereign Grant
                      </span>
                      <p className="text-lg font-serif font-bold text-[#3a6b4c] mt-1">
                        ₹{grantAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-[#3a6b4c] font-semibold truncate mt-0.5" title={currentArchetype.subsidyName}>
                        {currentArchetype.subsidyName}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65] block">
                        Promoter Margin (15%)
                      </span>
                      <p className="text-lg font-serif font-bold text-[#241b16] mt-1">
                        ₹{promoterEquity.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-[#786d65] mt-0.5">
                        Mandatory Equity Buffer
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65] block">
                        Net Bank Term Loan
                      </span>
                      <p className="text-lg font-serif font-bold text-[#c75d3e] mt-1">
                        ₹{bankLoan.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-[#786d65] mt-0.5">
                        EMI: ~₹{monthlyEmi.toLocaleString("en-IN")}/mo (5 Yrs)
                      </p>
                    </div>
                  </div>

                  {/* Net Monthly Margin & DSCR row */}
                  <div className="p-4 rounded-2xl bg-white border border-[#ede3d8] shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65] block">
                        Projected Monthly Net Profit
                      </span>
                      <p className="text-xl font-serif font-extrabold text-[#3a6b4c] mt-0.5">
                        ₹{projectedMargin.toLocaleString("en-IN")} / mo
                      </p>
                      <p className="text-[10px] text-[#786d65]">
                        Estimated Break-Even: 7 - 9 Months
                      </p>
                    </div>
                    <div className="text-right border-l border-[#ede3d8] pl-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65] block">
                        Lender DSCR Ratio
                      </span>
                      <p className="text-xl font-serif font-extrabold text-[#241b16] mt-0.5">
                        {currentArchetype.dscrBenchmark}x
                      </p>
                      <span className="text-[10px] text-[#3a6b4c] font-bold">
                        Exceeds 1.30x Bank Hurdle
                      </span>
                    </div>
                  </div>

                  {/* Deficit Visual Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-[#382f29]">
                      <span>Catchment Deficit Coverage</span>
                      <span className="font-bold text-[#c75d3e]">{currentArchetype.deficitPct}% Unserved Demand</span>
                    </div>
                    <div className="w-full bg-[#ede3d8]/70 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#c75d3e] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${currentArchetype.deficitPct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-[#786d65]">
                      <span>Mandi Arrival Deficit: {currentArchetype.unmetDemand}</span>
                      <span>Target: {scaleValue.toLocaleString()} {currentArchetype.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="pt-4 border-t border-[#ede3d8] flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href="/onboarding"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-xs sm:text-sm font-bold shadow-warm-md transition-all transform hover:-translate-y-0.5"
                  >
                    <span>Configure in Full 6-Step Wizard</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                  <Link
                    href="/report"
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] text-xs font-bold hover:bg-[#faf4ee] transition-colors text-center"
                  >
                    Pre-Vetted CMA Ledger (PDF)
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BEGIN: ComparativeSection */}
        <section className="py-20 bg-[#fff8f2]" id="ground-truth">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14 space-y-3">
              <span className="text-xs font-bold text-[#3a6b4c] uppercase tracking-wider bg-[#f0f6ec] px-3 py-1 rounded-full border border-[#3a6b4c]/20">
                Ground Truth vs Rural Myths
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16] mt-2">
                Why 80% of rural ventures struggle vs how GramVest protects you
              </h2>
              <p className="text-base text-[#786d65]">
                Most village businesses fail not due to lack of hard work, but from inaccurate footfall estimates, unvetted power loads, broker cuts on sovereign subsidies, and generic handwritten loan files.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Contrast Card 1 */}
              <div className="bg-white rounded-3xl border border-[#ede3d8] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" x2="9" y1="9" y2="15"></line>
                        <line x1="9" x2="15" y1="9" y2="15"></line>
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Common Trap
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#241b16]">
                      The &ldquo;Radius Footfall&rdquo; Illusion
                    </h3>
                    <p className="text-xs text-[#786d65] mt-1.5 leading-relaxed">
                      Assuming everyone within a 10km circle will buy from you. In reality, existing informal credit chains (arhtiyas) and weekly haat schedules dictate true rural trade.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ede3d8]/80 bg-[#f0f6ec] -mx-6 -mb-6 p-5 rounded-b-3xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c]">
                      GramVest Ground Truth
                    </span>
                    <span className="text-[10px] font-bold text-[#3a6b4c] bg-white px-1.5 py-0.5 rounded border border-[#3a6b4c]/20">
                      +42% Accuracy
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#241b16] leading-relaxed">
                    Maps 14-panchayat daily mandi traffic vectors, tractor intersections, and informal ledger debts to predict genuine customer capture.
                  </p>
                </div>
              </div>

              {/* Contrast Card 2 */}
              <div className="bg-white rounded-3xl border border-[#ede3d8] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Common Trap
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#241b16]">
                      Unplanned 3-Phase &amp; Diesel Burn
                    </h3>
                    <p className="text-xs text-[#786d65] mt-1.5 leading-relaxed">
                      Purchasing heavy 3-phase machinery only to discover your local rural feeder supplies low voltage during daytime milling hours, burning cash on diesel generators.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ede3d8]/80 bg-[#f0f6ec] -mx-6 -mb-6 p-5 rounded-b-3xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c]">
                      GramVest Ground Truth
                    </span>
                    <span className="text-[10px] font-bold text-[#3a6b4c] bg-white px-1.5 py-0.5 rounded border border-[#3a6b4c]/20">
                      Saves ₹1.85L/yr
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#241b16] leading-relaxed">
                    Audits PSPCL substation feeder schedules, historical voltage stability, and sizes hybrid solar-diesel setups to protect operational margin.
                  </p>
                </div>
              </div>

              {/* Contrast Card 3 */}
              <div className="bg-white rounded-3xl border border-[#ede3d8] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="18" x2="23" y1="8" y2="13"></line>
                        <line x1="23" x2="18" y1="8" y2="13"></line>
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Common Trap
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#241b16]">
                      Middleman Subsidy Cuts (15%)
                    </h3>
                    <p className="text-xs text-[#786d65] mt-1.5 leading-relaxed">
                      Paying 10% to 15% commissions to touts for PMEGP/PMFME dossiers that get rejected at the District Industries Centre (DIC) due to amateur DPR formatting.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ede3d8]/80 bg-[#f0f6ec] -mx-6 -mb-6 p-5 rounded-b-3xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c]">
                      GramVest Ground Truth
                    </span>
                    <span className="text-[10px] font-bold text-[#3a6b4c] bg-white px-1.5 py-0.5 rounded border border-[#3a6b4c]/20">
                      0% Broker Fee
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#241b16] leading-relaxed">
                    Auto-generates 100% compliant Detailed Project Reports directly aligned with official KVIC/DIC checklists for direct portal submission.
                  </p>
                </div>
              </div>

              {/* Contrast Card 4 */}
              <div className="bg-white rounded-3xl border border-[#ede3d8] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:shadow-md transition-shadow">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Common Trap
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#241b16]">
                      Generic Handwritten Loan Files
                    </h3>
                    <p className="text-xs text-[#786d65] mt-1.5 leading-relaxed">
                      70% of rural enterprise loan requests are rejected at bank branches due to missing Debt Service Coverage Ratios (DSCR) or unverified machinery proformas.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ede3d8]/80 bg-[#f0f6ec] -mx-6 -mb-6 p-5 rounded-b-3xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c]">
                      GramVest Ground Truth
                    </span>
                    <span className="text-[10px] font-bold text-[#3a6b4c] bg-white px-1.5 py-0.5 rounded border border-[#3a6b4c]/20">
                      1.82x Solvency
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#241b16] leading-relaxed">
                    Compiles 12-page CMA reports strictly formatted for SBI, PNB, and Lead District Bank branch managers with pre-vetted OEM quotations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: ComparativeSection */}

        {/* BEGIN: FourStepEngine */}
        <section className="py-20 bg-[#faf4ee] border-t border-[#ede3d8]" id="engine">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold text-[#c75d3e] uppercase tracking-wider bg-[#fcedea] px-3 py-1 rounded-full border border-[#c75d3e]/20">
                Institutional Methodology
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16]">
                The 4-Step Feasibility Engine
              </h2>
              <p className="text-base text-[#786d65]">
                From raw village enterprise intention to lender-grade loan sanction dossier in under three minutes.
              </p>
            </div>

            {/* 4 Step Interactive Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {[
                { stepNum: 1, label: "01. Input Village & Trade", title: "Specify Location" },
                { stepNum: 2, label: "02. Catchment Scan", title: "Deficit & Competition" },
                { stepNum: 3, label: "03. Grant Matching", title: "PMEGP & AIF Schemes" },
                { stepNum: 4, label: "04. Bank-Vetted Dossier", title: "Lender-Grade Output" },
              ].map((t) => {
                const isActive = activeEngineStep === t.stepNum;
                return (
                  <button
                    suppressHydrationWarning
                    key={t.stepNum}
                    onClick={() => handleTriggerSimulation(t.stepNum)}
                    type="button"
                    className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#c75d3e] bg-white shadow-sm ring-1 ring-[#c75d3e]/30"
                        : "border-transparent bg-white/70 hover:bg-white text-[#786d65]"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold block mb-1 ${
                        isActive ? "text-[#c75d3e]" : "text-[#786d65]"
                      }`}
                    >
                      {t.label}
                    </span>
                    <span className="text-sm font-serif font-bold text-[#241b16]">
                      {t.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Step Content Presentation Card */}
            <div className="bg-white rounded-3xl border border-[#ede3d8] p-6 sm:p-10 lg:p-12 shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fcedea] text-[#c75d3e]">
                    <span>{stepData.badge}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c75d3e]"></span>
                    <span className="text-[10px] font-extrabold uppercase">{stepData.auditMetric}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#241b16] leading-tight">
                    {stepData.title}
                  </h3>
                  <p className="text-base text-[#786d65] leading-relaxed">
                    {stepData.desc}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-[#382f29]">
                    {stepData.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#f0f6ec] text-[#3a6b4c] flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-3.5 h-3.5 text-[#3a6b4c]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span className="font-medium text-xs sm:text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => handleTriggerSimulation(activeEngineStep)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf4ee] hover:bg-[#ede3d8] text-[#241b16] text-xs font-bold border border-[#ede3d8] transition-colors cursor-pointer"
                    >
                      <svg className={`w-3.5 h-3.5 text-[#c75d3e] ${isSimulatingStep ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      <span>{isSimulatingStep ? "Simulating Pipeline..." : "Re-Run Step Audit"}</span>
                    </button>
                    <Link
                      href="/onboarding"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Try Step in 6-Step Wizard</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Simulated Telemetry Graphic Card */}
                <div className="lg:col-span-6 bg-[#1f1915] rounded-3xl p-6 border border-[#382f29] shadow-xl space-y-4 text-white">
                  <div className="flex items-center justify-between pb-3 border-b border-[#382f29]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                      <span className="text-[11px] font-mono text-[#ede3d8]/60 ml-2">
                        gramvest_engine_v3.2.live
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#d4e6c1] bg-[#3a6b4c]/30 px-2 py-0.5 rounded border border-[#3a6b4c]/50">
                      {isSimulatingStep ? "PROCESSING..." : "VERIFIED 200 OK"}
                    </span>
                  </div>

                  <div className="font-mono text-xs space-y-2.5">
                    <p className="flex items-center gap-2">
                      <span className="text-[#c75d3e] font-bold px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
                        {stepData.method}
                      </span>
                      <span className="text-[#ede3d8]/80">{stepData.endpoint}</span>
                    </p>

                    <div className="p-4 bg-black/40 rounded-xl border border-[#382f29]/80 space-y-1.5 font-mono text-[11px] leading-relaxed">
                      {isSimulatingStep ? (
                        <div className="py-4 text-center text-[#d4e6c1] animate-pulse">
                          Syncing Agmarknet Punjab Mandi &amp; PSPCL Grid Feeder Logs...
                        </div>
                      ) : (
                        stepData.logLines.map((line, idx) => (
                          <p
                            key={idx}
                            className={
                              idx === 0
                                ? "text-[#ede3d8]/50 italic"
                                : line.includes("✓") || line.includes("compliant") || line.includes("100%")
                                ? "text-[#d4e6c1] font-semibold"
                                : "text-[#ede3d8]/90"
                            }
                          >
                            {line}
                          </p>
                        ))
                      )}
                    </div>

                    <div className="p-3.5 bg-[#3a6b4c]/20 rounded-xl border border-[#3a6b4c]/40 text-[#d4e6c1] text-[11px] font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#d4e6c1] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>{stepData.highlightResult}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: FourStepEngine */}

        {/* BEGIN: SchemeShowcaseSection */}
        <section className="py-20 bg-white border-t border-[#ede3d8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
              <div className="max-w-2xl space-y-3">
                <span className="text-xs font-bold text-[#3a6b4c] uppercase tracking-wider bg-[#f0f6ec] px-3 py-1 rounded-full border border-[#3a6b4c]/20">
                  Direct Institutional Linkage
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16]">
                  Pre-Integrated Sovereign Grants &amp; Institutional Credit
                </h2>
                <p className="text-base text-[#786d65]">
                  GramVest maps your rural venture directly against central &amp; state subsidy guidelines with zero broker fees. Every scheme is cross-checked against Punjab Lead District Bank requirements.
                </p>
              </div>
              <Link
                href="/financing"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#c75d3e] hover:text-[#bd5537] hover:underline"
              >
                <span>View All 10 Schemes on Financing Desk</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Scheme Card 1 */}
              <div className="rounded-3xl border border-[#ede3d8] bg-[#faf4ee]/40 p-6 flex flex-col justify-between hover:border-[#c75d3e]/50 hover:bg-white hover:shadow-md transition-all space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c75d3e] bg-[#fcedea] px-2 py-0.5 rounded-full border border-[#c75d3e]/20">
                      35% Margin Money
                    </span>
                    <span className="text-xs font-mono font-bold text-[#786d65]">MoMSME / KVIC</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#241b16]">
                    PMEGP Rural Credit Subsidy
                  </h3>
                  <p className="text-xs text-[#786d65] leading-relaxed">
                    Sovereign non-repayable capital grant for rural micro-manufacturing and agro-processing up to ₹50 Lakhs project cost.
                  </p>
                  <div className="pt-2 space-y-1.5 text-xs text-[#382f29] font-medium">
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Grant Cap:</span>
                      <span className="font-bold text-[#3a6b4c]">Up to ₹17,50,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Tenure:</span>
                      <span>60 Months (6 Mo Moratorium)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Guarantee:</span>
                      <span className="text-[#3a6b4c] font-semibold">CGTMSE Collateral-Free</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/financing"
                  className="w-full py-2.5 rounded-xl border border-[#ede3d8] bg-white text-center text-xs font-bold text-[#241b16] hover:bg-[#faf4ee] hover:border-[#c75d3e] transition-colors"
                >
                  Verify PMEGP Fit →
                </Link>
              </div>

              {/* Scheme Card 2 */}
              <div className="rounded-3xl border border-[#ede3d8] bg-[#faf4ee]/40 p-6 flex flex-col justify-between hover:border-[#c75d3e]/50 hover:bg-white hover:shadow-md transition-all space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c] bg-[#f0f6ec] px-2 py-0.5 rounded-full border border-[#3a6b4c]/20">
                      35% Cluster Grant
                    </span>
                    <span className="text-xs font-mono font-bold text-[#786d65]">MOFPI / Punjab Agro</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#241b16]">
                    PMFME Micro Food Processing
                  </h3>
                  <p className="text-xs text-[#786d65] leading-relaxed">
                    Credit-linked capital grant for flour mills, spice units, bakeries, and ODOP (One District One Product) micro-units.
                  </p>
                  <div className="pt-2 space-y-1.5 text-xs text-[#382f29] font-medium">
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Grant Cap:</span>
                      <span className="font-bold text-[#3a6b4c]">Up to ₹10,000,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Tenure:</span>
                      <span>84 Months (Extended)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Coverage:</span>
                      <span className="text-[#3a6b4c] font-semibold">PAIC Punjab Priority</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/financing"
                  className="w-full py-2.5 rounded-xl border border-[#ede3d8] bg-white text-center text-xs font-bold text-[#241b16] hover:bg-[#faf4ee] hover:border-[#c75d3e] transition-colors"
                >
                  Verify PMFME Fit →
                </Link>
              </div>

              {/* Scheme Card 3 */}
              <div className="rounded-3xl border border-[#ede3d8] bg-[#faf4ee]/40 p-6 flex flex-col justify-between hover:border-[#c75d3e]/50 hover:bg-white hover:shadow-md transition-all space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#241b16] bg-[#ede3d8] px-2 py-0.5 rounded-full">
                      40% - 50% Capital Grant
                    </span>
                    <span className="text-xs font-mono font-bold text-[#786d65]">DA&amp;FW / Punjab Agri</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#241b16]">
                    SMAM Custom Hiring Centre (CHC)
                  </h3>
                  <p className="text-xs text-[#786d65] leading-relaxed">
                    Sub-Mission on Agricultural Mechanization grant for farm tractors, laser levelers, and crop residue straw equipment.
                  </p>
                  <div className="pt-2 space-y-1.5 text-xs text-[#382f29] font-medium">
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Grant Cap:</span>
                      <span className="font-bold text-[#3a6b4c]">Up to ₹10,000,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Tenure:</span>
                      <span>60 Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Focus:</span>
                      <span className="text-[#3a6b4c] font-semibold">Stubble &amp; Tillage Service</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/financing"
                  className="w-full py-2.5 rounded-xl border border-[#ede3d8] bg-white text-center text-xs font-bold text-[#241b16] hover:bg-[#faf4ee] hover:border-[#c75d3e] transition-colors"
                >
                  Verify SMAM Fit →
                </Link>
              </div>

              {/* Scheme Card 4 */}
              <div className="rounded-3xl border border-[#ede3d8] bg-[#faf4ee]/40 p-6 flex flex-col justify-between hover:border-[#c75d3e]/50 hover:bg-white hover:shadow-md transition-all space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c] bg-[#f0f6ec] px-2 py-0.5 rounded-full border border-[#3a6b4c]/20">
                      3% Interest Subvention
                    </span>
                    <span className="text-xs font-mono font-bold text-[#786d65]">MoA&amp;FW / NABARD</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#241b16]">
                    Agriculture Infrastructure Fund (AIF)
                  </h3>
                  <p className="text-xs text-[#786d65] leading-relaxed">
                    Long-term debt financing with 3% p.a. interest subvention up to ₹2 Crore for post-harvest cold chains and pack houses.
                  </p>
                  <div className="pt-2 space-y-1.5 text-xs text-[#382f29] font-medium">
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Subvention:</span>
                      <span className="font-bold text-[#3a6b4c]">3.0% for 7 Years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Tenure:</span>
                      <span>Up to 120 Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786d65]">Moratorium:</span>
                      <span className="text-[#3a6b4c] font-semibold">Up to 24 Months</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/financing"
                  className="w-full py-2.5 rounded-xl border border-[#ede3d8] bg-white text-center text-xs font-bold text-[#241b16] hover:bg-[#faf4ee] hover:border-[#c75d3e] transition-colors"
                >
                  Verify AIF Fit →
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* END: SchemeShowcaseSection */}

        {/* BEGIN: AccordionFAQs */}
        <section className="py-20 bg-[#faf4ee] border-t border-[#ede3d8]" id="faqs">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-bold text-[#c75d3e] uppercase tracking-wider bg-[#fcedea] px-3 py-1 rounded-full border border-[#c75d3e]/20">
                Clear Clarity
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16]">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-[#786d65]">
                Transparent answers on Punjab mandi datasets, sovereign subsidies, and bank acceptance.
              </p>
            </div>

            <div className="space-y-4">
              {/* FAQ 1 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  suppressHydrationWarning
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(1)}
                  type="button"
                >
                  <span>Do I need to enter my Aadhaar or personal bank account number?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${
                      openFaq === 1 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaq === 1 && (
                  <div className="px-5 pb-5 text-sm text-[#786d65] leading-relaxed">
                    No. GramVest does not request or store Aadhaar numbers, personal bank accounts, or sensitive identity tokens. Feasibility scans are based purely on geographic cluster dynamics, commercial census data, and tehsil electricity feeder telemetry.
                  </div>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  suppressHydrationWarning
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(2)}
                  type="button"
                >
                  <span>How accurate is the local tehsil competition and mandi data?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${
                      openFaq === 2 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaq === 2 && (
                  <div className="px-5 pb-5 text-sm text-[#786d65] leading-relaxed">
                    Our data pipeline synchronizes weekly with Agmarknet arrival registries, Punjab Mandi Board bulletin logs, State Discom (PSPCL) rural feeder bulletins, and registered Udyam MSME license registrations at the tehsil tier. Margin estimations reflect prevailing local APMC prices within a 7-day trailing average.
                  </div>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  suppressHydrationWarning
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(3)}
                  type="button"
                >
                  <span>Will public sector banks (SBI, PNB, Punjab Gramin Bank) accept this dossier?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${
                      openFaq === 3 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaq === 3 && (
                  <div className="px-5 pb-5 text-sm text-[#786d65] leading-relaxed">
                    Yes. The generated 12-page Feasibility Dossier format strictly follows the PMEGP/CMA (Credit Monitoring Arrangement) layout required by Lead District Managers (LDMs) and nationalized bank branch managers, complete with Debt Service Coverage Ratio (DSCR) calculations and itemized vendor equipment quotations.
                  </div>
                )}
              </div>

              {/* FAQ 4 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  suppressHydrationWarning
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(4)}
                  type="button"
                >
                  <span>How are the PMEGP subsidies (25% to 35%) and PMFME grants calculated?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${
                      openFaq === 4 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaq === 4 && (
                  <div className="px-5 pb-5 text-sm text-[#786d65] leading-relaxed">
                    Under the Prime Minister&apos;s Employment Generation Programme (PMEGP), general category promoters in rural areas qualify for 25% margin money capital subsidy, while special category promoters (Women, SC/ST, Ex-Servicemen, OBC) qualify for up to 35% on projects up to ₹50 Lakhs. Under PMFME, micro food processing units qualify for 35% credit-linked capital grants capped at ₹10 Lakhs.
                  </div>
                )}
              </div>

              {/* FAQ 5 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  suppressHydrationWarning
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(5)}
                  type="button"
                >
                  <span>How does Voice Search work in Punjabi and Hindi?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${
                      openFaq === 5 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaq === 5 && (
                  <div className="px-5 pb-5 text-sm text-[#786d65] leading-relaxed">
                    Entrepreneurs can speak directly in Punjabi (e.g. &ldquo;ਮੈਂ ਡੇਅਰੀ ਪ੍ਰੋਸੈਸਿੰਗ ਦਾ ਕੰਮ ਸ਼ੁਰੂ ਕਰਨਾ ਚਾਹੁੰਦਾ ਹਾਂ&rdquo;), Hindi, or English. Our integrated voice matching engine uses browser speech recognition to automatically parse rural trade keywords and map them directly to verified business archetypes.
                  </div>
                )}
              </div>

              {/* FAQ 6 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  suppressHydrationWarning
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(6)}
                  type="button"
                >
                  <span>What happens if my village feeder has frequent power cuts?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${
                      openFaq === 6 ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaq === 6 && (
                  <div className="px-5 pb-5 text-sm text-[#786d65] leading-relaxed">
                    GramVest correlates PSPCL power schedules with your chosen machinery load. If daytime 3-phase supply is under 16 hours, the system automatically factors in hybrid solar synchronization or backup generator fuel costs to verify whether your monthly net profit remains solvent above the 1.30x bank debt hurdle.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* END: AccordionFAQs */}

        {/* BEGIN: TerracottaClosingCTA */}
        <section className="py-20 bg-[#c75d3e] text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white uppercase tracking-wider">
              SIH 2026 Innovation • Punjab Agro Feasibility
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
              Don&apos;t invest your hard-earned savings blindly.
            </h2>
            <p className="text-base sm:text-lg text-[#ede3d8]/90 max-w-2xl mx-auto leading-relaxed">
              Evaluate real demand deficits, local 3-phase power reliability, and qualifying government capital subsidies (PMEGP, PMFME, SMAM) in your exact village block.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-[#ede3d8] text-[#c75d3e] text-base font-bold shadow-lg transition-transform transform hover:-translate-y-0.5"
                href="/onboarding"
              >
                Run Free 3-Minute Viability Check →
              </Link>
              <Link
                className="w-full sm:w-auto px-6 py-4 rounded-xl border border-white/30 hover:bg-white/10 text-white text-base font-semibold transition-colors"
                href="/financing"
              >
                Explore Government Schemes
              </Link>
            </div>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-[#ede3d8]/80 font-medium">
              <span>✓ Agmarknet Real-Time Sync</span>
              <span>✓ Lead District Bank Formats</span>
              <span>✓ No Aadhaar / Bank KYC Required</span>
            </div>
          </div>
        </section>
        {/* END: TerracottaClosingCTA */}
      </main>

      {/* BEGIN: MainFooter */}
      <footer className="bg-[#241b16] text-[#ede3d8]/80 py-16 border-t border-[#382f29]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#382f29]/80">
            {/* Brand & Vision */}
            <div className="md:col-span-4 space-y-4">
              <Link href="/" className="inline-flex items-center group">
                <Image
                  src="/gramvest_logo3.png"
                  alt="GramVest"
                  width={150}
                  height={48}
                  className="h-11 w-auto object-contain brightness-105 group-hover:scale-105 transition-transform duration-200"
                  style={{ width: "auto" }}
                />
              </Link>
              <p className="text-xs text-[#ede3d8]/70 leading-relaxed max-w-sm">
                Rural Commercial Ledger &amp; Feasibility Radar. Ground-truthed analytics, power stability audits, and bank-vetted DPR generation for India&apos;s next generational rural enterprises.
              </p>
              <div className="pt-2 text-xs text-[#ede3d8]/60">
                Trusted across 14,000+ local panchayats.
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-2 space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Feasibility Tools
              </p>
              <ul className="text-xs space-y-2 text-[#ede3d8]/70">
                <li>
                  <a className="hover:text-white transition-colors" href="#simulator">
                    Catchment Radar
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#simulator">
                    Subsidy Calculator
                  </a>
                </li>
                <li>
                  <a className="hover:text-white transition-colors" href="#engine">
                    Feeder Power Monitor
                  </a>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/report">
                    DPR Document Builder
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Sovereign Grants
              </p>
              <ul className="text-xs space-y-2 text-[#ede3d8]/70">
                <li>
                  <Link className="hover:text-white transition-colors" href="/financing">
                    PMEGP 35% Scheme
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/financing">
                    Agri Infra Fund (AIF)
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/financing">
                    PM Formalisation of FME
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-white transition-colors" href="/financing">
                    NABARD Dairy Venture
                  </Link>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Ground Intelligence Bureau
              </p>
              <p className="text-xs text-[#ede3d8]/70 leading-relaxed">
                Registered office: GramVest Technologies Pvt Ltd, 4th Floor, Krishi Vigyan Innovation Center, Aerocity, New Delhi 110037.
              </p>
              <div className="pt-2 text-xs text-[#d4e6c1] font-mono">
                Support Helpline: 1800-890-GRAM (Toll Free Mon-Sat 9am-6pm)
              </div>
            </div>
          </div>

          {/* Copyright and Regulatory Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#ede3d8]/50">
            <p>© 2026 GramVest Technologies Pvt Ltd. All rights reserved.</p>
            <p className="text-[11px] text-center sm:text-right">
              GramVest provides empirical data models; final loan sanction rests with respective lending institutions and DIC boards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

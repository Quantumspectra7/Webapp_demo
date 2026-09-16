"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Archetype Data Model
interface ArchetypeConfig {
  id: string;
  title: string;
  emoji: string;
  unit: string;
  subtitle: string;
  baseCost: number;
  unmetDemand: string;
  subsidyPct: number;
  subsidyName: string;
  marginBase: number;
  deficitPct: number;
  costPerUnit: number;
  minScale: number;
  maxScale: number;
  defaultScale: number;
  scaleStep: number;
}

const ARCHETYPES: Record<string, ArchetypeConfig> = {
  dairy: {
    id: "dairy",
    title: "Dairy Chilling Unit",
    emoji: "🥛",
    unit: "Liters / day",
    subtitle: "Bulk coolers & testing",
    baseCost: 1450000,
    unmetDemand: "~3,800 Ltrs / Day",
    subsidyPct: 35,
    subsidyName: "35% Capital Grant (PMEGP)",
    marginBase: 68400,
    deficitPct: 68,
    costPerUnit: 180,
    minScale: 500,
    maxScale: 5000,
    defaultScale: 2000,
    scaleStep: 250,
  },
  flour: {
    id: "flour",
    title: "Spice & Flour Mill",
    emoji: "🌾",
    unit: "Kg / day",
    subtitle: "Chilli, turmeric, atta",
    baseCost: 820000,
    unmetDemand: "~1,450 Kg / Day",
    subsidyPct: 35,
    subsidyName: "35% PMFME Micro Subsidy",
    marginBase: 44200,
    deficitPct: 54,
    costPerUnit: 120,
    minScale: 200,
    maxScale: 3000,
    defaultScale: 1000,
    scaleStep: 100,
  },
  chc: {
    id: "chc",
    title: "Custom Hiring Ctr",
    emoji: "🚜",
    unit: "Acres / month",
    subtitle: "Tractor implements & drone",
    baseCost: 2200000,
    unmetDemand: "~620 Acres Demand",
    subsidyPct: 40,
    subsidyName: "40% SMAM Farm Mechanization",
    marginBase: 95000,
    deficitPct: 75,
    costPerUnit: 250,
    minScale: 100,
    maxScale: 1200,
    defaultScale: 400,
    scaleStep: 50,
  },
  agro: {
    id: "agro",
    title: "Agro Supply Store",
    emoji: "🌱",
    unit: "Farmers served / mo",
    subtitle: "Certified seed & bio-inputs",
    baseCost: 950000,
    unmetDemand: "~850 Farmers / Block",
    subsidyPct: 20,
    subsidyName: "20% Mudra + Margin Scheme",
    marginBase: 51200,
    deficitPct: 42,
    costPerUnit: 90,
    minScale: 200,
    maxScale: 2500,
    defaultScale: 800,
    scaleStep: 100,
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
  }
> = {
  1: {
    badge: "Step 1 of 4 • Precision Setup",
    title: "Enter your exact village location & intended enterprise type.",
    desc: "GramVest looks up tehsil boundary definitions, distance to nearest state highway, high-tension power grid reliability, and primary agricultural produce clusters.",
    checklist: [
      "Automatic pincode & tehsil boundary polygon extraction",
      "Verification of primary & seasonal crop surplus",
      "Applicant category classification (General, OBC, SC/ST, Women)",
    ],
    method: "POST",
    endpoint: "/api/v1/catchment/scan",
    logLines: [
      '// Input location parameters',
      '"state": "Punjab",',
      '"tehsil": "Dhuri",',
      '"trade": "Dairy Value Addition & Chilling",',
      '"grid_category": "Rural Agricultural Feeder A-1"',
    ],
    highlightResult:
      "✓ 14 Gram Panchayats Identified within 12km radius. Total estimated unserved volume: 3,840 liters/day.",
  },
  2: {
    badge: "Step 2 of 4 • Spatial Analytics",
    title: "360-Degree Catchment Scan & Competitor Radius Mapping.",
    desc: "Analyzes actual farmer tractor movement routes, competing processing facilities in a 15km perimeter, and verifies existing unfulfilled Mandi trade inquiries.",
    checklist: [
      "Real-time geofenced competition density audit",
      "Historical APMC Mandi volume deficit analysis",
      "Haat Day transaction patterns and weekly peak loads",
    ],
    method: "GET",
    endpoint: "/api/v1/catchment/competition-density",
    logLines: [
      '// Geospatial competition scan',
      '"active_competitors": 2 (operating at only 40% capacity),',
      '"unserved_catchment_radius": "12 km",',
      '"deficit_confidence": "High (Mandi Board verified)"',
    ],
    highlightResult:
      "✓ Active competitors found: 2 (operating at only 40% capacity). Local Market Deficit: 68% Unserved.",
  },
  3: {
    badge: "Step 3 of 4 • Sovereign Grant Matching",
    title: "Automated Government Capital Subsidy Entitlement Check.",
    desc: "Cross-checks central and state schemes including PMEGP, AIF, and PMFME to match your demographic and sector for maximum sovereign capital grants.",
    checklist: [
      "PMEGP 25% to 35% margin money clearance",
      "AIF 3% interest subvention loan qualification",
      "Zero-broker direct DIC application readiness",
    ],
    method: "CALCULATE",
    endpoint: "/api/v1/subsidies/pmegp-aif",
    logLines: [
      '// Subsidy rules computation',
      '"matched_scheme": "PMEGP Rural (Category: Special)",',
      '"max_project_cost": "₹50,00,000",',
      '"capital_grant_eligible": "₹5,07,500 non-repayable"',
    ],
    highlightResult:
      "✓ Matched scheme: PMEGP Rural (Category: Special). Capital grant eligible: ₹5,07,500 non-repayable.",
  },
  4: {
    badge: "Step 4 of 4 • Lender-Grade Output",
    title: "Export SBI, PNB, and NABARD-Compliant Project Dossier.",
    desc: "Generates a complete 12-page CMA report containing 5-year balance sheet projections, DSCR calculations, and quotation-backed machinery schedules.",
    checklist: [
      "Pre-formatted DSCR (>1.75) financial solvency ratios",
      "Pre-cleared quotation layouts from vetted OEMs",
      "One-click PDF download for instant bank branch review",
    ],
    method: "GENERATE",
    endpoint: "/api/v1/dossier/bank-cma.pdf",
    logLines: [
      '// CMA underwriting dossier compilation',
      '"status": "100% compliant with RBI Priority Sector Lending",',
      '"dscr_average": "1.82x (comfortably above 1.30x hurdle)",',
      '"bank_format": "PNB & SBI Lead District standard"',
    ],
    highlightResult:
      "✓ Status: 100% compliant with RBI Priority Sector Lending. Ready for Lead District Manager branch submission.",
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
  const [scaleValue, setScaleValue] = useState<number>(2000);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("sangrur");
  const [selectedTehsil, setSelectedTehsil] = useState<string>("dhuri");

  const currentArchetype = ARCHETYPES[activeArchetypeKey] || ARCHETYPES.dairy;

  const handleSelectArchetype = (key: string) => {
    setActiveArchetypeKey(key);
    const arch = ARCHETYPES[key];
    if (arch) {
      setScaleValue(arch.defaultScale);
    }
  };

  // Dynamic calculations for simulator
  const calculatedCost =
    currentArchetype.baseCost +
    (scaleValue - currentArchetype.defaultScale) * currentArchetype.costPerUnit;
  const grantAmount = Math.round(
    calculatedCost * (currentArchetype.subsidyPct / 100)
  );
  const projectedMargin = Math.round(
    currentArchetype.marginBase * (scaleValue / currentArchetype.defaultScale)
  );

  let gridStatusText =
    "Dhuri Agricultural Feeder: 8 hrs day / 8 hrs night uninterrupted supply. 3-Phase transformer line reachable within 180 meters.";
  if (selectedDistrict === "nashik") {
    gridStatusText =
      "Dindori Industrial Express Feeder: 22 hrs continuous 415V supply. High post-harvest cold chain viability.";
  } else if (selectedDistrict === "meerut") {
    gridStatusText =
      "Meerut Rural Substation: Moderate 14-hr supply, recommends 15kVA automated diesel or solar backup integration.";
  }

  // 4-Step Engine state
  const [activeEngineStep, setActiveEngineStep] = useState<number>(1);
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
            <a className="hover:text-[#c75d3e] transition-colors" href="#mandi-stories">
              Mandi Stories
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
                {/* Live Status Pill */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#ede3d8] shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3a6b4c] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3a6b4c]"></span>
                  </span>
                  <span className="text-xs font-bold text-[#382f29] tracking-wide uppercase">
                    Hyper-Local Rural Business Intelligence
                  </span>
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
                      src="https://lh3.googleusercontent.com/aida/AEtjO1WcB1OXWM2Lq0pj4TZHcgZH9chQXEFANp8oum0D3d6hUbs45_NDGzv6jyjYJiuxHwJg6z9HJB32V78bfuIUJ7_Wd63WlOPymdFBouifXchQGDG7BDBIEgVehTHslch1zAl_t0r51tSBC4WhKJ8XCZTOIU-hZmaLgMwbPLXimyRZa-NG6gkBJwwyp9T5uQ6GTwzIZ63v75bxsLt7QH3BnPPlhb1LO1q-51KJsvoXKpti9FX54t-vMFU44rB1"
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

        {/* BEGIN: StandoutSimulator */}
        <section className="py-20 bg-[#faf4ee] border-y border-[#ede3d8] relative" id="simulator">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fcedea] text-[#c75d3e] uppercase tracking-wider">
                Interactive Sandbox
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#241b16] font-serif">
                Instant Rural Catchment & Subsidy Simulator
              </h2>
              <p className="text-base text-[#786d65]">
                Select your planned enterprise model, tehsil parameters, and initial capacity to evaluate real-time capital feasibility.
              </p>
            </div>

            {/* Simulator Container Grid */}
            <div className="bg-white rounded-3xl border border-[#ede3d8] shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Controls Panel (Left) */}
              <div className="p-6 sm:p-8 lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#ede3d8] space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2.5">
                    1. Select Commercial Enterprise Archetype
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.keys(ARCHETYPES).map((key) => {
                      const arch = ARCHETYPES[key];
                      const isSelected = activeArchetypeKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectArchetype(key)}
                          type="button"
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${isSelected
                              ? "border-[#c75d3e] bg-[#fcedea]/60 text-[#c75d3e]"
                              : "border-[#ede3d8] bg-white text-[#382f29] hover:border-[#c75d3e]/50"
                            }`}
                        >
                          <span className="text-lg">{arch.emoji}</span>
                          <div>
                            <p className="text-xs font-bold">{arch.title}</p>
                            <p className="text-[10px] text-[#786d65]">
                              {arch.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* District & Tehsil Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2"
                      htmlFor="district-select"
                    >
                      Target District
                    </label>
                    <select
                      id="district-select"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full rounded-xl border-[#ede3d8] bg-[#faf4ee]/40 text-sm font-semibold text-[#382f29] focus:border-[#c75d3e] focus:ring-[#c75d3e] p-2.5"
                    >
                      <option value="sangrur">Ludhiana / Sangrur (Punjab)</option>
                      <option value="nashik">Nashik (Maharashtra)</option>
                      <option value="meerut">Meerut (Uttar Pradesh)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-bold text-[#786d65] uppercase tracking-wider mb-2"
                      htmlFor="tehsil-select"
                    >
                      Target Tehsil / Block
                    </label>
                    <select
                      id="tehsil-select"
                      value={selectedTehsil}
                      onChange={(e) => setSelectedTehsil(e.target.value)}
                      className="w-full rounded-xl border-[#ede3d8] bg-[#faf4ee]/40 text-sm font-semibold text-[#382f29] focus:border-[#c75d3e] focus:ring-[#c75d3e] p-2.5"
                    >
                      <option value="dhuri">Jagraon / Dhuri Block</option>
                      <option value="malerkotla">Malerkotla Border</option>
                      <option value="sunam">Sunam Catchment</option>
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
                    <span className="text-sm font-bold text-[#c75d3e] bg-[#fcedea] px-2.5 py-0.5 rounded-lg">
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
                    className="w-full h-2 bg-[#ede3d8] rounded-lg appearance-none cursor-pointer accent-[#c75d3e]"
                  />
                  <div className="flex justify-between text-[11px] font-medium text-[#786d65]">
                    <span>Micro ({currentArchetype.minScale})</span>
                    <span>Commercial Scale ({currentArchetype.defaultScale})</span>
                    <span>Max Hub ({currentArchetype.maxScale})</span>
                  </div>
                </div>

                {/* Real-time Feasibility Highlights Checklist */}
                <div className="p-4 rounded-xl bg-[#f0f6ec] border border-[#3a6b4c]/20 space-y-2">
                  <p className="text-xs font-bold text-[#3a6b4c] uppercase tracking-wider flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Current Grid & Mandi Clearance
                  </p>
                  <p className="text-xs text-[#382f29] font-medium">
                    {gridStatusText}
                  </p>
                </div>
              </div>

              {/* Output Results Dossier Card (Right) */}
              <div className="p-6 sm:p-8 lg:col-span-6 bg-gradient-to-br from-white to-[#faf4ee] flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#ede3d8] pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#786d65]">
                        Feasibility Ledger
                      </span>
                      <h3 className="text-xl font-bold font-serif text-[#241b16]">
                        {currentArchetype.title} ({scaleValue.toLocaleString()} scale)
                      </h3>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#3a6b4c] text-white">
                      Feasible (81/100)
                    </span>
                  </div>

                  {/* Metric Matrix Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white border border-[#ede3d8] shadow-xs">
                      <span className="text-[11px] font-semibold text-[#786d65]">
                        Machinery & Shed Cost
                      </span>
                      <p className="text-lg font-serif font-bold text-[#241b16] mt-1">
                        ₹{calculatedCost.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-[#786d65]">
                        3-Phase Equipment + Setup
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#ede3d8] shadow-xs">
                      <span className="text-[11px] font-semibold text-[#786d65]">
                        Unmet Local Demand
                      </span>
                      <p className="text-lg font-serif font-bold text-[#241b16] mt-1">
                        {currentArchetype.unmetDemand}
                      </p>
                      <p className="text-[10px] text-[#3a6b4c] font-medium">
                        {currentArchetype.deficitPct}% Unserved Catchment
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#ede3d8] shadow-xs">
                      <span className="text-[11px] font-semibold text-[#786d65]">
                        Eligible Sovereign Grant
                      </span>
                      <p className="text-lg font-serif font-bold text-[#c75d3e] mt-1">
                        ₹{grantAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-[#c75d3e] font-medium">
                        {currentArchetype.subsidyName}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#ede3d8] shadow-xs">
                      <span className="text-[11px] font-semibold text-[#786d65]">
                        Projected Net Margin
                      </span>
                      <p className="text-lg font-serif font-bold text-[#3a6b4c] mt-1">
                        ₹{projectedMargin.toLocaleString("en-IN")} / mo
                      </p>
                      <p className="text-[10px] text-[#786d65]">
                        Est. Break-Even: 7 - 9 Months
                      </p>
                    </div>
                  </div>

                  {/* Deficit Visual Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-[#382f29]">
                      <span>Local Catchment Deficit</span>
                      <span>{currentArchetype.deficitPct}% Unserved Demand</span>
                    </div>
                    <div className="w-full bg-[#ede3d8]/70 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-[#c75d3e] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${currentArchetype.deficitPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* PDF Download & Action */}
                <div className="pt-4 border-t border-[#ede3d8] flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href="/report"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#241b16] hover:bg-black text-white text-sm font-bold shadow transition-all"
                  >
                    <svg
                      className="w-4 h-4 text-[#d4e6c1]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" x2="12" y1="15" y2="3"></line>
                    </svg>
                    Download Full 12-Page Feasibility PDF
                  </Link>
                  <Link
                    href="/onboarding"
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] text-xs font-bold hover:bg-[#ede3d8]/30 transition-colors text-center"
                  >
                    Configure My Enterprise →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: StandoutSimulator */}

        {/* BEGIN: ComparativeSection */}
        <section className="py-20 bg-[#fff8f2]" id="ground-truth">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <span className="text-xs font-bold text-[#3a6b4c] uppercase tracking-wider">
                Ground Truth vs Rural Myths
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16] mt-2 mb-4">
                Why 80% of rural ventures struggle vs how GramVest protects you
              </h2>
              <p className="text-base text-[#786d65]">
                Most village businesses fail not because of lack of hard work, but because of inaccurate footfall assumptions, unvetted power loads, and broker cuts on government subsidies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contrast Card 1 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" x2="9" y1="9" y2="15"></line>
                      <line x1="9" x2="15" y1="9" y2="15"></line>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Common Trap
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#241b16] mt-2">
                      The &ldquo;Radius Footfall&rdquo; Illusion
                    </h3>
                    <p className="text-sm text-[#786d65] mt-1 leading-relaxed">
                      Assuming everyone within 10km will buy from you. In reality, existing informal credit chains (arhtiyas) and weekly Haat schedules lock in consumer behavior.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ede3d8]/60 bg-[#f0f6ec] -mx-6 -mb-6 p-6 rounded-b-2xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c]">
                    GramVest Ground Truth
                  </span>
                  <p className="text-xs font-semibold text-[#241b16] mt-1 leading-relaxed">
                    We map 14-panchayat daily mandi traffic vectors, tractor route intersections, and existing informal ledger debts to predict exact actual footfall.
                  </p>
                </div>
              </div>

              {/* Contrast Card 2 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Common Trap
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#241b16] mt-2">
                      Unplanned 3-Phase & Diesel Burn
                    </h3>
                    <p className="text-sm text-[#786d65] mt-1 leading-relaxed">
                      Buying heavy machinery only to discover local village feeder provides low voltage during peak processing hours, burning profits on costly diesel generators.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ede3d8]/60 bg-[#f0f6ec] -mx-6 -mb-6 p-6 rounded-b-2xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c]">
                    GramVest Ground Truth
                  </span>
                  <p className="text-xs font-semibold text-[#241b16] mt-1 leading-relaxed">
                    Substation feeder schedules, historical voltage drops, and hybrid solar-diesel sizing are pre-calculated to ensure your margin survives power cuts.
                  </p>
                </div>
              </div>

              {/* Contrast Card 3 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] p-6 shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="18" x2="23" y1="8" y2="13"></line>
                      <line x1="23" x2="18" y1="8" y2="13"></line>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                      Common Trap
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#241b16] mt-2">
                      Middleman Subsidy Cuts & Rejections
                    </h3>
                    <p className="text-sm text-[#786d65] mt-1 leading-relaxed">
                      Paying 10% to 15% commissions to touts for PMEGP/AIF proposals that end up rejected at the District Industries Centre (DIC) due to non-standard DPR formats.
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#ede3d8]/60 bg-[#f0f6ec] -mx-6 -mb-6 p-6 rounded-b-2xl">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3a6b4c]">
                    GramVest Ground Truth
                  </span>
                  <p className="text-xs font-semibold text-[#241b16] mt-1 leading-relaxed">
                    Auto-generates 100% compliant Detailed Project Reports (DPR) adhering strictly to SBI, PNB, and NABARD bank underwriting standards with zero bribes.
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
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-[#c75d3e] uppercase tracking-wider">
                Methodology
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16]">
                The 4-Step Feasibility Engine
              </h2>
              <p className="text-base text-[#786d65]">
                From raw village trade intention to lender-grade loan sanction in under three minutes.
              </p>
            </div>

            {/* 4 Step Interactive Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {[
                { stepNum: 1, label: "01. Input Trade & Village", title: "Specify Location" },
                { stepNum: 2, label: "02. Catchment Scan", title: "Deficit & Competition" },
                { stepNum: 3, label: "03. Grant Matching", title: "PMEGP & AIF Schemes" },
                { stepNum: 4, label: "04. Bank-Vetted Dossier", title: "Lender-Grade Output" },
              ].map((t) => {
                const isActive = activeEngineStep === t.stepNum;
                return (
                  <button
                    key={t.stepNum}
                    onClick={() => setActiveEngineStep(t.stepNum)}
                    className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${isActive
                        ? "border-[#c75d3e] bg-white shadow-sm"
                        : "border-transparent bg-white/60 hover:bg-white text-[#786d65]"
                      }`}
                  >
                    <span
                      className={`text-xs font-bold block mb-1 ${isActive ? "text-[#c75d3e]" : "text-[#786d65]"
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
            <div className="bg-white rounded-3xl border border-[#ede3d8] p-8 sm:p-12 shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#fcedea] text-[#c75d3e]">
                    {stepData.badge}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif text-[#241b16] leading-tight">
                    {stepData.title}
                  </h3>
                  <p className="text-base text-[#786d65] leading-relaxed">
                    {stepData.desc}
                  </p>
                  <ul className="space-y-2.5 pt-2 text-sm text-[#382f29]">
                    {stepData.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-[#3a6b4c] flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Simulated Graphic Card */}
                <div className="lg:col-span-6 bg-[#faf4ee] rounded-2xl p-6 border border-[#ede3d8] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ede3d8]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    </div>
                    <span className="text-xs font-mono text-[#786d65]">
                      feasibility_engine_v3.2
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#382f29] space-y-2">
                    <p>
                      <span className="text-[#c75d3e] font-bold">
                        {stepData.method}
                      </span>{" "}
                      {stepData.endpoint}
                    </p>
                    <div className="p-3 bg-white rounded-lg border border-[#ede3d8]/80 space-y-1">
                      {stepData.logLines.map((line, idx) => (
                        <p key={idx} className={idx === 0 ? "text-[#786d65]" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="p-3 bg-[#f0f6ec] rounded-lg border border-[#3a6b4c]/30 text-[#3a6b4c] text-[11px] font-semibold">
                      {stepData.highlightResult}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: FourStepEngine */}

        {/* BEGIN: MandiStories */}
        <section className="py-20 bg-[#fff8f2]" id="mandi-stories">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-bold text-[#3a6b4c] uppercase tracking-wider">
                Ground Proof
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16]">
                Voices from the Mandi Belt
              </h2>
              <p className="text-base text-[#786d65]">
                Real village entrepreneurs who stress-tested their blueprints on GramVest prior to equipment purchases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Editorial Testimonial 1 */}
              <article className="bg-white rounded-3xl p-8 border border-[#ede3d8] shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-base sm:text-lg font-serif italic text-[#382f29] leading-relaxed">
                    &ldquo;I was about to spend ₹8 lakhs on an oil expeller. GramVest showed me that two larger mills were already operating at only 40% capacity 6 kilometers away. Instead, it recommended a chilli pulverizer unit with a 35% PMEGP subsidy. My loan was approved in 19 days without a broker.&rdquo;
                  </blockquote>
                </div>
                <div className="pt-4 border-t border-[#ede3d8] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#241b16] text-sm">Hardeep Singh Sandhu</p>
                    <p className="text-xs text-[#786d65]">Spice Processing Unit, Sangrur</p>
                  </div>
                  <span className="text-xs font-bold text-[#3a6b4c] bg-[#f0f6ec] px-2.5 py-1 rounded-full border border-[#3a6b4c]/20">
                    ₹14.2L Project Sanctioned
                  </span>
                </div>
              </article>

              {/* Editorial Testimonial 2 */}
              <article className="bg-white rounded-3xl p-8 border border-[#ede3d8] shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-base sm:text-lg font-serif italic text-[#382f29] leading-relaxed">
                    &ldquo;The power breakdown calculator saved our cold storage project. It warned us that the Baramati secondary line suffered 3.2-hour afternoon trip frequencies. We re-budgeted for a hybrid solar inverter directly into the bank DPR, which the branch manager commended.&rdquo;
                  </blockquote>
                </div>
                <div className="pt-4 border-t border-[#ede3d8] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#241b16] text-sm">Sunita Ravindra More</p>
                    <p className="text-xs text-[#786d65]">Vegetable Grading & Pre-Cooler, Nashik</p>
                  </div>
                  <span className="text-xs font-bold text-[#3a6b4c] bg-[#f0f6ec] px-2.5 py-1 rounded-full border border-[#3a6b4c]/20">
                    ₹8.8L Project Sanctioned
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>
        {/* END: MandiStories */}

        {/* BEGIN: AccordionFAQs */}
        <section className="py-20 bg-[#faf4ee] border-t border-[#ede3d8]" id="faqs">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-bold text-[#c75d3e] uppercase tracking-wider">
                Clear Clarity
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#241b16]">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-[#786d65]">
                Transparent answers on data sources, sovereign subsidies, and bank acceptance.
              </p>
            </div>

            <div className="space-y-4">
              {/* FAQ 1 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(1)}
                  type="button"
                >
                  <span>Do I need to enter my Aadhaar or bank account number?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${openFaq === 1 ? "rotate-180" : ""
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
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(2)}
                  type="button"
                >
                  <span>How accurate is the local tehsil competition and mandi data?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${openFaq === 2 ? "rotate-180" : ""
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
                    Our data pipeline synchronizes weekly with Agmarknet arrival registries, State Discom rural feeder bulletins, and registered Udyam MSME license registrations at the tehsil tier. Margin estimations reflect prevailing local APMC prices within a 7-day trailing average.
                  </div>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(3)}
                  type="button"
                >
                  <span>Will public sector banks (SBI, PNB, NABARD) accept this dossier?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${openFaq === 3 ? "rotate-180" : ""
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
                    Yes. The generated 12-page Feasibility Dossier format strictly follows the PMEGP/CMA (Credit Monitoring Arrangement) layout required by Lead District Managers (LDMs) and nationalized bank branch managers, complete with Debt Service Coverage Ratio (DSCR) calculations.
                  </div>
                )}
              </div>

              {/* FAQ 4 */}
              <div className="bg-white rounded-2xl border border-[#ede3d8] shadow-xs overflow-hidden">
                <button
                  className="w-full p-5 text-left font-bold text-[#241b16] text-base flex justify-between items-center hover:text-[#c75d3e] transition-colors cursor-pointer"
                  onClick={() => toggleFaq(4)}
                  type="button"
                >
                  <span>How are the PMEGP subsidies (25% to 35%) calculated?</span>
                  <svg
                    className={`w-5 h-5 text-[#786d65] transform transition-transform duration-200 ${openFaq === 4 ? "rotate-180" : ""
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
                    Under the Prime Minister&apos;s Employment Generation Programme (PMEGP), general category promoters in rural areas qualify for 25% margin money capital subsidy, while special category promoters (Women, SC/ST, Ex-Servicemen, OBC) qualify for up to 35% on projects up to ₹50 Lakhs.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* END: AccordionFAQs */}

        {/* BEGIN: TerracottaClosingCTA */}
        <section className="py-16 bg-[#c75d3e] text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif leading-tight">
              Don&apos;t invest your hard-earned savings blindly.
            </h2>
            <p className="text-base sm:text-lg text-[#ede3d8]/90 max-w-2xl mx-auto">
              Evaluate demand deficits, local power reliability, and qualifying government capital subsidies in your exact village block.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-[#ede3d8] text-[#c75d3e] text-base font-bold shadow-lg transition-transform transform hover:-translate-y-0.5"
                href="/onboarding"
              >
                Run Free 3-Minute Viability Check →
              </Link>
              <span className="text-xs text-[#ede3d8] font-medium">
                Free instant assessment • No commitment required
              </span>
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

export interface BusinessScenarioData {
  id: string;
  categoryId: string;
  title: string;
  punjabiTitle?: string;
  categoryName: string;
  description: string;
  registrySource: string;
  defaultScale: "small" | "medium";
  capacityUnit: string;
  dailyCapacity: number;
  capacityUtilization: number;
  headcount: number;
  powerRequirementKW: number;

  // Financials
  indicativeProjectCost: number; // in INR
  ownContribution: number;       // usually 10-15%
  loanRequirement: number;      // 85-90%
  tenureMonths: number;
  interestRate: number;
  sellingPricePerUnit: number;
  purchasePricePerUnit: number;
  monthlyPowerCost: number;
  monthlyLaborCost: number;
  monthlyAdminCost: number;

  // CaPEx Breakdown
  capexItems: {
    name: string;
    specification: string;
    amount: number;
    category: "Machinery" | "Civil / Shed" | "Electrification" | "Working Capital" | "Pre-operative";
    supplierOrigin?: string;
  }[];

  // OpEx Breakdown
  opexMonthlyItems: {
    name: string;
    amount: number;
    category: "Raw Material" | "Power & Utilities" | "Wages" | "Packaging & Logistics" | "Maintenance";
  }[];

  // Market & Opportunity Insights
  marketInsights: {
    catchmentDemand: string;
    typicalBuyers: string[];
    valueAdditionPct: number;
    keyCompetitorDensity: string;
    pricingTrend: string;
    seasonalFactors: string;
  };

  // Government Subsidies & Financing
  governmentSchemes: {
    schemeName: string;
    subsidyType: string;
    subsidyPct: number;
    maxSubsidyAmount: number;
    nodalAgency: string;
    applicableBenefit: string;
  }[];

  // SWOT Analysis
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };

  // Top Operational Risks & Mitigations
  risks: {
    id: string;
    title: string;
    category: "Supply" | "Operational" | "Financial" | "Regulatory" | "Market";
    severity: "Low" | "Medium" | "High";
    mitigation: string;
  }[];
}

export const REAL_BUSINESS_SCENARIOS: Record<string, BusinessScenarioData> = {
  // 1. Dairy Processing & Bulk Milk Chilling
  "biz-dairy-processing": {
    id: "biz-dairy-processing",
    categoryId: "biz-dairy-processing",
    title: "Dairy Processing & Bulk Milk Chilling Unit",
    punjabiTitle: "ਡੇਅਰੀ ਪ੍ਰੋਸੈਸਿੰਗ ਅਤੇ ਦੁੱਧ ਚਿਲਿੰਗ ਕੇਂਦਰ",
    categoryName: "Dairy & Livestock Value Addition",
    description: "1,000 LPD automated Bulk Milk Cooler (BMC) chilling vat, electronic milk fat/SNF analyzer, and hygienic paneer pressing & ghee clarification unit.",
    registrySource: "Punjab Dairy Development Board & Verka Cooperative Society Registry",
    defaultScale: "small",
    capacityUnit: "Liters / day",
    dailyCapacity: 1000,
    capacityUtilization: 75,
    headcount: 4,
    powerRequirementKW: 7.5,

    indicativeProjectCost: 1500000,
    ownContribution: 150000,
    loanRequirement: 1350000,
    tenureMonths: 84,
    interestRate: 8.5,
    sellingPricePerUnit: 44, // ₹44/L bulk chilled milk or ₹320/kg paneer equivalent
    purchasePricePerUnit: 33, // ₹33/L procurement at farmgate
    monthlyPowerCost: 14000,
    monthlyLaborCost: 38000,
    monthlyAdminCost: 8000,

    capexItems: [
      { name: "Bulk Milk Cooler (1,000L)", specification: "SS-304 Double Jacketed Direct Expansion", amount: 480000, category: "Machinery", supplierOrigin: "Ludhiana Industrial Focal Point" },
      { name: "Automated Ultrasonic Milk Analyzer & Stirrer", specification: "Dual Fat/SNF/Added Water Detection", amount: 120000, category: "Machinery", supplierOrigin: "Ambala / Mohali" },
      { name: "Semi-Auto Paneer Press & Steam Boiler", specification: "Hygienic Pneumatic Double Head", amount: 210000, category: "Machinery", supplierOrigin: "Ludhiana Industrial Area" },
      { name: "Ghee Clarifier & Vacuum Pouch Sealer", specification: "25 kg batch centrifuge + band sealer", amount: 150000, category: "Machinery", supplierOrigin: "Jalandhar" },
      { name: "Civil Shed & Food-Grade Epoxy Tiling", specification: "600 sq ft insulated dairy room with drainage", amount: 260000, category: "Civil / Shed", supplierOrigin: "Local Jagraon Contractors" },
      { name: "3-Phase Commercial Power & 10 kVA DG Backup", specification: "Dedicated transformer link + silent genset", amount: 160000, category: "Electrification", supplierOrigin: "PSPCL Ludhiana" },
      { name: "Working Capital Margin & Cold Crates", specification: "Initial 15-day milk procurement rotation", amount: 120000, category: "Working Capital", supplierOrigin: "Self / Bank" },
    ],

    opexMonthlyItems: [
      { name: "Raw Cow/Buffalo Milk Procurement (22,500 L)", amount: 742500, category: "Raw Material" },
      { name: "Commercial Power & DG Diesel Consumption", amount: 14000, category: "Power & Utilities" },
      { name: "Plant Operator (1) & Dairy Handlers (3)", amount: 38000, category: "Wages" },
      { name: "Packaging Pouches, Sanitizing Acid/Lye, Logistics", amount: 18000, category: "Packaging & Logistics" },
      { name: "Cooling Compressor Maintenance & CIP Wash", amount: 6500, category: "Maintenance" },
    ],

    marketInsights: {
      catchmentDemand: "High consistent year-round demand. Local Halwais and dhabas in Jagraon buy ~3,500 L/day, while Verka/Nestle chilling routes pick bulk chilled tankers at locked rates.",
      typicalBuyers: ["Milkfed / Verka societies", "Local sweet makers & Halwais", "Dhabas & Highway restaurants", "Direct village households"],
      valueAdditionPct: 28,
      keyCompetitorDensity: "Moderate (3-5 local cooperative collection points within 8 km; 0 branded paneer packing unit within 5 km).",
      pricingTrend: "Raw milk prices stable between ₹32-₹35/L; packaged paneer fetches ₹320-₹360/kg in local retail.",
      seasonalFactors: "Flush season (Nov-Feb) brings 35% higher milk yield; summer (May-July) brings 25% peak prices for curd & paneer.",
    },

    governmentSchemes: [
      {
        schemeName: "PM Formalisation of Micro food processing Enterprises (PMFME)",
        subsidyType: "Credit-Linked Capital Subsidy",
        subsidyPct: 35,
        maxSubsidyAmount: 1000000,
        nodalAgency: "MOFPI / Punjab Agro Industries Corporation (PAIC)",
        applicableBenefit: "35% subsidy on eligible plant & machinery (up to ₹5.25 Lakhs for this project).",
      },
      {
        schemeName: "Agriculture Infrastructure Fund (AIF)",
        subsidyType: "Interest Subvention",
        subsidyPct: 3,
        maxSubsidyAmount: 2000000,
        nodalAgency: "Department of Agriculture & Farmers Welfare",
        applicableBenefit: "3% interest subvention for 7 years on term loan + CGTMSE credit guarantee fee waiver.",
      },
    ],

    swot: {
      strengths: [
        "Jagraon and Sidhwan Bet belt has one of Punjab's highest dairy cattle densities per acre.",
        "Rapid chilling within 2 hours preserves milk bacteriological quality, commanding premium rate.",
        "Dual revenue stream: bulk milk chilling off-take + high-margin fresh paneer (28% margin).",
        "Low debtor turnaround time: Halwais pay weekly; cooperatives pay every 10 days.",
      ],
      weaknesses: [
        "Highly perishable commodity requiring uninterrupted 24x7 cooling (diesel backup critical).",
        "Daily cash flow needed for farmer procurement to prevent suppliers drifting to competitors.",
        "Seasonal lean period during peak summer requires managing buffer capacity.",
        "Stringent FSSAI quality parameters for microbial load and adulteration testing.",
      ],
      opportunities: [
        "Increasing consumer demand for unadulterated, certified hygienic paneer and desi ghee.",
        "Supply tie-ups with Ludhiana urban cloud kitchens and catering decorators for wedding seasons.",
        "Organic milk branding from local indigenous Sahiwal cow herds in Ludhiana rural belt.",
        "Utilizing PMFME 35% capital subsidy to lower debt repayment burden significantly.",
      ],
      threats: [
        "Aggressive procurement pricing wars by corporate private dairies during milk flush periods.",
        "Sudden cattle disease outbreaks (e.g. Lumpy Skin Disease) causing regional supply drops.",
        "Electricity tariff shifts or frequent rural feeder power cuts during paddy sowing season.",
        "Adulterated synthetic milk vendors undercutting local wholesale market prices.",
      ],
    },

    risks: [
      { id: "R-D-1", title: "Feeder Power Cut during Chilling Cycle", category: "Operational", severity: "High", mitigation: "Dedicated 10 kVA silent diesel generator with automatic changeover switch (AMF panel)." },
      { id: "R-D-2", title: "Milk Sourage / Acidity Inflow", category: "Supply", severity: "Medium", mitigation: "Mandatory rapid alcohol test & electronic MBRT testing before accepting milk cans into bulk vat." },
      { id: "R-D-3", title: "Farmer Payment Default / Flight", category: "Financial", severity: "Medium", mitigation: "Direct DBT bank transfers every 10 days backed by clear digital passbook SMS updates." },
      { id: "R-D-4", title: "Summer Procurement Dip", category: "Supply", severity: "Medium", mitigation: "Silage feed aggregation partnerships with local dairy farmers to ensure stable summer yield." },
    ],
  },

  // 2. Commercial Chakki Flour & Dal Mill
  "biz-flour-mill": {
    id: "biz-flour-mill",
    categoryId: "biz-flour-mill",
    title: "Commercial Chakki Flour & Dal Mill",
    punjabiTitle: "ਕਮਰਸ਼ੀਅਲ ਚੱਕੀ ਆਟਾ ਅਤੇ ਦਾਲ ਮਿੱਲ",
    categoryName: "Grain & Pulse Processing",
    description: "3,000 kg/day commercial cold-grinding stone chakki, multi-deck grain cleaner with aspirator, destoner, and automatic pouch packaging for whole wheat atta and gram dal.",
    registrySource: "DB_gramvest official Punjab Flour & Dal Mill Registries (7,345 records)",
    defaultScale: "small",
    capacityUnit: "Kg / day",
    dailyCapacity: 3000,
    capacityUtilization: 70,
    headcount: 3,
    powerRequirementKW: 18.5,

    indicativeProjectCost: 1200000,
    ownContribution: 120000,
    loanRequirement: 1080000,
    tenureMonths: 72,
    interestRate: 8.75,
    sellingPricePerUnit: 34, // ₹34/kg wholesale flour (Atta)
    purchasePricePerUnit: 24, // ₹24/kg wheat grain from Mandi/farmer gate
    monthlyPowerCost: 22000,
    monthlyLaborCost: 32000,
    monthlyAdminCost: 6000,

    capexItems: [
      { name: "Heavy Duty Stone Chakki (30-inch Emery Stone)", specification: "Cold grinding technology with grain elevator", amount: 280000, category: "Machinery", supplierOrigin: "Batala / Amritsar Industrial Area" },
      { name: "Grain Pre-Cleaner & Destoner Unit", specification: "Triple deck oscillating sieves with cyclone aspirator", amount: 220000, category: "Machinery", supplierOrigin: "Ludhiana Focal Point" },
      { name: "Dal Dehuller & Emery Roll Polisher", specification: "High recovery pulse split processing machine", amount: 190000, category: "Machinery", supplierOrigin: "Moga / Khanna" },
      { name: "Automatic Weighing & Band Pouch Sealer", specification: "5kg/10kg/25kg multi-bag packaging line", amount: 110000, category: "Machinery", supplierOrigin: "Jalandhar" },
      { name: "Civil Flooring & Anti-Moisture Grain Bins", specification: "RCC dust-free floor + 10-ton GI grain silos", amount: 210000, category: "Civil / Shed", supplierOrigin: "Jagraon Local" },
      { name: "Electrical Distribution Panel & 20 HP Motor Setup", specification: "Siemens starters + APFC capacitor panel", amount: 110000, category: "Electrification", supplierOrigin: "Ludhiana" },
      { name: "Working Capital for Wheat Procurement", specification: "30-ton buffer wheat stock from Dana Mandi", amount: 80000, category: "Working Capital", supplierOrigin: "Self / Cash Credit" },
    ],

    opexMonthlyItems: [
      { name: "Raw Wheat & Gram Grain Procurement (55,000 kg)", amount: 1320000, category: "Raw Material" },
      { name: "Industrial Electricity Charges (PSPCL 3-Phase)", amount: 22000, category: "Power & Utilities" },
      { name: "Chakki Operator (1) & Loading Laborers (2)", amount: 32000, category: "Wages" },
      { name: "HDPE Bags & Branded BOPP Pouches", amount: 24000, category: "Packaging & Logistics" },
      { name: "Emery Stone Dressing & Bearing Lubrication", amount: 4500, category: "Maintenance" },
    ],

    marketInsights: {
      catchmentDemand: "Every rural cluster consumes ~200 kg atta per household annually. Heavy ongoing demand from local dhabas, roadside restaurants on NH-5, and langars.",
      typicalBuyers: ["Local retail Kirana shops", "Wholesale grain traders", "Highway Dhabas & Gurdwara Langars", "Direct residential walk-ins"],
      valueAdditionPct: 30,
      keyCompetitorDensity: "High for unorganized custom chakkis; Low for certified unadulterated cold-ground chakki fresh atta packaging.",
      pricingTrend: "Raw wheat: ₹23-₹25/kg at harvest; Branded chakki atta: ₹34-₹38/kg; By-product bran (Choker) fetches ₹22/kg.",
      seasonalFactors: "Peak wheat inflow in April-May (Baisakhi season); stable year-round grinding with monsoon requiring strict moisture management.",
    },

    governmentSchemes: [
      {
        schemeName: "PM Formalisation of Micro food processing Enterprises (PMFME)",
        subsidyType: "Credit-Linked Capital Subsidy",
        subsidyPct: 35,
        maxSubsidyAmount: 1000000,
        nodalAgency: "MOFPI / Punjab Agro Industries Corporation",
        applicableBenefit: "35% capital subsidy up to ₹4.20 Lakhs on Chakki & Dal milling machinery.",
      },
      {
        schemeName: "PMEGP (Prime Minister's Employment Generation Programme)",
        subsidyType: "Margin Money Subsidy",
        subsidyPct: 35,
        maxSubsidyAmount: 1750000,
        nodalAgency: "KVIC / Punjab Khadi & Village Industries Board",
        applicableBenefit: "35% rural general/special category subsidy on total project cost.",
      },
    ],

    swot: {
      strengths: [
        "Raw material directly accessible at Jagraon Asia Grain Mandi with zero transport friction.",
        "Cold stone grinding preserves wheat germ & bran nutrients, beating corporate roller mill quality.",
        "Profitable by-product: wheat choker (bran) has 100% immediate off-take by dairy farmers.",
        "Recession-proof essential staple food item with daily cash transaction cycle.",
      ],
      weaknesses: [
        "Significant seasonal working capital needed during harvest window (April-May) for stock lock-in.",
        "Heavy electricity load requires stable 3-phase commercial industrial tariff.",
        "Dust accumulation and stone wear require regular preventive maintenance.",
        "Competition from traditional village toll-grinding (pisi) setups.",
      ],
      opportunities: [
        "Multi-grain flour blend (Wheat + Chana + Jowar + Soybean) fetching ₹55/kg premium price.",
        "Institutional supply contracts with local schools, colleges, and hospital canteens.",
        "Branded vacuum-packed 10kg flour bags distributed across 20+ nearby village retail shops.",
        "Pulse splitting (Chana dal, Moong dal) adding extra margin during off-season.",
      ],
      threats: [
        "Government open market grain releases (OMSS) driving sudden retail flour price dips.",
        "Heavy monsoon humidity causing weevil infestation if grain silo is unsealed.",
        "Power tariff hikes or unscheduled industrial power roster cuts.",
        "Aggressive promotional pricing by national corporate atta brands (Aashirvaad, Fortune).",
      ],
    },

    risks: [
      { id: "R-F-1", title: "Grain Moisture & Weevil Infestation", category: "Supply", severity: "High", mitigation: "Install digital moisture meter at intake; maintain grain silos under 12% moisture with hermetic seals." },
      { id: "R-F-2", title: "Chakki Stone Overheating (Nutrient Loss)", category: "Operational", severity: "Medium", mitigation: "Use water-cooled stone bearings and calibrated low-RPM motor drive." },
      { id: "R-F-3", title: "High Seasonal Working Capital Lock", category: "Financial", severity: "High", mitigation: "Avail Mandi Warehouse Receipt Financing (Pledge loan) at 7% interest for harvest stocking." },
      { id: "R-F-4", title: "Power Surge & Motor Burnout", category: "Operational", severity: "Medium", mitigation: "Automatic phase failure relay and surge protection in electrical distribution board." },
    ],
  },

  // 3. Fruits & Vegetable Processing / Cold Storage
  "biz-cold-storage": {
    id: "biz-cold-storage",
    categoryId: "biz-cold-storage",
    title: "Fruit & Vegetable Processing / Mini Cold Storage",
    punjabiTitle: "ਫਲ-ਸਬਜ਼ੀ ਪ੍ਰੋਸੈਸਿੰਗ ਅਤੇ ਮਿੰਨੀ ਕੋਲਡ ਸਟੋਰ",
    categoryName: "Cold Storage & Vegetable Processing",
    description: "25 Metric Ton multi-chamber solar-assisted micro cold room, automated vegetable bubble-washer, grading conveyor, and vacuum tray packing unit for potato, kinnow, peas, and green vegetables.",
    registrySource: "DB_gramvest official Punjab Fruits & Vegetables Registries (6,669 records)",
    defaultScale: "small",
    capacityUnit: "Metric Tons / batch",
    dailyCapacity: 25,
    capacityUtilization: 72,
    headcount: 5,
    powerRequirementKW: 12.0,

    indicativeProjectCost: 2200000,
    ownContribution: 220000,
    loanRequirement: 1980000,
    tenureMonths: 84,
    interestRate: 8.25,
    sellingPricePerUnit: 48, // Average blended price / kg processed/preserved
    purchasePricePerUnit: 22, // Average farmgate procurement price
    monthlyPowerCost: 28000,
    monthlyLaborCost: 45000,
    monthlyAdminCost: 9000,

    capexItems: [
      { name: "25 MT Micro Cold Room (PUF Panels 100mm)", specification: "Multi-temp 0°C to 12°C with hermetic scroll condensing unit", amount: 950000, category: "Machinery", supplierOrigin: "Chandigarh / Ludhiana Industrial" },
      { name: "Rotary Bubble Vegetable Washer & Destoner", specification: "SS-304 recirculating ozone sanitation washer", amount: 280000, category: "Machinery", supplierOrigin: "Ludhiana" },
      { name: "Grading & Sorting Inspection Conveyor Table", specification: "Food grade PVC belt with variable speed control", amount: 160000, category: "Machinery", supplierOrigin: "Batala" },
      { name: "Continuous Nitrogen Gas Flushing Band Sealer", specification: "Shelf-life extender for cut vegetables", amount: 140000, category: "Machinery", supplierOrigin: "Amritsar" },
      { name: "Solar Rooftop Net Metering Setup (10 kW)", specification: "Mono-PERC panels reducing grid refrigeration cost by 55%", amount: 420000, category: "Electrification", supplierOrigin: "PEDA Approved Vendor" },
      { name: "Civil Loading Dock & Storage Crates", specification: "Insulated ante-room + 800 perforated plastic crates", amount: 150000, category: "Civil / Shed", supplierOrigin: "Local Jagraon" },
      { name: "Working Capital & Buffer Stock Fund", specification: "Seasonal procurement rotation margin", amount: 100000, category: "Working Capital", supplierOrigin: "Self" },
    ],

    opexMonthlyItems: [
      { name: "Direct Farmgate Produce Procurement", amount: 520000, category: "Raw Material" },
      { name: "Grid Electricity + Solar Inverter Maintenance", amount: 28000, category: "Power & Utilities" },
      { name: "Supervisor (1) + Washing & Sorting Crew (4)", amount: 45000, category: "Wages" },
      { name: "Crate Rentals, PP Packaging, Transport Van Fuel", amount: 32000, category: "Packaging & Logistics" },
      { name: "Refrigerant Top-up & Condenser De-scaling", amount: 7500, category: "Maintenance" },
    ],

    marketInsights: {
      catchmentDemand: "Huge distress sales occur during peak pea and potato harvest around Sidhwan Bet & Jagraon. Holding produce for 30-60 days multiplies realization by 40-70%.",
      typicalBuyers: ["Mandi commission agents (Arhtiyas)", "Urban retail supermarket chains in Ludhiana", "Local restaurant & dhaba caterers", "FPOs & Vegetable exporters"],
      valueAdditionPct: 35,
      keyCompetitorDensity: "Very low for decentralized mini-cold rooms (only giant potato cold stores exist which reject small farmers).",
      pricingTrend: "Green peas swing from ₹15/kg at glut to ₹55/kg off-season; Tomatoes swing from ₹10/kg to ₹45/kg.",
      seasonalFactors: "Peak utilization during winter vegetable gluts (Dec-March); Summer kinnow & summer squash storage (April-July).",
    },

    governmentSchemes: [
      {
        schemeName: "Mission for Integrated Development of Horticulture (MIDH)",
        subsidyType: "Credit-Linked Back-Ended Capital Subsidy",
        subsidyPct: 35,
        maxSubsidyAmount: 1200000,
        nodalAgency: "National Horticulture Board (NHB) / Punjab Horticulture Dept",
        applicableBenefit: "35% subsidy on micro cold rooms and post-harvest pack house units.",
      },
      {
        schemeName: "PMFME (Fruit & Vegetable Scheme)",
        subsidyType: "Capital Subsidy",
        subsidyPct: 35,
        maxSubsidyAmount: 1000000,
        nodalAgency: "Ministry of Food Processing Industries",
        applicableBenefit: "Direct 35% capital support on washing, sorting & packaging machinery.",
      },
    ],

    swot: {
      strengths: [
        "Directly addresses Punjab farmers' #1 problem: perishable harvest distress sales.",
        "Decentralized mini cold storage allows local small farmers to rent crate space at ₹1.5/kg/month.",
        "Solar integration insulates the business from high refrigeration power tariffs.",
        "Year-round utility across potatoes, carrots, peas, kinnow, and green chilies.",
      ],
      weaknesses: [
        "Higher initial capital expenditure compared to dry grain milling.",
        "Requires technical discipline in compressor temperature & humidity balancing.",
        "Risk of batch spoilage if cold-chain is interrupted during power outage.",
        "Farmer awareness needed to shift them away from immediate distress dumping.",
      ],
      opportunities: [
        "Ready-to-cook chopped, washed, and packed vegetable packets for urban Ludhiana supermarkets.",
        "Dehydrated vegetable chips and garlic/ginger paste line during off-seasons.",
        "Tie-ups with wedding caterers for guaranteed advance bulk supplies at locked rates.",
        "Renting space to seed-potato growers in Jalandhar-Ludhiana border villages.",
      ],
      threats: [
        "Unpredictable climate shifts causing sudden premature crop failures.",
        "Extreme price crashes in national wholesale mandis (Delhi Azadpur).",
        "Refrigerant leaks causing unmonitored temperature spikes.",
        "High diesel costs if long power cuts occur during intense summer months.",
      ],
    },

    risks: [
      { id: "R-C-1", title: "Cold Room Temperature Spike", category: "Operational", severity: "High", mitigation: "Dual compressors + IoT temperature sensors with automated SMS alerts to plant owner's phone." },
      { id: "R-C-2", title: "Off-Season Capacity Underutilization", category: "Market", severity: "Medium", mitigation: "Contract with multi-commodity traders: potato in Mar-May, apples in Aug-Oct, vegetables in Nov-Feb." },
      { id: "R-C-3", title: "Moisture Condensation Rot", category: "Operational", severity: "Medium", mitigation: "Calibrated micro-defrost cycles and positive air pressure ante-room design." },
      { id: "R-C-4", title: "Working Capital Strain during Procurement", category: "Financial", severity: "Medium", mitigation: "Operate on a hybrid model: 60% third-party crate rental fee + 40% own trading stock." },
    ],
  },

  // 4. Commercial Bakery & Confectionery Unit
  "biz-bakery": {
    id: "biz-bakery",
    categoryId: "biz-bakery",
    title: "Commercial Bakery & Confectionery Unit",
    punjabiTitle: "ਕਮਰਸ਼ੀਅਲ ਬੇਕਰੀ ਅਤੇ ਕਨਫੈਕਸ਼ਨਰੀ ਯੂਨਿਟ",
    categoryName: "Bakery & Confectionery",
    description: "500 kg/day semi-automated commercial bakery featuring a 64-tray rotary rack oven, planetary spiral dough mixer, automatic bread slicer, and cookie extrusion for rusks, bread, and buns.",
    registrySource: "DB_gramvest official Punjab Bakery Product Registries (4,191 records)",
    defaultScale: "small",
    capacityUnit: "Kg / day",
    dailyCapacity: 500,
    capacityUtilization: 75,
    headcount: 4,
    powerRequirementKW: 14.0,

    indicativeProjectCost: 1100000,
    ownContribution: 110000,
    loanRequirement: 990000,
    tenureMonths: 72,
    interestRate: 8.75,
    sellingPricePerUnit: 85, // ₹85/kg blended wholesale bakery products
    purchasePricePerUnit: 42, // Flour, yeast, butter, sugar cost / kg output
    monthlyPowerCost: 18000,
    monthlyLaborCost: 40000,
    monthlyAdminCost: 6000,

    capexItems: [
      { name: "Rotary Rack Baking Oven (64-Tray Diesel/Gas)", specification: "Digital temp controller with stainless steel baking trolley", amount: 420000, category: "Machinery", supplierOrigin: "Ludhiana Industrial Area" },
      { name: "Spiral Dough Mixer (50 kg Batch)", specification: "Two-speed timer controlled SS-304 bowl", amount: 160000, category: "Machinery", supplierOrigin: "Amritsar / Jalandhar" },
      { name: "High Speed Bread Slicing Machine", specification: "Gravity feed multi-blade precision slicer", amount: 75000, category: "Machinery", supplierOrigin: "Ludhiana" },
      { name: "Cookie Dropping & Extrusion Machine", specification: "Semi-automatic wire cut with interchangeable nozzles", amount: 125000, category: "Machinery", supplierOrigin: "Batala" },
      { name: "Food Grade Stainless Worktables & Cooling Racks", specification: "SS-304 preparation surfaces + 120 baking trays", amount: 90000, category: "Civil / Shed", supplierOrigin: "Jagraon Local" },
      { name: "Pouch Packaging & Batch Coding Machine", specification: "Continuous heat sealer with expiry date printer", amount: 80000, category: "Machinery", supplierOrigin: "Jalandhar" },
      { name: "Electrification, Exhaust Ducting & Working Margin", specification: "Commercial 3-phase connection + commercial exhaust hood", amount: 150000, category: "Electrification", supplierOrigin: "PSPCL & Local" },
    ],

    opexMonthlyItems: [
      { name: "Maida, Sugar, Bakery Shortening, Yeast & Flavors", amount: 378000, category: "Raw Material" },
      { name: "Diesel/LPG for Oven Burner & Electricity", amount: 28000, category: "Power & Utilities" },
      { name: "Head Baker (1) & Helpers / Packagers (3)", amount: 40000, category: "Wages" },
      { name: "Printed BOPP Rusk Packets & Corrugated Boxes", amount: 22000, category: "Packaging & Logistics" },
      { name: "Oven Burner Servicing & Tray Re-tinning", amount: 5000, category: "Maintenance" },
    ],

    marketInsights: {
      catchmentDemand: "Tea culture is universal across Punjab. Every village dhaba and roadside stall sells 10-25 packets of crispy rusks and biscuits daily. High repeat consumption.",
      typicalBuyers: ["Village grocery and tea stalls", "Highway dhabas along GT Road", "School and college canteens", "Weekly village market traders"],
      valueAdditionPct: 45,
      keyCompetitorDensity: "Moderate for local unbranded items; very high margin opportunity in regional fresh delivery within 24 hours.",
      pricingTrend: "Crispy tea rusks retail at ₹110-₹140/kg; production cost is ₹55-₹65/kg.",
      seasonalFactors: "Winter months (Oct-Feb) see 40% surge in tea-time bakery consumption; wedding seasons spike cookie demand.",
    },

    governmentSchemes: [
      {
        schemeName: "PMEGP (Prime Minister's Employment Generation Programme)",
        subsidyType: "Margin Money Grant",
        subsidyPct: 35,
        maxSubsidyAmount: 1750000,
        nodalAgency: "KVIC / Punjab KVIB",
        applicableBenefit: "35% rural subsidy on total bakery project cost (up to ₹3.85 Lakhs).",
      },
      {
        schemeName: "PMFME (Bakery Products Cluster)",
        subsidyType: "Credit-Linked Capital Subsidy",
        subsidyPct: 35,
        maxSubsidyAmount: 1000000,
        nodalAgency: "PAIC / MOFPI",
        applicableBenefit: "35% subsidy for modernizing bakery oven and food-safety certified packaging.",
      },
    ],

    swot: {
      strengths: [
        "Exceptionally high value-addition margin (45%) compared to raw commodity trading.",
        "Daily cash turnover with zero credit required from local roadside stalls and tea shops.",
        "Raw materials (wheat flour, sugar) abundantly available locally at competitive mandi rates.",
        "Extensible product catalogue (rusks, burger buns, pav, cream rolls, festive cookies).",
      ],
      weaknesses: [
        "Short shelf life for soft breads (3-4 days) requires calibrated daily delivery runs.",
        "Critical dependency on a skilled master baker for consistent recipe taste.",
        "LPG / diesel fuel cost volatility impacting per-batch baking cost.",
        "Hygiene and pest control standards require rigorous daily sanitation.",
      ],
      opportunities: [
        "Atta (whole-wheat) health rusks and jaggery (gur) cookies catering to health-conscious consumers.",
        "Custom wedding gift bakery hampers during Punjab's peak Nov-Feb wedding season.",
        "Direct delivery route supplying 40 village shops across Jagraon, Raikot & Sidhwan Bet.",
        "Private label bakery supply for local regional supermarkets.",
      ],
      threats: [
        "Big FMCG corporate brands (Britannia, Parle) launching subsidized rural trial packs.",
        "Unreliable fuel supplies or sudden spikes in commercial LPG cylinders.",
        "Power cuts during dough proofing cycle leading to dough over-fermentation.",
        "Local price-cutting by unregistered micro-bakers operating without FSSAI hygiene standards.",
      ],
    },

    risks: [
      { id: "R-B-1", title: "Master Baker Attrition", category: "Operational", severity: "High", mitigation: "Standardize digital recipe SOPs with automated weighing scales so helpers can bake seamlessly." },
      { id: "R-B-2", title: "Soft Bread Expiry Return Risk", category: "Market", severity: "Medium", mitigation: "Prioritize long shelf-life dry baked goods (rusks, cookies) which constitute 75% of production." },
      { id: "R-B-3", title: "Fuel Burner Inefficiency", category: "Operational", severity: "Medium", mitigation: "Install digital Italian burner with automatic temperature cut-off saving 18% fuel." },
      { id: "R-B-4", title: "Distribution Route Breakdowns", category: "Operational", severity: "Medium", mitigation: "Partner with local 3-wheeler auto delivery drivers on revenue-per-crate incentive model." },
    ],
  },

  // 5. Spice Processing & Fine Grinding Unit
  "biz-spice-processing": {
    id: "biz-spice-processing",
    categoryId: "biz-spice-processing",
    title: "Spice Processing & Fine Grinding Unit",
    punjabiTitle: "ਮਸਾਲਾ ਪ੍ਰੋਸੈਸਿੰਗ ਅਤੇ ਪੀਸਣ ਯੂਨਿਟ",
    categoryName: "Spices & Condiments Processing",
    description: "400 kg/day multi-stage cool pulverizer, destoner-cum-dryer, vibro-sifter, and nitrogen-flushed pouch packaging line for whole turmeric, red chilli, coriander, and garam masala blends.",
    registrySource: "DB_gramvest official Punjab Spices Registries (1,972 records)",
    defaultScale: "small",
    capacityUnit: "Kg / day",
    dailyCapacity: 400,
    capacityUtilization: 70,
    headcount: 3,
    powerRequirementKW: 10.0,

    indicativeProjectCost: 950000,
    ownContribution: 95000,
    loanRequirement: 855000,
    tenureMonths: 60,
    interestRate: 8.75,
    sellingPricePerUnit: 240, // ₹240/kg blended retail/wholesale spice powder
    purchasePricePerUnit: 140, // Raw dry whole spices at wholesale
    monthlyPowerCost: 12000,
    monthlyLaborCost: 28000,
    monthlyAdminCost: 5000,

    capexItems: [
      { name: "Heavy Duty Water-Cooled Pin Mill Pulverizer", specification: "Maintains temperature below 45°C to preserve natural spice aroma/oils", amount: 320000, category: "Machinery", supplierOrigin: "Ludhiana Industrial Area" },
      { name: "Continuous Vibro Screen Sifter", specification: "Multi-mesh classification for fine spice powder separation", amount: 110000, category: "Machinery", supplierOrigin: "Jalandhar" },
      { name: "Solar Spice Dryer & Roaster", specification: "Controlled hot-air roaster for enhanced aroma extraction", amount: 140000, category: "Machinery", supplierOrigin: "Amritsar" },
      { name: "Automatic Form-Fill-Seal (FFS) Pouch Packing Unit", specification: "Nitrogen flushing attachment for 50g, 100g, 250g moisture-proof pouches", amount: 180000, category: "Machinery", supplierOrigin: "Ludhiana" },
      { name: "Dust Extraction & Air Filter System", specification: "Ensures hygienic operator working condition with cyclone separator", amount: 65000, category: "Civil / Shed", supplierOrigin: "Batala" },
      { name: "Electrification, Commercial 3-Phase Panel", specification: "Motor starters, cables, and APFC capacitor", amount: 75000, category: "Electrification", supplierOrigin: "PSPCL" },
      { name: "Working Capital for Bulk Whole Spice Purchase", specification: "Turmeric finger & dried chilli batch purchase", amount: 60000, category: "Working Capital", supplierOrigin: "Self" },
    ],

    opexMonthlyItems: [
      { name: "Raw Whole Spices (Turmeric, Chilli, Coriander, Jeera)", amount: 1176000, category: "Raw Material" },
      { name: "Commercial Electricity Charges", amount: 12000, category: "Power & Utilities" },
      { name: "Grinder Operator (1) + Packagers (2)", amount: 28000, category: "Wages" },
      { name: "Laminated Multilayer Printed Pouches & Outer Cartons", amount: 35000, category: "Packaging & Logistics" },
      { name: "Pin-Mill Blade Sharpening & Screen Replacement", amount: 4000, category: "Maintenance" },
    ],

    marketInsights: {
      catchmentDemand: "High distrust among rural consumers regarding loose adulterated spice powders. High willingness to pay for certified pure, locally ground turmeric and chilli.",
      typicalBuyers: ["Local Kirana stores & Supermarkets", "Dhabas, Dhabewalas & Caterers", "Gurdwara Langar procurement committees", "Direct rural households"],
      valueAdditionPct: 40,
      keyCompetitorDensity: "Low for modern nitrogen-packed branded units; high for unhygienic open market loose spice sellers.",
      pricingTrend: "Pure ground turmeric retails at ₹220-₹260/kg; whole raw fingers cost ₹120-₹140/kg in bulk mandis.",
      seasonalFactors: "Peak harvest and procurement for turmeric and chilli in March-May; steady consumption throughout the year.",
    },

    governmentSchemes: [
      {
        schemeName: "PMFME (Spices & Micro Processing Scheme)",
        subsidyType: "Capital Subsidy",
        subsidyPct: 35,
        maxSubsidyAmount: 1000000,
        nodalAgency: "MOFPI / Punjab Agro",
        applicableBenefit: "35% subsidy on water-cooled pulverizer and automatic FFS packing machine.",
      },
      {
        schemeName: "PMEGP Rural Entrepreneur Scheme",
        subsidyType: "Margin Money Grant",
        subsidyPct: 35,
        maxSubsidyAmount: 1750000,
        nodalAgency: "KVIC / District Industries Centre (DIC) Ludhiana",
        applicableBenefit: "35% grant for rural agro-processing unit with collateral-free loan.",
      },
    ],

    swot: {
      strengths: [
        "Very high shelf life (9-12 months), eliminating perishability risk almost completely.",
        "Water-cooled grinding preserves volatile essential oils, beating coarse village mill taste.",
        "Compact plant footprint (350 sq ft) with low water requirement and zero effluent waste.",
        "Strong regional brand loyalty once customers experience authentic unadulterated color and taste.",
      ],
      weaknesses: [
        "Pungent dust during chilli grinding requires dedicated exhaust and protective gear for workers.",
        "Seasonal raw spice price spikes require disciplined harvest procurement planning.",
        "Initial retail push needed to convince local shopkeepers to stock new regional brand.",
        "FSSAI food laboratory testing requirements for pesticide and moisture compliance.",
      ],
      opportunities: [
        "Regional specialty blends: Authentic Punjabi Garam Masala and Meat Masala with higher 50% margins.",
        "Supplying bulk 5kg and 10kg buckets to highway dhabas on GT Road and catering contractors.",
        "Custom organic turmeric processing for health-conscious urban Ludhiana buyers.",
        "Participating in Saras and Kisan Melas organized by Punjab Agricultural University (PAU).",
      ],
      threats: [
        "Adulterated loose spice competitors offering fake cheap color at half the price.",
        "Sudden unseasonal rains in southern spice markets causing nationwide price surges.",
        "Counterfeiting of branded pouches if security hologram is not implemented.",
        "Tough payment cycles from large urban retail supermarkets.",
      ],
    },

    risks: [
      { id: "R-S-1", title: "Heat-Induced Loss of Aroma/Color", category: "Operational", severity: "High", mitigation: "Water-cooled pulverizer ensures chamber temperature remains strictly under 45°C." },
      { id: "R-S-2", title: "Moisture-Induced Fungal Growth", category: "Supply", severity: "High", mitigation: "Mandatory pre-grinding moisture test (<8%) and hot-air solar batch drying." },
      { id: "R-S-3", title: "Retail Shelf Payment Delays", category: "Financial", severity: "Medium", mitigation: "Strict 14-day credit limit with cash discounts for upfront settlement." },
      { id: "R-S-4", title: "Worker Respiratory Irritation", category: "Operational", severity: "Medium", mitigation: "Enclosed negative-pressure cyclone dust collector + mandatory N95 respirators." },
    ],
  },
};

export const getScenarioForBusiness = (businessId?: string | null): BusinessScenarioData => {
  if (!businessId) {
    return REAL_BUSINESS_SCENARIOS["biz-dairy-processing"];
  }

  // Exact match
  if (REAL_BUSINESS_SCENARIOS[businessId]) {
    return REAL_BUSINESS_SCENARIOS[businessId];
  }

  // Fuzzy alias matching
  const lower = businessId.toLowerCase();
  if (lower.includes("flour") || lower.includes("dal") || lower.includes("mill") || lower.includes("atta")) {
    return REAL_BUSINESS_SCENARIOS["biz-flour-mill"];
  }
  if (lower.includes("cold") || lower.includes("fruit") || lower.includes("vegetable") || lower.includes("storage")) {
    return REAL_BUSINESS_SCENARIOS["biz-cold-storage"];
  }
  if (lower.includes("bakery") || lower.includes("bread") || lower.includes("biscuit") || lower.includes("rusk")) {
    return REAL_BUSINESS_SCENARIOS["biz-bakery"];
  }
  if (lower.includes("spice") || lower.includes("masala") || lower.includes("grinding")) {
    return REAL_BUSINESS_SCENARIOS["biz-spice-processing"];
  }

  // Default fallback to dairy
  return REAL_BUSINESS_SCENARIOS["biz-dairy-processing"];
};

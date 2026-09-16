export interface FeasibilityRiskItem {
  title: string;
  reason: string;
  mitigation: string;
  severity: "High" | "Medium" | "Critical";
}

export interface FeasibilityHoverDetails {
  whyChoose: string;
  advantages: string[];
  keyRisks: FeasibilityRiskItem[];
  safeguard: string;
}

export function getFeasibilityRationale(
  businessId?: string,
  villageName = "local catchment",
  monthlyProfit?: string
): FeasibilityHoverDetails {
  const bId = (businessId || "").toLowerCase();

  if (bId.includes("flour")) {
    return {
      whyChoose: `Staple consumer product with steady year-round demand in ${villageName} and low operational perishability.`,
      advantages: [
        "Inelastic daily consumer demand for fresh chakki atta across all seasons",
        "Low raw material perishability compared to dairy or horticulture",
        "High value-addition margin on branded and multigrain packaged flours",
      ],
      keyRisks: [
        {
          title: "Post-Harvest Grain Price Volatility",
          reason: "Wheat costs rise 15-20% in off-season months (Aug-Jan), squeezing milling margins.",
          mitigation: "Procure directly from APMC mandi during harvest arrivals with 60-day storage.",
          severity: "High",
        },
        {
          title: "Grid Power Tripping Under Heavy Milling Load",
          reason: "Frequent rural power cuts or phase imbalance can stall 15HP commercial chakki motors.",
          mitigation: "Install 3-phase industrial power line with capacitor banks and dedicated MCB protection.",
          severity: "Medium",
        },
        {
          title: "Local Unorganized Price Competition",
          reason: "Small village chakkis operating with low processing fees in neighboring clusters.",
          mitigation: "Differentiate with FSSAI-certified, graded, hygienically sealed 5kg/10kg bags.",
          severity: "Medium",
        },
      ],
      safeguard: "Lock in bulk wheat during mandi procurement season (April-May) to defend margins.",
    };
  }

  if (bId.includes("farm") || bId.includes("equipment") || bId.includes("machinery")) {
    return {
      whyChoose: `Lucrative rental yields (₹2,000–₹3,500/acre) propelled by labor shortages and supported by 40% SMAM capital grant.`,
      advantages: [
        "Critical agricultural machinery needed by 85%+ of small and marginal farmers",
        "Sub-Mission on Agricultural Mechanization (SMAM) offers up to 40% capital subsidy",
        "High hourly rental returns during peak wheat and paddy sowing/harvesting windows",
      ],
      keyRisks: [
        {
          title: "Severe Off-Season Machine Downtime",
          reason: "Specialized implements (Super Seeder, Baler) sit idle for 3-4 months between crop cycles.",
          mitigation: "Bundle multi-crop implements (rotavator, laser leveler, straw baler) for year-round work.",
          severity: "High",
        },
        {
          title: "Breakdown During Critical 15-Day Sowing Window",
          reason: "Tractor/implement failure during peak sowing causes immediate, irreversible customer churn.",
          mitigation: "Secure OEM annual maintenance contract (AMC) and stock critical emergency spares.",
          severity: "Critical",
        },
        {
          title: "Diesel Price Escalation & High Upfront CapEx",
          reason: "Fuel cost inflation directly compresses hourly machine operator profit margins.",
          mitigation: "Implement fuel-indexed hiring rate contracts and maintain >900 operating hours/year.",
          severity: "High",
        },
      ],
      safeguard: "Form advance village farmer hiring clusters to guarantee minimum threshold machine hours.",
    };
  }

  // Default / Dairy Processing
  return {
    whyChoose: `Daily liquid cash realization (${monthlyProfit || "₹1.7L/mo profit"}) with high local off-take and 35% PMEGP/PMFME subsidy.`,
    advantages: [
      "Immediate daily liquid cash collection from local milk collection centers and sweetshops",
      "35% credit-linked capital subsidy available under PMEGP / PMFME schemes",
      `Significant local supply gap (~1,800 L/day) in the ${villageName} catchment area`,
    ],
    keyRisks: [
      {
        title: "Summer Green Fodder & Feed Volatility",
        reason: "Raw milk procurement prices jump 15-20% during summer months due to green fodder scarcity.",
        mitigation: "Execute forward procurement agreements with local dairy farmers and silage cooperatives.",
        severity: "High",
      },
      {
        title: "Cold Chain Breakdown & Milk Spoilage",
        reason: "Unchilled raw milk curdles within 3-4 hours, risking complete batch losses during power outages.",
        mitigation: "Maintain a dedicated 15 kVA diesel generator backup for the bulk milk cooler (BMC).",
        severity: "Critical",
      },
      {
        title: "Institutional Buyer Payment Lag (45-60 Days)",
        reason: "Commercial dairy federations pay on extended credit cycles while farmers expect weekly cash.",
        mitigation: "Maintain a 30-day cash reserve / working capital CC limit to ensure timely farmer payouts.",
        severity: "High",
      },
    ],
    safeguard: "Always operate with a backup generator and maintain 1 month liquid working capital.",
  };
}

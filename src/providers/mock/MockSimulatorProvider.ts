import {
  FinancialScenario,
  WhatIfParameters,
  WhatIfResult,
  WhatIfComparison,
} from "@/domain";
import { ISimulatorProvider } from "@/providers/interfaces";
import { calculateOperatingFinancials, calculateViabilityScore } from "@/lib/calculations";

export class MockSimulatorProvider implements ISimulatorProvider {
  async runWhatIfSimulation(
    baseScenario: FinancialScenario,
    params: WhatIfParameters
  ): Promise<WhatIfResult> {
    await new Promise((res) => setTimeout(res, 60));

    const baseAssumptions = baseScenario.operationalAssumptions;
    const baseProjections = baseScenario.projections;

    // Apply adjustments
    const adjDailyCapacity = Math.max(
      100,
      baseAssumptions.dailyCapacityLiters * (1 + params.demandAdjustmentPct / 100)
    );
    const adjSellingPrice = Math.max(
      30,
      baseAssumptions.sellingPricePerLiter * (1 + params.priceAdjustmentPct / 100)
    );
    const adjPurchasePrice = Math.max(
      25,
      baseAssumptions.purchasePricePerLiter * (1 + params.rawMilkCostAdjustmentPct / 100)
    );
    const adjPowerDiesel = Math.max(
      5000,
      baseAssumptions.powerAndDieselMonthly * (1 + params.powerDieselCostAdjustmentPct / 100)
    );

    const emi = baseScenario.loanTerms.monthlyEMI;

    const simOp = calculateOperatingFinancials({
      dailyCapacity: adjDailyCapacity,
      capacityUtilization: baseAssumptions.capacityUtilizationPct,
      sellingPricePerUnit: adjSellingPrice,
      rawMaterialCostPerUnit: adjPurchasePrice,
      powerAndFuelMonthly: adjPowerDiesel,
      laborMonthly: baseAssumptions.laborMonthly,
      packagingAndConsumablesMonthly: baseAssumptions.consumablesMonthly,
      maintenanceAndOtherMonthly: baseAssumptions.maintenanceMonthly,
      monthlyLoanEMI: emi,
      depreciationMonthly: 6000,
    });

    // Score adjustments based on stress
    const marketScore = Math.max(
      30,
      Math.min(95, 82 + params.demandAdjustmentPct * 0.4)
    );
    const profitScore = Math.max(
      20,
      Math.min(95, 75 + (simOp.monthlyNetProfit - baseProjections.monthlyNetProfit) / 500)
    );
    const riskScore = Math.max(
      25,
      Math.min(
        90,
        64 -
          (params.rawMilkCostAdjustmentPct > 0 ? params.rawMilkCostAdjustmentPct * 0.8 : 0) -
          (params.priceAdjustmentPct < 0 ? Math.abs(params.priceAdjustmentPct) * 0.8 : 0)
      )
    );

    const viabilityResult = calculateViabilityScore({
      marketDemandScore: marketScore,
      competitionOpportunityScore: 76,
      capitalFitScore: 68,
      profitabilityScore: profitScore,
      riskResilienceScore: riskScore,
    });

    let projectedRiskLevel: WhatIfResult["projectedRiskLevel"] = "Moderate";
    if (simOp.annualDSCR < 1.15 || simOp.monthlyNetCashFlow < 5000) {
      projectedRiskLevel = "Critical";
    } else if (simOp.annualDSCR < 1.35 || simOp.monthlyNetCashFlow < 15000) {
      projectedRiskLevel = "Stressed";
    } else if (simOp.annualDSCR >= 1.6) {
      projectedRiskLevel = "Low";
    }

    const comparisons: WhatIfComparison[] = [
      {
        metric: "Monthly Revenue",
        baseValue: baseProjections.monthlyRevenue,
        scenarioValue: simOp.monthlyRevenue,
        unit: "₹",
        deltaPct: baseProjections.monthlyRevenue > 0
          ? +(((simOp.monthlyRevenue - baseProjections.monthlyRevenue) / baseProjections.monthlyRevenue) * 100).toFixed(1)
          : 0,
        status: simOp.monthlyRevenue >= baseProjections.monthlyRevenue ? "positive" : "negative",
        interpretation:
          simOp.monthlyRevenue >= baseProjections.monthlyRevenue
            ? "Volume & realization growth expand gross cash inflow."
            : "Revenue contraction caused by price concession or lower daily demand.",
      },
      {
        metric: "Monthly Net Profit",
        baseValue: baseProjections.monthlyNetProfit,
        scenarioValue: simOp.monthlyNetProfit,
        unit: "₹",
        deltaPct: baseProjections.monthlyNetProfit > 0
          ? +(((simOp.monthlyNetProfit - baseProjections.monthlyNetProfit) / baseProjections.monthlyNetProfit) * 100).toFixed(1)
          : 0,
        status: simOp.monthlyNetProfit >= baseProjections.monthlyNetProfit ? "positive" : "negative",
        interpretation:
          simOp.monthlyNetProfit >= 25000
            ? "Healthy operating earnings cushion after full loan servicing."
            : "Profit squeeze; operating margin falls below recommended safety buffer.",
      },
      {
        metric: "Monthly Net Cash Flow",
        baseValue: baseProjections.monthlyNetCashFlow,
        scenarioValue: simOp.monthlyNetCashFlow,
        unit: "₹",
        deltaPct: baseProjections.monthlyNetCashFlow > 0
          ? +(((simOp.monthlyNetCashFlow - baseProjections.monthlyNetCashFlow) / baseProjections.monthlyNetCashFlow) * 100).toFixed(1)
          : 0,
        status: simOp.monthlyNetCashFlow >= 15000 ? "positive" : "negative",
        interpretation:
          simOp.monthlyNetCashFlow >= 15000
            ? "Positive cash flow enables steady working capital replenishment."
            : "Cash deficit risk; working capital line may be required.",
      },
      {
        metric: "Loan Repayment Health (DSCR)",
        baseValue: baseProjections.annualDSCR,
        scenarioValue: simOp.annualDSCR,
        unit: "x",
        deltaPct: +(((simOp.annualDSCR - baseProjections.annualDSCR) / baseProjections.annualDSCR) * 100).toFixed(1),
        status: simOp.annualDSCR >= 1.3 ? "positive" : "negative",
        interpretation:
          simOp.annualDSCR >= 1.3
            ? `Comfortably clears bank sanction hurdle (1.30x) with ${simOp.annualDSCR}x cover.`
            : `Breaches bank appraisal hurdle rate (1.30x). High default vulnerability under stress.`,
      },
      {
        metric: "Viability Score",
        baseValue: 74,
        scenarioValue: viabilityResult.overallScore,
        unit: "/100",
        deltaPct: +(((viabilityResult.overallScore - 74) / 74) * 100).toFixed(1),
        status: viabilityResult.overallScore >= 70 ? "positive" : "negative",
        interpretation:
          viabilityResult.overallScore >= 70
            ? "Venture remains fundamentally resilient."
            : "Overall feasibility downgraded due to margin compression.",
      },
    ];

    let strategicSummary = "";
    if (projectedRiskLevel === "Critical" || projectedRiskLevel === "Stressed") {
      strategicSummary = `Stress scenario triggers significant margin tightening. At a DSCR of ${simOp.annualDSCR}x and net monthly cash flow of ₹${simOp.monthlyNetCashFlow.toLocaleString("en-IN")}, the business is sensitive to unhedged input cost spikes. Immediate mitigation measures are strongly recommended.`;
    } else {
      strategicSummary = `Under this scenario, the venture maintains sturdy cash coverage (DSCR ${simOp.annualDSCR}x) and steady monthly earnings (₹${simOp.monthlyNetProfit.toLocaleString("en-IN")}), confirming strong structural resilience for your selected business.`;
    }

    const suggestedPivots = [
      "Negotiate floor-and-ceiling price contracts with your primary buyers to reduce revenue downside risk.",
      "Diversify into at least one higher-margin product or service variant to lift blended realization.",
      "Build a 45-day emergency working capital reserve to absorb seasonal input cost surges.",
    ];

    return {
      parameters: params,
      comparisonItems: comparisons,
      projectedRevenue: simOp.monthlyRevenue,
      projectedNetProfit: simOp.monthlyNetProfit,
      projectedCashFlow: simOp.monthlyNetCashFlow,
      projectedDSCR: simOp.annualDSCR,
      projectedViabilityScore: viabilityResult.overallScore,
      projectedRiskLevel,
      strategicSummary,
      suggestedPivots,
    };
  }
}

import { FinancialScenario, ProjectCostItem } from "@/domain";
import { IFinanceProvider } from "@/providers/interfaces";
import { DEMO_FINANCIAL_SCENARIO } from "@/data/scenarios/dairy-jagraon";
import { calculateEMI, calculateOperatingFinancials } from "@/lib/calculations";
import { getScenarioForBusiness } from "@/data/real/business_scenarios";

export class MockFinanceProvider implements IFinanceProvider {
  private currentScenario: FinancialScenario = JSON.parse(
    JSON.stringify(DEMO_FINANCIAL_SCENARIO)
  );

  async getFinancialScenario(): Promise<FinancialScenario> {
    await new Promise((res) => setTimeout(res, 50));
    return JSON.parse(JSON.stringify(this.currentScenario));
  }

  async recalculateScenario(params: {
    projectCost: number;
    ownContribution: number;
    interestRate: number;
    tenureMonths: number;
    dailyCapacity: number;
    capacityUtilization: number;
    sellingPrice: number;
    purchasePrice: number;
    powerAndDiesel: number;
    categoryId?: string;
  }): Promise<FinancialScenario> {
    await new Promise((res) => setTimeout(res, 50));

    const scenario = getScenarioForBusiness(params.categoryId);

    const loanAmount = Math.max(0, params.projectCost - params.ownContribution);
    const ownContributionPct = params.projectCost > 0
      ? +((params.ownContribution / params.projectCost) * 100).toFixed(1)
      : 0;
    const termLoanPct = +(100 - ownContributionPct).toFixed(1);

    const loanCalc = calculateEMI({
      principal: loanAmount,
      annualInterestRate: params.interestRate,
      tenureMonths: params.tenureMonths,
      moratoriumMonths: 6,
    });

    const laborMonthly = scenario.monthlyLaborCost || 25000;
    const packagingMonthly = Math.round(params.projectCost * 0.012);
    const maintenanceMonthly = Math.round(params.projectCost * 0.005);

    const opCalc = calculateOperatingFinancials({
      dailyCapacity: params.dailyCapacity,
      capacityUtilization: params.capacityUtilization,
      sellingPricePerUnit: params.sellingPrice,
      rawMaterialCostPerUnit: params.purchasePrice,
      powerAndFuelMonthly: params.powerAndDiesel,
      laborMonthly,
      packagingAndConsumablesMonthly: packagingMonthly,
      maintenanceAndOtherMonthly: maintenanceMonthly,
      monthlyLoanEMI: loanCalc.monthlyEMI,
      depreciationMonthly: Math.round(params.projectCost * 0.008),
    });

    // 35% subsidy on eligible project cost under PMFME / PMEGP
    const primaryScheme = scenario.governmentSchemes[0];
    const eligibleSubsidy = Math.min(
      primaryScheme ? primaryScheme.maxSubsidyAmount : 1000000,
      Math.round(params.projectCost * ((primaryScheme ? primaryScheme.subsidyPct : 35) / 100))
    );

    // Build authentic CaPEx items from scenario
    const costBreakdown: ProjectCostItem[] = scenario.capexItems.map((c) => ({
      category:
        c.category === "Civil / Shed"
          ? "Civil Works & Shed"
          : c.category === "Electrification"
          ? "Electrification & DG"
          : c.category === "Working Capital"
          ? "Working Capital"
          : "Plant & Machinery",
      itemName: c.name,
      cost: c.amount,
      eligibleForSubsidy: c.category !== "Working Capital",
      notes: `${c.specification} (${c.supplierOrigin || "Punjab"})`,
    }));

    const updated: FinancialScenario = {
      ...this.currentScenario,
      id: `fin-${scenario.id}`,
      title: `${scenario.title} — Verified Financial Model`,
      totalProjectCost: params.projectCost,
      costBreakdown,
      financingMeans: {
        ownContribution: params.ownContribution,
        ownContributionPct,
        termLoan: loanAmount,
        termLoanPct,
        eligibleSubsidyAmount: eligibleSubsidy,
        subsidySchemeName: primaryScheme?.schemeName || "PMFME (35% Credit-Linked Subsidy)",
        effectiveNetLoan: Math.max(0, loanAmount - eligibleSubsidy),
      },
      loanTerms: {
        principal: loanAmount,
        interestRatePct: params.interestRate,
        tenureMonths: params.tenureMonths,
        moratoriumMonths: 6,
        monthlyEMI: loanCalc.monthlyEMI,
        totalInterest: loanCalc.totalInterest,
      },
      operationalAssumptions: {
        dailyCapacityLiters: params.dailyCapacity,
        capacityUtilizationPct: params.capacityUtilization,
        purchasePricePerLiter: params.purchasePrice,
        sellingPricePerLiter: params.sellingPrice,
        powerAndDieselMonthly: params.powerAndDiesel,
        laborMonthly,
        consumablesMonthly: packagingMonthly,
        maintenanceMonthly,
      },
      projections: {
        monthlyRevenue: opCalc.monthlyRevenue,
        monthlyRawMaterialCost: opCalc.monthlyRawMaterialCost,
        monthlyOperatingExpenses: opCalc.monthlyOperatingExpenses,
        monthlyEBITDA: opCalc.monthlyEBITDA,
        monthlyNetProfit: opCalc.monthlyNetProfit,
        monthlyNetCashFlow: opCalc.monthlyNetCashFlow,
        annualDSCR: opCalc.annualDSCR,
        breakEvenMonthlyLiters: opCalc.monthlyBreakEvenUnits,
        breakEvenCapacityPct: opCalc.breakEvenCapacityPct,
      },
      repaymentSchedule: loanCalc.schedule.slice(0, 12),
    };

    this.currentScenario = updated;
    return JSON.parse(JSON.stringify(updated));
  }
}

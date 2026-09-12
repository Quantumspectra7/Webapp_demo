import { FinancialScenario } from "@/domain";
import { IFinanceProvider } from "@/providers/interfaces";
import { DEMO_FINANCIAL_SCENARIO } from "@/data/scenarios/dairy-jagraon";
import { calculateEMI, calculateOperatingFinancials } from "@/lib/calculations";

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
  }): Promise<FinancialScenario> {
    await new Promise((res) => setTimeout(res, 50));

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

    const opCalc = calculateOperatingFinancials({
      dailyCapacity: params.dailyCapacity,
      capacityUtilization: params.capacityUtilization,
      sellingPricePerUnit: params.sellingPrice,
      rawMaterialCostPerUnit: params.purchasePrice,
      powerAndFuelMonthly: params.powerAndDiesel,
      laborMonthly: 15000,
      packagingAndConsumablesMonthly: 8000,
      maintenanceAndOtherMonthly: 4000,
      monthlyLoanEMI: loanCalc.monthlyEMI,
      depreciationMonthly: Math.round(params.projectCost * 0.008),
    });

    // PMEGP 35% subsidy on eligible project cost up to ₹50L
    const eligibleSubsidy = Math.round(params.projectCost * 0.35);

    const updated: FinancialScenario = {
      ...this.currentScenario,
      totalProjectCost: params.projectCost,
      financingMeans: {
        ownContribution: params.ownContribution,
        ownContributionPct,
        termLoan: loanAmount,
        termLoanPct,
        eligibleSubsidyAmount: eligibleSubsidy,
        subsidySchemeName: "PMEGP (Rural Special 35%)",
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
        laborMonthly: 15000,
        consumablesMonthly: 8000,
        maintenanceMonthly: 4000,
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

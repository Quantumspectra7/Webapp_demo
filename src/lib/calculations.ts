/**
 * Financial and operational calculation utilities for GramVest
 */

export interface LoanInput {
  principal: number;
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureMonths: number;
  moratoriumMonths?: number;
}

export interface LoanOutput {
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
  schedule: Array<{
    month: number;
    openingBalance: number;
    principalPaid: number;
    interestPaid: number;
    totalEmi: number;
    closingBalance: number;
  }>;
}

export function calculateEMI(input: LoanInput): LoanOutput {
  const { principal, annualInterestRate, tenureMonths, moratoriumMonths = 0 } = input;
  
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlyEMI: 0,
      totalInterest: 0,
      totalPayment: 0,
      schedule: [],
    };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const repaymentMonths = Math.max(1, tenureMonths - moratoriumMonths);

  let monthlyEMI = 0;
  if (monthlyRate === 0) {
    monthlyEMI = principal / repaymentMonths;
  } else {
    monthlyEMI =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
      (Math.pow(1 + monthlyRate, repaymentMonths) - 1);
  }

  const schedule = [];
  let currentBalance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= tenureMonths; m++) {
    const isMoratorium = m <= moratoriumMonths;
    const interest = currentBalance * monthlyRate;
    totalInterest += interest;

    let principalPayment = 0;
    let emiForMonth = 0;

    if (isMoratorium) {
      emiForMonth = interest; // Simple interest servicing during moratorium
    } else {
      emiForMonth = monthlyEMI;
      principalPayment = emiForMonth - interest;
      if (m === tenureMonths || currentBalance - principalPayment < 1) {
        principalPayment = currentBalance;
        emiForMonth = principalPayment + interest;
      }
    }

    const closingBalance = Math.max(0, currentBalance - principalPayment);

    schedule.push({
      month: m,
      openingBalance: Math.round(currentBalance),
      principalPaid: Math.round(principalPayment),
      interestPaid: Math.round(interest),
      totalEmi: Math.round(emiForMonth),
      closingBalance: Math.round(closingBalance),
    });

    currentBalance = closingBalance;
  }

  return {
    monthlyEMI: Math.round(monthlyEMI),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(principal + totalInterest),
    schedule,
  };
}

export interface OperatingFinancialsInput {
  dailyCapacity: number; // e.g. 500 liters/day
  capacityUtilization: number; // e.g. 80 (%)
  sellingPricePerUnit: number; // e.g. ₹60 / liter
  rawMaterialCostPerUnit: number; // e.g. ₹42 / liter
  powerAndFuelMonthly: number; // e.g. ₹18,000
  laborMonthly: number; // e.g. ₹15,000
  packagingAndConsumablesMonthly: number; // e.g. ₹8,000
  maintenanceAndOtherMonthly: number; // e.g. ₹4,000
  monthlyLoanEMI: number; // e.g. ₹12,310
  depreciationMonthly?: number; // e.g. ₹6,000
}

export interface OperatingFinancialsOutput {
  monthlyUnitsProduced: number;
  monthlyRevenue: number;
  monthlyRawMaterialCost: number;
  monthlyGrossMargin: number;
  monthlyGrossMarginPct: number;
  monthlyOperatingExpenses: number;
  monthlyEBITDA: number;
  monthlyNetProfit: number;
  monthlyNetCashFlow: number;
  annualDSCR: number;
  monthlyBreakEvenUnits: number;
  breakEvenCapacityPct: number;
}

export function calculateOperatingFinancials(input: OperatingFinancialsInput): OperatingFinancialsOutput {
  const effectiveDailyUnits = input.dailyCapacity * (input.capacityUtilization / 100);
  const monthlyUnits = Math.round(effectiveDailyUnits * 30);

  const monthlyRevenue = monthlyUnits * input.sellingPricePerUnit;
  const monthlyRawMaterialCost = monthlyUnits * input.rawMaterialCostPerUnit;
  const monthlyGrossMargin = monthlyRevenue - monthlyRawMaterialCost;
  const monthlyGrossMarginPct = monthlyRevenue > 0 ? (monthlyGrossMargin / monthlyRevenue) * 100 : 0;

  const fixedOpEx =
    input.powerAndFuelMonthly +
    input.laborMonthly +
    input.packagingAndConsumablesMonthly +
    input.maintenanceAndOtherMonthly;

  const totalOpEx = monthlyRawMaterialCost + fixedOpEx;
  const monthlyEBITDA = monthlyRevenue - totalOpEx;

  const depreciation = input.depreciationMonthly ?? 0;
  const monthlyPBT = monthlyEBITDA - depreciation;
  // Rural micro enterprises often benefit from 44AD presumptive taxation or exemptions
  const estimatedTax = monthlyPBT > 25000 ? Math.round(monthlyPBT * 0.05) : 0;
  const monthlyNetProfit = monthlyPBT - estimatedTax;

  const monthlyNetCashFlow = monthlyEBITDA - input.monthlyLoanEMI - estimatedTax;

  // DSCR = EBITDA / Debt Service (EMI)
  const annualDSCR = input.monthlyLoanEMI > 0 ? +(monthlyEBITDA / input.monthlyLoanEMI).toFixed(2) : 9.99;

  // Break-even units = Fixed Costs / Contribution per unit
  const contributionPerUnit = input.sellingPricePerUnit - input.rawMaterialCostPerUnit;
  const totalFixedCostsMonthly = fixedOpEx + input.monthlyLoanEMI;
  const monthlyBreakEvenUnits =
    contributionPerUnit > 0 ? Math.round(totalFixedCostsMonthly / contributionPerUnit) : 0;
  
  const maxMonthlyCapacity = input.dailyCapacity * 30;
  const breakEvenCapacityPct =
    maxMonthlyCapacity > 0 ? +((monthlyBreakEvenUnits / maxMonthlyCapacity) * 100).toFixed(1) : 0;

  return {
    monthlyUnitsProduced: monthlyUnits,
    monthlyRevenue,
    monthlyRawMaterialCost,
    monthlyGrossMargin,
    monthlyGrossMarginPct: +monthlyGrossMarginPct.toFixed(1),
    monthlyOperatingExpenses: totalOpEx,
    monthlyEBITDA,
    monthlyNetProfit,
    monthlyNetCashFlow,
    annualDSCR,
    monthlyBreakEvenUnits,
    breakEvenCapacityPct,
  };
}

export function calculateViabilityScore(params: {
  marketDemandScore: number; // 0-100
  competitionOpportunityScore: number; // 0-100
  capitalFitScore: number; // 0-100
  profitabilityScore: number; // 0-100
  riskResilienceScore: number; // 0-100
  weights?: {
    market: number;
    competition: number;
    capital: number;
    profitability: number;
    risk: number;
  };
}): {
  overallScore: number;
  verdict: "Promising" | "Viable with Caution" | "High Risk";
  quartile: string;
} {
  const weights = params.weights ?? {
    market: 0.25,
    competition: 0.2,
    capital: 0.2,
    profitability: 0.2,
    risk: 0.15,
  };

  const weightedScore =
    params.marketDemandScore * weights.market +
    params.competitionOpportunityScore * weights.competition +
    params.capitalFitScore * weights.capital +
    params.profitabilityScore * weights.profitability +
    params.riskResilienceScore * weights.risk;

  const overallScore = Math.round(weightedScore);

  let verdict: "Promising" | "Viable with Caution" | "High Risk" = "Promising";
  let quartile = "Top Quartile";

  if (overallScore >= 70) {
    verdict = "Promising";
    quartile = "Top Quartile (Jalandhar & Ludhiana Rural Belt)";
  } else if (overallScore >= 50) {
    verdict = "Viable with Caution";
    quartile = "Mid Quartile (Benchmark Feasible)";
  } else {
    verdict = "High Risk";
    quartile = "Lower Quartile (High Capital & Demand Friction)";
  }

  return { overallScore, verdict, quartile };
}

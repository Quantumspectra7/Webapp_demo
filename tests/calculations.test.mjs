import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEMI,
  calculateOperatingFinancials,
  calculateViabilityScore,
} from "../src/lib/calculations.ts";

test("calculateEMI calculates correct monthly installment and amortization schedule", () => {
  const result = calculateEMI({
    principal: 600000,
    annualInterestRate: 8.5,
    tenureMonths: 60,
    moratoriumMonths: 6,
  });

  assert.ok(result.monthlyEMI > 12000 && result.monthlyEMI < 14000, "EMI should be ~₹12,310 - ₹13,500");
  assert.equal(result.schedule.length, 60, "Schedule must span 60 months");
  assert.equal(result.schedule[0].principalPaid, 0, "Moratorium month 1 principal paid should be 0");
  assert.ok(result.schedule[0].interestPaid > 0, "Moratorium interest must be serviced");
  assert.equal(result.schedule[59].closingBalance, 0, "Closing balance at end of tenure must be 0");
});

test("calculateOperatingFinancials calculates correct revenue, EBITDA, and DSCR", () => {
  const result = calculateOperatingFinancials({
    dailyCapacity: 500,
    capacityUtilization: 85, // 425 L/day = 12,750 L/month
    sellingPricePerUnit: 60,
    rawMaterialCostPerUnit: 42,
    powerAndFuelMonthly: 18000,
    laborMonthly: 15000,
    packagingAndConsumablesMonthly: 8000,
    maintenanceAndOtherMonthly: 4000,
    monthlyLoanEMI: 12310,
    depreciationMonthly: 6000,
  });

  assert.equal(result.monthlyUnitsProduced, 12750);
  assert.equal(result.monthlyRevenue, 12750 * 60); // ₹7,65,000
  assert.equal(result.monthlyRawMaterialCost, 12750 * 42); // ₹5,35,500
  assert.ok(result.monthlyEBITDA > 0, "EBITDA must be positive");
  assert.ok(result.annualDSCR > 1.3, "DSCR must exceed 1.3x bank hurdle");
  assert.ok(result.monthlyBreakEvenUnits > 0, "Break-even units must be calculated");
});

test("calculateViabilityScore computes weighted quartile rank accurately", () => {
  const promising = calculateViabilityScore({
    marketDemandScore: 82,
    competitionOpportunityScore: 76,
    capitalFitScore: 68,
    profitabilityScore: 75,
    riskResilienceScore: 64,
  });

  assert.equal(promising.overallScore, 74);
  assert.equal(promising.verdict, "Promising");
  assert.ok(promising.quartile.includes("Top Quartile"));

  const stressed = calculateViabilityScore({
    marketDemandScore: 40,
    competitionOpportunityScore: 45,
    capitalFitScore: 40,
    profitabilityScore: 35,
    riskResilienceScore: 30,
  });

  assert.equal(stressed.verdict, "High Risk");
});

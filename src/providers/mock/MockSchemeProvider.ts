import { SchemeRouteRecommendation } from "@/domain";
import { ISchemeProvider } from "@/providers/interfaces";
import { DEMO_SCHEMES } from "@/data/scenarios/dairy-jagraon";

export class MockSchemeProvider implements ISchemeProvider {
  async getRecommendedSchemes(): Promise<SchemeRouteRecommendation> {
    await new Promise((res) => setTimeout(res, 50));
    return JSON.parse(JSON.stringify(DEMO_SCHEMES));
  }

  async calculateSubsidy(
    projectCost: number,
    schemeCode: string,
    isRuralSpecial: boolean
  ): Promise<{
    subsidyAmount: number;
    subsidyRatePct: number;
    effectiveNetLoan: number;
    disclaimer: string;
  }> {
    await new Promise((res) => setTimeout(res, 50));

    let rate = 0.25; // General urban PMEGP default
    if (schemeCode === "PMEGP") {
      rate = isRuralSpecial ? 0.35 : 0.25;
    } else if (schemeCode === "PMFME") {
      rate = 0.35;
    }

    const cappedCost = Math.min(projectCost, 5000000);
    const subsidyAmount = Math.round(cappedCost * rate);
    const termLoan = projectCost * 0.7; // Assuming 70% typical debt
    const effectiveNetLoan = Math.max(0, termLoan - subsidyAmount);

    return {
      subsidyAmount,
      subsidyRatePct: rate * 100,
      effectiveNetLoan,
      disclaimer:
        "Indicative calculation. Final subsidy sanction is approved by the District Level Task Force Committee (DLTFC) and released back-ended by KVIC.",
    };
  }
}

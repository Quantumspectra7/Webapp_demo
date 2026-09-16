import { SchemeRouteRecommendation, Scheme } from "@/domain";
import { ISchemeProvider } from "@/providers/interfaces";
import { getScenarioForBusiness } from "@/data/real/business_scenarios";
import { getSchemeRecommendationForBusiness } from "@/data/real/schemeRegistry";

export class MockSchemeProvider implements ISchemeProvider {
  private activeCategoryId: string = "biz-dairy-processing";

  public setActiveCategory(categoryId: string) {
    if (categoryId) {
      this.activeCategoryId = categoryId;
    }
  }

  async getRecommendedSchemes(
    categoryId?: string,
    projectCostOverride?: number,
    ownCapitalOverride?: number
  ): Promise<SchemeRouteRecommendation> {
    await new Promise((res) => setTimeout(res, 50));
    const targetCat = categoryId || this.activeCategoryId;

    return getSchemeRecommendationForBusiness(
      targetCat,
      projectCostOverride,
      ownCapitalOverride
    );
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

    let rate = 0.25;
    if (schemeCode === "PMEGP" || schemeCode === "SMAM") {
      rate = isRuralSpecial ? 0.35 : 0.25;
    } else if (schemeCode === "PMFME" || schemeCode === "MIDH") {
      rate = 0.35;
    }

    const cappedCost = Math.min(projectCost, 5000000);
    const subsidyAmount = Math.round(cappedCost * rate);
    const termLoan = projectCost * 0.7;
    const effectiveNetLoan = Math.max(0, termLoan - subsidyAmount);

    return {
      subsidyAmount,
      subsidyRatePct: rate * 100,
      effectiveNetLoan,
      disclaimer:
        "Indicative calculation. Final subsidy sanction is approved by the District Level Task Force Committee (DLTFC) and released back-ended by the nodal department.",
    };
  }
}


import { CapitalStructurePreview } from "@/domain";
import { IFinancePreviewProvider } from "@/providers/interfaces";

export class MockFinancePreviewProvider implements IFinancePreviewProvider {
  calculateCapitalStructure(ownCapital: number): CapitalStructurePreview {
    const validCapital = Math.max(0, ownCapital);
    // Challenge/demo assumption: 10% promoter equity, 90% debt/financing
    const indicativeProjectSize = Math.round(validCapital / 0.1);
    const indicativeFinancingComponent = Math.round(indicativeProjectSize * 0.9);

    // Micro vs Term loan routing per Section 48:
    // If indicative project cost <= 1.40 lakh: Micro Finance route
    // If > 1.40 lakh: Term Loan route
    const routeType = indicativeProjectSize <= 140000 ? "micro" : "term";

    return {
      ownCapital: validCapital,
      indicativeProjectSize,
      indicativeFinancingComponent,
      routeType,
      disclaimer:
        "Indicative calculation — final financing and eligibility depend on applicable scheme rules, bank risk appraisal, and formal credit approval.",
    };
  }
}

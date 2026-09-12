import { FeasibilityReport } from "@/domain";
import { IReportProvider } from "@/providers/interfaces";
import { DEMO_FEASIBILITY_REPORT } from "@/data/scenarios/dairy-jagraon";

export class MockReportProvider implements IReportProvider {
  async getFeasibilityReport(): Promise<FeasibilityReport> {
    await new Promise((res) => setTimeout(res, 50));
    return JSON.parse(JSON.stringify(DEMO_FEASIBILITY_REPORT));
  }

  async generateDownloadPdfUrl(
    reportId: string
  ): Promise<{ downloadUrl: string; filename: string }> {
    await new Promise((res) => setTimeout(res, 400)); // Simulate generation
    return {
      downloadUrl: `#dpr-download-${reportId}`,
      filename: `GramVest_Bankable_DPR_GurpreetSingh_Jagraon.pdf`,
    };
  }
}

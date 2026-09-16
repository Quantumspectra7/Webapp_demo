import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/services";
import { generateDprPdf } from "@/lib/pdfGenerator";

export async function GET(req: NextRequest) {
  try {
    const report = await reportService.getReport();
    const doc = generateDprPdf(report);
    const arrayBuffer = doc.output("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    const cleanName = (report.entrepreneur.fullName || "Entrepreneur").replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTown = (report.location.villageOrTown || "Catchment").replace(/[^a-zA-Z0-9]/g, "_");
    const cleanBiz = (report.business.title || "Enterprise").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `GramVest_Bankable_DPR_${cleanBiz}_${cleanTown}_${cleanName}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF dossier:", error);
    return NextResponse.json(
      { error: "Failed to generate bankable PDF dossier" },
      { status: 500 }
    );
  }
}

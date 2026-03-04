import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { AnalysisRun } from "~/services/api/analysis/types";

/**
 * Asynchronously generates and triggers a download for a PDF report of an analysis run.
 */
export const generateAnalysisPDF = async (run: AnalysisRun, projectName: string) => {
    if (!run.result) {
        console.error("Cannot generate generate PDF for incomplete run.");
        return;
    }

    const { result } = run;
    const doc = new jsPDF();

    // -- Styling Constants --
    const primaryColor: [number, number, number] = [255, 193, 7]; // Yellow-amber
    const darkGray: [number, number, number] = [40, 40, 45];
    const lightGray: [number, number, number] = [120, 120, 130];
    const bittersweet: [number, number, number] = [255, 107, 107];
    const margin = 20;

    // -- Header --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...darkGray);
    doc.text("Analysis Report", margin, margin + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...lightGray);
    doc.text(`Generated on: ${new Date(run.timestamp).toLocaleString()}`, margin, margin + 18);
    doc.text(`Run ID: ${run.id}`, margin, margin + 24);

    // -- Project Info --
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(margin, margin + 32, 210 - margin, margin + 32); // Horizontal rule

    doc.setFontSize(12);
    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.text("Context", margin, margin + 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Project: ${projectName}`, margin, margin + 52);
    doc.text(`Subproject (Model): ${run.subprojectId}`, margin, margin + 58);

    // -- High-Level Metrics (Rendered as text blocks) --
    let cursorY = margin + 75;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Metrics", margin, cursorY);

    cursorY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Metric 1
    doc.setTextColor(...primaryColor);
    doc.text(`Analyzed Entries: ${result.analyzedEntries}`, margin, cursorY);
    doc.setTextColor(...lightGray);
    doc.text(`(out of ${result.totalEntries})`, margin + 60, cursorY);

    cursorY += 8;
    // Metric 2
    doc.setTextColor(...bittersweet);
    doc.text(`Excluded Entries: ${result.excludedEntries}`, margin, cursorY);

    cursorY += 8;
    // Metric 3
    doc.setTextColor(...darkGray);
    doc.text(`Average Confidence: ${(result.confidenceMetrics.average * 100).toFixed(1)}%`, margin, cursorY);

    // -- Behavior Distribution Table --
    cursorY += 25;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Behavior Detection Distribution", margin, cursorY);

    const behaviorBody = result.behaviorDistribution.map(b => [
        b.behaviorId.replace(/_/g, " ").toUpperCase(),
        b.count.toString(),
        `${b.percentage}%`
    ]);

    autoTable(doc, {
        startY: cursorY + 6,
        head: [['Behavior', 'Count', 'Percentage']],
        body: behaviorBody,
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: 255 },
        styles: { font: "helvetica", fontSize: 9 },
        margin: { left: margin, right: margin }
    });

    cursorY = (doc as any).lastAutoTable.finalY + 20;

    // -- Insights Narrative --
    // Check page break
    if (cursorY > 250) {
        doc.addPage();
        cursorY = margin + 10;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkGray);
    doc.text("Key Insights", margin, cursorY);

    cursorY += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...lightGray);

    result.insights.forEach(insight => {
        // Simple word wrap
        const splitText = doc.splitTextToSize(`• ${insight}`, 170);
        doc.text(splitText, margin, cursorY);
        cursorY += (splitText.length * 6) + 4;
    });

    // -- Footer --
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...lightGray);
        doc.text(
            `Panopticon Analysis Report - Page ${i} of ${pageCount}`,
            105,
            285,
            { align: "center" }
        );
    }

    // -- Trigger Download --
    const filename = `panopticon_analysis_${run.subprojectId}_${run.id.split('_')[1]}.pdf`;
    doc.save(filename);
};

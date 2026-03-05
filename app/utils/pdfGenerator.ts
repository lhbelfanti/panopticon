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

    // -- Styling Constants (Matching Panopticon Dark Theme) --
    const backgroundColor = "#1a1a1a"; // Lightened for better depth
    const surfaceColor = "#242424"; // Slightly lighter for cards
    const primaryColor: [number, number, number] = [238, 189, 43]; // #eebd2b
    const textWhite = "#FFFFFF";
    const textGray = "#9CA3AF";
    const bittersweetColor: [number, number, number] = [255, 107, 107];
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const applyBackground = () => {
        doc.setFillColor(backgroundColor);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
    };

    applyBackground();

    // -- Header & Logo --
    const logoSize = 25;
    const logoX = pageWidth - margin - logoSize;
    const logoY = margin;

    // Background "PANOPTICON" wordmark (behind logo)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(45, 45, 45); // Very subtle dark grey for background wordmark on #1a1a1a bg
    const bgBrandName = "PANOPTICON";
    const bgWidth = doc.getTextWidth(bgBrandName);
    doc.text(bgBrandName, logoX + (logoSize / 2), logoY + (logoSize / 2) + 4, { align: "center" });

    // Logo Icon
    try {
        doc.addImage("/panopticon-logo-no-text.png", "PNG", logoX, logoY, logoSize, logoSize);
    } catch (e) {
        doc.setFillColor(...primaryColor);
        doc.rect(logoX, logoY, logoSize, logoSize, "F");
    }

    doc.setFontSize(28);
    doc.setTextColor(textWhite);
    doc.text("Analysis Report", margin, margin + 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(textGray);
    doc.text(`Generated on: ${new Date(run.timestamp).toLocaleString()}`, margin, margin + 22);
    doc.text(`Run ID: ${run.id.split('_')[1].toUpperCase()}`, margin, margin + 28);

    // -- Project Context Card --
    let cursorY = margin + 45;
    doc.setFillColor(surfaceColor);
    doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 35, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("PROJECT CONTEXT", margin + 8, cursorY + 10);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(textWhite);
    doc.setFontSize(11);
    doc.text(`Project: ${projectName}`, margin + 8, cursorY + 20);
    doc.text(`Subproject: ${run.subprojectId}`, margin + 8, cursorY + 27);

    // -- Key Metrics Cards --
    cursorY += 45;
    const cardWidth = (pageWidth - (margin * 2) - 10) / 3;

    const drawMetricCard = (x: number, y: number, label: string, value: string, subValue: string, color: [number, number, number]) => {
        doc.setFillColor(surfaceColor);
        doc.roundedRect(x, y, cardWidth, 40, 4, 4, "F");

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textGray);
        doc.text(label.toUpperCase(), x + 6, y + 10);

        doc.setFontSize(18);
        doc.setTextColor(...color);
        doc.text(value, x + 6, y + 22);

        doc.setFontSize(8);
        doc.setTextColor(textGray);
        doc.text(subValue, x + 6, y + 32);
    };

    drawMetricCard(margin, cursorY, "Total analyzed", result.analyzedEntries.toString(), `of ${result.totalEntries} available`, primaryColor);
    drawMetricCard(margin + cardWidth + 5, cursorY, "Excluded", result.excludedEntries.toString(), "Selection criteria", bittersweetColor);
    drawMetricCard(margin + (cardWidth + 5) * 2, cursorY, "Confidence", `${Math.round(result.confidenceMetrics.average * 100)}%`, `Median: ${Math.round(result.confidenceMetrics.median * 100)}%`, primaryColor);

    // -- Behavior Distribution Chart (Graphical) --
    cursorY += 55;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(textWhite);
    doc.text("Behavior Detection Trends", margin, cursorY);

    cursorY += 10;
    const chartHeight = 60;
    const chartWidth = pageWidth - (margin * 2);
    doc.setFillColor(surfaceColor);
    doc.roundedRect(margin, cursorY, chartWidth, chartHeight + 20, 4, 4, "F");

    const maxCount = Math.max(...result.behaviorDistribution.map(b => b.count), 1);
    const barSpacing = chartWidth / (result.behaviorDistribution.length || 1);
    const barWidth = Math.min(barSpacing * 0.6, 20);

    result.behaviorDistribution.forEach((b, i) => {
        const barHeight = (b.count / maxCount) * chartHeight;
        const x = margin + (i * barSpacing) + (barSpacing / 2) - (barWidth / 2);
        const y = cursorY + chartHeight + 10 - barHeight;

        doc.setFillColor(...primaryColor);
        doc.roundedRect(x, y, barWidth, barHeight, 2, 2, "F");

        doc.setFontSize(7);
        doc.setTextColor(textWhite);
        doc.text(b.count.toString(), x + (barWidth / 2), y - 3, { align: "center" });

        doc.setTextColor(textGray);
        const label = b.behaviorId.split('_').pop()?.toUpperCase() || "";
        doc.text(label, x + (barWidth / 2), cursorY + chartHeight + 15, { align: "center" });
    });

    // -- Executive Summary (Investigation Conclusion) --
    cursorY += chartHeight + 45;

    // Check for page break
    if (cursorY > pageHeight - 60) {
        doc.addPage();
        applyBackground();
        cursorY = margin + 10;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(textWhite);
    const summaryTitle = "Investigation Conclusion";
    doc.text(summaryTitle, margin, cursorY);

    const titleWidth = doc.getTextWidth(summaryTitle);
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(margin, cursorY + 2, margin + titleWidth, cursorY + 2);

    cursorY += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(textWhite);

    const conclusionText = result.insights.join(" ");
    const splitConclusion = doc.splitTextToSize(conclusionText, chartWidth);
    doc.text(splitConclusion, margin, cursorY);

    cursorY += (splitConclusion.length * 5) + 15;

    // -- Audit Details Table --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(textWhite);
    doc.text("Dataset Breakdown", margin, cursorY);

    const behaviorBody = result.behaviorDistribution.map(b => [
        b.behaviorId.replace(/_/g, " ").toUpperCase(),
        b.count.toString(),
        `${b.percentage}%`
    ]);

    autoTable(doc, {
        startY: cursorY + 6,
        head: [['Behavior', 'Count', 'Percentage']],
        body: behaviorBody,
        theme: 'plain',
        headStyles: { fillColor: backgroundColor, textColor: primaryColor, fontStyle: 'bold' },
        bodyStyles: { textColor: textWhite, fillColor: backgroundColor },
        alternateRowStyles: { fillColor: surfaceColor },
        styles: { font: "helvetica", fontSize: 9 },
        margin: { left: margin, right: margin }
    });

    // -- Footer --
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(textGray);
        doc.text(
            `Panopticon Intelligence - Subproject Analysis Report - Page ${i} of ${pageCount}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );
    }

    // -- Trigger Download --
    const filename = `panopticon_analysis_${run.subprojectId}_${run.id.split('_')[1]}.pdf`;
    doc.save(filename);
};

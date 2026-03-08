import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAnalysisPDF } from "./pdfGenerator";
import type { AnalysisRun } from "~/services/api/analysis/types";

// Mock jspdf and jspdf-autotable
const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFont = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetDrawColor = vi.fn();
const mockSetLineWidth = vi.fn();
const mockLine = vi.fn();
const mockAddPage = vi.fn();
const mockSetPage = vi.fn();
const mockSplitTextToSize = vi.fn((text: string) => [text]);
const mockGetNumberOfPages = vi.fn(() => 1);
const mockSetFillColor = vi.fn();
const mockRect = vi.fn();
const mockRoundedRect = vi.fn();
const mockAddImage = vi.fn();
const mockGetTextWidth = vi.fn(() => 50);

vi.mock("jspdf", () => {
    return {
        jsPDF: vi.fn().mockImplementation(function (this: any) {
            this.save = mockSave;
            this.text = mockText;
            this.setFont = mockSetFont;
            this.setFontSize = mockSetFontSize;
            this.setTextColor = mockSetTextColor;
            this.setDrawColor = mockSetDrawColor;
            this.setLineWidth = mockSetLineWidth;
            this.line = mockLine;
            this.addPage = mockAddPage;
            this.setPage = mockSetPage;
            this.splitTextToSize = mockSplitTextToSize;
            this.setFillColor = mockSetFillColor;
            this.rect = mockRect;
            this.roundedRect = mockRoundedRect;
            this.addImage = mockAddImage;
            this.getTextWidth = mockGetTextWidth;
            this.internal = {
                getNumberOfPages: mockGetNumberOfPages,
                pageSize: {
                    getWidth: vi.fn(() => 210),
                    getHeight: vi.fn(() => 297),
                }
            };
            this.lastAutoTable = { finalY: 180 };
            return this;
        })
    };
});

vi.mock("jspdf-autotable", () => ({
    default: vi.fn(),
}));

const makeCompletedRun = (): AnalysisRun => ({
    id: "run_1700000000000_42",
    subprojectId: "roberta",
    timestamp: "2024-01-15T10:00:00.000Z",
    status: "completed",
    parameters: { excludedEntryIds: [] },
    result: {
        totalEntries: 100,
        analyzedEntries: 90,
        excludedEntries: 10,
        behaviorDistribution: [
            { behaviorId: "hate_speech", count: 12, percentage: 12 },
            { behaviorId: "sexism", count: 8, percentage: 8 },
        ],
        confidenceMetrics: {
            average: 0.82,
            median: 0.85,
            distribution: [{ range: "0.8-1.0", count: 80 }],
        },
        insights: ["Insight A", "Insight B"],
    },
});

describe("generateAnalysisPDF", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns early and does not call doc.save when run.result is undefined", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
        const run = makeCompletedRun();
        run.result = undefined;

        await generateAnalysisPDF(run, "My Project", (k) => k);

        expect(mockSave).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it("calls doc.save with the correct filename for a completed run", async () => {
        const run = makeCompletedRun();
        await generateAnalysisPDF(run, "My Project", (k) => k);

        expect(mockSave).toHaveBeenCalledTimes(1);
        const filename = mockSave.mock.calls[0][0] as string;
        // filename: panopticon_analysis_roberta_1700000000000.pdf
        expect(filename).toMatch(/^panopticon_analysis_roberta_\d+\.pdf$/);
    });

    it("includes subprojectId in the filename", async () => {
        const run = makeCompletedRun();
        await generateAnalysisPDF(run, "My Project", (k) => k);

        const filename = mockSave.mock.calls[0][0] as string;
        expect(filename).toContain("roberta");
    });

    it("calls doc.text with the 'Analysis Report' heading", async () => {
        const run = makeCompletedRun();
        await generateAnalysisPDF(run, "My Project", (k) => k);

        const textCalls = mockText.mock.calls.map((c: any[]) => c[0]);
        expect(textCalls).toContain("projects.analysis.reportModal.title");
    });

    it("calls doc.text with the project name", async () => {
        const run = makeCompletedRun();
        await generateAnalysisPDF(run, "My Project", (k) => k);

        const textCalls = mockText.mock.calls.map((c: any[]) => c[0]);
        expect(textCalls.some((t: string) => t.includes("My Project"))).toBe(true);
    });
});

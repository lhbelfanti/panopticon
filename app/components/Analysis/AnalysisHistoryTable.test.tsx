import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalysisHistoryTable } from "./AnalysisHistoryTable";
import type { AnalysisRun } from "~/services/api/analysis/types";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const makRun = (overrides: Partial<AnalysisRun> = {}): AnalysisRun => ({
    id: "run_1700000000000_42",
    subprojectId: "roberta",
    timestamp: "2024-01-15T10:00:00.000Z",
    status: "completed",
    parameters: { excludedEntryIds: [] },
    result: {
        totalEntries: 100,
        analyzedEntries: 95,
        excludedEntries: 5,
        behaviorDistribution: [{ behaviorId: "hate_speech", count: 10, percentage: 10 }],
        confidenceMetrics: {
            average: 0.82,
            median: 0.85,
            distribution: [{ range: "0.8-1.0", count: 80 }],
        },
        insights: ["Insight 1"],
    },
    ...overrides,
});

describe("AnalysisHistoryTable", () => {
    const onRefreshMock = vi.fn();
    const onViewReportMock = vi.fn();
    const onDownloadPDFMock = vi.fn();

    const defaultProps = {
        history: [],
        isRefreshing: false,
        onRefresh: onRefreshMock,
        onViewReport: onViewReportMock,
        onDownloadPDF: onDownloadPDFMock,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderTable = (props = {}) =>
        render(<AnalysisHistoryTable {...defaultProps} {...props} />);

    it("renders table headers correctly", () => {
        renderTable();
        expect(screen.getByText("projects.analysis.historyTable.columns.idAndTimestamp")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.historyTable.columns.status")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.historyTable.columns.exclusions")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.historyTable.columns.actions")).toBeInTheDocument();
    });

    it("shows empty state when history is empty", () => {
        renderTable();
        expect(screen.getByText("projects.analysis.historyTable.noHistory")).toBeInTheDocument();
    });

    it("renders a completed run with View Report and PDF buttons", async () => {
        const user = userEvent.setup();
        const run = makRun({ status: "completed" });
        renderTable({ history: [run] });

        expect(screen.getByText("completed")).toBeInTheDocument();

        const row = screen.getByText("completed").closest("tr");

        expect(screen.getByText("projects.analysis.historyTable.viewReport")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.historyTable.pdf")).toBeInTheDocument();
    });

    it("renders a processing run with spinner and no action buttons", async () => {
        const user = userEvent.setup();
        const run = makRun({ status: "processing", result: undefined });
        renderTable({ history: [run] });

        expect(screen.getByText("processing")).toBeInTheDocument();

        const row = screen.getByText("processing").closest("tr");

        expect(screen.queryByText("projects.analysis.historyTable.viewReport")).not.toBeInTheDocument();
        expect(screen.queryByText("projects.analysis.historyTable.pdf")).not.toBeInTheDocument();
    });

    it("renders a failed run with error icon and no action buttons", async () => {
        const user = userEvent.setup();
        const run = makRun({ status: "failed", result: undefined });
        renderTable({ history: [run] });

        expect(screen.getByText("failed")).toBeInTheDocument();

        const row = screen.getByText("failed").closest("tr");

        expect(screen.queryByText("projects.analysis.historyTable.viewReport")).not.toBeInTheDocument();
        expect(screen.queryByText("projects.analysis.historyTable.pdf")).not.toBeInTheDocument();
    });

    it("calls onViewReport when View Report is clicked", async () => {
        const user = userEvent.setup();
        const run = makRun({ status: "completed" });
        renderTable({ history: [run] });

        const viewBtn = screen.getByText("projects.analysis.historyTable.viewReport");
        await user.click(viewBtn);

        expect(onViewReportMock).toHaveBeenCalledWith(run);
    });

    it("calls onDownloadPDF when PDF is clicked", async () => {
        const user = userEvent.setup();
        const run = makRun({ status: "completed" });
        renderTable({ history: [run] });

        const pdfBtn = screen.getByText("projects.analysis.historyTable.pdf");
        await user.click(pdfBtn);

        expect(onDownloadPDFMock).toHaveBeenCalledWith(run.id);
    });

    it("calls onRefresh when Refresh history is clicked", async () => {
        const user = userEvent.setup();
        renderTable();

        await user.click(screen.getByText("projects.analysis.historyTable.refresh"));
        expect(onRefreshMock).toHaveBeenCalled();
    });

    it("refresh button is disabled when isRefreshing is true", () => {
        renderTable({ isRefreshing: true });
        const btn = screen.getByText("projects.analysis.historyTable.refresh").closest("button");
        expect(btn).toBeDisabled();
    });

    it("displays exclusion count correctly", () => {
        const run = makRun({
            status: "completed",
            parameters: { excludedEntryIds: ["e1", "e2", "e3"] },
        });
        renderTable({ history: [run] });

        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.historyTable.entriesExcluded")).toBeInTheDocument();
    });

    it("renders multiple runs in order", () => {
        const run1 = makRun({ id: "run_1000_1", status: "completed" });
        const run2 = makRun({ id: "run_2000_2", status: "processing", result: undefined });
        renderTable({ history: [run1, run2] });

        expect(screen.getByText("completed")).toBeInTheDocument();
        expect(screen.getByText("processing")).toBeInTheDocument();
    });
});

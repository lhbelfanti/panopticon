import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalysisReportModal } from "../Modals/AnalysisReportModal";
import type { AnalysisRun } from "~/services/api/analysis/types";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock recharts to avoid canvas rendering issues in jsdom
vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
    Cell: () => null,
}));

const makeCompletedRun = (overrides: Partial<AnalysisRun> = {}): AnalysisRun => ({
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
        ],
        confidenceMetrics: {
            average: 0.82,
            median: 0.85,
            distribution: [{ range: "0.8-1.0", count: 80 }],
        },
        insights: ["Hate speech is the top category.", "High overall confidence."],
    },
    ...overrides,
});

describe("AnalysisReportModal", () => {
    const onCloseMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders nothing when isOpen is false", () => {
        const { container } = render(
            <AnalysisReportModal isOpen={false} onClose={onCloseMock} run={makeCompletedRun()} />
        );
        expect(container.firstChild).toBeNull();
    });

    it("renders nothing when run is null", () => {
        const { container } = render(
            <AnalysisReportModal isOpen={true} onClose={onCloseMock} run={null} />
        );
        expect(container.firstChild).toBeNull();
    });

    it("renders nothing for completed run with no result", () => {
        const run = makeCompletedRun({ result: undefined });
        const { container } = render(
            <AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />
        );
        expect(container.firstChild).toBeNull();
    });

    it("shows processing state for a processing run", () => {
        const run = makeCompletedRun({ status: "processing", result: undefined });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);
        expect(screen.getByText("Analysis Processing")).toBeInTheDocument();
    });

    it("shows close button in processing state that calls onClose", async () => {
        const user = userEvent.setup();
        const run = makeCompletedRun({ status: "processing", result: undefined });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);

        await user.click(screen.getByText("Close"));
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("renders the full report for a completed run", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("Analysis Report")).toBeInTheDocument();
    });

    it("displays analyzedEntries count", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("90")).toBeInTheDocument(); // analyzedEntries
    });

    it("displays excludedEntries count", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("10")).toBeInTheDocument(); // excludedEntries
    });

    it("displays overall confidence as percentage", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("82%")).toBeInTheDocument(); // 0.82 * 100
    });

    it("renders insights as list items", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("Hate speech is the top category.")).toBeInTheDocument();
        expect(screen.getByText("High overall confidence.")).toBeInTheDocument();
    });

    it("renders chart containers", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("Behavior Distribution")).toBeInTheDocument();
        expect(screen.getByText("Confidence Distribution")).toBeInTheDocument();
        expect(screen.getAllByTestId("responsive-container").length).toBeGreaterThan(0);
    });

    it("calls onClose when X button is clicked", async () => {
        const user = userEvent.setup();
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);

        const closeBtn = screen.getByRole("button", { name: "" });
        // The X close button is inside the modal header
        const allButtons = screen.getAllByRole("button");
        const xBtn = allButtons.find(b => b.querySelector("svg.lucide-x"));
        if (xBtn) await user.click(xBtn);

        expect(onCloseMock).toHaveBeenCalled();
    });

    it("calls onClose when backdrop is clicked", async () => {
        const user = userEvent.setup();
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);

        // The backdrop is the absolute inset-0 div
        const backdrop = document.querySelector(".absolute.inset-0");
        if (backdrop) await user.click(backdrop as HTMLElement);

        expect(onCloseMock).toHaveBeenCalled();
    });

    it("renders Executive Summary section heading", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("Executive Summary")).toBeInTheDocument();
    });
});

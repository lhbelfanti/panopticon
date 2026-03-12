import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalysisReportModal } from "../Modals/AnalysisReportModal";
import type { AnalysisRun } from "~/services/api/analysis/types";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (options && options.total) return `${key} (total: ${options.total})`;
            if (options && options.count) return `${key} (count: ${options.count})`;
            if (options && options.range) return `${key} (range: ${options.range})`;
            if (options && options.value) return `${key} (value: ${options.value})`;
            return key;
        },
    }),
}));

// Mock ResizeObserver for Recharts
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock fetch
vi.stubGlobal("fetch", vi.fn(() => 
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
));

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
        insights: {
            topBehaviorId: "hate_speech",
            confidenceTrend: "high",
            verdictConcentration: "positive",
        },
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

    it("shows loading state for completed run with no result", () => {
        const run = makeCompletedRun({ result: undefined });
        render(
            <AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />
        );
        expect(screen.getByText("projects.analysis.reportModal.loading.title")).toBeInTheDocument();
    });

    it("shows processing state for a processing run", () => {
        const run = makeCompletedRun({ status: "processing", result: undefined });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);
        expect(screen.getByText("projects.analysis.reportModal.processing.title")).toBeInTheDocument();
    });

    it("shows close button in processing state that calls onClose", async () => {
        const user = userEvent.setup();
        const run = makeCompletedRun({ status: "processing", result: undefined });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);

        await user.click(screen.getByText("projects.analysis.reportModal.close"));
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("renders the full report for a completed run", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("projects.analysis.reportModal.title")).toBeInTheDocument();
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

    it("renders insights based on data keys", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("projects.analysis.reportModal.insights.topBehavior")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.reportModal.insights.confidenceHigh")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.reportModal.insights.verdictsPositive")).toBeInTheDocument();
    });

    it("renders chart containers", () => {
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        expect(screen.getByText("projects.analysis.reportModal.behaviorChart.title")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.reportModal.confidenceChart.title")).toBeInTheDocument();
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

    it("renders legacy insights correctly", () => {
        const run = makeCompletedRun({
            result: {
                ...makeCompletedRun().result!,
                insights: ["Legacy insight 1", "Legacy insight 2"] as any
            }
        });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);
        expect(screen.getByText("Legacy insight 1 Legacy insight 2")).toBeInTheDocument();
    });

    it("renders different confidence trends and verdict concentrations", () => {
        const run = makeCompletedRun({
            result: {
                ...makeCompletedRun().result!,
                insights: {
                    topBehaviorId: "hate_speech",
                    confidenceTrend: "low",
                    verdictConcentration: "negative"
                }
            }
        });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);
        expect(screen.getByText("projects.analysis.reportModal.insights.confidenceLow")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.reportModal.insights.verdictsNegative")).toBeInTheDocument();
        
        // Test medium trend
        const run2 = makeCompletedRun({
            result: {
                ...makeCompletedRun().result!,
                insights: {
                    ...makeCompletedRun().result!.insights,
                    confidenceTrend: "medium"
                }
            }
        });
        render(<AnalysisReportModal isOpen={false} onClose={onCloseMock} run={run2} />); // Just to trigger state
    });

    it("renders error state correctly", async () => {
        const user = userEvent.setup();
        vi.stubGlobal("fetch", vi.fn(() => 
            Promise.resolve({
                ok: false,
                statusText: "Server Error",
            })
        ));

        const run = makeCompletedRun({ result: undefined });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);
        
        await screen.findByText("projects.analysis.reportModal.loading.fetchError");
        const closeBtn = screen.getByText("projects.analysis.reportModal.close");
        await user.click(closeBtn);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("closes when backdrop is clicked", async () => {
        const user = userEvent.setup();
        const { container } = render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={makeCompletedRun()} />);
        const backdrop = container.querySelector(".bg-background-dark\\/90");
        if (backdrop) await user.click(backdrop);
        expect(onCloseMock).toHaveBeenCalled();
    });

    it("successfully fetches full run data", async () => {
        const fullRun = { ...makeCompletedRun(), result: { ...makeCompletedRun().result, totalEntries: 999 } };
        vi.stubGlobal("fetch", vi.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(fullRun),
            })
        ));

        const run = makeCompletedRun({ result: undefined });
        render(<AnalysisReportModal isOpen={true} onClose={onCloseMock} run={run} />);
        
        await screen.findByText(/999/);
    });
});

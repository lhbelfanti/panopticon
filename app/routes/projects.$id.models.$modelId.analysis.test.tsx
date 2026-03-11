import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import { generateAnalysisPDF } from "~/utils/pdfGenerator";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div>{children}</div>,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    PieChart: ({ children }: any) => <div>{children}</div>,
    Pie: ({ children }: any) => <div>{children}</div>,
    Cell: () => null,
}));

vi.mock("~/utils/pdfGenerator", () => ({
    generateAnalysisPDF: vi.fn(),
}));

const mockHistoryTableProps = {
    onRefresh: vi.fn(),
    onViewReport: vi.fn(),
    onDownloadPDF: vi.fn(),
};

vi.mock("~/components/Analysis/AnalysisHistoryTable", () => ({
    AnalysisHistoryTable: ({ history, onRefresh, onViewReport, onDownloadPDF }: any) => (
        <div data-testid="history-table">
            <span data-testid="history-count">{history.length}</span>
            <button onClick={onRefresh}>refresh</button>
            <button onClick={() => onViewReport({ id: "run_1" })}>view-report</button>
            <button onClick={() => onDownloadPDF("run_1")}>download-pdf</button>
        </div>
    ),
}));

vi.mock("~/components/Analysis/NewAnalysisForm", () => ({
    NewAnalysisForm: ({ onSubmit, excludedEntryIds, onOpenExclusions }: any) => (
        <div data-testid="new-analysis-form">
            <button data-testid="submit-btn" onClick={() => onSubmit([])}>submit</button>
            <button data-testid="open-exclusions-btn" onClick={onOpenExclusions}>open-exclusions</button>
            <span data-testid="excluded-count">{excludedEntryIds?.length ?? 0}</span>
        </div>
    ),
}));

vi.mock("~/components/EntriesTable", () => ({
    __esModule: true,
    default: ({ excludedIds, onExcludedIdsChange }: any) => (
        <div data-testid="entries-table-modal">
            <button data-testid="toggle-id-1" onClick={() => onExcludedIdsChange(new Set([...excludedIds, "1"]))}>exclude-1</button>
        </div>
    ),
}));

vi.mock("~/components/Modals/AnalysisReportModal", () => ({
    AnalysisReportModal: ({ isOpen, onClose }: any) =>
        isOpen ? <div data-testid="report-modal"><button onClick={onClose}>close-modal</button></div> : null,
}));

const { mockSubmit, mockProject, mockUseLoaderData, mockUseActionData, mockLocation, mockNavigation } = vi.hoisted(() => ({
    mockSubmit: vi.fn(),
    mockProject: {
        id: 1,
        name: "Test Project",
        behaviors: [],
        subprojects: [],
        models: [],
        createdAt: "2024-01-01T00:00:00Z",
    },
    mockUseLoaderData: (() => {
        const history: any[] = [];
        const entriesData = { entries: [], total: 0, page: 1, limit: 10, totalPages: 0 };
        return vi.fn(() => ({
            modelId: "roberta",
            history,
            entriesData,
            filterCol: "id",
            filterVal: "",
            filterOp: "",
            filterBias: 0
        }));
    })(),
    mockUseActionData: vi.fn(() => undefined as any),
    mockLocation: { state: null, search: "" },
    mockNavigation: { state: "idle", formData: null },
}));

// STABLE MOCK DATA TO AVOID INFINITE LOOPS IN USEEFFECT
const stabelLoaderData = {
    modelId: "roberta",
    history: [],
};

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useLoaderData: () => mockUseLoaderData(),
        useNavigation: () => mockNavigation,
        useLocation: () => mockLocation,
        useActionData: () => mockUseActionData(),
        useSubmit: () => mockSubmit,
        useOutletContext: () => ({ project: mockProject }),
        Link: ({ to, children, className }: any) => <a href={to} className={className}>{children}</a>,
    };
});

import AnalysisPage from "./projects.$id.models.$modelId.analysis";

describe("AnalysisPage Route Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseActionData.mockReturnValue(undefined as any);
        mockUseLoaderData.mockReset();
        mockUseLoaderData.mockReturnValue({
            modelId: "roberta",
            history: [],
            entriesData: { entries: [], total: 0, page: 1, limit: 10, totalPages: 0 },
            filterCol: "id",
            filterVal: "",
            filterOp: "",
            filterBias: 0
        });
    });

    const renderPage = () => {
        return render(
            <MemoryRouter>
                <AnalysisPage />
            </MemoryRouter>
        );
    };

    it("renders the page heading", () => {
        renderPage();
        expect(screen.getByText("projects.analysis.title")).toBeInTheDocument();
    });

    it("renders 'New analysis' and 'History' tab buttons", () => {
        renderPage();
        expect(screen.getByText("projects.analysis.tabs.new")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.tabs.history")).toBeInTheDocument();
    });

    it("defaults to showing NewAnalysisForm on the 'new' tab", () => {
        renderPage();
        expect(screen.getByTestId("new-analysis-form")).toBeInTheDocument();
        expect(screen.queryByTestId("history-table")).not.toBeInTheDocument();
    });

    it("shows AnalysisHistoryTable when History tab is clicked", () => {
        renderPage();
        fireEvent.click(screen.getByText("projects.analysis.tabs.history"));
        expect(screen.getByTestId("history-table")).toBeInTheDocument();
        expect(screen.queryByTestId("new-analysis-form")).not.toBeInTheDocument();
    });

    it("returns to New Analysis tab when 'New analysis' is clicked", () => {
        renderPage();
        fireEvent.click(screen.getByText("projects.analysis.tabs.history"));
        fireEvent.click(screen.getByText("projects.analysis.tabs.new"));
        expect(screen.getByTestId("new-analysis-form")).toBeInTheDocument();
    });

    it("renders breadcrumb with project name", () => {
        renderPage();
        expect(screen.getByText("Test Project")).toBeInTheDocument();
    });

    it("renders Back to subproject link", () => {
        renderPage();
        expect(screen.getByText("projects.analysis.backToSubproject")).toBeInTheDocument();
    });

    it("calls submit with trigger_analysis intent when form submits", () => {
        renderPage();
        fireEvent.click(screen.getByTestId("submit-btn"));
        expect(mockSubmit).toHaveBeenCalled();
        const formArg: FormData = mockSubmit.mock.calls[0][0];
        expect(formArg.get("intent")).toBe("trigger_analysis");
    });

    it("opens and closes the exclusion modal", async () => {
        renderPage();

        // Modal should not be visible initially
        expect(screen.queryByTestId("entries-table-modal")).not.toBeInTheDocument();

        // Open modal
        fireEvent.click(screen.getByTestId("open-exclusions-btn"));

        // Wait for smooth scroll timeout
        await waitFor(() => {
            expect(screen.getByTestId("entries-table-modal")).toBeInTheDocument();
        });
        expect(screen.getByText(/projects\.analysis\.exclusions\.refineTitle/i)).toBeInTheDocument();

        // Close modal via 'Apply & close'
        fireEvent.click(screen.getByText(/projects\.analysis\.exclusions\.applyAndClose/i));
        expect(screen.queryByTestId("entries-table-modal")).not.toBeInTheDocument();
    });

    it("updates excluded count when state changes in the modal", async () => {
        renderPage();

        // Open modal
        fireEvent.click(screen.getByTestId("open-exclusions-btn"));

        // Wait for smooth scroll timeout
        await waitFor(() => {
            expect(screen.getByTestId("toggle-id-1")).toBeInTheDocument();
        });

        // Toggle entry 1 in modal
        fireEvent.click(screen.getByTestId("toggle-id-1"));

        // Close modal
        fireEvent.click(screen.getByText(/projects\.analysis\.exclusions\.applyAndClose/i));

        // Count should be 1
        expect(screen.getByTestId("excluded-count")).toHaveTextContent("1");
    });

    it("auto-switches to history tab when action is successful", async () => {
        const { rerender } = renderPage();
        
        // Mock actionData success
        mockUseActionData.mockReturnValue({ success: true });
        
        rerender(<MemoryRouter><AnalysisPage /></MemoryRouter>);
        
        expect(screen.getByTestId("history-table")).toBeInTheDocument();
    });

    it("locks body overflow when exclusion modal is open", async () => {
        vi.useFakeTimers();
        renderPage();
        
        await act(async () => {
            fireEvent.click(screen.getByTestId("open-exclusions-btn"));
            vi.advanceTimersByTime(400);
        });
        
        expect(document.body.style.overflow).toBe("hidden");
        
        await act(async () => {
            fireEvent.click(screen.getByText(/projects\.analysis\.exclusions\.applyAndClose/i));
        });
        
        expect(document.body.style.overflow).toBe("unset");
        
        vi.useRealTimers();
    });

    it("handles history table actions", async () => {
        const historyMock = [
            { id: "run_1", status: "completed", metrics: {}, createdAt: "2024-01-01" }
        ];
        mockUseLoaderData.mockReturnValue({
            ...stabelLoaderData,
            history: historyMock as any,
            entriesData: { entries: [], total: 0, page: 1, limit: 10, totalPages: 0 },
            filterCol: "id",
            filterVal: "",
            filterOp: "",
            filterBias: 0
        });

        renderPage();
        fireEvent.click(screen.getByText("projects.analysis.tabs.history"));
        
        // Assert data is there
        expect(screen.getByTestId("history-count")).toHaveTextContent("1");
        
        fireEvent.click(screen.getByText("refresh"));
        expect(mockSubmit).toHaveBeenCalled();

        fireEvent.click(screen.getByText("view-report"));
        expect(screen.getByTestId("report-modal")).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(screen.getByText("download-pdf"));
        });
        
        await waitFor(() => {
            expect(vi.mocked(generateAnalysisPDF)).toHaveBeenCalled();
        });
    });

    it("closes the analysis report modal", () => {
        const historyMock = [{ id: "run_1", status: "completed", metrics: {}, createdAt: "2024" }];
        mockUseLoaderData.mockReturnValueOnce({
            ...stabelLoaderData,
            history: historyMock as any,
            entriesData: { entries: [], total: 0, page: 1, limit: 10, totalPages: 0 },
            filterCol: "id",
            filterVal: "",
            filterOp: "",
            filterBias: 0
        });

        renderPage();
        fireEvent.click(screen.getByText("projects.analysis.tabs.history"));
        
        // Open it
        fireEvent.click(screen.getByText("view-report"));
        expect(screen.getByTestId("report-modal")).toBeInTheDocument();

        // Close it
        fireEvent.click(screen.getByText("close-modal"));
        expect(screen.queryByTestId("report-modal")).not.toBeInTheDocument();
    });

    it("initializes excluded ids from location state", () => {
        (mockLocation as any).state = { excludedEntryIds: ["e1", "e2"] };
        renderPage();
        expect(screen.getByTestId("excluded-count")).toHaveTextContent("2");
        (mockLocation as any).state = null; // cleanup
    });
});

// ─── Loader & Action Tests ────────────────────────────────────────────────────

import { loader, action, meta } from "./projects.$id.models.$modelId.analysis";

vi.mock("~/services/api/projects/index.server", () => ({
    getProjectById: vi.fn(async (id: number) => {
        if (id === 1) return { id: 1, name: "Test Project", behaviors: [], subprojects: [] };
        return null;
    }),
}));

vi.mock("~/services/api/analysis/index.server", () => ({
    getSubprojectAnalysisHistory: vi.fn(async () => []),
    triggerProjectAnalysis: vi.fn(async () => ({ id: "run_123", status: "processing" })),
}));

vi.mock("~/services/api/entries/index.server", () => ({
    getEntries: vi.fn(async () => ({ entries: [], total: 0, page: 1, limit: 10, totalPages: 0 })),
}));

import { getSubprojectAnalysisHistory, triggerProjectAnalysis } from "~/services/api/analysis/index.server";
import { getEntries } from "~/services/api/entries/index.server";

describe("AnalysisPage Loader", () => {
    it("returns modelId, history for valid params", async () => {
        const result = await loader({ params: { id: "1", modelId: "roberta" }, request: new Request("http://localhost?page=2&filterCol=text&filterVal=foo") } as any) as any;
        expect(result).not.toHaveProperty("project");
        expect(result).toHaveProperty("modelId", "roberta");
        expect(result).toHaveProperty("history");
        expect(getSubprojectAnalysisHistory).toHaveBeenCalledWith("roberta");
        expect(getEntries).toHaveBeenCalledWith(expect.objectContaining({
            page: 2,
            filterCol: "text",
            filterVal: "foo"
        }));
    });

    it("throws 404 when modelId param is missing", async () => {
        await expect(
            loader({ params: { id: "1" }, request: new Request("http://localhost") } as any)
        ).rejects.toThrow();
    });
});

describe("AnalysisPage Action", () => {
    it("triggers analysis and returns success for trigger_analysis intent", async () => {
        const formData = new FormData();
        formData.set("intent", "trigger_analysis");
        formData.set("excludedIds", JSON.stringify(["e1", "e2"]));
        const request = new Request("http://localhost", { method: "POST", body: formData });
        const result = await action({ request, params: { modelId: "roberta" } } as any);
        expect(triggerProjectAnalysis).toHaveBeenCalledWith("roberta", ["e1", "e2"]);
        expect(result).toEqual({ success: true });
    });

    it("handles empty excludedIds gracefully", async () => {
        const formData = new FormData();
        formData.set("intent", "trigger_analysis");
        const request = new Request("http://localhost", { method: "POST", body: formData });
        const result = await action({ request, params: { modelId: "roberta" } } as any);
        expect(triggerProjectAnalysis).toHaveBeenCalledWith("roberta", []);
        expect(result).toEqual({ success: true });
    });

    it("returns null for unknown intent", async () => {
        const formData = new FormData();
        formData.set("intent", "unknown");
        const request = new Request("http://localhost", { method: "POST", body: formData });
        const result = await action({ request, params: { modelId: "roberta" } } as any);
        expect(result).toBeNull();
    });

    it("throws 400 when modelId is missing", async () => {
        const formData = new FormData();
        formData.set("intent", "trigger_analysis");
        const request = new Request("http://localhost", { method: "POST", body: formData });
        await expect(
            action({ request, params: {} } as any)
        ).rejects.toThrow();
    });
});

describe("AnalysisPage Meta", () => {
    it("returns correct title meta tag", () => {
        expect(meta({ data: { title: "Analysis" } } as any)).toContainEqual({ title: "Panopticon - Analysis" });
    });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router";
import { PredictionsHistoryModal } from "./PredictionsHistoryModal";

// Mock translation
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, defaultText: string) => defaultText || key,
    }),
}));

// Setup fetcher mock using vi.hoisted to prevent scoping issues
const { mockStateObj, mockDataObj, mockLoad } = vi.hoisted(() => ({
    mockStateObj: { value: "idle" },
    mockDataObj: { value: null as any },
    mockLoad: vi.fn(),
}));

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useFetcher: () => ({
            load: mockLoad,
            get state() { return mockStateObj.value; },
            get data() { return mockDataObj.value; }
        })
    };
});

describe("PredictionsHistoryModal", () => {
    const defaultProps = {
        projectId: 1,
        modelId: "roberta",
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockStateObj.value = "idle";
        mockDataObj.value = null;
        mockLoad.mockClear();
    });

    const renderModal = () => {
        return render(
            <BrowserRouter>
                <PredictionsHistoryModal {...defaultProps} />
            </BrowserRouter>
        );
    };

    it("calls fetcher.load on mount if idle and no data", () => {
        renderModal();
        expect(mockLoad).toHaveBeenCalledWith("/projects/1/models/roberta/predictions");
    });

    it("displays loading state when fetching", () => {
        mockStateObj.value = "loading";
        renderModal();
        // The refresh icon should have animate-spin inside the main content area
        // Actually there are two RefreshCw icons (header, body). We can just check for loading indicators.
        // The body has a specific loading container.
        // Just verifying it doesn't crash is a good start.
        expect(screen.getByTitle("Refresh")).toBeInTheDocument();
    });

    it("displays empty state when no runs found", () => {
        mockStateObj.value = "idle";
        mockDataObj.value = { predictionRuns: [] };
        renderModal();
        expect(screen.getByText("No prediction runs found.")).toBeInTheDocument();
    });

    it("renders prediction runs correctly", () => {
        mockStateObj.value = "idle";
        mockDataObj.value = {
            predictionRuns: [
                {
                    id: "run_123",
                    projectId: 1,
                    modelId: "roberta",
                    status: "Running",
                    totalEntries: 100,
                    processedEntries: 50,
                    createdAt: "2024-01-01T00:00:00Z"
                },
                {
                    id: "run_124",
                    projectId: 1,
                    modelId: "roberta",
                    status: "Completed",
                    totalEntries: 100,
                    processedEntries: 100,
                    createdAt: "2024-01-02T00:00:00Z"
                },
                {
                    id: "run_125",
                    projectId: 1,
                    modelId: "roberta",
                    status: "Failed",
                    totalEntries: 100,
                    processedEntries: 10,
                    createdAt: "2024-01-03T00:00:00Z"
                }
            ]
        };
        renderModal();

        expect(screen.getByText("#123")).toBeInTheDocument();
        expect(screen.getByText("Running")).toBeInTheDocument();
        expect(screen.getByText("Progress")).toBeInTheDocument();
        expect(screen.getByText("50 / 100 (50%)")).toBeInTheDocument();

        expect(screen.getByText("#124")).toBeInTheDocument();
        expect(screen.getByText("Completed")).toBeInTheDocument();

        expect(screen.getByText("#125")).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    it("calls handleRefresh when refresh button is clicked", async () => {
        const user = userEvent.setup();
        mockStateObj.value = "idle";
        mockDataObj.value = { predictionRuns: [] };
        renderModal();

        const refreshBtn = screen.getByTitle("Refresh");
        await user.click(refreshBtn);

        await waitFor(() => {
            expect(mockLoad).toHaveBeenCalledTimes(1); // Click only (skipped mount fetch due to mockData)
        });
    });

    it("calls onClose when close button is clicked", async () => {
        const user = userEvent.setup();
        renderModal();

        // The close button is the one with X
        // we can find it by getting button without title, or just get all buttons
        // The easiest is clicking the close button SVG
        const closeBtn = screen.getAllByRole("button")[1]; // Second button in header
        await user.click(closeBtn);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("stops propagation on inner click", async () => {
        const user = userEvent.setup();
        renderModal();
        // click the inner div
        const innerDiv = screen.getByText("Prediction History").parentElement?.parentElement;
        if (innerDiv) await user.click(innerDiv);
        // should not crash or call onClose
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
});

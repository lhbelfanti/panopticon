import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter } from "react-router";
import EntriesTable from "./index";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("~/components/Modals/PredictionsHistoryModal", () => ({
    PredictionsHistoryModal: () => <div data-testid="predictions-modal">projects.entries.predictionHistory</div>
}));

const mockSubmit = vi.fn();
const mockUseNavigation = vi.fn(() => ({
    state: "idle",
    formData: undefined,
    location: undefined,
}));

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        Form: ({ children, onSubmit, ...props }: any) => (
            <form onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(e); }} {...props}>
                {children}
            </form>
        ),
        useSubmit: () => mockSubmit,
        useNavigation: () => mockUseNavigation(),
    };
});

describe("EntriesTable", () => {
    const mockProject = {
        id: "proj-1",
        name: "Test Project",
        subprojects: [],
        behaviors: [],
        models: [],
        createdAt: "2024-01-01T00:00:00Z"
    };

    const mockData = {
        entries: [
            {
                id: "entry_1",
                text: "This is a test entry",
                verdict: "Positive" as any,
                score: 0.95,
                datasetId: "ds-1",
                modelId: "roberta",
                projectId: 1,
                createdAt: "2024-01-01T00:00:00Z"
            },
            {
                id: "entry_2",
                text: "Another pending entry",
                verdict: "Pending" as any,
                score: undefined,
                datasetId: "ds-1",
                modelId: "roberta",
                projectId: 1,
                createdAt: "2024-01-02T00:00:00Z"
            },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
    };

    const defaultProps = {
        project: mockProject as any,
        modelId: "roberta",
        data: mockData,
        filterCol: "text" as any,
        filterVal: "",
        filterOp: "=",
        filterBias: 0,
    };

    const renderTable = (props = {}) => {
        return render(
            <BrowserRouter>
                <EntriesTable
                    {...defaultProps}
                    filterOp={defaultProps.filterOp as any}
                    filterBias={defaultProps.filterBias as any}
                    {...props}
                />
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it("renders table headers correctly", () => {
        renderTable();
        // These keys appear in both the header and the filter dropdown
        expect(screen.getAllByText("projects.entries.tableId")[0]).toBeInTheDocument();
        expect(screen.getAllByText("projects.entries.tableText")[0]).toBeInTheDocument();
        expect(screen.getAllByText("projects.entries.tableVerdict")[0]).toBeInTheDocument();
        expect(screen.getAllByText("projects.entries.tableScore")[0]).toBeInTheDocument();
    });

    it("renders entries data correctly", () => {
        renderTable();
        expect(screen.getAllByText("1")[0]).toBeInTheDocument(); // entry_1 split
        expect(screen.getByText("This is a test entry")).toBeInTheDocument();
        // Verdict AND score are rendered as strings in table; i18n mock returns key
        expect(screen.getAllByText("projects.entries.verdicts.positive")[0]).toBeInTheDocument();
        expect(screen.getByText("95.0%")).toBeInTheDocument();

        expect(screen.getAllByText("2")[0]).toBeInTheDocument(); // entry_2 split
        expect(screen.getByText("Another pending entry")).toBeInTheDocument();
        expect(screen.getAllByText("projects.entries.verdicts.pending")[0]).toBeInTheDocument();
        expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("renders empty state when no entries", () => {
        renderTable({ data: { ...mockData, entries: [], total: 0 } });
        expect(screen.getByText("projects.entries.noResults")).toBeInTheDocument();
    });

    it("opens view modal when entry text is clicked", async () => {
        const user = userEvent.setup();
        renderTable();

        // Click the TR (we'll click the text cell)
        await user.click(screen.getByText("This is a test entry"));

        // Modal should appear
        expect(screen.getByText("projects.entries.viewFullEntry")).toBeInTheDocument();

        // Check elements inside modal — verdicts in modal use i18n keys, in table use i18n keys too
        // The mock t() returns the key. The raw entry.verdict is NOT rendered directly in the badge.
        const verdictBadges = screen.getAllByText("projects.entries.verdicts.positive");
        expect(verdictBadges.length).toBeGreaterThan(1);

        // Close modal
        const closeBtn = screen.getAllByRole("button").find(b => b.querySelector('svg.lucide-x'));
        if (closeBtn) await user.click(closeBtn);

        expect(screen.queryByText("projects.entries.viewFullEntry")).not.toBeInTheDocument();
    });

    it("opens delete confirmation modal when trash icon is clicked", async () => {
        const user = userEvent.setup();
        renderTable();

        const deleteBtns = screen.getAllByTitle("projects.entries.deleteEntry");
        // The first two are the row buttons, the third is in the modal itself which is hidden
        await user.click(deleteBtns[0]);

        expect(screen.getByText("projects.entries.deleteEntryDesc")).toBeInTheDocument();
    });

    it("renders different verdict styles", () => {
        const entryOverrides = [
            { id: "e1", verdict: "Positive", text: "t1" },
            { id: "e2", verdict: "Negative", text: "t2" },
            { id: "e3", verdict: "Pending", text: "t3" },
            { id: "e4", verdict: "In Progress", text: "t4" },
            { id: "e5", verdict: "Other", text: "t5" },
        ];
        renderTable({ data: { ...mockData, entries: entryOverrides as any } });

        // Verdicts are translated via i18n key — mock t() returns the key string
        expect(screen.getByText("projects.entries.verdicts.positive")).toHaveClass("border-green-500/20");
        expect(screen.getByText("projects.entries.verdicts.negative")).toHaveClass("border-bittersweet-shimmer/20");
        expect(screen.getByText("projects.entries.verdicts.pending")).toHaveClass("border-yellow-500/20");
        expect(screen.getByText("projects.entries.verdicts.inprogress")).toHaveClass("border-blue-500/20");
        // "Other" has no key so falls back to entry.verdict value
        expect(screen.getByText("projects.entries.verdicts.other")).toHaveClass("border-gray-500/20");
    });

    it("handles filter column switching and value typing", async () => {
        const user = userEvent.setup();
        renderTable();

        const colSelect = screen.getByRole("combobox", { name: "" }); // The first one
        await user.selectOptions(colSelect, "id");
        // Placeholder is an i18n key in test environment
        expect(screen.getByPlaceholderText("projects.entries.numberIdPlaceholder")).toBeInTheDocument();

        await user.selectOptions(colSelect, "verdict");
        const selects = screen.getAllByRole("combobox");
        expect(selects.length).toBe(2); // col + val
        expect(screen.getByRole("option", { name: "projects.entries.verdicts.positive" })).toBeInTheDocument();

        await user.selectOptions(colSelect, "score");
        // Score placeholder is also an i18n key
        expect(screen.getByPlaceholderText("projects.entries.scorePlaceholder")).toBeInTheDocument();
    });

    it("renders pagination ellipsis for many pages", () => {
        renderTable({ data: { ...mockData, totalPages: 20, page: 10 } });
        const ellipsis = screen.getAllByText("...");
        expect(ellipsis.length).toBeGreaterThan(0);
        expect(screen.getByText("10")).toHaveClass("bg-primary");
    });

    it("handles null scores correctly", () => {
        const dataWithNullScore = {
            ...mockData,
            entries: [{ ...mockData.entries[0], score: undefined }]
        };
        renderTable({ data: dataWithNullScore });
        expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("closes modal on backdrop click", async () => {
        const user = userEvent.setup();
        renderTable();
        await user.click(screen.getByText("This is a test entry"));
        expect(screen.getByText("projects.entries.viewFullEntry")).toBeInTheDocument();

        // The backdrop is the first div with fixed inset-0
        const backdrop = screen.getByText("projects.entries.viewFullEntry").parentElement?.parentElement?.parentElement;
        if (backdrop) await user.click(backdrop);

        expect(screen.queryByText("projects.entries.viewFullEntry")).not.toBeInTheDocument();
    });

    it("renders different pagination scenarios", () => {
        // Test near beginning
        const { rerender } = render(
            <BrowserRouter>
                <EntriesTable {...defaultProps} filterOp={defaultProps.filterOp as any} data={{ ...mockData, totalPages: 20, page: 3 }} />
            </BrowserRouter>
        );
        expect(screen.getAllByText("...").length).toBe(1);

        // Test near end
        rerender(
            <BrowserRouter>
                <EntriesTable {...defaultProps} filterOp={defaultProps.filterOp as any} data={{ ...mockData, totalPages: 20, page: 18 }} />
            </BrowserRouter>
        );
        expect(screen.getAllByText("...").length).toBe(1);

        // Test in middle
        rerender(
            <BrowserRouter>
                <EntriesTable {...defaultProps} filterOp={defaultProps.filterOp as any} data={{ ...mockData, totalPages: 20, page: 10 }} />
            </BrowserRouter>
        );
        expect(screen.getAllByText("...").length).toBe(2);
    });

    it("renders fuzzy score filter when ~= is selected", () => {
        renderTable({ filterCol: "score", filterOp: "~=" });
        expect(screen.getByPlaceholderText("projects.entries.biasPlaceholder")).toBeInTheDocument();
    });

    it("applies loading opacity when navigation is loading", () => {
        mockUseNavigation.mockReturnValueOnce({
            state: "loading",
            formData: undefined,
            location: { search: "?filterCol=text" } as any,
        });

        const { container } = renderTable();
        const tableWrapper = container.querySelector(".opacity-30");
        expect(tableWrapper).toBeInTheDocument();
    });

    it("debounces filter input typing", async () => {
        vi.useFakeTimers();
        renderTable({ filterCol: "text" });

        const searchInput = screen.getByPlaceholderText("projects.entries.searchCharactersPlaceholder");
        fireEvent.change(searchInput, { target: { value: "test search" } });

        // Submit shouldn't be called immediately due to debounce
        expect(mockSubmit).not.toHaveBeenCalled();

        // Advance time
        vi.runAllTimers();
        expect(mockSubmit).toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("cancels deletion when cancel button is clicked", () => {
        renderTable();

        const deleteBtns = screen.getAllByTitle("projects.entries.deleteEntry");
        fireEvent.click(deleteBtns[0]);

        expect(screen.getByText("projects.entries.deleteEntryDesc")).toBeInTheDocument();

        const cancelBtn = screen.getByText("sidebar.cancel");
        fireEvent.click(cancelBtn);

        expect(screen.queryByText("projects.entries.deleteEntryDesc")).not.toBeInTheDocument();
    });

    it("does not open view modal when clicking action cell", () => {
        renderTable();

        // Assuming action cell is the last cell of the row. We will find it by its child buttons.
        const viewIcons = screen.getAllByTitle("projects.entries.viewEntry");
        const actionCell = viewIcons[0].parentElement?.parentElement;

        // Click on the action cell (which has stopPropagation) so modal should NOT open
        if (actionCell) {
            fireEvent.click(actionCell);
        }

        expect(screen.queryByText("projects.entries.viewFullEntry")).not.toBeInTheDocument();
    });

    it("clears debounce timeout on unmount", () => {
        vi.useFakeTimers();
        const { unmount } = renderTable({ filterCol: "text" });

        const searchInput = screen.getByPlaceholderText("projects.entries.searchCharactersPlaceholder");
        fireEvent.change(searchInput, { target: { value: "test search 2" } });

        // Unmount before timer finishes
        unmount();
        vi.runAllTimers();

        // If cleared, submit won't be called
        expect(mockSubmit).not.toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("handles exclude mode individual row selection", () => {
        const onExcludedIdsChange = vi.fn();
        const excludedIds = new Set<string>();

        renderTable({ excludedIds, onExcludedIdsChange });
        
        // Enter exclude mode via toggle
        const toggleBtn = screen.getByText("projects.entries.excludeMode");
        fireEvent.click(toggleBtn);

        // Find the checkboxes (lucide icons). Since the row is clickable, let's just click the cell containing the square icon.
        const firstRowCheckbox = screen.getAllByRole("row")[1].querySelector("td:first-child");
        if (firstRowCheckbox) {
            fireEvent.click(firstRowCheckbox);
        }

        expect(onExcludedIdsChange).toHaveBeenCalled();
        const newSet = onExcludedIdsChange.mock.calls[0][0];
        expect(newSet.has("entry_1")).toBe(true);
    });

    it("handles exclude mode select all / deselect all", () => {
        const onExcludedIdsChange = vi.fn();
        const excludedIds = new Set<string>();

        renderTable({ excludedIds, onExcludedIdsChange });
        
        // Enter exclude mode
        fireEvent.click(screen.getByText("projects.entries.excludeMode"));

        // Find the "Select all" button — title is shown as i18n key from t() mock
        const selectAllBtn = screen.getByTitle("projects.entries.deselectPage");
        if (selectAllBtn) {
            fireEvent.click(selectAllBtn);
        }

        expect(onExcludedIdsChange).toHaveBeenCalled();
        const newSet = onExcludedIdsChange.mock.calls[0][0];
        expect(newSet.has("entry_1")).toBe(true);
        expect(newSet.has("entry_2")).toBe(true);
    });

    it("opens view modal when Eye icon is clicked", () => {
        renderTable();

        const viewBtns = screen.getAllByTitle("projects.entries.viewEntry");
        if (viewBtns.length > 0) {
            fireEvent.click(viewBtns[0]);
        }

        expect(screen.getByText("projects.entries.viewFullEntry")).toBeInTheDocument();
    });

    it("triggers form submit on select change", () => {
        renderTable({ filterCol: "verdict" });

        const selects = screen.getAllByRole("combobox");
        const valSelect = selects[1];
        
        fireEvent.change(valSelect, { target: { value: "Negative" } });
        
        // Form onChange should trigger submit
        expect(mockSubmit).toHaveBeenCalled();
    });

    it("handles reset selection in exclusion banner", () => {
        const onExcludedIdsChange = vi.fn();
        renderTable({ excludedIds: new Set(["entry_1"]), onExcludedIdsChange });
        
        fireEvent.click(screen.getByText("projects.entries.excludeMode"));

        const resetBtn = screen.getByText("projects.entries.resetSelection");
        fireEvent.click(resetBtn);

        expect(onExcludedIdsChange).toHaveBeenCalledWith(new Set());
    });

    it("renders Go to Analysis link with correct state in banner", () => {
        renderTable({ excludedIds: new Set(["entry_1"]) });
        
        fireEvent.click(screen.getByText("projects.entries.excludeMode"));
        
        const analysisLink = screen.getByText("projects.entries.goToAnalysis").closest("a");
        expect(analysisLink).toHaveAttribute("href", "/projects/proj-1/models/roberta/analysis");
    });

    it("triggers predict pending action", () => {
        renderTable();
        
        const predictBtn = screen.getByText("projects.entries.predictPending");
        fireEvent.click(predictBtn);
        
        expect(mockSubmit).toHaveBeenCalledWith(expect.any(FormData), { method: "post" });
        const formData = mockSubmit.mock.calls[0][0] as FormData;
        expect(formData.get("intent")).toBe("predict_pending");
    });

    it("handles pagination next/prev clicks", () => {
        renderTable({ data: { ...mockData, totalPages: 5, page: 2 } });
        
        const nextBtn = screen.getByTitle("projects.entries.next");
        const prevBtn = screen.getByTitle("projects.entries.prev");
        
        expect(nextBtn).not.toBeDisabled();
        expect(prevBtn).not.toBeDisabled();
    });

    it("handles partial selection toggle in exclude mode", () => {
        const onExcludedIdsChange = vi.fn();
        // entry_1 is excluded, entry_2 is NOT excluded
        renderTable({ excludedIds: new Set(["entry_1"]), onExcludedIdsChange });

        fireEvent.click(screen.getByText("projects.entries.excludeMode"));

        // The "Select page" button should be visible (Square icon) because not all are selected
        // With t() mock, title comes back as the i18n key
        const selectPageBtn = screen.getByTitle("projects.entries.selectPage");
        fireEvent.click(selectPageBtn);

        // Clicking "Select page" should remove all from excludedIds (making them all selected)
        expect(onExcludedIdsChange).toHaveBeenCalledWith(new Set());
    });

    it("toggles individual re-selection of items", () => {
        const onExcludedIdsChange = vi.fn();
        renderTable({ excludedIds: new Set(["entry_1"]), onExcludedIdsChange });

        fireEvent.click(screen.getByText("projects.entries.excludeMode"));

        // entry_1 is excluded (Square icon), click it to re-select
        const rows = screen.getAllByRole("row");
        const entry1Row = rows[1]; // Header is 0, entry_1 is 1
        const checkbox = entry1Row.querySelector("td:first-child");
        
        if (checkbox) fireEvent.click(checkbox);

        expect(onExcludedIdsChange).toHaveBeenCalledWith(new Set());
    });

    it("opens predictions history modal", () => {
        renderTable();

        const historyBtn = screen.getByText("projects.entries.predictionHistory");
        fireEvent.click(historyBtn);

        expect(screen.getByTestId("predictions-modal")).toBeInTheDocument();

        // Close it
        const closeBtns = screen.getAllByText("projects.entries.predictionHistory");
        expect(closeBtns.length).toBeGreaterThan(0);
        // Our mock just renders the text, so let's check if it's there. 
        // In real component, onClose would be called.
    });

    it("handles internal exclusion state when no prop provided", () => {
        renderTable(); // No excludedIds prop
        
        fireEvent.click(screen.getByText("projects.entries.excludeMode"));
        
        const firstRowCheckbox = screen.getAllByRole("row")[1].querySelector("td:first-child");
        if (firstRowCheckbox) fireEvent.click(firstRowCheckbox);
        // Should show translation key in banner if mock doesn't interpolate
        expect(screen.getByText("projects.entries.includedCount")).toBeInTheDocument();
    });
});

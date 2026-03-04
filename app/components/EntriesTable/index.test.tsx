import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router";
import EntriesTable from "./index";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
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

    it("renders table headers correctly", () => {
        renderTable();
        expect(screen.getByText("projects.entries.tableId")).toBeInTheDocument();
        expect(screen.getByText("projects.entries.tableText")).toBeInTheDocument();
        expect(screen.getByText("projects.entries.tableVerdict")).toBeInTheDocument();
        expect(screen.getByText("projects.entries.tableScore")).toBeInTheDocument();
    });

    it("renders entries data correctly", () => {
        renderTable();
        expect(screen.getAllByText("1")[0]).toBeInTheDocument(); // entry_1 split
        expect(screen.getByText("This is a test entry")).toBeInTheDocument();
        expect(screen.getByText("Positive")).toBeInTheDocument();
        expect(screen.getByText("95.0%")).toBeInTheDocument();

        expect(screen.getAllByText("2")[0]).toBeInTheDocument(); // entry_2 split
        expect(screen.getByText("Another pending entry")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
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
        expect(screen.getByText("View Full Entry")).toBeInTheDocument();

        // Check elements inside modal (there might be multiple verdicts now, one in table, one in modal)
        const verdicts = screen.getAllByText("Positive");
        expect(verdicts.length).toBeGreaterThan(1);

        // Close modal
        const closeBtn = screen.getAllByRole("button").find(b => b.querySelector('svg.lucide-x'));
        if (closeBtn) await user.click(closeBtn);

        expect(screen.queryByText("View Full Entry")).not.toBeInTheDocument();
    });

    it("opens delete confirmation modal when trash icon is clicked", async () => {
        const user = userEvent.setup();
        renderTable();

        const deleteBtns = screen.getAllByTitle("projects.entries.deleteEntry");
        // The first two are the row buttons, the third is in the modal itself which is hidden
        await user.click(deleteBtns[0]);

        expect(screen.getByText("projects.entries.deleteEntryDesc")).toBeInTheDocument();
    });

    it("predict pending button calls submit", async () => {
        const user = userEvent.setup();
        renderTable();

        const predictBtn = screen.getByRole("button", { name: /Predict Pending/i });
        await user.click(predictBtn);

        expect(mockSubmit).toHaveBeenCalled();
        const calls = mockSubmit.mock.calls;
        expect(calls[0][0].get("intent")).toBe("predict_pending");
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

        expect(screen.getByText("Positive")).toHaveClass("border-green-500/20");
        expect(screen.getByText("Negative")).toHaveClass("border-bittersweet-shimmer/20");
        expect(screen.getByText("Pending")).toHaveClass("border-yellow-500/20");
        expect(screen.getByText("In Progress")).toHaveClass("border-blue-500/20");
        expect(screen.getByText("Other")).toHaveClass("border-gray-500/20");
    });

    it("handles filter column switching and value typing", async () => {
        const user = userEvent.setup();
        renderTable();

        const colSelect = screen.getByRole("combobox", { name: "" }); // The first one
        await user.selectOptions(colSelect, "id");
        expect(screen.getByPlaceholderText("Number ID")).toBeInTheDocument();

        await user.selectOptions(colSelect, "verdict");
        const selects = screen.getAllByRole("combobox");
        expect(selects.length).toBe(2); // col + val
        expect(screen.getByRole("option", { name: "Positive" })).toBeInTheDocument();

        await user.selectOptions(colSelect, "score");
        expect(screen.getByPlaceholderText("0-100")).toBeInTheDocument();
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
        expect(screen.getByText("View Full Entry")).toBeInTheDocument();

        // The backdrop is the first div with fixed inset-0
        const backdrop = screen.getByText("View Full Entry").parentElement?.parentElement?.parentElement;
        if (backdrop) await user.click(backdrop);

        expect(screen.queryByText("View Full Entry")).not.toBeInTheDocument();
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

    it("renders fuzzy score filter when ~= is selected", async () => {
        const user = userEvent.setup();
        renderTable({ filterCol: "score", filterOp: "~=" });
        expect(screen.getByPlaceholderText("Bias")).toBeInTheDocument();
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

        const searchInput = screen.getByPlaceholderText("Search characters");
        fireEvent.change(searchInput, { target: { value: "test search" } });

        // Submit shouldn't be called immediately due to debounce
        expect(mockSubmit).not.toHaveBeenCalled();

        // Advance time
        vi.runAllTimers(); // Or vi.advanceTimersByTime(300);
        expect(mockSubmit).toHaveBeenCalled();

        vi.useRealTimers();
    });

    it("cancels deletion when cancel button is clicked", async () => {
        const user = userEvent.setup();
        renderTable();

        const deleteBtns = screen.getAllByTitle("projects.entries.deleteEntry");
        await user.click(deleteBtns[0]);

        expect(screen.getByText("projects.entries.deleteEntryDesc")).toBeInTheDocument();

        const cancelBtn = screen.getByText("sidebar.cancel");
        await user.click(cancelBtn);

        expect(screen.queryByText("projects.entries.deleteEntryDesc")).not.toBeInTheDocument();
    });

    it("does not open view modal when clicking action cell", async () => {
        const user = userEvent.setup();
        renderTable();

        // Assuming action cell is the last cell of the row. We will find it by its child buttons.
        const viewIcons = screen.getAllByTitle("View full entry");
        const actionCell = viewIcons[0].parentElement?.parentElement;

        if (actionCell) {
            await user.click(actionCell);
        }

        expect(screen.queryByText("View Full Entry")).not.toBeInTheDocument();
    });

    it("clears debounce timeout on unmount", () => {
        vi.useFakeTimers();
        const { unmount } = renderTable({ filterCol: "text" });

        const searchInput = screen.getByPlaceholderText("Search characters");
        fireEvent.change(searchInput, { target: { value: "test search 2" } });

        // Unmount before timer finishes
        unmount();
        vi.runAllTimers();

        // If cleared, submit won't be called
        // Since other tests might have called mockSubmit, we rely on the specific call not happening
        // (Wait, `mockSubmit` was cleared in `beforeEach`, but let's just assert `not.toHaveBeenCalled()`)
        expect(mockSubmit).not.toHaveBeenCalled();

        vi.useRealTimers();
    });
});

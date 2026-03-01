import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router";
import EntriesTable from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockSubmit = vi.fn();
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
        useNavigation: () => ({
            state: "idle",
            formData: undefined,
            location: undefined,
        }),
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
        filterBias: "",
    };

    const renderTable = (props = {}) => {
        return render(
            <BrowserRouter>
                <EntriesTable {...defaultProps} {...props} />
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
});

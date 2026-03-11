import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ExclusionModal } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("~/components/EntriesTable", () => ({
    default: () => <div data-testid="entries-table">Entries Table Mock</div>
}));

describe("ExclusionModal", () => {
    const mockProject = { id: "proj-1", name: "Test Project" };
    const mockData = { entries: [], total: 0, page: 1, limit: 10, totalPages: 1 };

    it("renders when open and handles close", () => {
        const onClose = vi.fn();
        const { rerender } = render(
            <ExclusionModal
                isOpen={false}
                onClose={onClose}
                project={mockProject as any}
                modelId="roberta"
                entriesData={mockData}
                filterCol="id"
                filterVal=""
                filterOp="="
                filterBias={0}
                excludedEntryIds={[]}
                onExcludedIdsChange={vi.fn()}
            />
        );

        expect(screen.queryByText("projects.analysis.exclusions.refineTitle")).not.toBeInTheDocument();

        rerender(
            <ExclusionModal
                isOpen={true}
                onClose={onClose}
                project={mockProject as any}
                modelId="roberta"
                entriesData={mockData}
                filterCol="id"
                filterVal=""
                filterOp="="
                filterBias={0}
                excludedEntryIds={[]}
                onExcludedIdsChange={vi.fn()}
            />
        );

        expect(screen.getByText("projects.analysis.exclusions.refineTitle")).toBeInTheDocument();
        expect(screen.getByTestId("entries-table")).toBeInTheDocument();

        fireEvent.click(screen.getByText("projects.analysis.exclusions.applyAndClose"));
        expect(onClose).toHaveBeenCalled();
    });
});

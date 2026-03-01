import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import SubprojectEntriesPage from "./projects.$id.models.$modelId";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock the EntriesTable since it has its own extensive tests
vi.mock("~/components/EntriesTable", () => ({
    default: ({ project, modelId, filterCol }: any) => (
        <div data-testid="entries-table">
            Mocked Table for {project.name} - {modelId} - Filter: {filterCol}
        </div>
    ),
}));

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useLoaderData: () => ({
            project: { id: "proj-1", name: "Test Project" },
            modelId: "roberta",
            data: { entries: [], total: 0 },
            filterCol: "text",
            filterVal: "test val",
            filterOp: "=",
            filterBias: 0,
        }),
    };
});

describe("SubprojectEntriesPage Route", () => {
    it("renders the EntriesTable with data from loader", () => {
        render(
            <MemoryRouter>
                <SubprojectEntriesPage />
            </MemoryRouter>
        );

        // Assert that the mocked table receives and renders the expected props from useLoaderData
        expect(screen.getByTestId("entries-table")).toBeInTheDocument();
        expect(screen.getByText("Mocked Table for Test Project - roberta - Filter: text")).toBeInTheDocument();
    });
});

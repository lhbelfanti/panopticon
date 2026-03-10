import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import SubprojectEntriesPage from "./projects.$id.models.$modelId._index";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
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
            modelId: "roberta",
            data: { entries: [], total: 0 },
            filterCol: "text",
            filterVal: "test val",
            filterOp: "=",
            filterBias: 0,
        }),
        useOutletContext: () => ({
            project: { id: "proj-1", name: "Test Project" },
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

import { loader, action } from "./projects.$id.models.$modelId._index";
import { getEntries, deleteEntry, predictPendingEntries } from "~/services/api/entries/index.server";
import { getProjectById } from "~/services/api/projects/index.server";

vi.mock("~/services/api/entries/index.server", () => ({
    getEntries: vi.fn(async () => ({ entries: [], total: 0 })),
    deleteEntry: vi.fn(async () => { }),
    predictPendingEntries: vi.fn(async () => 5),
}));

vi.mock("~/services/api/projects/index.server", () => ({
    getProjectById: vi.fn(async (id: number) => {
        if (id === 123) return { id: 123, name: "Test Project" };
        return null;
    }),
}));

describe("SubprojectEntriesPage Route Functions", () => {
    it("loader returns model data", async () => {
        const url = "http://localhost/projects/123/models/m1?filterCol=text&filterVal=foo";
        const result = await loader({ params: { id: "123", modelId: "m1" }, request: new Request(url) } as any);
        expect(result.modelId).toBe("m1");
        expect(result.filterVal).toBe("foo");
    });

    it("action handles predict_pending", async () => {
        const formData = new FormData();
        formData.set("intent", "predict_pending");
        const request = new Request("http://localhost", { method: "POST", body: formData });
        const result = await action({ request, params: { id: "123", modelId: "m1" } } as any);
        expect(result).toEqual({ success: true, count: 5 });
    });

    it("action handles delete_entry", async () => {
        const formData = new FormData();
        formData.set("intent", "delete_entry");
        formData.set("entryId", "e1");
        const request = new Request("http://localhost", { method: "POST", body: formData });
        const result = await action({ request, params: { id: "123", modelId: "m1" } } as any);
        expect(deleteEntry).toHaveBeenCalledWith(123, "m1", "e1");
        expect(result).toBeNull();
    });

    it("action returns null for unknown intent", async () => {
        const formData = new FormData();
        formData.set("intent", "unknown");
        const request = new Request("http://localhost", { method: "POST", body: formData });
        const result = await action({ request, params: { id: "123", modelId: "m1" } } as any);
        expect(result).toBeNull();
    });
});

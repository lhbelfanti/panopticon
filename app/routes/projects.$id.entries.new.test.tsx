import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router";
import NewEntriesPage from "./projects.$id.entries.new";

// Mock i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === "projects.entries.new.subtitle") return `Import data to project "${options?.name}" for analysis.`;
            return key;
        },
    }),
}));

const mockProject = {
    id: 1,
    name: "Test Project",
    description: "Test Description",
    behaviors: ["behavior1"],
    models: ["model1"],
    subprojects: [],
    createdAt: "2024-01-01T00:00:00Z",
};

const mockUseNavigation = vi.fn(() => ({
    state: "idle",
    formData: undefined,
    location: undefined,
}));

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useLoaderData: () => ({ project: mockProject }),
        useNavigation: () => mockUseNavigation(),
        useParams: () => ({ id: "1" }),
        Link: ({ children, to }: any) => <a href={to}>{children}</a>,
    };
});

describe("NewEntriesPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    it("renders correctly with project data", () => {
        render(
            <BrowserRouter>
                <NewEntriesPage />
            </BrowserRouter>
        );

        expect(screen.getByText("projects.entries.new.title")).toBeInTheDocument();
        expect(screen.getByText(/Import data to project "Test Project" for analysis/i)).toBeInTheDocument();
        expect(screen.getByText("projects.entries.new.tabs.single")).toBeInTheDocument();
    });

    it("switches tabs correctly", async () => {
        render(
            <BrowserRouter>
                <NewEntriesPage />
            </BrowserRouter>
        );

        const bulkTabBtn = screen.getByText("projects.entries.new.tabs.bulk");
        fireEvent.click(bulkTabBtn);

        expect(screen.getByText("entries.new.dropzoneTitle")).toBeInTheDocument();
    });

    it("submits manual entry correctly", async () => {
        const spy = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => { });

        render(
            <BrowserRouter>
                <NewEntriesPage />
            </BrowserRouter>
        );

        const textarea = screen.getByLabelText("entries.new.manualEntryLabel");
        fireEvent.change(textarea, { target: { value: "Test manual entry" } });

        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });
        fireEvent.click(submitBtn);

        expect(spy).toHaveBeenCalled();
    });
});

import { loader, action } from "./projects.$id.entries.new";
import { getProjectById } from "~/services/api/projects/index.server";
import { addEntriesToProject } from "~/services/api/entries/index.server";

vi.mock("~/services/api/projects/index.server", () => ({
    getProjectById: vi.fn(),
}));

vi.mock("~/services/api/entries/index.server", () => ({
    addEntriesToProject: vi.fn(),
}));

describe("NewEntriesPage Route Exports", () => {
    it("loader returns project when found", async () => {
        const mockProj = { id: 1, name: "Test", models: ["m1"] };
        (getProjectById as any).mockResolvedValue(mockProj);

        const result = await loader({ params: { id: "1" }, request: {} as any } as any);
        expect(result).toEqual({ project: mockProj });
    });

    it("loader throws 404 when project not found", async () => {
        (getProjectById as any).mockResolvedValue(null);
        await expect(loader({ params: { id: "1" }, request: {} as any } as any)).rejects.toThrow();
    });

    it("action adds entries and redirects", async () => {
        const mockProj = { id: 1, name: "Test", models: ["m1"] };
        (getProjectById as any).mockResolvedValue(mockProj);
        (addEntriesToProject as any).mockResolvedValue(1);

        const formData = new FormData();
        formData.append("texts", JSON.stringify(["hello"]));

        const result = await action({
            params: { id: "1" },
            request: { formData: () => Promise.resolve(formData) } as any
        } as any);

        expect(addEntriesToProject).toHaveBeenCalledWith(1, ["m1"], ["hello"]);

        expect(result).toBeInstanceOf(Response);
        if (result instanceof Response) {
            expect(result.headers.get("Location")).toBe("/projects/1");
        }
    });
});

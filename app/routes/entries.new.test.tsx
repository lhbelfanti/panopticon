import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GlobalEntriesNewPage, { loader, action } from "./entries.new";
import { createMemoryRouter, RouterProvider } from "react-router";

// Mock dependencies
vi.mock("~/services/api/projects/index.server", () => ({
    getProjects: vi.fn().mockResolvedValue([
        {
            id: 1,
            name: "Test Project",
            subprojects: [
                { id: 11, model: "model_a" },
                { id: 12, model: "model_b" },
            ]
        }
    ]),
}));

vi.mock("~/services/api/entries/mocks/platforms", () => ({
    getSupportedPlatforms: vi.fn().mockResolvedValue([
        { id: "twitter", name: "Twitter" }
    ])
}));

vi.mock("~/services/api/entries/index.server", () => ({
    addEntriesToProject: vi.fn().mockResolvedValue(1),
}));

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const renderWithRouter = (ui: React.ReactElement, loaderData: any, initialEntries = ["/entries/new"]) => {
    const routes = [
        {
            path: "/entries/new",
            element: ui,
            loader: () => loaderData,
        }
    ];

    const router = createMemoryRouter(routes, {
        initialEntries: initialEntries,
    });

    return render(<RouterProvider router={router} />);
};

describe("GlobalEntriesNewPage", () => {
    const mockLoaderData = {
        projects: [
            {
                id: 1,
                name: "Test Project",
                subprojects: [
                    { id: 11, model: "model_a" },
                    { id: 12, model: "model_b" },
                ]
            }
        ],
        platforms: [{ id: "twitter", name: "Twitter" }]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the initial view correctly", async () => {
        const { container } = renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);

        expect(await screen.findByText("projects.entries.new.title")).toBeInTheDocument();
        expect(screen.getByText("projects.entries.new.targetConfiguration.title")).toBeInTheDocument();
        expect(screen.getByLabelText("projects.entries.new.targetConfiguration.targetProject")).toBeInTheDocument();
    });

    it("populates subprojects when a project is selected", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);

        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        fireEvent.change(projectSelect, { target: { value: "1" } });

        await waitFor(() => {
            expect(screen.getByText("projects.entries.new.targetConfiguration.targetSubprojects")).toBeInTheDocument();
            expect(screen.getByText("projects.models.model_a")).toBeInTheDocument();
            expect(screen.getByText("projects.models.model_b")).toBeInTheDocument();
        });
    });

    it("action handles submission correctly", async () => {
        const formData = new FormData();
        formData.append("projectId", "1");
        formData.append("subprojectIds", JSON.stringify(["model_a"]));
        formData.append("entriesData", JSON.stringify([{ text: "hello", metadata: { isReply: false } }]));
        formData.append("socialMediaType", "twitter");

        const request = new Request("http://localhost/entries/new", {
            method: "POST",
            body: formData,
        });

        const response = (await action({ request, params: {}, context: {} } as any)) as Response;

        expect(response.status).toBe(302);
        // @ts-ignore
        expect(response.headers.get("Location")).toBe("/projects/1");

        const { addEntriesToProject } = await import("~/services/api/entries/index.server");
        expect(addEntriesToProject).toHaveBeenCalledWith(1, ["model_a"], [{ text: "hello", metadata: { isReply: false } }], "twitter");
    });

    it("action handles missing required fields", async () => {
        const formData = new FormData();
        const request = new Request("http://localhost/entries/new", {
            method: "POST",
            body: formData,
        });

        const response = await action({ request, params: {}, context: {} } as any);
        const status = (response as any).status || (response as any).init?.status;
        expect(status).toBe(400);
    });

    it("action handles uploadAnother correctly", async () => {
        const formData = new FormData();
        formData.append("projectId", "1");
        formData.append("subprojectIds", JSON.stringify(["model_a"]));
        formData.append("entriesData", JSON.stringify([{ text: "hello", metadata: { isReply: false } }]));
        formData.append("socialMediaType", "twitter");
        formData.append("uploadAnother", "true");

        const request = new Request("http://localhost/entries/new", {
            method: "POST",
            body: formData,
        });

        const response = await action({ request, params: {}, context: {} } as any);
        expect((response as any).data).toEqual({ success: true, count: 1 });
    });

    it("can change social media platform", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        const platformSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.mediaType");
        fireEvent.change(platformSelect, { target: { value: "twitter" } });
        expect((platformSelect as HTMLSelectElement).value).toBe("twitter");
    });

    it("can toggle subprojects", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);

        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        fireEvent.change(projectSelect, { target: { value: "1" } });

        const subObj = await screen.findByText("projects.models.model_a");
        fireEvent.click(subObj);

        // Re-clicking toggles it back
        fireEvent.click(subObj);
    });

    it("can switch tabs", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        const singleTab = await screen.findByText("projects.entries.new.tabs.single");
        const bulkTab = screen.getByText("projects.entries.new.tabs.bulk");

        fireEvent.click(bulkTab);
        fireEvent.click(singleTab);
    });

    it("can submit manual entry", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        fireEvent.change(projectSelect, { target: { value: "1" } });

        const textarea = screen.getByPlaceholderText("projects.entries.new.interactiveForm.placeholder");
        fireEvent.change(textarea, { target: { value: "New manual entry" } });

        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });
        fireEvent.click(submitBtn);
    });

    it("can submit bulk upload", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        fireEvent.change(projectSelect, { target: { value: "1" } });

        const bulkTab = screen.getByText("projects.entries.new.tabs.bulk");
        fireEvent.click(bulkTab);

        const input = screen.getByLabelText("csv-upload-input") as HTMLInputElement;
        const csvContent = "text\nhello";
        const file = new File([csvContent], "test.csv", { type: "text/csv" });
        fireEvent.change(input, { target: { files: [file] } });

        const confirmBtn = await screen.findByRole("button", { name: "projects.entries.new.confirmUpload" });
        fireEvent.click(confirmBtn);
    });

    it("pre-selects project and subprojects from query params", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData, ["/entries/new?projectId=1"]);

        // Wait for state updates
        await waitFor(() => {
            const projectSelect = screen.getByLabelText("projects.entries.new.targetConfiguration.targetProject") as HTMLSelectElement;
            expect(projectSelect.value).toBe("1");
        });

        await waitFor(() => {
            expect(screen.getByText("projects.models.model_a")).toBeInTheDocument();
            expect(screen.getByText("projects.models.model_b")).toBeInTheDocument();
        });
    });

    it("unselects project when handleProjectChange receives empty value", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);

        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        fireEvent.change(projectSelect, { target: { value: "1" } });

        await waitFor(() => expect(screen.getByText("projects.models.model_a")).toBeInTheDocument());

        fireEvent.change(projectSelect, { target: { value: "" } });

        await waitFor(() => expect(screen.queryByText("projects.models.model_a")).not.toBeInTheDocument());
    });




});

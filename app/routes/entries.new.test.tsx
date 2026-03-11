import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

vi.mock("~/services/api/config.server", () => ({
    getAppConfig: vi.fn().mockResolvedValue({ platforms: [{ id: "twitter", name: "Twitter" }] }),
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

    it("loader fetches and returns projects and platforms", async () => {
        const { getAppConfig } = await import("~/services/api/config.server");
        const { getProjects } = await import("~/services/api/projects/index.server");
        
        vi.mocked(getProjects).mockResolvedValueOnce([{ id: 1, name: "Proj" }] as any);
        vi.mocked(getAppConfig).mockResolvedValueOnce({ platforms: [{ id: "fb", name: "FB" }] } as any);

        const result = await loader();
        expect(result).toEqual({
            projects: [{ id: 1, name: "Proj" }],
            platforms: [{ id: "fb", name: "FB" }]
        });
    });

    it("action handles API failure", async () => {
        const { addEntriesToProject } = await import("~/services/api/entries/index.server");
        vi.mocked(addEntriesToProject).mockRejectedValueOnce(new Error("API Fail"));

        const formData = new FormData();
        formData.append("projectId", "1");
        formData.append("subprojectIds", JSON.stringify(["m1"]));
        formData.append("entriesData", JSON.stringify([{ text: "t" }]));

        const request = new Request("http://localhost/entries/new", { method: "POST", body: formData });
        
        await expect(action({ request, params: {}, context: {} } as any)).rejects.toThrow("API Fail");
    });

    it("shows alert if submitting without project or subprojects", async () => {
        if (!window.alert) window.alert = vi.fn();
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        
        // Single entry tab - manual submit
        const textarea = await screen.findByPlaceholderText("projects.entries.new.interactiveForm.placeholder");
        fireEvent.change(textarea, { target: { value: "test" } });
        
        const submitBtn = screen.getByRole("button", { name: "entries.new.submit" });
        fireEvent.click(submitBtn);
        
        expect(alertSpy).toHaveBeenCalledWith("Please select a project and at least one subproject.");

        // Bulk tab
        const bulkTab = screen.getByText("projects.entries.new.tabs.bulk");
        fireEvent.click(bulkTab);
        
        // Manual call to handleBulkUpload since we can't easily trigger it via UI without project selection
        // Actually we can just test the function directly if it was exported, but it's internal.
        // We can mock BulkUpload to call onUpload.
    });

    it("handles invalid projectId in query params", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData, ["/entries/new?projectId=abc"]);
        // Use findBy to wait for router
        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject") as HTMLSelectElement;
        expect(projectSelect.value).toBe("");
    });

    it("automatically selects all subprojects when a project is chosen", async () => {
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        fireEvent.change(projectSelect, { target: { value: "1" } });
        
        await waitFor(() => {
            const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
            // Filter checkboxes that are for subprojects (usually have values like "model_a")
            const subprojectCheckboxes = checkboxes.filter(c => ["model_a", "model_b"].includes(c.value));
            expect(subprojectCheckboxes.every(c => c.checked)).toBe(true);
        });
    });

    it("shows alert if submitting bulk without subprojects", async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        
        // Select project first
        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        await user.selectOptions(projectSelect, "1");

        // Switch to bulk tab first
        const bulkTab = await screen.findByText("projects.entries.new.tabs.bulk");
        await user.click(bulkTab);

        // Unselect all subprojects
        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        for (const cb of checkboxes) {
            if (cb.checked) await user.click(cb);
        }

        // Mock a file upload to make the button appear
        const file = new File(["text\nsample entry"], "test.csv", { type: "text/csv" });
        const input = screen.getByLabelText("csv-upload-input");
        await user.upload(input, file);

        const uploadBtn = await screen.findByText("projects.entries.new.confirmUpload");
        fireEvent.click(uploadBtn);
        
        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith("Please select a project and at least one subproject.");
        });
    });

    it("action handles uploadAnother correctly and returns data", async () => {
        const { addEntriesToProject } = await import("~/services/api/entries/index.server");
        vi.mocked(addEntriesToProject).mockResolvedValueOnce({} as any);

        const formData = new FormData();
        formData.append("projectId", "1");
        formData.append("subprojectIds", JSON.stringify(["m1"]));
        formData.append("entriesData", JSON.stringify([{ text: "t" }]));
        formData.append("uploadAnother", "true");

        const request = new Request("http://localhost/entries/new", { method: "POST", body: formData });
        
        const response = await action({ request, params: {}, context: {} } as any);
        // In RRv7 data() might return an object with 'data' or just the data depending on the test env
        const responseData = (response as any).data || response;
        expect(responseData).toEqual({ success: true, count: 1 });
    });

    it("automatically selects all subprojects when a project is chosen", async () => {
        const user = userEvent.setup();
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        await user.selectOptions(projectSelect, "1");
        
        await waitFor(() => {
            const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
            const subprojectCheckboxes = checkboxes.filter(c => ["model_a", "model_b"].includes(c.value));
            expect(subprojectCheckboxes.every(c => c.checked)).toBe(true);
        });
    });

    it("clears selection when project is changed to empty", async () => {
        const user = userEvent.setup();
        renderWithRouter(<GlobalEntriesNewPage />, mockLoaderData);
        const projectSelect = await screen.findByLabelText("projects.entries.new.targetConfiguration.targetProject");
        await user.selectOptions(projectSelect, "1");
        await screen.findByTitle("projects.models.model_a");
        
        fireEvent.change(projectSelect, { target: { value: "" } });
        await waitFor(() => {
            expect(screen.queryByTitle("projects.models.model_a")).not.toBeInTheDocument();
        }, { timeout: 3000 });
    });
});

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

const renderWithRouter = (ui: React.ReactElement, loaderData: any) => {
    const routes = [
        {
            path: "/entries/new",
            element: ui,
            loader: () => loaderData,
        }
    ];

    const router = createMemoryRouter(routes, {
        initialEntries: ["/entries/new"],
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
});

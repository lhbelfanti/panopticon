import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import ProjectSettingsPage from "./projects.$id.settings";
import * as projectsServer from "~/services/api/projects/index.server";

// Mocks
vi.mock("~/services/api/projects/index.server", () => ({
    getProjectById: vi.fn(),
    getBehaviorsConfig: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
    Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useLoaderData: () => ({}),
        useRouteLoaderData: (id: string) => {
            if (id === "root") return {
                behaviorConfigs: [
                    { id: "hate_speech", enabled: true, availableModels: ["bert_spanish"], iconName: "Shield", color: "orange" },
                    { id: "toxicity", enabled: true, availableModels: ["bert_spanish"], iconName: "AlertTriangle", color: "purple" },
                ]
            };
            return null;
        },
        useOutletContext: () => ({
            project: {
                id: 1,
                name: "Test Project",
                description: "Test Description",
                behaviors: ["hate_speech"],
                models: ["bert_spanish"],
                subprojects: [],
                createdAt: new Date().toISOString(),
            },
        }),
        useActionData: () => undefined,
        useNavigation: () => ({
            state: "idle",
            formData: { get: (key: string) => undefined },
        }),
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    };
});

// Mock ConfirmationModal since it uses portals/base components
vi.mock("~/components/ConfirmationModal", () => ({
    default: ({ isOpen, title, confirmText }: any) =>
        isOpen ? <div data-testid="modal">
            <h2>{title}</h2>
            <button>{confirmText}</button>
        </div> : null
}));

describe("ProjectSettingsPage", () => {
    beforeEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it("renders the settings page with the edit form", async () => {
        render(
            <MemoryRouter initialEntries={["/projects/1/settings"]}>
                <ProjectSettingsPage />
            </MemoryRouter>
        );

        expect(screen.getByText("projects.settings.title")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test Project")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Test Description")).toBeInTheDocument();

        // Initially selected behaviors should be disabled
        const behaviorCheckbox = screen.getByDisplayValue("hate_speech");
        expect(behaviorCheckbox).toBeDisabled();

        // New behaviors should be enabled
        const newBehaviorCheckbox = screen.getByDisplayValue("toxicity");
        expect(newBehaviorCheckbox).not.toBeDisabled();
    });

    it("shows the danger zone and delete button", async () => {
        render(
            <MemoryRouter initialEntries={["/projects/1/settings"]}>
                <ProjectSettingsPage />
            </MemoryRouter>
        );

        expect(screen.getByText("projects.settings.dangerZoneTitle")).toBeInTheDocument();
        expect(screen.getByText("projects.settings.deleteButton")).toBeInTheDocument();
    });

    it("action handles validation error", async () => {
        const { action } = await import("./projects.$id.settings");
        const formData = new FormData();
        formData.set("intent", "update_project");
        formData.set("name", ""); // Missing name

        const result = await action({ request: new Request("http://localhost", { method: "POST", body: formData }), params: { id: "1" } } as any);
        expect(result).toEqual({ error: "Name is required" });
    });

    it("action handles update failure", async () => {
        const { action } = await import("./projects.$id.settings");
        const updateProjectSpy = vi.spyOn(projectsServer, "updateProject").mockRejectedValueOnce(new Error("API Error"));

        const formData = new FormData();
        formData.set("intent", "update_project");
        formData.set("name", "Valid Name");

        const result = await action({ request: new Request("http://localhost", { method: "POST", body: formData }), params: { id: "1" } } as any);
        expect(result).toEqual({ error: "Failed to update project" });

        updateProjectSpy.mockRestore();
    });

    it("action handles delete_project intent", async () => {
        const { action } = await import("./projects.$id.settings");
        const formData = new FormData();
        formData.set("intent", "delete_project");

        const result = await action({ request: new Request("http://localhost", { method: "POST", body: formData }), params: { id: "1" } } as any) as Response;
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/");
    });

    it("action throws 404 if id is missing", async () => {
        const { action } = await import("./projects.$id.settings");
        const formData = new FormData();
        await expect(action({ request: new Request("http://localhost", { method: "POST", body: formData }), params: {} } as any)).rejects.toThrow();
    });

    it("action returns null for unknown intent", async () => {
        const { action } = await import("./projects.$id.settings");
        const formData = new FormData();
        formData.set("intent", "unknown_intent");
        const result = await action({ request: new Request("http://localhost", { method: "POST", body: formData }), params: { id: "1" } } as any);
        expect(result).toBeNull();
    });

    it("loader returns empty object after consolidation", async () => {
        const { loader } = await import("./projects.$id.settings");
        const result = await loader({ params: { id: "1" }, request: new Request("http://localhost") } as any);
        expect(result).toEqual({});
    });

    it("loader throws 404 if id is missing", async () => {
        const { loader } = await import("./projects.$id.settings");
        await expect(loader({ params: {}, request: new Request("http://localhost") } as any)).rejects.toThrow();
    });

    it("opens the delete confirmation modal when danger zone button is clicked", async () => {
        const userEvent = (await import("@testing-library/user-event")).default;
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/projects/1/settings"]}>
                <ProjectSettingsPage />
            </MemoryRouter>
        );

        const deleteBtn = screen.getByText("projects.settings.deleteButton");
        await user.click(deleteBtn);

        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByText("projects.view.deleteProject")).toBeInTheDocument();
    });
});

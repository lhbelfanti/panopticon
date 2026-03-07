import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import ProjectSettingsPage from "./projects.$id.settings";

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
        useLoaderData: () => ({
            project: {
                id: 1,
                name: "Test Project",
                description: "Test Description",
                behaviors: ["hate_speech"],
                models: ["bert_spanish"],
                subprojects: [],
                createdAt: new Date().toISOString(),
            },
            behaviorConfigs: [
                { id: "hate_speech", enabled: true, availableModels: ["bert_spanish"], iconName: "Shield", colorClass: "", bgClass: "" },
                { id: "toxicity", enabled: true, availableModels: ["bert_spanish"], iconName: "AlertTriangle", colorClass: "", bgClass: "" },
            ]
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
        const projectsServer = await import("~/services/api/projects/index.server");
        const updateProjectSpy = vi.spyOn(projectsServer, "updateProject").mockRejectedValueOnce(new Error("API Error"));

        const formData = new FormData();
        formData.set("intent", "update_project");
        formData.set("name", "Valid Name");

        const result = await action({ request: new Request("http://localhost", { method: "POST", body: formData }), params: { id: "1" } } as any);
        expect(result).toEqual({ error: "Failed to update project" });

        updateProjectSpy.mockRestore();
    });
});

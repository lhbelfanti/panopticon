import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter, MemoryRouter } from "react-router";
import ProjectViewPage from "./projects.$id._index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options ? `${key} ${JSON.stringify(options)}` : key,
    }),
    Trans: ({ i18nKey }: any) => <span>{i18nKey}</span>,
}));

// Mock child to isolate route logic
vi.mock("~/components/SubprojectCard", () => ({
    default: ({ subproject }: any) => <div data-testid={`subproject-${subproject.model}`} />,
}));

const mockSubmit = vi.fn();
vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useLoaderData: () => ({
            project: {
                id: "proj-123",
                name: "Test Project",
                description: "A test description",
                behaviors: ["spam", "toxicity"],
                subprojects: [
                    { id: "sub-1", model: "roberta" },
                    { id: "sub-2", model: "llama3_zero_shot" },
                ],
            },
            behaviorConfigs: [
                {
                    id: "spam",
                    name: "Spam",
                    iconName: "FileText",
                    bgClass: "bg-red-500",
                    colorClass: "text-red-500",
                },
                {
                    id: "toxicity",
                    name: "Toxicity",
                    iconName: "Shield",
                    bgClass: "bg-blue-500",
                    colorClass: "text-blue-500",
                }
            ]
        }),
        useNavigation: () => ({
            state: "idle",
            formData: undefined,
        }),
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
        useSubmit: () => vi.fn(),
    };
});

describe("ProjectViewPage Route", () => {
    const renderPage = () => {
        return render(
            <MemoryRouter>
                <ProjectViewPage />
            </MemoryRouter>
        );
    };

    it("renders project details and headers", () => {
        renderPage();

        expect(screen.getByText("Test Project")).toBeInTheDocument();
        expect(screen.getByText("A test description")).toBeInTheDocument();
        expect(screen.getByText("proj-123")).toBeInTheDocument();

        expect(screen.getByText("projects.behaviors.spam")).toBeInTheDocument();
        expect(screen.getByText("projects.behaviors.toxicity")).toBeInTheDocument();
    });

    it("renders subprojects via mocked SubprojectCard", () => {
        renderPage();

        expect(screen.getByTestId("subproject-roberta")).toBeInTheDocument();
        expect(screen.getByTestId("subproject-llama3_zero_shot")).toBeInTheDocument();
        expect(screen.getByText("projects.view.subprojectsTitle")).toBeInTheDocument();
    });

    it("opens delete project modal", async () => {
        const user = userEvent.setup();
        renderPage();

        const deleteBtn = screen.getByTitle("projects.view.deleteProject");
        await user.click(deleteBtn);

        expect(screen.getByText('projects.view.deleteProjectDesc {"name":"Test Project"}')).toBeInTheDocument();
    });
});

import { loader, action } from "./projects.$id._index";
import { getProjectById, getBehaviorsConfig, deleteProject } from "~/services/api/projects/index.server";

// Mock the server-side services
vi.mock("~/services/api/projects/index.server", () => ({
    getProjectById: vi.fn(async (id: number) => {
        if (id === 123) {
            return { id: 123, name: "Test Project", description: "Desc", behaviors: [], subprojects: [] };
        }
        return null;
    }),
    getBehaviorsConfig: vi.fn(async () => []),
    deleteProject: vi.fn(async () => { }),
}));

describe("ProjectViewPage Route Functions", () => {
    it("loader returns project data for valid ID", async () => {
        const result = await loader({ params: { id: "123" }, request: new Request("http://localhost") } as any);
        expect(result).toHaveProperty("project");
        expect(result.project.id).toBe(123);
    });

    it("loader throws 404 for invalid ID", async () => {
        await expect(loader({ params: { id: "999" }, request: new Request("http://localhost") } as any))
            .rejects.toThrow();
    });

    it("action handles delete_project intent", async () => {
        const formData = new FormData();
        formData.set("intent", "delete_project");
        const request = new Request("http://localhost", { method: "POST", body: formData });

        const result = await action({ request, params: { id: "123" } } as any) as Response;
        expect(deleteProject).toHaveBeenCalledWith(123);
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/");
    });
});

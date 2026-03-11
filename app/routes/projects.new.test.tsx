import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import NewProjectPage from "./projects.new";

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
        useActionData: () => undefined,
        useLoaderData: () => ({ behaviorConfigs: [] }),
        useNavigation: () => ({
            state: "idle",
            formData: undefined,
            location: undefined,
        }),
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
        useSubmit: () => vi.fn(),
    };
});

describe("NewProjectPage Route", () => {
    const renderPage = (loaderData = { behaviorConfigs: [] }) => {
        const routes = [
            {
                id: "root",
                path: "/",
                loader: () => loaderData,
                children: [
                    {
                        path: "projects/new",
                        element: <NewProjectPage />,
                    },
                ],
            },
        ];

        const router = createMemoryRouter(routes, {
            initialEntries: ["/projects/new"],
        });

        return render(<RouterProvider router={router} />);
    };

    it("renders the new project page layout with the form", async () => {
        renderPage();
        expect(await screen.findByText("projects.new.title")).toBeInTheDocument();

        // Elements from NewProjectForm
        expect(await screen.findByText("projects.new.name")).toBeInTheDocument();
        expect(await screen.findByText("projects.new.description")).toBeInTheDocument();
    });
});

import { loader, action } from "./projects.new";

describe("NewProjectPage Route Functions", () => {
    it("action validates at least one behavior and model", async () => {
        const formData = new FormData();
        formData.set("name", "Test Project");
        // No behaviors or models added
        const request = new Request("http://localhost/projects/new", {
            method: "POST",
            body: formData,
        });

        let result = await action({ request }) as any;
        expect(result.error).toBe("At least one target behavior must be selected");

        formData.append("behaviors", "Hate Speech");
        const request2 = new Request("http://localhost/projects/new", {
            method: "POST",
            body: formData,
        });
        result = await action({ request: request2 }) as any;
        expect(result.error).toBe("At least one ML model must be selected");
    });

    it("action handles API failure", async () => {
        const formData = new FormData();
        formData.set("name", "error_trigger");
        formData.append("behaviors", "Hate Speech");
        formData.append("models", "roberta");
        const request = new Request("http://localhost/projects/new", {
            method: "POST",
            body: formData,
        });

        const projectsServer = await import("~/services/api/projects/index.server");
        const createProjectSpy = vi.spyOn(projectsServer, "createProject").mockRejectedValueOnce(new Error("API Error"));

        const result = await action({ request });
        expect(result).toEqual({ error: "Failed to create project" });
        createProjectSpy.mockRestore();
    });

    it("action validates all required fields", async () => {
        const formData = new FormData();
        // 1. Missing name
        let request = new Request("http://localhost/projects/new", { method: "POST", body: formData });
        let result = await action({ request }) as any;
        expect(result.error).toBe("Name is required");

        // 2. Missing behaviors
        formData.set("name", "Test");
        request = new Request("http://localhost/projects/new", { method: "POST", body: formData });
        result = await action({ request }) as any;
        expect(result.error).toBe("At least one target behavior must be selected");

        // 3. Missing models
        formData.append("behaviors", "Hate Speech");
        request = new Request("http://localhost/projects/new", { method: "POST", body: formData });
        result = await action({ request }) as any;
        expect(result.error).toBe("At least one ML model must be selected");
    });

    it("action redirects on success", async () => {
        const formData = new FormData();
        formData.set("name", "New Project");
        formData.append("behaviors", "Hate Speech");
        formData.append("models", "roberta");
        const request = new Request("http://localhost/projects/new", {
            method: "POST",
            body: formData,
        });

        const projectsServer = await import("~/services/api/projects/index.server");
        const createProjectSpy = vi.spyOn(projectsServer, "createProject").mockResolvedValueOnce({
            id: 123,
            name: "New Project",
            description: "",
            behaviors: ["Hate Speech"],
            subprojects: [],
        } as any);

        const result = await action({ request }) as Response;
        expect(result.status).toBe(302);
        expect(result.headers.get("Location")).toBe("/projects/123");
        createProjectSpy.mockRestore();
    });

    it("loader returns an empty object (data is in root)", async () => {
        const result = await loader({ request: new Request("http://localhost/projects/new"), params: {} } as any);
        expect(result).toEqual({});
    });
});

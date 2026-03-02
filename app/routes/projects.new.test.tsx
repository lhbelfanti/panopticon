import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
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
    const renderPage = () => {
        return render(
            <BrowserRouter>
                <NewProjectPage />
            </BrowserRouter>
        );
    };

    it("renders the new project page layout with the form", () => {
        renderPage();
        expect(screen.getByText("projects.new.title")).toBeInTheDocument();

        // Elements from NewProjectForm
        expect(screen.getByText("projects.new.name")).toBeInTheDocument();
        expect(screen.getByText("projects.new.description")).toBeInTheDocument();
    });
});

import { loader, action } from "./projects.new";

describe("NewProjectPage Route Functions", () => {
    it("loader returns behavior configs", async () => {
        const result = await loader({ request: new Request("http://localhost/projects/new"), params: {} } as any);
        expect(result).toHaveProperty("behaviorConfigs");
    });

    it("action validates required fields", async () => {
        const formData = new FormData();
        const request = new Request("http://localhost/projects/new", {
            method: "POST",
            body: formData,
        });

        const result = await action({ request });
        expect(result).toEqual({ error: "Name is required" });
    });
});

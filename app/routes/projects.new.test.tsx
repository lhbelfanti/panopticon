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

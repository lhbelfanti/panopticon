import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { SubprojectHeader } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("SubprojectHeader", () => {
    const mockProject = {
        id: "proj-1",
        name: "Test Project",
    };

    it("renders project and model crumbs and description", () => {
        render(
            <BrowserRouter>
                <SubprojectHeader project={mockProject as any} modelId="roberta" description="Sub Description" />
            </BrowserRouter>
        );

        expect(screen.getByText("Test Project")).toBeInTheDocument();
        expect(screen.getByText("projects.models.roberta")).toBeInTheDocument();
        expect(screen.getByText("Sub Description")).toBeInTheDocument();
    });
});

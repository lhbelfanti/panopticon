import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { AnalysisHeader } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("AnalysisHeader", () => {
    const mockProject = {
        id: 1,
        name: "Test Project",
    };

    it("renders breadcrumbs and project name correctly", () => {
        render(
            <BrowserRouter>
                <AnalysisHeader 
                    project={mockProject as any} 
                    modelId="roberta" 
                    title="Analysis Title" 
                    backText="Back Text"
                />
            </BrowserRouter>
        );

        expect(screen.getByText("Test Project")).toBeInTheDocument();
        expect(screen.getByText("projects.models.roberta")).toBeInTheDocument();
        expect(screen.getByText("Back Text")).toBeInTheDocument();
    });
});

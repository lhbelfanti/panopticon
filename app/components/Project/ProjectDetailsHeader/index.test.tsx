import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { ProjectDetailsHeader } from "./index";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("ProjectDetailsHeader", () => {
    const mockProject = {
        id: 1,
        name: "Test Project",
        description: "Test Description",
        behaviors: ["toxic", "hate"],
    };

    it("renders project details correctly", () => {
        const mockConfigs = [
            { id: "toxic", color: "red", iconName: "AlertCircle" },
            { id: "hate", color: "orange", iconName: "Shield" },
        ];
        render(
            <BrowserRouter>
                <ProjectDetailsHeader 
                    project={mockProject as any} 
                    behaviorConfigs={mockConfigs as any} 
                />
            </BrowserRouter>
        );

        expect(screen.getByText("Test Project")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("projects.behaviors.toxic")).toBeInTheDocument();
        expect(screen.getByText("projects.behaviors.hate")).toBeInTheDocument();
    });
});

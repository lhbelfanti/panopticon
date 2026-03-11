import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { SubprojectsSection } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("SubprojectsSection", () => {
    const mockProject = {
        id: 1,
        subprojects: [
            { id: 101, model: "roberta" },
            { id: 102, model: "llama" },
        ],
    };

    it("renders subprojects correctly", () => {
        render(
            <BrowserRouter>
                <SubprojectsSection project={mockProject as any} />
            </BrowserRouter>
        );

        expect(screen.getByText("projects.view.subprojectsTitle")).toBeInTheDocument();
        expect(screen.getByText("projects.models.roberta")).toBeInTheDocument();
        expect(screen.getByText("projects.models.llama")).toBeInTheDocument();
    });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import SubprojectCard from "./index";

// Mock react-i18next
vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockSubproject = {
    model: "roberta_english",
    totalEntries: 1450,
    entriesByVerdict: {
        Positive: 800,
        Negative: 500,
        Pending: 100,
        "In Progress": 50,
    }
};

const renderSubprojectCard = (subproject: any, projectId: number) => {
    return render(
        <BrowserRouter>
            <SubprojectCard subproject={subproject} projectId={projectId} />
        </BrowserRouter>
    );
};

describe("SubprojectCard", () => {
    it("renders the subproject model name", () => {
        renderSubprojectCard(mockSubproject, 123);

        // According to testing conventions, query by role or text
        expect(
            screen.getByRole("heading", { level: 3, name: "projects.models.roberta_english" })
        ).toBeInTheDocument();
    });

    it("links to the correct URLs", () => {
        renderSubprojectCard(mockSubproject, 123);

        const links = screen.getAllByRole("link");
        expect(links.some(l => l.getAttribute("href") === "/projects/123/models/roberta_english")).toBe(true);
        expect(links.some(l => l.getAttribute("href") === "/projects/123/models/roberta_english/analysis")).toBe(true);
    });

    it("renders the open subproject text", () => {
        renderSubprojectCard(mockSubproject, 123);
        expect(screen.getByText("projects.view.openSubproject")).toBeInTheDocument();
    });
});

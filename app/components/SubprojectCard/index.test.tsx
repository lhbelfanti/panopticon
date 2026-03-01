import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import SubprojectCard from "./index";

// Mock react-i18next
vi.mock("react-i18next", () => ({
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

const renderSubprojectCard = (subproject: any, projectId: string) => {
    return render(
        <BrowserRouter>
            <SubprojectCard subproject={subproject} projectId={projectId} />
        </BrowserRouter>
    );
};

describe("SubprojectCard", () => {
    it("renders the subproject model name", () => {
        renderSubprojectCard(mockSubproject, "123");

        // According to testing conventions, query by role or text
        expect(
            screen.getByRole("heading", { level: 3, name: "projects.models.roberta_english" })
        ).toBeInTheDocument();
    });

    it("links to the correct URL", () => {
        renderSubprojectCard(mockSubproject, "123");

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/projects/123/models/roberta_english");
    });

    it("renders the open subproject text", () => {
        renderSubprojectCard(mockSubproject, "123");
        expect(screen.getByText("projects.view.openSubproject")).toBeInTheDocument();
    });
});

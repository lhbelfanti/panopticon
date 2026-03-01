import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { QuickActions } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("QuickActions", () => {
    const renderQuickActions = () => {
        return render(
            <BrowserRouter>
                <QuickActions />
            </BrowserRouter>
        );
    };

    it("renders both quick action cards", () => {
        renderQuickActions();

        // Check titles via translation keys
        expect(screen.getByText("dashboard.newProject.title")).toBeInTheDocument();
        expect(screen.getByText("dashboard.newEntry.title")).toBeInTheDocument();

        // Check descriptions
        expect(screen.getByText("dashboard.newProject.desc")).toBeInTheDocument();
        expect(screen.getByText("dashboard.newEntry.desc")).toBeInTheDocument();

        // Check actions
        expect(screen.getByText("dashboard.newProject.action")).toBeInTheDocument();
        expect(screen.getByText("dashboard.newEntry.action")).toBeInTheDocument();
    });

    it("has correct links for the actions", () => {
        renderQuickActions();

        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(2);

        // Assuming order is fixed as in component
        expect(links[0]).toHaveAttribute("href", "/projects/new");
        expect(links[1]).toHaveAttribute("href", "/entries/new");
    });
});

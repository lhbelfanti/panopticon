import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router";
import { Breadcrumb } from "./index";
import { Home, Folder } from "lucide-react";

describe("Breadcrumb Component", () => {
    const renderBreadcrumb = (items: any) => {
        return render(
            <MemoryRouter>
                <Breadcrumb items={items} />
            </MemoryRouter>
        );
    };

    it("renders breadcrumb items correctly", () => {
        const items = [
            { label: "Home", to: "/", icon: <Home size={16} /> },
            { label: "Project", to: "/project", icon: <Folder size={16} /> },
            { label: "Current" }
        ];

        renderBreadcrumb(items);

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Project")).toBeInTheDocument();
        expect(screen.getByText("Current")).toBeInTheDocument();
    });

    it("highlights the last item in yellow", () => {
        const items = [
            { label: "Home", to: "/" },
            { label: "Current" }
        ];

        renderBreadcrumb(items);

        const currentItem = screen.getByText("Current").closest('div');
        expect(currentItem).toHaveClass("text-yellow-400");
    });

    it("renders chevron separators", () => {
        const items = [
            { label: "Home", to: "/" },
            { label: "Project", to: "/project" },
            { label: "Current" }
        ];

        const { container } = renderBreadcrumb(items);
        
        // ChevronRight is a lucide icon
        const chevrons = container.querySelectorAll('.lucide-chevron-right');
        expect(chevrons).toHaveLength(2);
    });
});

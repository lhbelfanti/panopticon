import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { BrowserRouter, MemoryRouter } from "react-router";
import { NavItem } from "./index";

describe("NavItem", () => {
    const defaultProps = {
        to: "/test",
        icon: <span data-testid="nav-icon" />,
        label: "Test Label",
        collapsed: false,
    };

    const renderNavItem = (props = {}) => {
        return render(
            <BrowserRouter>
                <NavItem {...defaultProps} {...props} />
            </BrowserRouter>
        );
    };

    it("renders correctly with label and icon", () => {
        renderNavItem();
        expect(screen.getByText("Test Label")).toBeInTheDocument();
        expect(screen.getByTestId("nav-icon")).toBeInTheDocument();
    });

    it("hides label when collapsed is true", () => {
        renderNavItem({ collapsed: true });
        expect(screen.queryByText("Test Label")).not.toBeInTheDocument();
    });

    it("adds specific indent class when indented is true", () => {
        const { container } = renderNavItem({ indented: true });
        const linkElement = container.querySelector("a");
        expect(linkElement).toHaveClass("pl-5");
    });

    it("renders sub-items when expanded", async () => {
        const user = userEvent.setup();
        const subItems = [
            { id: "1", to: "/test/1", label: "Sub Item 1" },
            { id: "2", to: "/test/2", label: "Sub Item 2" },
        ];

        renderNavItem({ subItems });

        // Assuming the chevron button is the only button in the NavItem initially for subitems
        const expandBtn = screen.getByRole("button");
        await user.click(expandBtn);

        expect(screen.getByText("Sub Item 1")).toBeInTheDocument();
        expect(screen.getByText("Sub Item 2")).toBeInTheDocument();
    });

    it("does not render sub-items button when collapsed is true", () => {
        const subItems = [{ id: "1", to: "/test/1", label: "Sub Item 1" }];
        renderNavItem({ collapsed: true, subItems });

        // The button to expand sub-items shouldn't exist if collapsed
        const buttons = screen.queryAllByRole("button");
        expect(buttons).toHaveLength(0);
    });

    it("applies active styles when the route matches", () => {
        const { container } = render(
            <MemoryRouter initialEntries={["/test"]}>
                <NavItem {...defaultProps} />
            </MemoryRouter>
        );

        const linkElement = container.querySelector("a");
        expect(linkElement).toHaveClass("bg-primary");
    });

    it("applies active styles to sub-items when their route matches", async () => {
        const subItems = [{ id: 1, to: "/active-sub", label: "Active Sub" }];
        const { container } = render(
            <MemoryRouter initialEntries={["/active-sub"]}>
                <NavItem {...defaultProps} subItems={subItems} />
            </MemoryRouter>
        );

        // Subitems are shown if their route is active even if not manually expanded? 
        // Actually, isExpanded is false by default. But let's check if the link exists.
        // Wait, line 87: {isExpanded && hasSubItems && !collapsed && (
        // So we need to expand it first or mock the state.
        // Let's just expand it.
        const user = userEvent.setup();
        const expandBtn = screen.getByRole("button");
        await user.click(expandBtn);

        const subLink = screen.getByText("Active Sub").closest("a");
        expect(subLink).toHaveClass("bg-primary/10");
    });
});

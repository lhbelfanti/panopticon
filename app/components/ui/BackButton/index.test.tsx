import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import { BackButton } from "./index";

describe("BackButton", () => {
    it("renders with text and link", () => {
        render(
            <MemoryRouter>
                <BackButton to="/home" text="Back to Home" />
            </MemoryRouter>
        );

        const link = screen.getByRole("link", { name: /back to home/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/home");
    });

    it("renders with custom icon", () => {
        render(
            <MemoryRouter>
                <BackButton to="/home" text="Back" icon={<span data-testid="custom-icon">Icon</span>} />
            </MemoryRouter>
        );

        expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        render(
            <MemoryRouter>
                <BackButton to="/home" text="Back" className="custom-class" />
            </MemoryRouter>
        );

        const link = screen.getByRole("link");
        expect(link).toHaveClass("custom-class");
        expect(link).toHaveClass("text-primary"); // Should still have default classes
    });
});

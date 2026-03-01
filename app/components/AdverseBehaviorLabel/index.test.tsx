import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdverseBehaviorLabel } from "./index";

describe("AdverseBehaviorLabel", () => {
    it("renders default text when no children provided", () => {
        render(<AdverseBehaviorLabel />);
        expect(screen.getByText("Adverse Human Behaviours")).toBeInTheDocument();
    });

    it("renders custom children when provided", () => {
        render(<AdverseBehaviorLabel>Custom Label text</AdverseBehaviorLabel>);
        expect(screen.getByText("Custom Label text")).toBeInTheDocument();
    });

    it("applies custom className", () => {
        const { container } = render(<AdverseBehaviorLabel className="custom-test-class" />);
        // Testing Library recommends testing what the user sees, but for specific class combinations on a span
        // container queries are sometimes necessary.
        expect(container.firstChild).toHaveClass("custom-test-class");
        expect(container.firstChild).toHaveClass("text-primary/90"); // Default class
    });
});

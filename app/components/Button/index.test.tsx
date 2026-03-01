import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./index";

describe("Button", () => {
    it("renders children successfully", () => {
        render(<Button>Click Me!</Button>);
        expect(screen.getByRole("button", { name: /click me!/i })).toBeInTheDocument();
    });

    it("calls onClick when clicked", async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<Button onClick={handleClick}>Submit</Button>);
        const btn = screen.getByRole("button", { name: /submit/i });

        await user.click(btn);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies passed className", () => {
        render(<Button className="custom-class">Test</Button>);
        const btn = screen.getByRole("button", { name: /test/i });
        expect(btn).toHaveClass("custom-class");
        // Also retains default classes
        expect(btn).toHaveClass("px-4", "py-2");
    });
});

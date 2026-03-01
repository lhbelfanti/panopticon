import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "./index";

describe("Logo", () => {
    it("renders the logo image", () => {
        render(<Logo />);
        const img = screen.getByRole("img", { name: /panopticon logo/i });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", "/panopticon-logo-no-text.png");
    });

    it("renders front and background texts by default", () => {
        render(<Logo />);
        // The component renders "PANOPTICON" text twice (background and foreground)
        const texts = screen.getAllByText("PANOPTICON");
        expect(texts).toHaveLength(2);
    });

    it("hides texts when collapsed is true", () => {
        render(<Logo collapsed={true} />);
        const texts = screen.queryAllByText("PANOPTICON");
        expect(texts).toHaveLength(0);
    });

    it("applies the collapsed class to the image when collapsed", () => {
        render(<Logo collapsed={true} />);
        const img = screen.getByRole("img", { name: /panopticon logo/i });
        expect(img).toHaveClass("w-10");
    });
});

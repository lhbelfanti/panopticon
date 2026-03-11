import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthBranding } from "./index";

vi.mock("~/components/Logo", () => ({
    Logo: () => <div data-testid="logo">Logo Mock</div>
}));

describe("AuthBranding", () => {
    it("renders description and logo correctly", () => {
        render(<AuthBranding description="Branding Description" />);

        expect(screen.getByText("Branding Description")).toBeInTheDocument();
        expect(screen.getByTestId("logo")).toBeInTheDocument();
    });
});

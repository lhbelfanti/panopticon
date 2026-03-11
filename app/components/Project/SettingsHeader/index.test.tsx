import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SettingsHeader } from "./index";

describe("SettingsHeader", () => {
    it("renders title and description correctly", () => {
        render(
            <SettingsHeader title="Settings Title" description="Settings Description" />
        );

        expect(screen.getByText("Settings Title")).toBeInTheDocument();
        expect(screen.getByText("Settings Description")).toBeInTheDocument();
    });
});

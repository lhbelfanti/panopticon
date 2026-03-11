import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import { NewEntryFAB } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("NewEntryFAB", () => {
    it("renders correctly with link to new entry", () => {
        render(
            <BrowserRouter>
                <NewEntryFAB projectId={1} />
            </BrowserRouter>
        );

        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/entries/new?projectId=1");
        expect(screen.getByText("sidebar.newEntry")).toBeInTheDocument();
    });
});

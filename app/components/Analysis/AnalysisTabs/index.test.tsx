import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnalysisTabs } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("AnalysisTabs", () => {
    it("renders tabs correctly and handles tab clicks", () => {
        const onTabChange = vi.fn();
        render(
            <AnalysisTabs activeTab="new" onTabChange={onTabChange} />
        );

        expect(screen.getByText("projects.analysis.tabs.new")).toBeInTheDocument();
        expect(screen.getByText("projects.analysis.tabs.history")).toBeInTheDocument();

        fireEvent.click(screen.getByText("projects.analysis.tabs.history"));
        expect(onTabChange).toHaveBeenCalledWith("history");
    });
});

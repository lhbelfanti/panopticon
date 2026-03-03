import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SummaryGrid } from "./index";

vi.mock("react-i18next", () => ({
    Trans: ({ i18nKey, children }: any) => children || i18nKey,
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("SummaryGrid", () => {
    const mockSummary = {
        tweetsAnalyzed: 1250,
        activeProjects: 3,
        averagePrecision: 92,
        remainingTokens: 2500000,
    };

    it("renders all summary widgets", () => {
        render(<SummaryGrid summary={mockSummary} />);

        // Widget Titles (from translation keys)
        expect(screen.getByText("dashboard.summary.tweetsAnalyzed")).toBeInTheDocument();
        expect(screen.getByText("dashboard.summary.activeProjects")).toBeInTheDocument();
        expect(screen.getByText("dashboard.summary.averagePrecision")).toBeInTheDocument();
        expect(screen.getByText("dashboard.summary.mostUsedModel")).toBeInTheDocument();
        expect(screen.getByText("dashboard.summary.remainingTokens")).toBeInTheDocument();

        // Widget Values
        expect(screen.getByText("1,250")).toBeInTheDocument(); // Formatted number
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("92%")).toBeInTheDocument();
        expect(screen.getByText("2.5M")).toBeInTheDocument(); // Formatted tokens
    });

    it("renders unlimited tokens correctly", () => {
        // Missing remainingTokens implies unlimited
        const summaryNoTokens = { ...mockSummary, remainingTokens: undefined };
        render(<SummaryGrid summary={summaryNoTokens} />);

        expect(screen.getByText("dashboard.summary.unlimited")).toBeInTheDocument();
    });

    it("caps the token progress bar at 100%", () => {
        // 10M tokens is > 5M total used for progress calc
        const summaryHighTokens = { ...mockSummary, remainingTokens: 10000000 };
        const { container } = render(<SummaryGrid summary={summaryHighTokens} />);

        const progressBar = container.querySelector(".bg-primary");
        expect(progressBar).toHaveStyle({ width: "100%" });
    });

    it("renders progress bar at 0% when tokens are 0", () => {
        const summaryZeroTokens = { ...mockSummary, remainingTokens: 0 };
        const { container } = render(<SummaryGrid summary={summaryZeroTokens} />);

        const progressBar = container.querySelector(".bg-primary");
        expect(progressBar).toHaveStyle({ width: "0%" });
    });
});

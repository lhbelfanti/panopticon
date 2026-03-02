import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router";
import Index from "./_index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock the child components to simplify the test
vi.mock("~/components/Dashboard/QuickActions", () => ({
    QuickActions: () => <div data-testid="quick-actions" />,
}));
vi.mock("~/components/Dashboard/SummaryGrid", () => ({
    SummaryGrid: () => <div data-testid="summary-grid" />,
}));
vi.mock("~/components/Dashboard/RecentActivity", () => ({
    RecentActivity: () => <div data-testid="recent-activity" />,
}));

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        useLoaderData: () => ({
            summary: {},
            recentActivities: [],
        }),
    };
});

describe("Dashboard Index Route", () => {
    const renderIndex = () => {
        return render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );
    };

    it("renders the dashboard layout with welcome message", () => {
        renderIndex();
        expect(screen.getByText("dashboard.welcome")).toBeInTheDocument();
        expect(screen.getByText("dashboard.subtitle")).toBeInTheDocument();
    });

    it("renders the child dashboard components", () => {
        renderIndex();
        expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
        expect(screen.getByTestId("summary-grid")).toBeInTheDocument();
        expect(screen.getByTestId("recent-activity")).toBeInTheDocument();
    });
});

import { loader } from "./_index";
import { getDashboardSummary, getRecentActivities } from "~/services/api/dashboard/index.server";

vi.mock("~/services/api/dashboard/index.server", () => ({
    getDashboardSummary: vi.fn(async () => ({})),
    getRecentActivities: vi.fn(async () => []),
}));

describe("Dashboard Index Route Functions", () => {
    it("loader returns dashboard data", async () => {
        const result = await loader();
        expect(result).toHaveProperty("summary");
        expect(result).toHaveProperty("recentActivities");
    });
});

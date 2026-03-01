import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { RecentActivity } from "./index";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, options: any) => options ? `${key} count:${options.count}` : key,
    }),
}));

describe("RecentActivity", () => {
    beforeAll(() => {
        // Mock system time to ensure predictable "time ago" calculations
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-01-02T12:00:00Z"));
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it("renders empty state correctly", () => {
        render(<RecentActivity recentActivities={[]} />);
        expect(screen.getByText("dashboard.recentActivity.noActivity")).toBeInTheDocument();
    });

    it("renders activities correctly", () => {
        const mockActivities = [
            {
                id: "1",
                type: "project_created",
                description: "Created new project X",
                timestamp: "2024-01-02T11:55:00Z", // 5 mins ago
            },
            {
                id: "2",
                type: "predictions_made",
                description: "Predictions complete for Y",
                timestamp: "2024-01-01T12:00:00Z", // 1 day ago
            }
        ];

        render(<RecentActivity recentActivities={mockActivities as any} />);

        expect(screen.getByText("Created new project X")).toBeInTheDocument();
        expect(screen.getByText("Predictions complete for Y")).toBeInTheDocument();

        // Check time calculations based on mock date
        expect(screen.getByText("relativeTime.minutesAgo count:5")).toBeInTheDocument();
        expect(screen.getByText("relativeTime.hoursAgo count:24")).toBeInTheDocument();

        // Check inferred status mappings
        expect(screen.getByText("status.created")).toBeInTheDocument();
        expect(screen.getByText("status.processing")).toBeInTheDocument();
    });
});

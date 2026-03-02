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

    it("renders time ago correctly for different intervals", () => {
        const mockActivities = [
            {
                id: "1",
                type: "csv_uploaded",
                description: "Just now",
                timestamp: "2024-01-02T11:59:55Z", // 5 seconds ago
            },
            {
                id: "2",
                type: "tweets_added",
                description: "Days ago",
                timestamp: "2024-01-01T11:59:55Z", // 1 day ago
            },
            {
                id: "3",
                type: "unknown",
                description: "Long ago",
                status: "custom_status",
                timestamp: "2023-12-30T12:00:00Z", // 3 days ago
            }
        ];

        render(<RecentActivity recentActivities={mockActivities as any} />);

        expect(screen.getByText("relativeTime.secondsAgo")).toBeInTheDocument();
        expect(screen.getByText("relativeTime.daysAgo count:1")).toBeInTheDocument();
        expect(screen.getByText("relativeTime.daysAgo count:3")).toBeInTheDocument();
        expect(screen.getByText("status.custom_status")).toBeInTheDocument();
    });
});

import { ActivityIcon, getActivityColor } from "./utils";

describe("RecentActivity Utils", () => {
    it("ActivityIcon returns fallback for unknown type", () => {
        const { container } = render(<ActivityIcon type="unknown" />);
        // It should render an Activity icon (default)
        expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("getActivityColor returns fallback for unknown type", () => {
        const color = getActivityColor("unknown");
        expect(color).toContain("gray-500");
    });
});

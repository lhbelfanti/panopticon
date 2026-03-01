import { describe, it, expect } from "vitest";
import { ActivityIcon, getActivityColor } from "./utils";
import { render } from "@testing-library/react";

describe("RecentActivity utils", () => {
    describe("getActivityColor", () => {
        it("returns correct color for project_created", () => {
            expect(getActivityColor("project_created")).toContain("bg-blue-500/10");
        });
        it("returns correct color for csv_uploaded", () => {
            expect(getActivityColor("csv_uploaded")).toContain("bg-emerald-500/10");
        });
        it("returns correct color for tweets_added", () => {
            expect(getActivityColor("tweets_added")).toContain("bg-emerald-500/10");
        });
        it("returns correct color for predictions_made", () => {
            expect(getActivityColor("predictions_made")).toContain("bg-primary/10");
        });
        it("returns default color for unknown types", () => {
            expect(getActivityColor("unknown_type")).toContain("bg-gray-500/10");
        });
    });

    describe("ActivityIcon", () => {
        it("renders successfully without crashing", () => {
            const { container } = render(<ActivityIcon type="project_created" />);
            expect(container.querySelector("svg")).toBeInTheDocument();
        });
    });
});

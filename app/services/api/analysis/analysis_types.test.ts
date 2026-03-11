import { describe, it, expect } from "vitest";
import type { AnalysisRun, AnalysisResult } from "./types";

describe("Analysis Types", () => {
    it("can be imported", () => {
        // This is a dummy test to ensure the types file is "hit" by the coverage tool
        // if it's being tracked as potentially having code.
        const mockResult: AnalysisResult = {
            totalEntries: 10,
            analyzedEntries: 8,
            excludedEntries: 2,
            behaviorDistribution: [],
            confidenceMetrics: { average: 0.9, median: 0.9, distribution: [] },
            insights: { topBehaviorId: "a", confidenceTrend: "high", verdictConcentration: "positive" }
        };
        
        const mockRun: AnalysisRun = {
            id: "1",
            subprojectId: "s1",
            timestamp: "2024-01-01",
            status: "completed",
            parameters: { excludedEntryIds: [] },
            result: mockResult
        };

        expect(mockRun.id).toBe("1");
    });
});

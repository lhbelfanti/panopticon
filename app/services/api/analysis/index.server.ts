import type { AnalysisRun, AnalysisResult } from "./types";
import { analysisStore } from "../mock/store";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Triggers a new analysis run for a specific subproject.
 * Handles concurrency and mocks the analysis process.
 */
export const triggerProjectAnalysis = async (
    subprojectId: string,
    excludedEntryIds: string[] = []
): Promise<AnalysisRun> => {
    const runId = `run_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newRun: AnalysisRun = {
        id: runId,
        subprojectId,
        status: "processing",
        timestamp: new Date().toISOString(),
        parameters: { excludedEntryIds },
    };

    // Add to store
    analysisStore.runs = [newRun, ...analysisStore.runs];

    // Fire and forget (mock async processing)
    // In a real server this would be a background job
    (async () => {
        await delay(5000); // 5s mock duration

        const runIndex = analysisStore.runs.findIndex(r => r.id === runId);
        if (runIndex === -1) return;

        // Mock result generation
        // For simplicity, we create some plausible-looking metrics
        const analyzedCount = 50 + Math.floor(Math.random() * 150);
        const excludedCount = excludedEntryIds.length;
        const totalEntries = analyzedCount + excludedCount;

        const results: AnalysisResult = {
            totalEntries,
            analyzedEntries: analyzedCount,
            excludedEntries: excludedCount,
            behaviorDistribution: [
                { behaviorId: "hate_speech", count: 12, percentage: 12 },
                { behaviorId: "sexism", count: 8, percentage: 8 },
                { behaviorId: "cyberbullying", count: 5, percentage: 5 },
                { behaviorId: "suicidal_ideation_depression", count: 15, percentage: 15 },
                { behaviorId: "illicit_drugs", count: 3, percentage: 3 },
            ],
            confidenceMetrics: {
                average: 0.82,
                median: 0.85,
                distribution: [
                    { range: "0.0-0.2", count: 10 },
                    { range: "0.2-0.4", count: 20 },
                    { range: "0.4-0.6", count: 35 },
                    { range: "0.6-0.8", count: 65 },
                    { range: "0.8-1.0", count: 120 },
                ],
            },
            insights: [
                "Hate speech represents the most frequent category in this dataset.",
                "Confidence levels are generally high (>80%) for the BERT (Spanish) model.",
                "Detected behaviors are more concentrated in the 'Positive' verdict category.",
            ],
        };

        analysisStore.runs[runIndex] = {
            ...analysisStore.runs[runIndex],
            status: "completed",
            result: results,
        };
    })();

    return newRun;
};

/**
 * Retrieves the history of analysis runs for a specific subproject.
 */
export const getSubprojectAnalysisHistory = async (subprojectId: string): Promise<AnalysisRun[]> => {
    await delay(500);
    return analysisStore.runs.filter(r => r.subprojectId === subprojectId);
};

/**
 * Retrieves a single analysis run by its ID.
 */
export const getAnalysisRunById = async (runId: string): Promise<AnalysisRun | null> => {
    await delay(300);
    return analysisStore.runs.find(r => r.id === runId) || null;
};

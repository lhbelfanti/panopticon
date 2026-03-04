export type AnalysisStatus = "processing" | "completed" | "failed";

export interface AnalysisRun {
    id: string;
    subprojectId: string; // The model/subproject ID this belongs to
    timestamp: string;
    status: AnalysisStatus;
    parameters: {
        excludedEntryIds: string[];
    };
    result?: AnalysisResult;
    error?: string;
}

export interface AnalysisResult {
    totalEntries: number;
    analyzedEntries: number;
    excludedEntries: number;
    behaviorDistribution: {
        behaviorId: string;
        count: number;
        percentage: number;
    }[];
    confidenceMetrics: {
        average: number;
        median: number;
        distribution: {
            range: string; // e.g., "0.8-1.0"
            count: number;
        }[];
    };
    insights: string[]; // Narrative summaries
}

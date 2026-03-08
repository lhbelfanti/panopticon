export type PredictionRunStatus = "Running" | "Completed" | "Failed";

export interface PredictionRun {
    id: string;
    projectId: number;
    modelId: string;
    totalEntries: number;
    processedEntries: number;
    status: PredictionRunStatus;
    createdAt: string;
    completedAt?: string;
}

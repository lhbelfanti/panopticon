import type { PredictionRun } from "./types";

// Stateless mock generation based on seed to persist across hot reloads
export const predictionStore: Record<string, PredictionRun[]> = {};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getPredictionRuns = async (
    projectId: number,
    modelId: string,
): Promise<PredictionRun[]> => {
    await delay(200);
    const storeKey = `${projectId}_${modelId}`;
    return predictionStore[storeKey] || [];
};

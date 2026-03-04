import type { AnalysisRun } from "../analysis/types";

// Centralized mock store for Analysis domain
export const analysisStore: {
    runs: AnalysisRun[];
} = {
    runs: [],
};

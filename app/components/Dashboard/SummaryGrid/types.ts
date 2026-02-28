export interface SummaryData {
    tweetsAnalyzed: number;
    activeProjects: number;
    averagePrecision: number;
    remainingTokens?: number;
}

export interface SummaryGridProps {
    summary: SummaryData;
}

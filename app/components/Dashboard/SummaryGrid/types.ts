export interface SummaryData {
  tweetsAnalyzed: number;
  tweetsQuota?: number;
  tweetsTrend?: number;
  activeProjects: number;
  averagePrecision: number;
  remainingTokens?: number;
  mostUsedModel?: string;
}

export interface SummaryGridProps {
  summary: SummaryData;
}

export interface SummaryData {
  tweetsAnalyzed: number;
  tweetsQuota?: number;
  tweetsTrend?: number;
  activeProjects: number;
  averagePrecision: number;
  remainingTokens?: number;
  mostUsedModel?: string;
}

export const DEFAULT_TOKEN_QUOTA = 5_000_000;

export interface SummaryGridProps {
  summary: SummaryData;
  tokenQuota?: number;
}

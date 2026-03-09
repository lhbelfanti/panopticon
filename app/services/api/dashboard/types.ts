export interface DashboardSummary {
  tweetsAnalyzed: number;
  tweetsQuota?: number;
  tweetsTrend?: number;
  activeProjects: number;
  averagePrecision: number;
  remainingTokens?: number;
  mostUsedModel?: string;
}

export type RecentActivityType =
  | "project_created"
  | "csv_uploaded"
  | "tweets_added"
  | "predictions_made";

export interface RecentActivity {
  id: number;
  type: RecentActivityType;
  description: string;
  metadata?: Record<string, string | number>;
  timestamp: string;
}

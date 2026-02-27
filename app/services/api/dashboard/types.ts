export interface DashboardSummary {
    tweetsAnalyzed: number;
    activeProjects: number;
    averagePrecision: number;
    remainingTokens?: number;
}

export type RecentActivityType = 'project_created' | 'csv_uploaded' | 'tweets_added' | 'predictions_made';

export interface RecentActivity {
    id: string;
    type: RecentActivityType;
    description: string;
    timestamp: string;
}

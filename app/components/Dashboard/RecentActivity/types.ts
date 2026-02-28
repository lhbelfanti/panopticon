export interface ActivityItem {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status?: string;
}

export interface RecentActivityProps {
    recentActivities: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  status?: string;
}

export interface RecentActivityProps {
  recentActivities: ActivityItem[];
}

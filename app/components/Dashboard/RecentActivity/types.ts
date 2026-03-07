export interface ActivityItem {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  status?: string;
  metadata?: Record<string, string | number>;
}

export interface RecentActivityProps {
  recentActivities: ActivityItem[];
}

import type { DashboardSummary, RecentActivity } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  await delay(Math.floor(Math.random() * 500) + 500);

  return {
    tweetsAnalyzed: 2453,
    activeProjects: 2,
    averagePrecision: 89.4,
    remainingTokens: 154200,
  };
};

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  await delay(Math.floor(Math.random() * 500) + 500);

  return [
    {
      id: "act_1",
      type: "project_created",
      description: "Proyecto 'Suicidal Ideation Study' fue creado",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: "act_2",
      type: "csv_uploaded",
      description: "Subiste el archivo 'dataset_raw.csv' (300 entradas)",
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    },
    {
      id: "act_3",
      type: "predictions_made",
      description: "Se completaron 150 predicciones con 'Panoptic Core Model'",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ];
};

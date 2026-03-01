import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ActivityIcon, getActivityColor } from "./utils";
import type { RecentActivityProps } from "./types";

export const RecentActivity = (props: RecentActivityProps) => {
  const { recentActivities } = props;
  const { t } = useTranslation();

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 86400;
    if (interval > 1)
      return t("relativeTime.daysAgo", { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1)
      return t("relativeTime.hoursAgo", { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1)
      return t("relativeTime.minutesAgo", { count: Math.floor(interval) });
    return t("relativeTime.secondsAgo");
  };

  return (
    <>
      <h2 className="text-lg font-bold text-white-1 mb-6">
        {t("dashboard.recentActivity.title")}
      </h2>
      <div className="bg-surface-dark rounded-2xl border border-white/5 shadow-md overflow-hidden mb-8">
        {recentActivities.map((activity, idx) => {
          let statusKey = "done";
          if (activity.status) {
            statusKey = activity.status;
          } else if (activity.type === "project_created") {
            statusKey = "created";
          } else if (activity.type === "predictions_made") {
            statusKey = "processing";
          }

          return (
            <div
              key={activity.id}
              className={`p-4 flex gap-4 items-center hover:bg-white/5 transition-colors ${idx !== recentActivities.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}
              >
                <ActivityIcon type={activity.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white-1 text-sm truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-light-gray-70 mt-0.5">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              <div className="flex-shrink-0 pl-4">
                <span className="text-[10px] font-medium tracking-wider uppercase bg-white/5 text-light-gray-70 px-2 py-1 rounded-md border border-white/10">
                  {t(`status.${statusKey}`)}
                </span>
              </div>
            </div>
          );
        })}

        {recentActivities.length === 0 && (
          <div className="p-8 text-center text-light-gray-70 flex flex-col items-center">
            <Activity className="w-10 h-10 opacity-20 mb-3" />
            <p className="text-sm">
              {t("dashboard.recentActivity.noActivity")}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

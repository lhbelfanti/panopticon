import { useTranslation } from "react-i18next";
import { CheckCircle2, FileText, Folder, TrendingUp, Zap } from "lucide-react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { SummaryGridProps } from "./types";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const SummaryGrid = (props: SummaryGridProps) => {
  const { summary } = props;
  const { t } = useTranslation();

  // Convention: extract long Tailwind strings into variables
  const widgetCardClasses =
    "bg-surface-dark p-4 rounded-xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform";

  return (
    <>
      <h2 className="text-lg font-bold text-white-1 mb-6 flex items-center gap-2">
        {t("dashboard.summary.title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {/* Widget 1 */}
        <div className={widgetCardClasses}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-light-gray-70 text-sm font-medium tracking-tight pr-2">
              {t("dashboard.summary.tweetsAnalyzed")}
            </span>
            <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText size={16} />
            </div>
          </div>
          <div className="flex items-baseline flex-wrap gap-x-1 gap-y-2">
            <span className="text-3xl font-extrabold text-white-1 tracking-tight">
              {summary.tweetsAnalyzed.toLocaleString()}
            </span>
            <span className="text-light-gray-70 text-lg font-medium ml-0.5">
              / {summary.tweetsQuota?.toLocaleString() ?? "2,500"}
            </span>
            <div className="flex shrink-0 items-center gap-1 ml-auto bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-lg text-green-400">
              <TrendingUp size={14} />
              <span className="font-bold text-sm">{summary.tweetsTrend ?? 85}%</span>
            </div>
          </div>
        </div>

        {/* Widget 2 */}
        <div className={widgetCardClasses}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-light-gray-70 text-sm font-medium tracking-tight">
              {t("dashboard.summary.activeProjects")}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Folder size={16} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white-1 tracking-tight">
            {summary.activeProjects}
          </span>
        </div>

        {/* Widget 3 */}
        <div className={widgetCardClasses}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-light-gray-70 text-sm font-medium tracking-tight">
              {t("dashboard.summary.averagePrecision")}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-white-1 tracking-tight">
            {summary.averagePrecision}%
          </span>
        </div>

        {/* Widget 4: Most Used Model */}
        <div className={widgetCardClasses}>
          <div className="flex justify-between items-start mb-3">
            <span className="text-light-gray-70 text-sm font-medium tracking-tight">
              {t("dashboard.summary.mostUsedModel")}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={16} />
            </div>
          </div>
          <span className="text-xl font-extrabold text-white-1 tracking-tight">
            {summary.mostUsedModel ?? "N/A"}
          </span>
        </div>

        {/* Widget 5: Remaining Tokens (Inline width) */}
        <div className={cn(widgetCardClasses, "relative overflow-hidden")}>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-light-gray-70 text-sm font-medium tracking-tight">
              {t("dashboard.summary.remainingTokens")}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={16} />
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <span className="text-2xl font-extrabold text-white-1 tracking-tight">
              {summary.remainingTokens
                ? (summary.remainingTokens / 1000000).toFixed(1) + "M"
                : t("dashboard.summary.unlimited")}
            </span>

            {summary.remainingTokens !== undefined && (
              <div className="flex-1 bg-background-dark rounded-full h-1.5 shadow-inner overflow-hidden border border-white/5 mt-1">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{
                    width: `${Math.min((summary.remainingTokens / 5000000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

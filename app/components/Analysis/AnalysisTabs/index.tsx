import { Zap, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AnalysisTabsProps } from "./types";

export const AnalysisTabs = (props: AnalysisTabsProps) => {
    const { activeTab, onTabChange } = props;
    const { t } = useTranslation();

    const tabButtonClass = (isActive: boolean) => `
        flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all
        ${isActive
            ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"}
    `;

    return (
        <div className="flex justify-center relative z-10">
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 max-w-fit">
                <button
                    onClick={() => onTabChange("new")}
                    className={tabButtonClass(activeTab === "new")}
                >
                    <Zap size={16} />
                    {t("projects.analysis.tabs.new")}
                </button>
                <button
                    onClick={() => onTabChange("history")}
                    className={tabButtonClass(activeTab === "history")}
                >
                    <History size={16} />
                    {t("projects.analysis.tabs.history")}
                </button>
            </div>
        </div>
    );
};

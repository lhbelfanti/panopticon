import { PlusCircle, TableProperties } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IngestionTabsProps } from "./types";

export const IngestionTabs = (props: IngestionTabsProps) => {
    const { activeTab, onTabChange } = props;
    const { t } = useTranslation();

    const tabButtonClass = (isActive: boolean) => `
        flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all
        ${isActive
            ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"}
    `;

    return (
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-8 border border-white/5 max-w-fit relative z-10">
            <button
                onClick={() => onTabChange("single")}
                className={tabButtonClass(activeTab === "single")}
            >
                <PlusCircle size={16} />
                {t("projects.entries.new.tabs.single")}
            </button>
            <button
                onClick={() => onTabChange("bulk")}
                className={tabButtonClass(activeTab === "bulk")}
            >
                <TableProperties size={16} />
                {t("projects.entries.new.tabs.bulk")}
            </button>
        </div>
    );
};

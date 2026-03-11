import React from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SettingsDangerZoneProps } from "./types";

export const SettingsDangerZone = (props: SettingsDangerZoneProps) => {
    const { onDelete } = props;
    const { t } = useTranslation();

    return (
        <div className="bg-surface-dark border border-bittersweet-shimmer/20 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="p-8 border-b border-bittersweet-shimmer/10 bg-bittersweet-shimmer/5">
                <h2 className="text-xl font-bold text-bittersweet-shimmer flex items-center gap-2">
                    <Trash2 size={20} />
                    {t("projects.settings.dangerZoneTitle")}
                </h2>
            </div>
            <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className="text-white-1 font-bold mb-1">
                        {t("projects.settings.deleteTitle")}
                    </h3>
                    <p className="text-sm text-light-gray-70 max-w-md">
                        {t("projects.settings.deleteWarning")}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onDelete}
                    className="px-6 py-2.5 bg-bittersweet-shimmer/10 hover:bg-bittersweet-shimmer text-bittersweet-shimmer hover:text-white-1 font-bold rounded-lg border border-bittersweet-shimmer/20 transition-all whitespace-nowrap"
                >
                    {t("projects.settings.deleteButton")}
                </button>
            </div>
        </div>
    );
};

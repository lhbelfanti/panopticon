import { useTranslation } from "react-i18next";
import {
    Zap,
    Layers,
    CheckCircle2,
    XSquare,
    ChevronRight,
    Filter,
    AlertCircle,
    Plus
} from "lucide-react";
import type { NewAnalysisFormProps } from "./types";

export const NewAnalysisForm = ({
    subprojectId,
    excludedEntryIds,
    isSubmitting,
    onSubmit,
    onOpenExclusions
}: NewAnalysisFormProps) => {
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500 py-10">
            {/* Action Card */}
            <div className="bg-surface-dark border border-white/5 rounded-2xl p-10 shadow-2xl overflow-hidden relative group">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Form Configuration */}
                    <div className="col-span-1 lg:col-span-2 flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-extrabold text-white-1 tracking-tight">{t("projects.analysis.newForm.title")}</h2>
                            <p className="text-light-gray-70 text-base">
                                {t("projects.analysis.newForm.description")}
                            </p>
                        </div>

                        <div className="flex gap-4 items-stretch min-h-[144px] bg-background-dark/30 p-2 rounded-2xl border border-white/5">
                            {/* Exclusions Summary Trigger (Primary Action) */}
                            <button
                                onClick={onOpenExclusions}
                                className="flex-1 bg-surface-dark border-2 border-bittersweet-shimmer/30 hover:border-bittersweet-shimmer hover:bg-white/5 rounded-xl p-6 flex flex-col justify-between items-start relative group/mini overflow-hidden transition-all text-left shadow-lg cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-xs uppercase font-bold text-light-gray-50 tracking-widest leading-none group-hover/mini:text-bittersweet-shimmer transition-colors mb-4">
                                    <XSquare size={16} className="text-bittersweet-shimmer" />
                                    {t("projects.analysis.newForm.exclusionsTitle")}
                                </div>
                                <div className="flex flex-col gap-1 w-full mt-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-extrabold text-white-1 leading-none group-hover/mini:text-bittersweet-shimmer transition-colors">
                                            {excludedEntryIds.length > 0 ? t("projects.analysis.newForm.refineList") : t("projects.analysis.newForm.manage")}
                                        </span>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bittersweet-shimmer/10 border border-bittersweet-shimmer/30 text-[10px] font-bold uppercase tracking-widest text-bittersweet-shimmer group-hover/mini:bg-bittersweet-shimmer group-hover/mini:text-background-dark group-hover/mini:border-bittersweet-shimmer transition-all shadow-sm">
                                            <Plus size={12} strokeWidth={3} />
                                            <span>{t("projects.analysis.newForm.addExclusions")}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-light-gray-70 leading-relaxed mt-1">
                                        {excludedEntryIds.length > 0
                                            ? t("projects.analysis.newForm.entriesExcluded", { count: excludedEntryIds.length })
                                            : t("projects.analysis.newForm.noExclusions")}
                                    </span>
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/mini:opacity-100 transition-all group-hover/mini:translate-x-1 duration-300">
                                    <ChevronRight size={20} className="text-bittersweet-shimmer" />
                                </div>
                                {/* Decorative highlight */}
                                <div className="absolute inset-0 border-2 border-bittersweet-shimmer/0 group-hover/mini:border-bittersweet-shimmer/20 rounded-xl transition-colors pointer-events-none" />
                            </button>

                            {/* Selection Summary (Informational) */}
                            <div className="flex-1 bg-transparent p-6 flex flex-col justify-between items-start">
                                <div className="flex items-center gap-2 text-xs uppercase font-bold text-light-gray-60 tracking-widest leading-none mb-4">
                                    <Layers size={14} className="text-primary/70" />
                                    {t("projects.analysis.newForm.datasetTitle")}
                                </div>
                                <div className="flex flex-col gap-1 w-full relative z-10">
                                    <span className="text-3xl font-extrabold text-white-1 leading-none tabular-nums opacity-90">
                                        {excludedEntryIds.length > 0 ? t("projects.analysis.newForm.filtered") : t("projects.analysis.newForm.complete")}
                                    </span>
                                    <span className="text-xs font-semibold text-light-gray-60 leading-relaxed mt-1">
                                        {excludedEntryIds.length > 0
                                            ? t("projects.analysis.newForm.filteredDesc")
                                            : t("projects.analysis.newForm.completeDesc")}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center w-full pt-6 border-t border-white/5">
                            <button
                                onClick={() => onSubmit(excludedEntryIds)}
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-background-dark px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Layers className="animate-pulse" size={18} />
                                        <span>{t("projects.analysis.newForm.starting")}</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        <span className="whitespace-nowrap">{t("projects.analysis.newForm.generate")}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Integrated Guidance Info */}
                    <div className="col-span-1 flex flex-col gap-6 lg:border-l lg:border-t-0 border-t border-white/5 lg:pl-12 pt-8 lg:pt-0">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <h4 className="text-white-1 font-bold text-sm tracking-tight uppercase tracking-widest">{t("projects.analysis.newForm.guideTitle")}</h4>
                            </div>

                            <div className="flex flex-col gap-8 pl-1">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Filter size={16} />
                                        <h5 className="text-white-1 font-bold text-xs uppercase tracking-widest">{t("projects.analysis.newForm.guideExcludeTitle")}</h5>
                                    </div>
                                    <p className="text-light-gray-70 text-sm leading-relaxed">
                                        {t("projects.analysis.newForm.guideExcludeDesc")}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Layers size={16} />
                                        <h5 className="text-white-1 font-bold text-xs uppercase tracking-widest">{t("projects.analysis.newForm.guideHistoryTitle")}</h5>
                                    </div>
                                    <p className="text-light-gray-70 text-sm leading-relaxed">
                                        {t("projects.analysis.newForm.guideHistoryDesc")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

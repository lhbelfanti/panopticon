import { useTranslation } from "react-i18next";
import {
    Zap,
    Layers,
    CheckCircle2,
    XSquare,
    FileBarChart,
    ChevronRight,
    Search,
    Filter,
    AlertCircle
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
        <div className="max-w-4xl mx-auto flex flex-col gap-10 animate-in fade-in duration-500 py-10">
            {/* Action Card */}
            <div className="bg-surface-dark border border-white/5 rounded-2xl p-10 shadow-2xl overflow-hidden relative group">
                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-extrabold text-white-1 tracking-tight">Generate subproject analysis</h2>
                        <p className="text-light-gray-70 text-base">
                            Configure how you want to derive high-level metrics and insights for this model.
                            You can apply entry exclusions directly from this screen.
                        </p>
                    </div>

                    <div className="flex gap-4 items-stretch min-h-[144px] bg-background-dark/30 p-2 rounded-2xl border border-white/5">
                        {/* Exclusions Summary Trigger (Primary Action) */}
                        <button
                            onClick={onOpenExclusions}
                            className="flex-1 bg-surface-dark border border-white/10 hover:border-primary/50 hover:bg-white/5 rounded-xl p-6 flex flex-col justify-between items-start relative group/mini overflow-hidden transition-all text-left shadow-lg"
                        >
                            <div className="flex items-center gap-2 text-xs uppercase font-bold text-light-gray-50 tracking-widest leading-none group-hover/mini:text-primary transition-colors mb-4">
                                <XSquare size={16} className="text-bittersweet-shimmer group-hover/mini:text-primary transition-colors" />
                                Exclusions
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-2xl font-extrabold text-white-1 leading-none group-hover/mini:text-primary transition-colors">
                                    {excludedEntryIds.length > 0 ? "Refine list" : "Manage"}
                                </span>
                                <span className="text-xs font-semibold text-light-gray-70 leading-relaxed mt-1">
                                    {excludedEntryIds.length > 0
                                        ? `${excludedEntryIds.length} entries currently excluded. Click to modify.`
                                        : "No exclusions applied. Click to select entries to ignore."}
                                </span>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/mini:opacity-100 transition-all group-hover/mini:translate-x-1 duration-300">
                                <ChevronRight size={20} className="text-primary" />
                            </div>
                            {/* Decorative highlight */}
                            <div className="absolute inset-0 border-2 border-primary/0 group-hover/mini:border-primary/50 rounded-xl transition-colors pointer-events-none" />
                        </button>

                        {/* Selection Summary (Informational) */}
                        <div className="flex-1 bg-transparent p-6 flex flex-col justify-between items-start">
                            <div className="flex items-center gap-2 text-xs uppercase font-bold text-light-gray-60 tracking-widest leading-none mb-4">
                                <Layers size={14} className="text-primary/70" />
                                Dataset for analysis
                            </div>
                            <div className="flex flex-col gap-1 w-full relative z-10">
                                <span className="text-3xl font-extrabold text-white-1 leading-none tabular-nums opacity-90">
                                    {excludedEntryIds.length > 0 ? "Filtered" : "Complete"}
                                </span>
                                <span className="text-xs font-semibold text-light-gray-60 leading-relaxed mt-1">
                                    {excludedEntryIds.length > 0
                                        ? "Analysis will run on the selected subset of entries."
                                        : "Analysis will run on all available entries in the subproject."}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-400/10 text-green-400 border border-green-400/20 rounded-lg">
                                <CheckCircle2 size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Ready to process</span>
                            </div>
                            <p className="text-[11px] text-light-gray-70 italic max-w-[250px]">
                                Analysis results will be saved to your history for future access.
                            </p>
                        </div>

                        <button
                            onClick={() => onSubmit(excludedEntryIds)}
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-background-dark px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-primary/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Layers className="animate-pulse" size={18} />
                                    <span className="text-xs">Starting analysis...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={18} />
                                    <span className="text-xs whitespace-nowrap">Generate analysis</span>
                                    <ChevronRight size={18} className="opacity-50" />
                                </>
                            )}
                        </button>
                    </div>
                    {/* Integrated Guidance Info */}
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-6">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <h4 className="text-white-1 font-bold text-sm tracking-tight uppercase tracking-widest">Analysis guide</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-1">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Filter size={16} />
                                        <h5 className="text-white-1 font-bold text-xs uppercase tracking-widest">Exclude sensitive data</h5>
                                    </div>
                                    <p className="text-light-gray-70 text-sm leading-relaxed">
                                        Use the entries table filters to identify outlier data points or test cases you want to ignore to ensure your charts accurately reflect true performance.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Layers size={16} />
                                        <h5 className="text-white-1 font-bold text-xs uppercase tracking-widest">Traceable history</h5>
                                    </div>
                                    <p className="text-light-gray-70 text-sm leading-relaxed">
                                        Every analysis is saved. You can always come back and re-download the PDF report or view the visual insights as they were when they were generated.
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

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
    onSubmit
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
                            You can apply entry exclusions from the previous screen.
                        </p>
                    </div>

                    <div className="flex gap-4 items-stretch h-36">
                        {/* Selection Summary */}
                        <div className="flex-1 bg-background-dark/50 border border-white/5 rounded-xl p-6 flex flex-col justify-between items-start">
                            <div className="flex items-center gap-2 text-xs uppercase font-bold text-light-gray-50 tracking-widest leading-none">
                                <Layers size={14} className="text-primary" />
                                Current selection
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-4xl font-extrabold text-white-1 leading-none tabular-nums">
                                    {excludedEntryIds.length > 0 ? "*" : "All"}
                                </span>
                                <span className="text-xs font-semibold text-light-gray-70 leading-none">
                                    {excludedEntryIds.length > 0 ? `${excludedEntryIds.length} entries excluded` : "Full subproject data"}
                                </span>
                            </div>
                        </div>

                        {/* Exceptions Summary */}
                        <div className="flex-1 bg-background-dark/50 border border-white/5 rounded-xl p-6 flex flex-col justify-between items-start relative group/mini overflow-hidden">

                            <div className="flex items-center gap-2 text-xs uppercase font-bold text-light-gray-50 tracking-widest leading-none">
                                <XSquare size={14} className="text-bittersweet-shimmer" />
                                Selection criteria
                            </div>
                            <div className="flex flex-col gap-1 max-w-[140px] truncate">
                                <span className="text-white-1 text-sm font-bold truncate">
                                    {excludedEntryIds.length > 0 ? "Excluded list" : "None applied"}
                                </span>
                                <span className="text-[10px] text-light-gray-70 uppercase tracking-widest leading-none font-medium">
                                    {excludedEntryIds.length > 0 ? "Manual exclusion list" : "Standard baseline"}
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
                            <p className="text-[11px] text-light-gray-70 italic max-w-xs">
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
                </div>
            </div>

            {/* Integrated Guidance Info */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
                <div className="flex flex-col gap-5">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-white-1 font-bold text-sm tracking-tight uppercase tracking-widest">Analysis guide</h4>
                            <p className="text-light-gray-70 text-xs">Helpful pointers for generating and managing your subproject insights.</p>
                        </div>
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
    );
};

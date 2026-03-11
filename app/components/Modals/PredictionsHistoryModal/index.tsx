import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { X, CheckCircle, Clock, RefreshCw } from "lucide-react";
import type { PredictionRun } from "~/services/api/predictions/types";
import type { PredictionsHistoryModalProps } from "./types";

export const PredictionsHistoryModal: React.FC<PredictionsHistoryModalProps> = (props: PredictionsHistoryModalProps) => {
    const { projectId, modelId, onClose } = props;
    const { t } = useTranslation();
    const fetcher = useFetcher<{ predictionRuns: PredictionRun[] }>();

    const fetchUrl = `/projects/${projectId}/models/${modelId}/predictions`;

    useEffect(() => {
        if (fetcher.state === "idle" && !fetcher.data) {
            fetcher.load(fetchUrl);
        }
    }, [fetcher, fetchUrl]);

    const handleRefresh = () => {
        fetcher.load(fetchUrl);
    };

    const runs = fetcher.data?.predictionRuns || [];
    const isLoading = fetcher.state === "loading";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-surface-dark border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/20">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-white-1 uppercase tracking-widest">{t("projects.entries.predictionHistory", "Prediction History")}</h2>
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg text-light-gray-70 hover:text-white-1 hover:bg-white/10 transition-colors disabled:opacity-50"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-light-gray-70 hover:text-white-1 hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative min-h-[200px]">
                    {isLoading && !fetcher.data ? (
                        <div className="flex items-center justify-center h-full min-h-[150px]">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : runs.length === 0 ? (
                        <div className="text-center py-12 text-light-gray-60 flex items-center justify-center min-h-[150px]">
                            {t("projects.entries.predictionNoRuns", "No prediction runs found.")}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {runs.map((run) => {
                                const progressPercent = run.totalEntries > 0 ? Math.round((run.processedEntries / run.totalEntries) * 100) : 0;
                                return (
                                    <div key={run.id} className="bg-background-dark p-5 rounded-xl border border-white/5 flex flex-col gap-4 shadow-sm">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="text-white-1 font-bold font-mono text-sm">#{run.id.split("_")[1]}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase
                           ${run.status === "Completed" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                                        run.status === "Running" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.3)]" :
                                                            "bg-red-500/10 text-red-500 border border-red-500/20"
                                                    }`}>
                                                    {t(`projects.entries.status${run.status}`, run.status)}
                                                </span>
                                            </div>
                                            <span className="text-light-gray-60 text-xs font-medium">
                                                {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(run.createdAt))}
                                            </span>
                                        </div>

                                        {run.status === "Running" ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-end text-xs text-light-gray-60 font-bold uppercase tracking-wider">
                                                    <span>{t("projects.entries.predictionProgress", "Progress")}</span>
                                                    <span>{run.processedEntries} / {run.totalEntries} ({progressPercent}%)</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                                                    <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-2 text-sm text-light-gray-60 font-medium">
                                                    {run.status === "Completed" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-red-500" />}
                                                    <span>{run.processedEntries} / {run.totalEntries} processed</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import React from "react";
import { useTranslation } from "react-i18next";
import { X, CheckCircle, Clock } from "lucide-react";
import type { PredictionRun } from "~/services/api/predictions/types";

interface PredictionsHistoryModalProps {
    runs: PredictionRun[];
    onClose: () => void;
}

export const PredictionsHistoryModal: React.FC<PredictionsHistoryModalProps> = ({ runs, onClose }) => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-dark border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white-1">{t("projects.entries.predictionHistory", "Prediction History")}</h2>
                    <button onClick={onClose} className="text-light-gray-60 hover:text-white-1 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {runs.length === 0 ? (
                        <div className="text-center py-8 text-light-gray-60">
                            {t("projects.entries.predictionNoRuns", "No prediction runs found.")}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {runs.map((run) => {
                                const progressPercent = run.totalEntries > 0 ? Math.round((run.processedEntries / run.totalEntries) * 100) : 0;
                                return (
                                    <div key={run.id} className="bg-background-dark p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white-1 font-semibold text-sm">Run #{run.id.split("_")[1]}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                           ${run.status === "Completed" ? "bg-green-500/10 text-green-500" :
                                                        run.status === "Running" ? "bg-blue-500/10 text-blue-400" :
                                                            "bg-red-500/10 text-red-500"
                                                    }`}>
                                                    {run.status}
                                                </span>
                                            </div>
                                            <span className="text-light-gray-60 text-xs">
                                                {new Date(run.createdAt).toLocaleString()}
                                            </span>
                                        </div>

                                        {run.status === "Running" ? (
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between text-xs text-light-gray-60">
                                                    <span>{t("projects.entries.predictionProgress", "Progress")}</span>
                                                    <span>{run.processedEntries} / {run.totalEntries} ({progressPercent}%)</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-light-gray-70">
                                                {run.status === "Completed" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-red-500" />}
                                                <span>{run.processedEntries} / {run.totalEntries} processed</span>
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

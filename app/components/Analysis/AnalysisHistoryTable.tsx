import { useTranslation } from "react-i18next";
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileBarChart,
    Download,
    RefreshCw,
    Info
} from "lucide-react";
import type { AnalysisRun } from "~/services/api/analysis/types";
import type { AnalysisHistoryTableProps } from "./types";

export const AnalysisHistoryTable = ({
    history,
    isRefreshing,
    onRefresh,
    onViewReport,
    onDownloadPDF
}: AnalysisHistoryTableProps) => {
    const { t } = useTranslation();

    const getStatusIcon = (status: AnalysisRun["status"]) => {
        switch (status) {
            case "completed":
                return <CheckCircle2 className="text-green-400" size={18} />;
            case "processing":
                return <Loader2 className="text-blue-400 animate-spin" size={18} />;
            case "failed":
                return <AlertCircle className="text-red-400" size={18} />;
        }
    };

    const getStatusBadge = (status: AnalysisRun["status"]) => {
        switch (status) {
            case "completed":
                return "bg-green-400/10 text-green-400 border-green-400/20";
            case "processing":
                return "bg-blue-400/10 text-blue-400 border-blue-400/20";
            case "failed":
                return "bg-red-400/10 text-red-400 border-red-400/20";
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    <h3 className="text-lg font-bold text-white-1 uppercase tracking-tight">{t("projects.analysis.historyTable.title")}</h3>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-light-gray-60 hover:text-white-1 transition-colors bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50"
                >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                    {t("projects.analysis.historyTable.refresh")}
                </button>
            </div>

            <div className="bg-surface-dark border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black/20 border-b border-white/5">
                        <tr className="text-[0.65rem] font-bold text-light-gray-70 uppercase tracking-widest leading-none">
                            <th className="py-4 px-6">{t("projects.analysis.historyTable.columns.idAndTimestamp")}</th>
                            <th className="py-4 px-6 text-center">{t("projects.analysis.historyTable.columns.status")}</th>
                            <th className="py-4 px-6 text-center">{t("projects.analysis.historyTable.columns.exclusions")}</th>
                            <th className="py-4 px-6 text-right">{t("projects.analysis.historyTable.columns.actions")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-light-gray-50 italic">
                                    {t("projects.analysis.historyTable.noHistory")}
                                </td>
                            </tr>
                        ) : (
                            history.map((run) => (
                                <tr key={run.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-mono text-white-1 font-semibold">{run.id.split('_')[1]}</span>
                                            <span className="text-[10px] text-light-gray-60 uppercase tracking-widest leading-none">
                                                {new Date(run.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {getStatusIcon(run.status)}
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(run.status)}`}>
                                                {run.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-bold text-white-1">
                                                {run.parameters.excludedEntryIds.length}
                                            </span>
                                            <span className="text-[10px] text-light-gray-70 uppercase font-medium">{t("projects.analysis.historyTable.entriesExcluded")}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-3 transition-opacity">
                                            {run.status === "completed" && (
                                                <>
                                                    <button
                                                        onClick={() => onViewReport?.(run)}
                                                        className="text-xs font-bold text-light-gray-60 hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                                                    >
                                                        <FileBarChart size={14} />
                                                        {t("projects.analysis.historyTable.viewReport")}
                                                    </button>
                                                    <div className="w-px h-3 bg-white/10" />
                                                    <button
                                                        onClick={() => onDownloadPDF?.(run.id)}
                                                        className="text-xs font-bold text-light-gray-60 hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                                                    >
                                                        <Download size={14} />
                                                        {t("projects.analysis.historyTable.pdf")}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-400/5 border border-blue-400/10 p-4 rounded-xl flex gap-3 items-start">
                <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-blue-200/60 uppercase tracking-widest font-medium">
                    {t("projects.analysis.historyTable.info")}
                </p>
            </div>
        </div>
    );
};

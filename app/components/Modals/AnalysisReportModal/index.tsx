import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { X, FileBarChart, Loader2, BarChart3, XSquare, CheckCircle2 } from "lucide-react";
import type { AnalysisRun } from "~/services/api/analysis/types";
import type { AnalysisReportModalProps } from "./types";

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

export const AnalysisReportModal = (props: AnalysisReportModalProps) => {
    const { isOpen, onClose, run: initialRun } = props;
    const { t } = useTranslation();
    const [run, setRun] = useState<AnalysisRun | null>(initialRun);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setRun(initialRun);
        setError(null);

        if (isOpen && initialRun && !initialRun.result && initialRun.status === "completed") {
            const fetchFullRun = async () => {
                setIsLoading(true);
                try {
                    // Extract project and model from run ID if needed, or use placeholders for the path
                    // Actually, our API path is /api/v1/projects/:id/models/:mid/analysis/:runId
                    // But we can just use the runId if we change the route or use a simpler one.
                    // Let's use the one we created. We need the params.
                    // Wait, the run object has subprojectId.
                    // For now, let's assume a simplified fetch or use the runId in the path.
                    const response = await fetch(`/api/v1/projects/0/models/${initialRun.subprojectId}/analysis/${initialRun.id}`);
                    if (!response.ok) throw new Error("Failed to fetch report data");
                    const fullRun = await response.json();
                    setRun(fullRun);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchFullRun();
        }
    }, [isOpen, initialRun]);

    if (!isOpen || !run) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4">
                <div className="bg-surface-dark border border-white/10 rounded-2xl p-12 shadow-2xl flex flex-col items-center gap-6 max-w-md w-full animate-in zoom-in-95 duration-200">
                    <Loader2 size={48} className="text-primary animate-spin" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white-1 mb-2">{t('projects.analysis.reportModal.loading.title', "Loading Report")}</h3>
                        <p className="text-light-gray-70 text-sm">{t('projects.analysis.reportModal.loading.desc', "Fetching detailed analysis results...")}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4">
                <div className="bg-surface-dark border border-white/10 rounded-2xl p-12 shadow-2xl flex flex-col items-center gap-6 max-w-md w-full">
                    <XSquare size={48} className="text-bittersweet-shimmer" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white-1 mb-2">{t('common.error')}</h3>
                        <p className="text-light-gray-70 text-sm">{error}</p>
                    </div>
                    <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 text-white-1 rounded-lg font-bold transition-colors">
                        {t('projects.analysis.reportModal.close')}
                    </button>
                </div>
            </div>
        );
    }

    if (run.status === "processing") {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4">
                <div className="bg-surface-dark border border-white/10 rounded-2xl p-12 shadow-2xl flex flex-col items-center gap-6 max-w-md w-full animate-in zoom-in-95 duration-200">
                    <Loader2 size={48} className="text-primary animate-spin" />
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white-1 mb-2">{t('projects.analysis.reportModal.processing.title')}</h3>
                        <p className="text-light-gray-70 text-sm">{t('projects.analysis.reportModal.processing.desc')}</p>
                    </div>
                    <button onClick={onClose} className="mt-4 px-6 py-2 bg-white/5 hover:bg-white/10 text-white-1 rounded-lg font-bold transition-colors">
                        {t('projects.analysis.reportModal.close')}
                    </button>
                </div>
            </div>
        );
    }

    if (!run.result) return null;

    const { result } = run;

    // Backwards compatibility for old runs in memory where insights was an array of strings
    const resolvedInsights: any = Array.isArray(result.insights)
        ? { topBehaviorId: "unknown", confidenceTrend: "medium" as const, verdictConcentration: "mixed" as const, legacyText: result.insights.join(" ") }
        : result.insights;

    // Formatting data for Recharts
    const barData = result.behaviorDistribution.map(item => ({
        name: t(`projects.behaviors.${item.behaviorId}`),
        count: item.count,
        percent: item.percentage
    }));

    const pieData = result.confidenceMetrics.distribution.map(item => ({
        name: t('projects.analysis.reportModal.confidenceChart.score', { range: item.range }),
        value: item.count
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background-dark/90 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-surface-dark border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-background-dark/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <FileBarChart size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-white-1 tracking-tight">{t('projects.analysis.reportModal.title')}</h2>
                            <p className="text-light-gray-60 text-sm md:text-base font-medium flex items-center gap-2 mt-1">
                                <span className="font-mono text-white-1">{run.id.split('_')[1]}</span>
                                <span className="opacity-50">•</span>
                                <span>{new Date(run.timestamp).toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-light-gray-60 hover:text-white-1 hover:bg-white/5 rounded-full transition-colors group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="flex flex-col gap-10 max-w-4xl mx-auto">

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                                <span className="text-xs font-bold text-light-gray-60 uppercase tracking-widest leading-none flex items-center gap-2">
                                    <BarChart3 size={12} className="text-light-gray-60" />
                                    {t('projects.analysis.reportModal.totalAnalyzed')}
                                </span>
                                <span className="text-4xl font-extrabold text-white-1">{result.analyzedEntries}</span>
                                <span className="text-[11px] text-light-gray-70 font-semibold mt-1">{t('projects.analysis.reportModal.outOfAvailable', { total: result.totalEntries })}</span>
                                <div className="absolute top-5 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><BarChart3 size={64} /></div>
                            </div>
                            <div className="bg-bittersweet-shimmer/10 border border-bittersweet-shimmer/20 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                                <span className="text-xs font-bold text-bittersweet-shimmer/80 uppercase tracking-widest leading-none flex items-center gap-2">
                                    <XSquare size={12} />
                                    {t('projects.analysis.reportModal.excluded')}
                                </span>
                                <span className="text-4xl font-extrabold text-bittersweet-shimmer">{result.excludedEntries}</span>
                                <span className="text-[11px] text-bittersweet-shimmer/60 font-semibold mt-1">{t('projects.analysis.reportModal.excludedDesc')}</span>
                                <div className="absolute top-5 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><XSquare size={64} /></div>
                            </div>
                            <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col gap-2 relative overflow-hidden group">
                                <span className="text-xs font-bold text-primary/80 uppercase tracking-widest leading-none flex items-center gap-2">
                                    <CheckCircle2 size={12} />
                                    {t('projects.analysis.reportModal.confidence')}
                                </span>
                                <span className="text-4xl font-extrabold text-primary">{Math.round(result.confidenceMetrics.average * 100)}%</span>
                                <span className="text-[11px] text-primary/60 font-semibold mt-1">{t('projects.analysis.reportModal.median', { value: Math.round(result.confidenceMetrics.median * 100) })}</span>
                                <div className="absolute top-5 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><CheckCircle2 size={64} /></div>
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Story / Insights */}
                        <div className="flex flex-col gap-6">
                            <h3 className="text-xl font-bold text-white-1 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                {t('projects.analysis.reportModal.summary')}
                            </h3>
                            <div className="columns-1 md:columns-2 gap-6 space-y-6">
                                {resolvedInsights.legacyText ? (
                                    <div className="break-inside-avoid bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-white-1/90 leading-relaxed font-semibold shadow-sm hover:border-white/10 transition-colors">
                                        <p>{resolvedInsights.legacyText}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="break-inside-avoid bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-white-1/90 leading-relaxed font-semibold shadow-sm hover:border-white/10 transition-colors">
                                            <p>{t('projects.analysis.reportModal.insights.topBehavior', { behavior: t(`projects.behaviors.${resolvedInsights.topBehaviorId}`) })}</p>
                                        </div>
                                        <div className="break-inside-avoid bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-white-1/90 leading-relaxed font-semibold shadow-sm hover:border-white/10 transition-colors">
                                            <p>{resolvedInsights.confidenceTrend === 'high' ? t('projects.analysis.reportModal.insights.confidenceHigh') : resolvedInsights.confidenceTrend === 'medium' ? t('projects.analysis.reportModal.insights.confidenceMedium') : t('projects.analysis.reportModal.insights.confidenceLow')}</p>
                                        </div>
                                        {resolvedInsights.verdictConcentration !== 'mixed' && (
                                            <div className="break-inside-avoid bg-white/5 border border-white/5 p-5 rounded-2xl text-sm text-white-1/90 leading-relaxed font-semibold shadow-sm hover:border-white/10 transition-colors">
                                                <p>{resolvedInsights.verdictConcentration === 'positive' ? t('projects.analysis.reportModal.insights.verdictsPositive') : t('projects.analysis.reportModal.insights.verdictsNegative')}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Behavior Distribution Chart */}
                            <div className="flex flex-col gap-6 bg-background-dark/40 border border-white/5 p-6 rounded-2xl">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-white-1 font-bold text-lg">{t('projects.analysis.reportModal.behaviorChart.title')}</h4>
                                    <p className="text-xs text-light-gray-60 font-semibold">{t('projects.analysis.reportModal.behaviorChart.desc')}</p>
                                </div>
                                <div className="h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                contentStyle={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                            />
                                            <Bar dataKey="count" fill="var(--color-primary, #FFC107)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Confidence Distribution Chart */}
                            <div className="flex flex-col gap-6 bg-background-dark/40 border border-white/5 p-6 rounded-2xl">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-white-1 font-bold text-lg">{t('projects.analysis.reportModal.confidenceChart.title')}</h4>
                                    <p className="text-xs text-light-gray-60 font-semibold">{t('projects.analysis.reportModal.confidenceChart.desc')}</p>
                                </div>
                                <div className="h-[280px] w-full flex items-center justify-center relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#13131A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

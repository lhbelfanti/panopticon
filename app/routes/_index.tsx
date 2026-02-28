import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { getDashboardSummary, getRecentActivities } from "~/services/api/dashboard/index.server";
import { CopyPlus, FileText, Activity, Server, Zap, CheckCircle2, Folder, Globe, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
    return [
        { title: "Panopticon - Dashboard" },
        { name: "description", content: "Adverse Human Behaviour Analysis Platform" },
    ];
};

export async function loader() {
    const [summary, recentActivities] = await Promise.all([
        getDashboardSummary(),
        getRecentActivities()
    ]);
    return { summary, recentActivities };
}

export default function Index() {
    const { summary, recentActivities } = useLoaderData<typeof loader>();
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === "es" ? "en" : "es");
    };

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let interval = seconds / 86400;
        if (interval > 1) return t('relativeTime.daysAgo', { count: Math.floor(interval) });
        interval = seconds / 3600;
        if (interval > 1) return t('relativeTime.hoursAgo', { count: Math.floor(interval) });
        interval = seconds / 60;
        if (interval > 1) return t('relativeTime.minutesAgo', { count: Math.floor(interval) });
        return t('relativeTime.secondsAgo');
    };

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-white-1 mb-2 tracking-tight">
                        {t('dashboard.welcome')}
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-light-gray-70 text-lg flex items-center gap-3">
                            {t('dashboard.subtitle')}
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                v2.4.0
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Link
                    to="/projects/new"
                    className="group bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between min-h-[160px]"
                >
                    <div className="flex flex-col gap-3 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Folder size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white-1">{t('dashboard.newProject.title')}</h2>
                        </div>
                        <p className="text-light-gray-70 text-sm leading-relaxed pr-4 w-[70%]">
                            {t('dashboard.newProject.desc')}
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                        <span className="text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                            {t('dashboard.newProject.action')}
                        </span>
                    </div>
                </Link>

                <Link
                    to="/entries/new"
                    className="group bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between min-h-[160px]"
                >
                    <div className="flex flex-col gap-3 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Activity size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-white-1">{t('dashboard.newPrediction.title')}</h2>
                        </div>
                        <p className="text-light-gray-70 text-sm leading-relaxed pr-4 w-[70%]">
                            {t('dashboard.newPrediction.desc')}
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                        <span className="text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                            {t('dashboard.newPrediction.action')}
                        </span>
                    </div>
                </Link>
            </div>

            {/* Summary Grid (Shrunk) */}
            <h2 className="text-lg font-bold text-white-1 mb-6 flex items-center gap-2">
                {t('dashboard.summary.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">

                {/* Widget 1 */}
                <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-light-gray-70 text-sm font-medium tracking-tight">{t('dashboard.summary.tweetsAnalyzed')}</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FileText size={16} />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-extrabold text-white-1 tracking-tight">
                            {summary.tweetsAnalyzed.toLocaleString()}
                        </span>
                        <span className="text-light-gray-70 text-lg font-medium ml-1">
                            / 2,500
                        </span>
                        <div className="flex items-center gap-1 ml-4 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-lg text-green-400">
                            <TrendingUp size={14} />
                            <span className="font-bold text-sm">85%</span>
                        </div>
                    </div>
                </div>

                {/* Widget 2 */}
                <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-light-gray-70 text-sm font-medium tracking-tight">{t('dashboard.summary.activeProjects')}</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Folder size={16} />
                        </div>
                    </div>
                    <span className="text-3xl font-extrabold text-white-1 tracking-tight">
                        {summary.activeProjects}
                    </span>
                </div>

                {/* Widget 3 */}
                <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-light-gray-70 text-sm font-medium tracking-tight">{t('dashboard.summary.averagePrecision')}</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <span className="text-3xl font-extrabold text-white-1 tracking-tight">
                        {summary.averagePrecision}%
                    </span>
                </div>

                {/* Widget 4: Most Used Model */}
                <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-light-gray-70 text-sm font-medium tracking-tight">{t('dashboard.summary.mostUsedModel')}</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Zap size={16} />
                        </div>
                    </div>
                    <span className="text-xl font-extrabold text-white-1 tracking-tight">
                        LLaMA-3-8B
                    </span>
                </div>

                {/* Widget 5: Remaining Tokens (Inline width) */}
                <div className="bg-surface-dark p-4 rounded-xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-light-gray-70 text-sm font-medium tracking-tight">{t('dashboard.summary.remainingTokens')}</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Zap size={16} />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        <span className="text-2xl font-extrabold text-white-1 tracking-tight">
                            {summary.remainingTokens ? (summary.remainingTokens / 1000000).toFixed(1) + 'M' : t('dashboard.summary.unlimited')}
                        </span>

                        {summary.remainingTokens !== undefined && (
                            <div className="flex-1 bg-background-dark rounded-full h-1.5 shadow-inner overflow-hidden border border-white/5 mt-1">
                                <div
                                    className="bg-primary h-1.5 rounded-full"
                                    style={{ width: `${Math.min((summary.remainingTokens / 5000000) * 100, 100)}%` }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Recent Activity */}
            <h2 className="text-lg font-bold text-white-1 mb-6">
                {t('dashboard.recentActivity.title')}
            </h2>
            <div className="bg-surface-dark rounded-2xl border border-white/5 shadow-md overflow-hidden mb-8">
                {recentActivities.map((activity: any, idx) => {
                    let statusKey = 'done';
                    if (activity.status) {
                        statusKey = activity.status;
                    } else if (activity.type === 'project_created') {
                        statusKey = 'created';
                    } else if (activity.type === 'predictions_made') {
                        statusKey = 'processing';
                    }

                    return (
                        <div
                            key={activity.id}
                            className={`p-4 flex gap-4 items-center hover:bg-white/5 transition-colors ${idx !== recentActivities.length - 1 ? 'border-b border-white/5' : ''}`}
                        >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                <ActivityIcon type={activity.type} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white-1 text-sm truncate">{activity.description}</p>
                                <p className="text-xs text-light-gray-70 mt-0.5">
                                    {getTimeAgo(activity.timestamp)}
                                </p>
                            </div>
                            <div className="flex-shrink-0 pl-4">
                                <span className="text-[10px] font-medium tracking-wider uppercase bg-white/5 text-light-gray-70 px-2 py-1 rounded-md border border-white/10">
                                    {t(`status.${statusKey}`)}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {recentActivities.length === 0 && (
                    <div className="p-8 text-center text-light-gray-70 flex flex-col items-center">
                        <Activity className="w-10 h-10 opacity-20 mb-3" />
                        <p className="text-sm">{t('dashboard.recentActivity.noActivity')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityIcon({ type }: { type: string }) {
    switch (type) {
        case 'project_created': return <Folder size={14} />;
        case 'csv_uploaded':
        case 'tweets_added': return <FileText size={14} />;
        case 'predictions_made': return <Activity size={14} />;
        default: return <Activity size={14} />;
    }
}

function getActivityColor(type: string): string {
    switch (type) {
        case 'project_created': return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
        case 'csv_uploaded':
        case 'tweets_added': return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        case 'predictions_made': return "bg-primary/10 text-primary border border-primary/20";
        default: return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
    }
}

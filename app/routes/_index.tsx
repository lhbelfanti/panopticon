import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { getDashboardSummary, getRecentActivities } from "~/services/api/dashboard/index.server";
import { PlusCircle, FileText, Activity, MessageCircle, Server, Zap, CheckCircle2 } from "lucide-react";

export const meta: MetaFunction = () => {
    return [
        { title: "Panopticon - Dashboard" },
        { name: "description", content: "Adverse Human Behaviour Analysis Platform" },
    ];
};

export async function loader() {
    // Fetch mock data concurrently
    const [summary, recentActivities] = await Promise.all([
        getDashboardSummary(),
        getRecentActivities()
    ]);

    return { summary, recentActivities };
}

export default function Index() {
    const { summary, recentActivities } = useLoaderData<typeof loader>();

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white-1 flex items-baseline gap-3">
                        Bienvenido a Panopticon
                        <span className="text-sm font-normal text-bittersweet-shimmer bg-bittersweet-shimmer/10 px-2 py-0.5 rounded-md">
                            v1.0.0
                        </span>
                    </h1>
                    <p className="text-light-gray-70 mt-2">
                        Plataforma de análisis de comportamientos humanos adversos
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/entries/new"
                        className="flex items-center gap-2 bg-[var(--color-eerie-black-1)] hover:bg-jet text-white-1 px-4 py-2.5 rounded-lg border border-[var(--color-eerie-black-1)] transition-colors"
                    >
                        <PlusCircle size={18} />
                        <span className="font-medium">Nueva Entrada</span>
                    </Link>
                    <Link
                        to="/projects/new"
                        className="flex items-center gap-2 bg-bittersweet-shimmer hover:bg-orange-crayola text-white-1 px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-bittersweet-shimmer/20"
                    >
                        <FileText size={18} />
                        <span className="font-medium">Nuevo Proyecto</span>
                    </Link>
                </div>
            </div>

            {/* Summary Grid */}
            <h2 className="text-sm font-semibold text-light-gray-70 uppercase tracking-wider mb-4">
                Resumen de Actividad
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                {/* Widget 1 */}
                <div className="bg-onyx p-6 rounded-2xl border border-[var(--color-eerie-black-1)] shadow-md flex justify-between items-start hover:border-bittersweet-shimmer transition-colors">
                    <div className="flex flex-col">
                        <span className="text-light-gray-70 text-sm font-medium mb-1">Tweets Analizados</span>
                        <span className="text-3xl font-bold text-white-1">
                            {summary.tweetsAnalyzed.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <MessageCircle size={20} />
                    </div>
                </div>

                {/* Widget 2 */}
                <div className="bg-onyx p-6 rounded-2xl border border-[var(--color-eerie-black-1)] shadow-md flex justify-between items-start hover:border-bittersweet-shimmer transition-colors">
                    <div className="flex flex-col">
                        <span className="text-light-gray-70 text-sm font-medium mb-1">Proyectos Activos</span>
                        <span className="text-3xl font-bold text-white-1">
                            {summary.activeProjects}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-vegas-gold/10 flex items-center justify-center text-vegas-gold">
                        <FolderFilled size={20} />
                    </div>
                </div>

                {/* Widget 3 */}
                <div className="bg-onyx p-6 rounded-2xl border border-[var(--color-eerie-black-1)] shadow-md flex justify-between items-start hover:border-bittersweet-shimmer transition-colors">
                    <div className="flex flex-col">
                        <span className="text-light-gray-70 text-sm font-medium mb-1">Precisión Promedio</span>
                        <span className="text-3xl font-bold text-white-1">
                            {summary.averagePrecision}%
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                {/* Widget 4 */}
                <div className="bg-onyx p-6 rounded-2xl border border-[var(--color-eerie-black-1)] shadow-md flex justify-between items-start hover:border-bittersweet-shimmer transition-colors">
                    <div className="flex flex-col">
                        <span className="text-light-gray-70 text-sm font-medium mb-1">Tokens Restantes</span>
                        <span className="text-3xl font-bold text-white-1">
                            {summary.remainingTokens?.toLocaleString() ?? 'Ilimitado'}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-yellow-crayola/10 flex items-center justify-center text-orange-yellow-crayola">
                        <Zap size={20} />
                    </div>
                </div>

            </div>

            {/* Recent Activity */}
            <h2 className="text-sm font-semibold text-light-gray-70 uppercase tracking-wider mb-4">
                Actividad Reciente
            </h2>
            <div className="bg-onyx rounded-2xl border border-[var(--color-eerie-black-1)] shadow-md overflow-hidden">
                {recentActivities.map((activity, idx) => (
                    <div
                        key={activity.id}
                        className={`p-4 flex gap-4 items-start hover:bg-jet transition-colors ${idx !== recentActivities.length - 1 ? 'border-b border-[var(--color-eerie-black-1)]' : ''}`}
                    >
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                            <ActivityIcon type={activity.type} />
                        </div>
                        <div className="flex-1">
                            <p className="text-white-1 text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-light-gray-70 mt-1">
                                {new Date(activity.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}

                {recentActivities.length === 0 && (
                    <div className="p-8 text-center text-light-gray-70">
                        No hay actividad reciente.
                    </div>
                )}
            </div>
        </div>
    );
}

function FolderFilled({ size }: { size: number }) {
    // Simple lucide wrapper since FolderFilled doesn't exist out of the box
    // using Server to represent something filled 
    return <Server size={size} />;
}

function ActivityIcon({ type }: { type: string }) {
    switch (type) {
        case 'project_created': return <FileText size={16} />;
        case 'csv_uploaded': return <Server size={16} />;
        case 'tweets_added': return <MessageCircle size={16} />;
        case 'predictions_made': return <Activity size={16} />;
        default: return <Activity size={16} />;
    }
}

function getActivityColor(type: string): string {
    switch (type) {
        case 'project_created': return "bg-vegas-gold/20 text-vegas-gold";
        case 'csv_uploaded': return "bg-blue-500/20 text-blue-400";
        case 'tweets_added': return "bg-purple-500/20 text-purple-400";
        case 'predictions_made': return "bg-bittersweet-shimmer/20 text-bittersweet-shimmer";
        default: return "bg-gray-500/20 text-gray-400";
    }
}

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
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-white-1 mb-2 tracking-tight">
                        ¡Bienvenido! ¿Qué deseas hacer hoy?
                    </h1>
                    <p className="text-light-gray-70 text-lg flex items-center gap-3">
                        Plataforma de análisis de texto avanzada
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            v2.4.0
                        </span>
                    </p>
                </div>
            </div>

            {/* Quick Actions (Stitch-inspired layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Link
                    to="/projects/new"
                    className="group bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/5 flex flex-col gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white-1">Nuevo Proyecto</h2>
                    </div>
                    <p className="text-light-gray-70 text-sm leading-relaxed">
                        Configura un nuevo entorno de análisis, importa datasets y define tus objetivos de minería de texto.
                    </p>
                </Link>

                <Link
                    to="/entries/new"
                    className="group bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-primary/5 flex flex-col gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white-1">Nueva Predicción</h2>
                    </div>
                    <p className="text-light-gray-70 text-sm leading-relaxed">
                        Ejecuta modelos de IA sobre textos en tiempo real para predecir sentimientos, categorías o entidades.
                    </p>
                </Link>
            </div>

            {/* Summary Grid */}
            <h2 className="text-lg font-bold text-white-1 mb-6 flex items-center gap-2">
                Resumen de actividad
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

                {/* Widget 1 */}
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-light-gray-70 font-medium tracking-tight">Tweets analizados</span>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <MessageCircle size={20} />
                        </div>
                    </div>
                    <span className="text-4xl font-extrabold text-white-1 tracking-tight">
                        {summary.tweetsAnalyzed.toLocaleString()}
                    </span>
                </div>

                {/* Widget 2 */}
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-light-gray-70 font-medium tracking-tight">Proyectos activos</span>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <FolderFilled size={20} />
                        </div>
                    </div>
                    <span className="text-4xl font-extrabold text-white-1 tracking-tight">
                        {summary.activeProjects}
                    </span>
                </div>

                {/* Widget 3 */}
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-light-gray-70 font-medium tracking-tight">Precisión promedio</span>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <span className="text-4xl font-extrabold text-white-1 tracking-tight">
                        {summary.averagePrecision}%
                    </span>
                </div>

                {/* Widget 4: Remaining Tokens */}
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 shadow-md flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className="text-light-gray-70 font-medium tracking-tight">Tokens restantes</span>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="flex items-end gap-2 relative z-10">
                        <span className="text-4xl font-extrabold text-white-1 tracking-tight">
                            {summary.remainingTokens ? (summary.remainingTokens / 1000000).toFixed(1) + 'M' : 'Ilimitado'}
                        </span>
                    </div>

                    {/* Progress Bar Injection */}
                    {summary.remainingTokens !== undefined && (
                        <div className="mt-5 w-full bg-white/5 rounded-full h-2 shadow-inner overflow-hidden relative z-10">
                            <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${Math.min((summary.remainingTokens / 5000000) * 100, 100)}%` }}
                            ></div>
                        </div>
                    )}
                </div>

            </div>

            {/* Recent Activity */}
            <h2 className="text-lg font-bold text-white-1 mb-6">
                Actividad reciente
            </h2>
            <div className="bg-surface-dark rounded-2xl border border-white/5 shadow-md overflow-hidden mb-8">
                {recentActivities.map((activity, idx) => (
                    <div
                        key={activity.id}
                        className={`p-5 flex gap-5 items-start hover:bg-white/5 transition-colors ${idx !== recentActivities.length - 1 ? 'border-b border-white/5' : ''}`}
                    >
                        <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary border border-primary/20`}>
                            <ActivityIcon type={activity.type} />
                        </div>
                        <div className="flex-1">
                            <p className="text-white-1 font-semibold">{activity.description}</p>
                            <p className="text-sm text-light-gray-70 mt-1">
                                {new Date(activity.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}

                {recentActivities.length === 0 && (
                    <div className="p-10 text-center text-light-gray-70 flex flex-col items-center">
                        <Activity className="w-12 h-12 opacity-20 mb-3" />
                        <p>No hay actividad reciente.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function FolderFilled({ size }: { size: number }) {
    return <Server size={size} />;
}

function ActivityIcon({ type }: { type: string }) {
    switch (type) {
        case 'project_created': return <FileText size={18} />;
        case 'csv_uploaded': return <Server size={18} />;
        case 'tweets_added': return <MessageCircle size={18} />;
        case 'predictions_made': return <Activity size={18} />;
        default: return <Activity size={18} />;
    }
}

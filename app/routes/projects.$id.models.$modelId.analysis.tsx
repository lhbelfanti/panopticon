import { useState, useEffect } from "react";
import {
    Link,
    useLoaderData,
    useLocation,
    useNavigation,
    useSubmit,
} from "react-router";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Folder,
    Box,
    BarChart3,
    Zap,
    History
} from "lucide-react";

import { getProjectById } from "~/services/api/projects/index.server";
import {
    getSubprojectAnalysisHistory,
    triggerProjectAnalysis
} from "~/services/api/analysis/index.server";

import { AnalysisHistoryTable } from "~/components/Analysis/AnalysisHistoryTable";
import { NewAnalysisForm } from "~/components/Analysis/NewAnalysisForm";
import { AnalysisReportModal } from "~/components/Modals/AnalysisReportModal";
import { generateAnalysisPDF } from "~/utils/pdfGenerator";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { AnalysisRun } from "~/services/api/analysis/types";

export const meta = () => [{ title: "Panopticon | Analysis" }];

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id, modelId } = params;
    if (!id || !modelId) throw new Response("Not Found", { status: 404 });

    const project = await getProjectById(parseInt(id));
    if (!project) throw new Response("Not Found", { status: 404 });

    const history = await getSubprojectAnalysisHistory(modelId);

    return { project, modelId, history };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { modelId } = params;
    if (!modelId) throw new Response("Bad Request", { status: 400 });

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "trigger_analysis") {
        const excludedIdsStr = formData.get("excludedIds") as string;
        const excludedIds = excludedIdsStr ? JSON.parse(excludedIdsStr) : [];
        await triggerProjectAnalysis(modelId, excludedIds);
        return { success: true };
    }

    return null;
};

const AnalysisPage = () => {
    const { project, modelId, history } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const location = useLocation();
    const submit = useSubmit();
    const nav = useNavigation();

    // Catch passed state from EntriesTable
    const passedExcludedIds = location.state?.excludedEntryIds || [];

    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [localHistory, setLocalHistory] = useState<AnalysisRun[]>(history);
    const [selectedRun, setSelectedRun] = useState<AnalysisRun | null>(null);

    const isSubmitting = nav.formData?.get("intent") === "trigger_analysis";

    // Auto-switch to history if a submission completes
    useEffect(() => {
        if (nav.state === "idle" && !isSubmitting && nav.formData) {
            setActiveTab("history");
        }
    }, [nav.state, isSubmitting, nav.formData]);

    useEffect(() => {
        setLocalHistory(history);
    }, [history]);

    const handleGenerate = (excludedIds: string[]) => {
        const formData = new FormData();
        formData.append("intent", "trigger_analysis");
        formData.append("excludedIds", JSON.stringify(excludedIds));
        submit(formData, { method: "post" });
    };

    const containerClasses = "flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative";
    const headerClasses = "flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-10 pb-6 border-b border-white/5";

    return (
        <div className={containerClasses}>
            {/* Navigation Header */}
            <div className={headerClasses}>
                <Link
                    to={`/projects/${project.id}/models/${modelId}`}
                    className="flex items-center gap-2 text-primary hover:text-white-1 transition-colors text-sm font-semibold max-w-max"
                >
                    <ArrowLeft size={16} />
                    Back to subproject
                </Link>

                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white-1 mb-2 tracking-tight flex items-center gap-4">
                            <BarChart3 size={36} className="text-primary" />
                            Subproject Analysis
                        </h1>
                        <nav className="flex items-center gap-3 text-light-gray-50 font-medium">
                            <Link to={`/projects/${project.id}`} className="hover:text-yellow-400 flex items-center gap-1.5 transition-colors">
                                <Folder size={18} />
                                {project.name}
                            </Link>
                            <span className="opacity-30">/</span>
                            <Link to={`/projects/${project.id}/models/${modelId}`} className="hover:text-primary flex items-center gap-1.5 transition-colors text-white-1">
                                <Box size={18} />
                                {t(`projects.models.${modelId}`)}
                            </Link>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Tab Navigation (Centered on top of content) */}
            <div className="flex justify-center mb-8">
                <div className="flex bg-surface-dark border border-white/5 p-1 rounded-xl shadow-inner h-12">
                    <button
                        onClick={() => setActiveTab("new")}
                        className={`flex items-center gap-2 px-6 rounded-lg text-sm font-bold transition-all ${activeTab === "new"
                            ? "bg-primary/10 text-primary shadow-md border border-primary/20"
                            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <Zap size={16} />
                        New analysis
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-6 rounded-lg text-sm font-bold transition-all ${activeTab === "history"
                            ? "bg-primary/10 text-primary shadow-md border border-primary/20"
                            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <History size={16} />
                        History
                    </button>
                </div>
            </div>

            {/* Tab Panels */}
            {activeTab === "new" ? (
                <NewAnalysisForm
                    subprojectId={modelId}
                    excludedEntryIds={passedExcludedIds}
                    isSubmitting={isSubmitting}
                    onSubmit={handleGenerate}
                />
            ) : (
                <div className="max-w-6xl mx-auto py-6">
                    <AnalysisHistoryTable
                        history={localHistory}
                        isRefreshing={nav.state === "loading"}
                        onRefresh={() => submit(null, { replace: true })}
                        onViewReport={(run) => setSelectedRun(run)}
                        onDownloadPDF={(runId) => {
                            const runData = localHistory.find(r => r.id === runId);
                            if (runData) generateAnalysisPDF(runData, project.name);
                        }}
                    />
                </div>
            )}

            <AnalysisReportModal
                isOpen={selectedRun !== null}
                onClose={() => setSelectedRun(null)}
                run={selectedRun}
            />
        </div>
    );
};

export default AnalysisPage;

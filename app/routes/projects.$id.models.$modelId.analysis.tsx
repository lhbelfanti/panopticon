import { useState, useEffect } from "react";
import {
    Link,
    useLoaderData,
    useLocation,
    useNavigation,
    useSubmit,
    useActionData
} from "react-router";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    Folder,
    Box,
    BarChart3,
    Zap,
    History,
    X,
    XSquare
} from "lucide-react";
import { Breadcrumb } from "~/components/Breadcrumb";

import { getProjectById } from "~/services/api/projects/index.server";
import {
    getSubprojectAnalysisHistory,
    triggerProjectAnalysis
} from "~/services/api/analysis/index.server";
import { getEntries } from "~/services/api/entries/index.server";

import { AnalysisHistoryTable } from "~/components/Analysis/AnalysisHistoryTable";
import { NewAnalysisForm } from "~/components/Analysis/NewAnalysisForm";
import EntriesTable from "~/components/EntriesTable";
import { AnalysisReportModal } from "~/components/Modals/AnalysisReportModal";
import { generateAnalysisPDF } from "~/utils/pdfGenerator";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { AnalysisRun } from "~/services/api/analysis/types";

export const meta = () => [{ title: "Panopticon | Analysis" }];

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const { id, modelId } = params;
    if (!id || !modelId) throw new Response("Not Found", { status: 404 });

    const project = await getProjectById(parseInt(id));
    if (!project) throw new Response("Not Found", { status: 404 });

    const history = await getSubprojectAnalysisHistory(modelId);

    const url = new URL(request.url);
    const filterCol = (url.searchParams.get("filterCol") || "id") as any;
    const filterVal = url.searchParams.get("filterVal") || "";
    const filterOp = (url.searchParams.get("filterOp") || "") as any;
    const filterBias = parseFloat(url.searchParams.get("filterBias") || "0");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10;

    const entriesData = await getEntries({
        projectId: parseInt(id),
        modelId,
        page,
        limit,
        filterCol,
        filterVal,
        filterOp,
        filterBias,
    });

    return { project, modelId, history, entriesData, filterCol, filterVal, filterOp, filterBias };
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
    const { project, modelId, history, entriesData, filterCol, filterVal, filterOp, filterBias } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const { t } = useTranslation();
    const location = useLocation();
    const submit = useSubmit();
    const nav = useNavigation();

    // Catch passed state from EntriesTable (legacy support for navigation from entries table)
    const passedExcludedIds = location.state?.excludedEntryIds || [];

    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [localHistory, setLocalHistory] = useState<AnalysisRun[]>(history);
    const [selectedRun, setSelectedRun] = useState<AnalysisRun | null>(null);

    // Exclusion Modal State
    // Exclusion Modal State
    const [showExclusionModal, setShowExclusionModal] = useState(false);
    const [excludedEntryIds, setExcludedEntryIds] = useState<string[]>(passedExcludedIds);

    const handleOpenExclusions = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Wait for smooth scroll to finish before opening the modal and locking scroll
        setTimeout(() => {
            document.body.style.overflow = "hidden";
            setShowExclusionModal(true);
        }, 400);
    };

    const handleCloseExclusions = () => {
        document.body.style.overflow = "unset";
        setShowExclusionModal(false);
    };

    useEffect(() => {
        if (passedExcludedIds.length > 0) {
            setExcludedEntryIds(passedExcludedIds);
        }
    }, [passedExcludedIds]);

    const isSubmitting = nav.formData?.get("intent") === "trigger_analysis";

    // Auto-switch to history if a submission completes successfully
    useEffect(() => {
        if (actionData?.success && nav.state === "idle" && !isSubmitting) {
            setActiveTab("history");
        }
    }, [actionData, nav.state, isSubmitting]);

    useEffect(() => {
        setLocalHistory(history);
    }, [history]);

    const handleGenerate = () => {
        const formData = new FormData();
        formData.append("intent", "trigger_analysis");
        formData.append("excludedIds", JSON.stringify(excludedEntryIds));
        submit(formData, { method: "post" });
    };

    const containerClasses = "flex-1 pt-8 pl-8 pr-8 lg:pt-12 lg:pl-12 lg:pr-12 pb-0 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative";
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
                    {t("projects.analysis.backToSubproject")}
                </Link>

                <div className="flex justify-between items-end">
                    <div>
                        <Breadcrumb
                            items={[
                                {
                                    label: project.name,
                                    to: `/projects/${project.id}`,
                                    icon: <Folder size={28} className="text-primary" />
                                },
                                {
                                    label: t(`projects.models.${modelId}`),
                                    to: `/projects/${project.id}/models/${modelId}`,
                                    icon: <Box size={28} className="text-primary" />
                                },
                                {
                                    label: t("projects.analysis.title"),
                                    icon: <BarChart3 size={28} className="text-primary" />
                                }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Tab Navigation (Centered on top of content) */}
            <div className="flex justify-center relative z-10">
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 max-w-fit">
                    <button
                        onClick={() => setActiveTab("new")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "new"
                            ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <Zap size={16} />
                        {t("projects.analysis.tabs.new")}
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "history"
                            ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <History size={16} />
                        {t("projects.analysis.tabs.history")}
                    </button>
                </div>
            </div>

            {/* Tab Panels */}
            {activeTab === "new" ? (
                <NewAnalysisForm
                    subprojectId={modelId}
                    excludedEntryIds={excludedEntryIds}
                    isSubmitting={isSubmitting}
                    onSubmit={handleGenerate}
                    onOpenExclusions={handleOpenExclusions}
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

            {/* Integrated Exclusion Modal */}
            {showExclusionModal && (
                <div className="absolute inset-x-0 inset-y-0 z-50 pointer-events-none">
                    <div className="sticky top-0 w-full h-screen flex items-center justify-center bg-background-dark/80 backdrop-blur-sm p-4 pointer-events-auto animate-in fade-in">
                        <div className="bg-surface-dark w-full h-full max-w-7xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                                <div>
                                    <h2 className="text-xl font-bold text-white-1 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-bittersweet-shimmer/10 flex items-center justify-center text-bittersweet-shimmer">
                                            <XSquare size={20} />
                                        </div>
                                        {t("projects.analysis.exclusions.refineTitle")}
                                    </h2>
                                </div>
                                <button
                                    onClick={handleCloseExclusions}
                                    className="p-3 rounded-xl bg-white/5 text-light-gray-70 hover:text-white-1 hover:bg-white/10 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content - The Entries Table */}
                            <div className="flex-1 overflow-hidden flex flex-col bg-background-dark min-h-0">
                                <EntriesTable
                                    project={project}
                                    modelId={modelId}
                                    data={entriesData}
                                    filterCol={filterCol}
                                    filterVal={filterVal}
                                    filterOp={filterOp}
                                    filterBias={filterBias}
                                    isExclusionOnly={true}
                                    excludedIds={new Set(excludedEntryIds)}
                                    onExcludedIdsChange={(newSet: Set<string>) => setExcludedEntryIds(Array.from(newSet))}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-end shrink-0">
                                <button
                                    onClick={handleCloseExclusions}
                                    className="bg-primary hover:bg-primary/90 text-background-dark px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 cursor-pointer"
                                >
                                    {t("projects.analysis.exclusions.applyAndClose")}
                                </button>
                            </div>
                        </div>
                    </div>
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

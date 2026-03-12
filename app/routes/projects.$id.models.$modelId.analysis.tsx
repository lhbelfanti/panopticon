import { useState, useEffect } from "react";
import {
    useLoaderData,
    useLocation,
    useNavigation,
    useSubmit,
    useActionData,
    useOutletContext,
    type MetaFunction
} from "react-router";
import { i18next } from "~/localization/i18n.server";
import { useTranslation } from "react-i18next";

import {
    getSubprojectAnalysisHistory,
    triggerProjectAnalysis
} from "~/services/api/analysis/index.server";
import { getEntries } from "~/services/api/entries/index.server";

import { AnalysisHistoryTable } from "~/components/Analysis/AnalysisHistoryTable";
import { NewAnalysisForm } from "~/components/Analysis/NewAnalysisForm";
import { AnalysisReportModal } from "~/components/Modals/AnalysisReportModal";
import { AnalysisHeader } from "~/components/Analysis/AnalysisHeader";
import { AnalysisTabs } from "~/components/Analysis/AnalysisTabs";
import { ExclusionModal } from "~/components/Analysis/ExclusionModal";
import { generateAnalysisPDF } from "~/utils/pdfGenerator";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { AnalysisRun } from "~/services/api/analysis/types";
import type { ProjectContext } from "~/routes/projects.$id";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: `Panopticon - ${data?.title}` },
        {
            name: "description",
            content: "Adverse Human Behaviour Analysis Platform",
        },
    ];
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const { modelId, id } = params;
    if (!modelId || !id) throw new Response("Not Found", { status: 404 });

    const history = await getSubprojectAnalysisHistory(modelId);

    const url = new URL(request.url);
    const filterCol = (url.searchParams.get("filterCol") || "id") as any;
    const filterVal = url.searchParams.get("filterVal") || "";
    const filterOp = (url.searchParams.get("filterOp") || "") as any;
    const filterBias = parseFloat(url.searchParams.get("filterBias") || "0");
    const page = parseInt(url.searchParams.get("page") || "1", 10);

    const entriesData = await getEntries({
        projectId: parseInt(id),
        modelId,
        page,
        limit: 10,
        filterCol,
        filterVal,
        filterOp,
        filterBias,
    });

    const t = await i18next.getFixedT(request);
    const title = t("titles.modelAnalysis");

    return { modelId, history, entriesData, filterCol, filterVal, filterOp, filterBias, title };
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
    const { modelId, history, entriesData, filterCol, filterVal, filterOp, filterBias } = useLoaderData<typeof loader>();
    const { project } = useOutletContext<ProjectContext>();
    const actionData = useActionData<typeof action>();
    const { t } = useTranslation();
    const location = useLocation();
    const submit = useSubmit();
    const nav = useNavigation();

    const passedExcludedIds = location.state?.excludedEntryIds || [];
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [localHistory, setLocalHistory] = useState<AnalysisRun[]>(history);
    const [selectedRun, setSelectedRun] = useState<AnalysisRun | null>(null);
    const [showExclusionModal, setShowExclusionModal] = useState(false);
    const [excludedEntryIds, setExcludedEntryIds] = useState<string[]>(passedExcludedIds);

    const handleOpenExclusions = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
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
        if (passedExcludedIds.length > 0) setExcludedEntryIds(passedExcludedIds);
    }, [passedExcludedIds]);

    const isSubmitting = nav.formData?.get("intent") === "trigger_analysis";

    useEffect(() => {
        if (actionData?.success && nav.state === "idle" && !isSubmitting) setActiveTab("history");
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

    return (
        <div className="flex-1 pt-8 pl-8 pr-8 lg:pt-12 lg:pl-12 lg:pr-12 pb-0 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative">
            <AnalysisHeader
                project={project}
                modelId={modelId}
                title={t("projects.analysis.title")}
                backText={t("projects.analysis.backToSubproject")}
            />

            <AnalysisTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
                        onViewReport={setSelectedRun}
                        onDownloadPDF={async (runId) => {
                            const runData = localHistory.find(r => r.id === runId);
                            if (!runData) return;

                            if (!runData.result) {
                                try {
                                    const response = await fetch(`/api/v1/projects/${project.id}/models/${modelId}/analysis/${runId}`);
                                    if (!response.ok) throw new Error("Failed to fetch full report data");
                                    const fullRun = await response.json();
                                    generateAnalysisPDF(fullRun, project.name, t);
                                } catch (error) {
                                    console.error("Error downloading PDF:", error);
                                }
                            } else {
                                generateAnalysisPDF(runData, project.name, t);
                            }
                        }}
                    />
                </div>
            )}

            <ExclusionModal
                isOpen={showExclusionModal}
                onClose={handleCloseExclusions}
                project={project}
                modelId={modelId}
                entriesData={entriesData}
                filterCol={filterCol}
                filterVal={filterVal}
                filterOp={filterOp}
                filterBias={filterBias}
                excludedEntryIds={excludedEntryIds}
                onExcludedIdsChange={setExcludedEntryIds}
            />

            <AnalysisReportModal
                isOpen={selectedRun !== null}
                onClose={() => setSelectedRun(null)}
                run={selectedRun}
            />
        </div>
    );
};

export default AnalysisPage;

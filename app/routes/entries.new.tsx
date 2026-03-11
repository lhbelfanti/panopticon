import { useState, useMemo, useEffect } from "react";
import {
    data,
    redirect,
    useActionData,
    useLoaderData,
    useNavigation,
    useSubmit,
    useSearchParams,
    type MetaFunction,
} from "react-router";
import { i18next } from "~/localization/i18n.server";
import { useTranslation } from "react-i18next";
import { CopyPlus } from "lucide-react";

import { getProjects } from "~/services/api/projects/index.server";
import { getAppConfig } from "~/services/api/config.server";
import { addEntriesToProject } from "~/services/api/entries/index.server";
import { EntryForm } from "~/components/EntryIngestion/EntryForm";
import { BulkUpload } from "~/components/EntryIngestion/BulkUpload";
import { ConfigurationSection } from "~/components/EntryIngestion/ConfigurationSection";
import { IngestionTabs } from "~/components/EntryIngestion/IngestionTabs";
import { BackButton } from "~/components/ui/BackButton";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        { title: `Panopticon - ${data?.title}` },
        {
            name: "description",
            content: "Adverse Human Behaviour Analysis Platform",
        },
    ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const [projects, config, t] = await Promise.all([
        getProjects(),
        getAppConfig(),
        i18next.getFixedT(request)
    ]);
    const title = t("titles.addEntries");
    return { projects, platforms: config.platforms, title };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();

    const projectIdStr = formData.get("projectId") as string;
    const subprojectIdsStr = formData.get("subprojectIds") as string;
    const entriesDataStr = formData.get("entriesData") as string;
    const socialMediaType = formData.get("socialMediaType") as string;

    if (!projectIdStr || !subprojectIdsStr || !entriesDataStr) {
        return data({ error: "Missing required fields" }, { status: 400 });
    }

    const projectId = parseInt(projectIdStr);
    const subprojectIds = JSON.parse(subprojectIdsStr) as string[];
    const entriesData = JSON.parse(entriesDataStr) as { text: string; metadata?: any }[];
    const uploadAnother = formData.get("uploadAnother") === "true";

    await addEntriesToProject(projectId, subprojectIds, entriesData, socialMediaType);

    if (uploadAnother) {
        return data({ success: true, count: entriesData.length });
    }
    return redirect(`/projects/${projectId}`);
};

export default function GlobalEntriesNewPage() {
    const { projects, platforms } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const submit = useSubmit();
    const [searchParams] = useSearchParams();

    const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
    const [selectedSubprojects, setSelectedSubprojects] = useState<string[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string>("twitter");
    const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

    useEffect(() => {
        const projectIdParam = searchParams.get("projectId");
        if (projectIdParam) {
            const pid = parseInt(projectIdParam);
            if (!isNaN(pid)) {
                const project = projects.find(p => p.id === pid);
                if (project) {
                    setSelectedProjectId(pid);
                    setSelectedSubprojects(project.subprojects.map(sp => sp.model));
                }
            }
        }
    }, [searchParams, projects]);

    const isSubmitting = navigation.state === "submitting";

    const handleProjectChange = (projectId: number | "") => {
        setSelectedProjectId(projectId);
        if (!projectId) {
            setSelectedSubprojects([]);
            return;
        }
        const proj = projects.find(p => p.id === projectId);
        setSelectedSubprojects(proj ? proj.subprojects.map(sp => sp.model) : []);
    };

    const toggleSubproject = (modelId: string) => {
        setSelectedSubprojects(prev =>
            prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
        );
    };

    const handleManualSubmit = (text: string, metadata?: any, uploadAnother?: boolean) => {
        if (!selectedProjectId || selectedSubprojects.length === 0) {
            alert("Please select a project and at least one subproject.");
            return;
        }

        const formData = new FormData();
        formData.append("projectId", selectedProjectId.toString());
        formData.append("subprojectIds", JSON.stringify(selectedSubprojects));
        formData.append("socialMediaType", selectedPlatform);
        formData.append("entriesData", JSON.stringify([{ text, metadata }]));

        if (uploadAnother) formData.append("uploadAnother", "true");

        submit(formData, { method: "post" });
    };

    const handleBulkUpload = (entriesData: { text: string; metadata?: any }[]) => {
        if (!selectedProjectId || selectedSubprojects.length === 0) {
            alert("Please select a project and at least one subproject.");
            return;
        }

        const formData = new FormData();
        formData.append("projectId", selectedProjectId.toString());
        formData.append("subprojectIds", JSON.stringify(selectedSubprojects));
        formData.append("socialMediaType", selectedPlatform);
        formData.append("entriesData", JSON.stringify(entriesData));

        submit(formData, { method: "post" });
    };

    const canImport = selectedProjectId && selectedSubprojects.length > 0;

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                <BackButton to="/" text={t("sidebar.home")} />

                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight flex items-center gap-3">
                        <CopyPlus size={36} className="text-primary" />
                        {t("projects.entries.new.title")}
                    </h1>
                    <p className="text-light-gray-70 text-lg">
                        {t("projects.entries.new.subtitleGlobal", "Select a configuration below to import data into your workspace.")}
                    </p>
                </div>

                <ConfigurationSection
                    projects={projects}
                    platforms={platforms}
                    selectedProjectId={selectedProjectId}
                    selectedPlatform={selectedPlatform}
                    selectedSubprojects={selectedSubprojects}
                    onProjectChange={handleProjectChange}
                    onPlatformChange={setSelectedPlatform}
                    onToggleSubproject={toggleSubproject}
                />

                <IngestionTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className={`transition-opacity duration-300 ${!canImport ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100"}`}>
                    <div className="bg-surface-dark border border-white/5 rounded-2xl p-8 shadow-2xl relative">
                        {!canImport && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-dark/60 backdrop-blur-[2px] rounded-2xl rounded-t-none">
                                <div className="bg-background-dark border border-white/10 px-6 py-3 rounded-full shadow-2xl animate-pulse">
                                    <span className="font-bold text-white-1">{t("projects.entries.new.targetConfiguration.finishConfigInfo", "Please finish the configuration first")}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === "single" ? (
                            <EntryForm onSubmit={handleManualSubmit} isSubmitting={isSubmitting} />
                        ) : (
                            <BulkUpload
                                onUpload={handleBulkUpload}
                                isSubmitting={isSubmitting}
                                socialMediaType={selectedPlatform}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

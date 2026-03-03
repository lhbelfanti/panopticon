import { useState, useMemo } from "react";
import {
    data,
    redirect,
    useActionData,
    useLoaderData,
    useNavigation,
    Link,
    useSubmit,
} from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, PlusCircle, TableProperties, CheckCircle2 } from "lucide-react";

import { getProjects } from "~/services/api/projects/index.server";
import { getSupportedPlatforms } from "~/services/api/entries/mocks/platforms";
import { addEntriesToProject } from "~/services/api/entries/index.server";
import { EntryForm } from "~/components/EntryIngestion/EntryForm";
import { BulkUpload } from "~/components/EntryIngestion/BulkUpload";
import { CustomCheckbox } from "~/components/ui/CustomCheckbox";

import type { ActionFunctionArgs } from "react-router";

export const loader = async () => {
    const [projects, platforms] = await Promise.all([
        getProjects(),
        getSupportedPlatforms()
    ]);
    return { projects, platforms };
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

    // Form Selection State
    const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
    const [selectedSubprojects, setSelectedSubprojects] = useState<string[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string>("twitter"); // Defaulting to first mock
    const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");

    const isSubmitting = navigation.state === "submitting";

    // Derived State
    const selectedProject = useMemo(() => projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);

    // Automatically select all subprojects when a project is chosen, or clear them if no project
    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (!val) {
            setSelectedProjectId("");
            setSelectedSubprojects([]);
            return;
        }
        const projId = parseInt(val);
        const proj = projects.find(p => p.id === projId);
        setSelectedProjectId(projId);
        if (proj) {
            // Default to all subprojects selected to match original behavior
            setSelectedSubprojects(proj.subprojects.map(sp => sp.model));
        } else {
            setSelectedSubprojects([]);
        }
    }

    const toggleSubproject = (modelId: string) => {
        if (selectedSubprojects.includes(modelId)) {
            setSelectedSubprojects(prev => prev.filter(id => id !== modelId));
        } else {
            setSelectedSubprojects(prev => [...prev, modelId]);
        }
    }

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

        if (uploadAnother) {
            formData.append("uploadAnother", "true");
        }

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


    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-light-gray-70 hover:text-primary transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">{t("navigation.dashboard")}</span>
                </Link>

                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight">
                        {t("projects.entries.new.title")}
                    </h1>
                    <p className="text-light-gray-70 text-lg">
                        Select a configuration below to import data into your workspace.
                    </p>
                </div>

                {/* Configuration Section */}
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 shadow-xl mb-8 flex flex-col gap-6 relative z-20 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                    <h2 className="text-lg font-bold text-white-1 border-b border-light-gray-70/20 pb-2">
                        {t("projects.entries.new.targetConfiguration.title", "Target Configuration")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project Selection */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="project-select" className="text-sm font-bold text-light-gray-70 uppercase tracking-widest pl-1">
                                {t("projects.entries.new.targetConfiguration.targetProject", "Target Project")}
                            </label>
                            <select
                                id="project-select"
                                value={selectedProjectId}
                                onChange={handleProjectChange}
                                className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>{t("projects.entries.new.targetConfiguration.selectProject", "Select a project...")}</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Social Media Selection */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="platform-select" className="text-sm font-bold text-light-gray-70 uppercase tracking-widest pl-1">
                                {t("projects.entries.new.targetConfiguration.mediaType", "Media Type")}
                            </label>
                            <select
                                id="platform-select"
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                                className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white-1 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                            >
                                {platforms.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Subproject Selection - Only visible if Project is selected */}
                    {selectedProject && (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-bold text-light-gray-70 uppercase tracking-widest pl-1">
                                {t("projects.entries.new.targetConfiguration.targetSubprojects", "Target Subprojects (Models) *")}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                {selectedProject.subprojects.map(sp => {
                                    const isSelected = selectedSubprojects.includes(sp.model);
                                    return (
                                        <CustomCheckbox
                                            key={sp.id}
                                            checked={isSelected}
                                            onChange={() => toggleSubproject(sp.model)}
                                            wrapperClassName="p-4 bg-background-dark/50"
                                            label={t(`projects.models.${sp.model}`)}
                                        />
                                    );
                                })}
                            </div>
                            {selectedSubprojects.length === 0 && (
                                <p className="text-red-400 text-xs pl-1 font-semibold">{t("projects.entries.new.targetConfiguration.noSubprojectsError", "You must select at least one subproject.")}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-8 border border-white/5 max-w-fit relative z-10">
                    <button
                        onClick={() => setActiveTab("single")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "single"
                            ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <PlusCircle size={16} />
                        {t("projects.entries.new.tabs.single")}
                    </button>
                    <button
                        onClick={() => setActiveTab("bulk")}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "bulk"
                            ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                            : "text-light-gray-70 hover:text-white-1 hover:bg-white/5"
                            }`}
                    >
                        <TableProperties size={16} />
                        {t("projects.entries.new.tabs.bulk")}
                    </button>
                </div>

                {/* Tab Content */}
                <div className={`transition-opacity duration-300 ${!selectedProjectId || selectedSubprojects.length === 0 ? "opacity-50 pointer-events-none grayscale-[0.5]" : "opacity-100"}`}>
                    <div className="bg-surface-dark border border-white/5 rounded-2xl p-8 shadow-2xl relative">
                        {/* Overlay instruction when disabled */}
                        {(!selectedProjectId || selectedSubprojects.length === 0) && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-dark/60 backdrop-blur-[2px] rounded-2xl rounded-t-none">
                                <div className="bg-background-dark border border-white/10 px-6 py-3 rounded-full shadow-2xl animate-pulse">
                                    <span className="font-bold text-white-1">{t("projects.entries.new.targetConfiguration.finishConfigInfo", "Please finish the Target Configuration first")}</span>
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

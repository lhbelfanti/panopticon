import { useState } from "react";
import {
    Link,
    redirect,
    useActionData,
    useLoaderData,
    useNavigation,
} from "react-router";

import {
    deleteProject,
    getBehaviorsConfig,
    getProjectById,
    updateProject,
} from "~/services/api/projects/index.server";

import { NewProjectForm } from "~/components/ProjectForms/NewProjectForm";
import ConfirmationModal from "~/components/ConfirmationModal";

import { Folder, ArrowLeft, Trash2, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { MLModel, TargetBehavior } from "~/services/api/projects/types";

export const meta = () => {
    return [
        { title: "Panopticon - Project Settings" },
    ];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });
    const projectId = parseInt(id);

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete_project") {
        await deleteProject(projectId);
        return redirect("/");
    }

    if (intent === "update_project") {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const behaviors = formData.getAll("behaviors") as string[];
        const models = formData.getAll("models") as MLModel[];

        if (!name?.trim()) {
            return { error: "Name is required" };
        }

        try {
            await updateProject(projectId, {
                name,
                description,
                behaviors: behaviors as TargetBehavior[],
                models,
            });
            return redirect(`/projects/${projectId}`);
        } catch (err) {
            return { error: "Failed to update project" };
        }
    }

    return null;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });
    const project = await getProjectById(parseInt(id));
    if (!project) throw new Response("Not Found", { status: 404 });

    const behaviorConfigs = await getBehaviorsConfig();
    return { project, behaviorConfigs };
};

const ProjectSettingsPage = () => {
    const { project, behaviorConfigs } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isSubmitting = navigation.formData?.get("intent") === "update_project";
    const isDeleting = navigation.formData?.get("intent") === "delete_project";

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            <div className="max-w-3xl mx-auto">
                <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-2 text-primary hover:text-white-1 transition-colors text-sm font-semibold max-w-max mb-8"
                >
                    <ArrowLeft size={16} />
                    {t("projects.settings.backToProject")}
                </Link>

                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight flex items-center gap-3">
                        <Settings size={36} className="text-primary" />
                        {t("projects.settings.title")}
                    </h1>
                    <p className="text-light-gray-70 text-lg">
                        {t("projects.settings.description", { name: project.name })}
                    </p>
                </div>

                <div className="bg-surface-dark border border-white/5 rounded-2xl shadow-xl overflow-hidden mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="p-8 border-b border-white/5 bg-white/5">
                        <h2 className="text-xl font-bold text-white-1 flex items-center gap-2">
                            <Folder size={20} className="text-primary" />
                            {t("projects.settings.generalTitle")}
                        </h2>
                    </div>
                    <NewProjectForm
                        actionData={actionData as any}
                        isSubmitting={isSubmitting}
                        behaviorConfigs={behaviorConfigs}
                        mode="edit"
                        initialData={{
                            name: project.name,
                            description: project.description || "",
                            behaviors: project.behaviors,
                            models: project.models,
                        }}
                    />
                    {/* We need to pass the intent to the form */}
                    <input type="hidden" name="intent" value="update_project" form="project-form" />
                </div>

                {/* Since NewProjectForm has its own Form tag, we need to adjust or wrap it. 
            Actually, NewProjectForm already has a <Form method="post">. 
            We need to make sure the intent is captured. 
            Let's modify NewProjectForm to accept an optional intent hidden field or just use the button name.
        */}

                {/* Danger Zone */}
                <div className="bg-surface-dark border border-bittersweet-shimmer/20 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="p-8 border-b border-bittersweet-shimmer/10 bg-bittersweet-shimmer/5">
                        <h2 className="text-xl font-bold text-bittersweet-shimmer flex items-center gap-2">
                            <Trash2 size={20} />
                            {t("projects.settings.dangerZoneTitle")}
                        </h2>
                    </div>
                    <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-white-1 font-bold mb-1">
                                {t("projects.settings.deleteTitle")}
                            </h3>
                            <p className="text-sm text-light-gray-70 max-w-md">
                                {t("projects.settings.deleteWarning")}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-2.5 bg-bittersweet-shimmer/10 hover:bg-bittersweet-shimmer text-bittersweet-shimmer hover:text-white-1 font-bold rounded-lg border border-bittersweet-shimmer/20 transition-all whitespace-nowrap"
                        >
                            {t("projects.settings.deleteButton")}
                        </button>
                    </div>
                </div>

                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    icon={<Trash2 size={28} />}
                    title={t("projects.view.deleteProject")}
                    description={t("projects.view.deleteProjectDesc", {
                        name: project.name,
                    })}
                    cancelText={t("sidebar.cancel")}
                    confirmText={
                        isDeleting
                            ? t("common.deleting")
                            : t("projects.view.deleteProjectConfirm")
                    }
                    confirmAction="."
                    confirmMethod="post"
                    isDestructive={true}
                    hiddenInputs={{ intent: "delete_project" }}
                />
            </div>
        </div>
    );
};

export default ProjectSettingsPage;

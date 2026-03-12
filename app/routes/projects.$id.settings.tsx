import { useState } from "react";
import {
    redirect,
    useActionData,
    useNavigation,
    useOutletContext,
    useRouteLoaderData,
    type MetaFunction
} from "react-router";
import { i18next } from "~/localization/i18n.server";
import { useTranslation } from "react-i18next";
import { Folder, Trash2 } from "lucide-react";

import {
    deleteProject,
    updateProject,
} from "~/services/api/projects/index.server";

import { NewProjectForm } from "~/components/ProjectForms/NewProjectForm";
import ConfirmationModal from "~/components/ConfirmationModal";
import { SettingsHeader } from "~/components/Project/SettingsHeader";
import { SettingsDangerZone } from "~/components/Project/SettingsDangerZone";
import { BackButton } from "~/components/ui/BackButton";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { MLModel, TargetBehavior } from "~/services/api/projects/types";
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

        if (!name?.trim()) return { error: "Name is required" };

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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });
    const t = await i18next.getFixedT(request);
    const title = t("titles.projectSettings");
    return { title };
};

export default function ProjectSettingsPage() {
    const rootData = useRouteLoaderData("root") as { behaviorConfigs: any[] };
    const behaviorConfigs = rootData?.behaviorConfigs || [];
    const { project } = useOutletContext<ProjectContext>();
    const { t } = useTranslation();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isSubmitting = navigation.formData?.get("intent") === "update_project";
    const isDeleting = navigation.formData?.get("intent") === "delete_project";

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <BackButton
                    to={`/projects/${project.id}`}
                    text={t("projects.settings.backToProject")}
                />

                <SettingsHeader
                    title={t("projects.settings.title")}
                    description={t("projects.settings.description", { name: project.name })}
                />

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
                        initialData={project}
                    />
                    <input type="hidden" name="intent" value="update_project" form="project-form" />
                </div>

                <SettingsDangerZone onDelete={() => setShowDeleteModal(true)} />

                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    icon={<Trash2 size={28} />}
                    title={t("projects.view.deleteProject")}
                    description={t("projects.view.deleteProjectDesc", { name: project.name })}
                    cancelText={t("sidebar.cancel")}
                    confirmText={isDeleting ? t("common.deleting") : t("projects.view.deleteProjectConfirm")}
                    confirmAction="."
                    confirmMethod="post"
                    isDestructive={true}
                    hiddenInputs={{ intent: "delete_project" }}
                    maxWidth="max-w-xl"
                />
            </div>
        </div>
    );
}

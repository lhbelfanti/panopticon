import { redirect, useActionData, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";
import { createProject } from "~/services/api/projects/index.server";
import type { TargetBehavior, MLModel } from "~/services/api/projects/types";

export const meta = () => {
    return [
        { title: "Panopticon" },
        { name: "description", content: "Adverse Human Behaviour Analysis Platform" },
    ];
};

export const action = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const behaviors = formData.getAll("behaviors") as TargetBehavior[];
    const models = formData.getAll("models") as MLModel[];

    if (!name?.trim()) {
        return { error: "Name is required" };
    }
    if (!behaviors.length) {
        return { error: "At least one target behavior must be selected" };
    }
    if (!models.length) {
        return { error: "At least one ML model must be selected" };
    }

    try {
        const newProject = await createProject({ name, description, behaviors, models });
        return redirect(`/projects/${newProject.id}`);
    } catch (err) {
        return { error: "Failed to create project" };
    }
};

import { NewProjectForm } from "~/components/ProjectForms/NewProjectForm";

const NewProjectPage = () => {
    const { t } = useTranslation();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight">
                        {t('projects.new.title')}
                    </h1>
                    <p className="text-light-gray-70 text-lg">
                        {t('projects.new.subtitle')}
                    </p>
                </div>

                <div className="bg-surface-dark border border-white/5 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <NewProjectForm actionData={actionData} isSubmitting={isSubmitting} />
                </div>
            </div>
        </div>
    );
};

export default NewProjectPage;

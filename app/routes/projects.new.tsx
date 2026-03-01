import type { LoaderFunctionArgs } from "react-router";
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import {
  createProject,
  getBehaviorsConfig,
} from "~/services/api/projects/index.server";
import type { MLModel, TargetBehavior } from "~/services/api/projects/types";
import { NewProjectForm } from "~/components/ProjectForms/NewProjectForm";
import { useTranslation } from "react-i18next";
import { LibraryBig } from "lucide-react";

export const meta = () => {
  return [
    { title: "Panopticon" },
    {
      name: "description",
      content: "Adverse Human Behaviour Analysis Platform",
    },
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
    const newProject = await createProject({
      name,
      description,
      behaviors,
      models,
    });
    return redirect(`/projects/${newProject.id}`);
  } catch (err) {
    return { error: "Failed to create project" };
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const behaviorConfigs = await getBehaviorsConfig();
  return { behaviorConfigs };
};

const NewProjectPage = () => {
  const { t } = useTranslation();
  const actionData = useActionData<typeof action>();
  const { behaviorConfigs } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight flex items-center gap-3">
            <LibraryBig size={36} className="text-primary" />
            {t("projects.new.title")}
          </h1>
        </div>

        <div className="bg-surface-dark border border-white/5 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <NewProjectForm
            actionData={actionData}
            isSubmitting={isSubmitting}
            behaviorConfigs={behaviorConfigs}
          />
        </div>
      </div>
    </div>
  );
};

export default NewProjectPage;

import { useState } from "react";
import {
  redirect,
  useNavigation,
  useOutletContext,
  useRouteLoaderData,
} from "react-router";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";

import {
  deleteProject,
} from "~/services/api/projects/index.server";

import ConfirmationModal from "~/components/ConfirmationModal";
import { ProjectDetailsHeader } from "~/components/Project/ProjectDetailsHeader";
import { SubprojectsSection } from "~/components/Project/SubprojectsSection";
import { NewEntryFAB } from "~/components/Project/NewEntryFAB";
import { BackButton } from "~/components/ui/BackButton";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { ProjectContext } from "~/routes/projects.$id";

export const meta = () => {
  return [
    { title: "Panopticon" },
    {
      name: "description",
      content: "Adverse Human Behaviour Analysis Platform",
    },
  ];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { id } = params;
  if (!id) throw new Response("Not Found", { status: 404 });
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete_project") {
    await deleteProject(parseInt(id));
    return redirect("/");
  }

  return null;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = params;
  if (!id) throw new Response("Not Found", { status: 404 });
  return {};
};

export default function ProjectDetailsPage() {
  const { project } = useOutletContext<ProjectContext>();
  const rootData = useRouteLoaderData("root") as { behaviorConfigs: any[] };
  const behaviorConfigs = rootData?.behaviorConfigs || [];
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isDeleting = navigation.formData?.get("intent") === "delete_project";

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <BackButton to="/" text={t("sidebar.home")} />
        </div>

        <ProjectDetailsHeader project={project} behaviorConfigs={behaviorConfigs} />

        <hr className="border-white/5 animate-in fade-in duration-700" />

        <SubprojectsSection project={project} />

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
          maxWidth="max-w-xl"
        />
      </div>

      <NewEntryFAB projectId={project.id} />
    </div>
  );
}

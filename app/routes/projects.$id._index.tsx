import { useState } from "react";
import {
  Link,
  redirect,
  useLoaderData,
  useNavigation,
} from "react-router";

import {
  deleteProject,
  getBehaviorsConfig,
  getProjectById,
} from "~/services/api/projects/index.server";

import ConfirmationModal from "~/components/ConfirmationModal";
import SubprojectCard from "~/components/SubprojectCard";
import { AdverseBehaviorLabel } from "~/components/AdverseBehaviorLabel";

import { Folder, PlusCircle, Trash2, ArrowLeft, Settings } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

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
    return redirect("/"); // Redirect to dashboard after deletion
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

const ProjectViewPage = () => {
  const { project, behaviorConfigs } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check if we are currently submitting a delete
  const isDeleting = navigation.formData?.get("intent") === "delete_project";

  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* Navigation */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary hover:text-white-1 transition-colors text-sm font-semibold max-w-max"
          >
            <ArrowLeft size={16} />
            {t("sidebar.home")}
          </Link>
        </div>

        {/* Header */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-between items-start -mt-2">
          <div>
            <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight flex items-center gap-3">
              <Folder size={36} className="text-primary" />
              {project.name}
            </h1>
            {project.description && (
              <p className="text-light-gray-70 text-lg max-w-4xl mt-7 mb-10 truncate text-balance">
                {project.description}
              </p>
            )}

            <div className="flex flex-row gap-20 mt-6">
              <div className="flex flex-col gap-2">
                <span className="text-[0.65rem] font-bold text-light-gray-50 uppercase tracking-widest">
                  PROJECT ID
                </span>
                <span className="text-sm font-mono text-white-1 bg-white/5 border border-white/5 py-1.5 px-3 rounded-md self-start shadow-inner">
                  {project.id}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[0.65rem] font-bold text-light-gray-50 uppercase tracking-widest">
                  <Trans i18nKey="projects.view.behaviorsTracked" components={{ 1: <AdverseBehaviorLabel /> }} />
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.behaviors?.map((b) => {
                    const config = behaviorConfigs.find((c) => c.id === b);
                    if (!config) return null;
                    const IconNode =
                      (LucideIcons as any)[config.iconName] || LucideIcons.Circle;

                    return (
                      <div
                        key={b}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 ${config.bgClass} ${config.colorClass}`}
                      >
                        <IconNode size={14} />
                        <span className="text-xs font-semibold">
                          {t(`projects.behaviors.${b}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${project.id}/settings`}
              className="group flex-shrink-0 text-light-gray-70 transition-all p-2.5 rounded-full hover:bg-white/5 hover:scale-105"
              title={t("projects.view.settings")}
            >
              <Settings
                size={20}
                className="group-hover:text-white-1 transition-colors"
              />
            </Link>
          </div>
        </div>

        <hr className="border-white/5 animate-in fade-in duration-700" />

        {/* Subprojects (ML Models) Section */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white-1 mb-2">
              {t("projects.view.subprojectsTitle")}
            </h2>
            <p className="text-sm text-light-gray-70 w-full max-w-full leading-relaxed text-balance">
              {t("projects.view.subprojectsDesc")}
            </p>
          </div>

          {!project.subprojects || project.subprojects.length === 0 ? (
            <div className="p-8 border border-dashed border-white/20 rounded-2xl text-center bg-white/5">
              <p className="text-light-gray-70">
                {t("projects.view.emptyModels")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {project.subprojects.map((sub) => (
                <SubprojectCard
                  key={sub.id}
                  subproject={sub}
                  projectId={project.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Project Deletion Modal */}
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

      {/* Floating Action Button (FAB) for New Entry */}
      <div className="fixed bottom-8 right-8 z-40 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
        <Link
          to={`/entries/new?projectId=${project.id}`}
          className="flex items-center gap-2 px-6 py-4 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-full transition-all hover:-translate-y-1 hover:scale-105 shadow-2xl shadow-primary/30 group"
        >
          <PlusCircle size={22} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-base">{t("sidebar.newEntry")}</span>
        </Link>
      </div>
    </div>
  );
};

export default ProjectViewPage;

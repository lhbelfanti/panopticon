import { useState } from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { useLoaderData, redirect, useSubmit, useNavigation } from "react-router";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { getProjectById, deleteProject } from "~/services/api/projects/index.server";
import SubprojectCard from "~/components/SubprojectCard";
import ConfirmationModal from "~/components/ConfirmationModal";

export const meta = () => {
    return [
        { title: "Panopticon" },
        { name: "description", content: "Adverse Human Behaviour Analysis Platform" },
    ];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "delete_project") {
        await deleteProject(id);
        return redirect("/"); // Redirect to dashboard after deletion
    }

    return null;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    if (!id) throw new Response("Not Found", { status: 404 });
    const project = await getProjectById(id);
    if (!project) throw new Response("Not Found", { status: 404 });
    return { project };
};

const ProjectViewPage = () => {
    const { project } = useLoaderData<typeof loader>();
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Check if we are currently submitting a delete
    const isDeleting = navigation.formData?.get("intent") === "delete_project";

    return (
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-background-dark min-h-screen custom-scrollbar relative">
            <div className="max-w-6xl mx-auto flex flex-col gap-10">

                {/* Header */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white-1 mb-3 tracking-tight">
                            {project.name}
                        </h1>
                        {project.description && (
                            <p className="text-light-gray-70 text-lg max-w-3xl mb-6 truncate text-balance">
                                {project.description}
                            </p>
                        )}

                        <div className="flex flex-col gap-2 mt-2">
                            <span className="text-[0.65rem] font-bold text-light-gray-50 uppercase tracking-widest">
                                {t('projects.view.behaviorsTracked')}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {project.behaviors?.map((b) => (
                                    <span key={b} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-light-gray-80">
                                        {t(`projects.behaviors.${b}`)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isDeleting}
                            className="p-2.5 rounded-xl border border-white/10 bg-surface-dark text-light-gray-70 hover:text-bittersweet-shimmer hover:border-bittersweet-shimmer/30 hover:bg-bittersweet-shimmer/10 transition-all disabled:opacity-50"
                            title={t('projects.view.deleteProject')}
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>

                <hr className="border-white/5 animate-in fade-in duration-700" />

                {/* Subprojects (ML Models) Section */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white-1 mb-2">
                            {t('projects.view.subprojectsTitle')}
                        </h2>
                        <p className="text-sm text-light-gray-70">
                            {t('projects.view.subprojectsDesc')}
                        </p>
                    </div>

                    {(!project.subprojects || project.subprojects.length === 0) ? (
                        <div className="p-8 border border-dashed border-white/20 rounded-2xl text-center bg-white/5">
                            <p className="text-light-gray-70">{t('projects.view.emptyModels')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {project.subprojects.map((sub) => (
                                <SubprojectCard key={sub.id} subproject={sub} projectId={project.id} />
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
                    description={t("projects.view.deleteProjectDesc", { name: project.name })}
                    cancelText={t("sidebar.cancel")}
                    confirmText={isDeleting ? t("common.deleting") : t("projects.view.deleteProjectConfirm")}
                    confirmAction="."
                    confirmMethod="post"
                    isDestructive={true}
                    hiddenInputs={{ intent: "delete_project" }}
                />
            </div>
        </div>
    );
};

export default ProjectViewPage;

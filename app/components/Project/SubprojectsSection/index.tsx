import React from "react";
import { useTranslation } from "react-i18next";
import SubprojectCard from "~/components/SubprojectCard";
import type { SubprojectsSectionProps } from "./types";

export const SubprojectsSection = (props: SubprojectsSectionProps) => {
    const { project } = props;
    const { t } = useTranslation();

    return (
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
                    {project.subprojects.map((sub: any) => (
                        <SubprojectCard
                            key={sub.id}
                            subproject={sub}
                            projectId={project.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

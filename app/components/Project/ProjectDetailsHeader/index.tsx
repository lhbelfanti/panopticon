import React from "react";
import { Link } from "react-router";
import { Folder, Settings } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { AdverseBehaviorLabel } from "~/components/AdverseBehaviorLabel";
import { getBehaviorClasses } from "~/utils/behaviorColors";
import type { ProjectDetailsHeaderProps } from "./types";

export const ProjectDetailsHeader = (props: ProjectDetailsHeaderProps) => {
    const { project, behaviorConfigs } = props;
    const { t } = useTranslation();

    return (
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
                            {t("projects.view.projectId", "PROJECT ID")}
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
                            {project.behaviors?.map((b: string) => {
                                const config = behaviorConfigs.find((c: any) => c.id === b);
                                if (!config) return null;
                                const IconNode =
                                    (LucideIcons as any)[config.iconName] || LucideIcons.Circle;
                                const { text: colorText, bg: colorBg } = getBehaviorClasses(config.color);

                                return (
                                    <div
                                        key={b}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 ${colorBg} ${colorText}`}
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
    );
};

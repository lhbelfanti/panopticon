import React from "react";
import { Folder, Box, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "~/components/Breadcrumb";
import { BackButton } from "~/components/ui/BackButton";
import type { AnalysisHeaderProps } from "./types";

export const AnalysisHeader = (props: AnalysisHeaderProps) => {
    const { project, modelId, title, backText } = props;
    const { t } = useTranslation();

    const headerClasses = "flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 mb-10 pb-6 border-b border-white/5";

    return (
        <div className={headerClasses}>
            <BackButton
                to={`/projects/${project.id}/models/${modelId}`}
                text={backText}
            />

            <div className="flex justify-between items-end">
                <div>
                    <Breadcrumb
                        items={[
                            {
                                label: project.name,
                                to: `/projects/${project.id}`,
                                icon: <Folder size={28} className="text-primary" />
                            },
                            {
                                label: t(`projects.models.${modelId}`),
                                to: `/projects/${project.id}/models/${modelId}`,
                                icon: <Box size={28} className="text-primary" />
                            },
                            {
                                label: title,
                                icon: <BarChart3 size={28} className="text-primary" />
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

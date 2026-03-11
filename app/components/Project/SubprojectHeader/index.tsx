import React from "react";
import { Folder, Box } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "~/components/Breadcrumb";
import type { SubprojectHeaderProps } from "./types";

export const SubprojectHeader = (props: SubprojectHeaderProps) => {
    const { project, modelId, description } = props;
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                            icon: <Box size={28} className="text-primary" />
                        }
                    ]}
                />
                <p className="text-light-gray-70 text-sm mt-5">{description}</p>
            </div>
        </div>
    );
};

import type { ReactNode } from "react";
import type { Project } from "~/services/api/projects/types";

export interface SubprojectHeaderProps {
    project: Project;
    modelId: string;
    description: string;
}

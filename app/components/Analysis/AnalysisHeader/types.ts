import type { ReactNode } from "react";
import type { Project } from "~/services/api/projects/types";

export interface AnalysisHeaderProps {
    project: Project;
    modelId: string;
    title: string;
    backText: string;
}

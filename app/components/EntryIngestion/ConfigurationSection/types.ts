import type { Project } from "~/services/api/projects/types";

export interface ConfigurationSectionProps {
    projects: Project[];
    platforms: { id: string; name: string }[];
    selectedProjectId: number | "";
    selectedPlatform: string;
    selectedSubprojects: string[];
    onProjectChange: (projectId: number | "") => void;
    onPlatformChange: (platformId: string) => void;
    onToggleSubproject: (modelId: string) => void;
}

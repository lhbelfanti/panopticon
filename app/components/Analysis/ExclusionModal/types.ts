import type { Project } from "~/services/api/projects/types";

export interface ExclusionModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    modelId: string;
    entriesData: any;
    filterCol: any;
    filterVal: string;
    filterOp: any;
    filterBias: number;
    excludedEntryIds: string[];
    onExcludedIdsChange: (newIds: string[]) => void;
}

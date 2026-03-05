import type { AnalysisRun } from "~/services/api/analysis/types";

export interface AnalysisHistoryTableProps {
    history: AnalysisRun[];
    isRefreshing?: boolean;
    onRefresh?: () => void;
    onViewReport?: (run: AnalysisRun) => void;
    onDownloadPDF?: (runId: string) => void;
}

export interface NewAnalysisFormProps {
    subprojectId: string;
    excludedEntryIds: string[];
    isSubmitting?: boolean;
    onSubmit: (excludedIds: string[]) => void;
    onOpenExclusions?: () => void;
}

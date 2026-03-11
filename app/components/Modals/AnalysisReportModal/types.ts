import type { AnalysisRun } from "~/services/api/analysis/types";

export interface AnalysisReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    run: AnalysisRun | null;
}

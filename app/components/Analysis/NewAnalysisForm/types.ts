export interface NewAnalysisFormProps {
    subprojectId: string;
    excludedEntryIds: string[];
    isSubmitting?: boolean;
    onSubmit: (excludedIds: string[]) => void;
    onOpenExclusions?: () => void;
}

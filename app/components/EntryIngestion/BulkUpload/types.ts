export interface BulkUploadProps {
    onUpload: (entriesData: { text: string; metadata?: any }[]) => void;
    isSubmitting?: boolean;
    socialMediaType?: string;
}

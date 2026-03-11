import type { TwitterMetadata } from "~/services/api/entries/types";

export interface EntryFormProps {
    onSubmit: (text: string, metadata?: TwitterMetadata, uploadAnother?: boolean) => void;
    isSubmitting?: boolean;
}

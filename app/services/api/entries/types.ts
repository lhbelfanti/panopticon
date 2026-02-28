export type EntryVerdict = "Pending" | "Positive" | "Negative" | "Error";

export interface Entry {
    id: string;
    projectId: string; // The parent project ID
    modelId: string; // The subproject model reference
    text: string;
    verdict: EntryVerdict;
    score?: number; // Added for prediction scores
    createdAt: string;
}

export interface GetEntriesParams {
    projectId: string;
    modelId: string;
    page?: number;
    limit?: number;
    search?: string;
    verdict?: EntryVerdict | "";
}

export interface PaginatedEntries {
    entries: Entry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

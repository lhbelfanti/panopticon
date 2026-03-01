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

export type FilterColumn = "id" | "text" | "verdict" | "score";
export type FilterOperator = ">" | "<" | ">=" | "<=" | "=" | "~=" | "";

export interface GetEntriesParams {
  projectId: string;
  modelId: string;
  page?: number;
  limit?: number;
  filterCol?: FilterColumn;
  filterVal?: string;
  filterOp?: FilterOperator;
  filterBias?: number;
}

export interface PaginatedEntries {
  entries: Entry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
